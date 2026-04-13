{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE DeriveGeneric #-}

module DependencyAnalyzer
    ( AnalysisResult(..)
    , FileNode(..)
    , UnusedStyle(..)
    , UnusedExport(..)
    , analyzeDependencies
    , isExternalImport  -- Exportando para testes
    ) where

import qualified Data.Map.Strict as Map
import qualified Data.Text as T
import Data.Text (Text)
import Data.List (isPrefixOf, isSuffixOf)
import System.FilePath (takeDirectory, (</>), normalise, makeRelative, takeFileName, splitDirectories, takeExtension)
import System.Directory (canonicalizePath, doesFileExist)
import GHC.Generics (Generic)
import Data.Aeson (ToJSON, object, (.=), toJSON)
import qualified Data.Aeson as Aeson

import ImportParser (parseImports, ImportStatement(..), importSource)
import qualified StyleUsageAnalyzer as Style
import qualified UnusedExportsAnalyzer as Exports
import FileCache (FileCache, loadFileCache)
import Control.Concurrent.Async (mapConcurrently, concurrently)
import ImportIndex (ImportIndex, buildImportIndex)

-- | Pastas que devem ser ignoradas (sempre externas)
ignoredPaths :: [String]
ignoredPaths = ["node_modules", ".git", "dist", "build", ".next", "coverage"]

-- | Bibliotecas/pacotes externos conhecidos
knownExternalPackages :: [String]
knownExternalPackages = 
    [ "react", "react-native", "react-dom", "lodash", "axios", "moment"
    , "@react-navigation", "@naturacode", "styled-components"
    , "zustand", "react-query", "@tanstack", "expo", "metro"
    ]

-- | Tipo de nó no grafo — classifica o papel do arquivo no projeto
data NodeType
    = SourceNode    -- Arquivo de código fonte regular
    | TestNode      -- Arquivo de teste (.spec, .test)
    | MockNode      -- Arquivo de mock (__mocks__, testMocks)
    | ConfigNode    -- Arquivo de configuração (vitest, babel, metro, tsconfig, .d.ts)
    deriving (Show, Eq)

-- | Serializa NodeType para JSON
nodeTypeToText :: NodeType -> Text
nodeTypeToText SourceNode = "source"
nodeTypeToText TestNode   = "test"
nodeTypeToText MockNode   = "mock"
nodeTypeToText ConfigNode = "config"

-- | Determina o NodeType de um arquivo pelo seu path
classifyNode :: FilePath -> NodeType
classifyNode path
    | isTestFile path  = TestNode
    | isMockFile path  = MockNode
    | isConfigFile path = ConfigNode
    | otherwise        = SourceNode
  where
    isTestFile :: FilePath -> Bool
    isTestFile p =
        ".spec.ts"   `isSuffixOf` p || ".spec.tsx"  `isSuffixOf` p ||
        ".spec.js"   `isSuffixOf` p || ".spec.jsx"  `isSuffixOf` p ||
        ".test.ts"   `isSuffixOf` p || ".test.tsx"  `isSuffixOf` p ||
        ".test.js"   `isSuffixOf` p || ".test.jsx"  `isSuffixOf` p

    isMockFile :: FilePath -> Bool
    isMockFile p =
        "/__mocks__/"  `isInfixOf` p ||
        "__mocks__/"   `isPrefixOf` p ||
        "/testMocks/"  `isInfixOf` p  ||
        ".mock.ts"     `isSuffixOf` p ||
        ".mock.tsx"    `isSuffixOf` p ||
        ".mock.js"     `isSuffixOf` p

    isConfigFile :: FilePath -> Bool
    isConfigFile p =
        "vitest.config"   `isInfixOf` p ||
        "vitest.setup"    `isInfixOf` p ||
        "babel.config"    `isInfixOf` p ||
        "metro.config"    `isInfixOf` p ||
        "jest.config"     `isInfixOf` p ||
        "webpack.config"  `isInfixOf` p ||
        "tsconfig"        `isInfixOf` p ||
        "react-native.config" `isInfixOf` p ||
        ".d.ts"           `isSuffixOf` p

    isInfixOf :: String -> String -> Bool
    isInfixOf needle haystack = go haystack
      where
        go [] = False
        go s@(_:rest)
            | needle `isPrefixOf` s = True
            | otherwise             = go rest

-- | Nó de arquivo no grafo de dependências
data FileNode = FileNode
    { fileId     :: Text
    , nodeType   :: Text      -- "source" | "test" | "mock" | "config"
    , imports    :: [Text]
    , importedBy :: [Text]
    } deriving (Show, Eq, Generic)

instance ToJSON FileNode where
    toJSON fn = object
        [ "fileId"     .= fileId fn
        , "nodeType"   .= nodeType fn
        , "imports"    .= imports fn
        , "importedBy" .= importedBy fn
        ]

-- | Informação sobre estilo não utilizado
data UnusedStyle = UnusedStyle
    { unusedStyleName   :: Text
    , unusedStyleFileId :: Text
    , unusedImportType  :: Text
    } deriving (Show, Eq, Generic)

instance ToJSON UnusedStyle where
    toJSON us = object
        [ "name"       .= unusedStyleName us
        , "fileId"     .= unusedStyleFileId us
        , "importType" .= unusedImportType us
        ]

-- | Informação sobre export não utilizado
data UnusedExport = UnusedExport
    { unusedExportName   :: Text
    , unusedExportType   :: Text
    , unusedExportFileId :: Text
    , canBeInternal      :: Bool
    } deriving (Show, Eq, Generic)

instance ToJSON UnusedExport where
    toJSON ue = object
        [ "name"          .= unusedExportName ue
        , "type"          .= unusedExportType ue
        , "fileId"        .= unusedExportFileId ue
        , "canBeInternal" .= canBeInternal ue
        ]

-- | Resultado completo da análise
data AnalysisResult = AnalysisResult
    { projectName  :: Text
    , analyzedAt   :: Text
    , fileRegistry :: Map.Map Text Text
    , dependencies :: [FileNode]
    , unusedStyles :: [UnusedStyle]
    , unusedExports :: [UnusedExport]
    } deriving (Show, Generic)

instance ToJSON AnalysisResult where
    toJSON ar = object
        [ "projectName"   .= projectName ar
        , "analyzedAt"    .= analyzedAt ar
        , "fileRegistry"  .= fileRegistry ar
        , "dependencies"  .= dependencies ar
        , "unusedStyles"  .= unusedStyles ar
        , "unusedExports" .= unusedExports ar
        ]

-- | Verifica se um path contém diretórios ignorados
containsIgnoredPath :: FilePath -> Bool
containsIgnoredPath path = 
    any (\ignored -> ignored `elem` splitDirectories path) ignoredPaths

-- | Verifica se um import é externo
isExternalImport :: String -> Bool
isExternalImport path = 
    containsIgnoredPath path
    || any (\pkg -> pkg `isPrefixOf` path) knownExternalPackages
    || ("@" `isPrefixOf` path && not ("@/" `isPrefixOf` path) && not ("./" `isPrefixOf` path || "../" `isPrefixOf` path))
    && not ("./" `isPrefixOf` path || "../" `isPrefixOf` path || "@/" `isPrefixOf` path)
    && not (any (\prefix -> prefix `isPrefixOf` path) ["src/", "screens/", "components/", "services/", "utils/", "hooks/", "store/", "types/", "config/", "common/", "modules/", "assets/", "routes/"])

-- | Resolve import para caminho de arquivo
resolveImport :: FilePath -> FilePath -> Text -> IO (Maybe FilePath)
resolveImport rootDir currentFile importPath = do
    let importStr = T.unpack importPath
    if isExternalImport importStr
        then return Nothing
        else do
            let currentDir = takeDirectory currentFile
                extensions = [".ts", ".tsx", ".js", ".jsx", ".css", ".scss", ".sass", ".less", ".styl"]
                
            basePath <- if "./" `isPrefixOf` importStr || "../" `isPrefixOf` importStr
                then return $ normalise (currentDir </> importStr)
                else if "@/" `isPrefixOf` importStr
                then do
                    let aliasPath = drop 2 importStr
                    return $ normalise (rootDir </> "src" </> aliasPath)
                else do
                    let srcBasedPath = rootDir </> "src" </> importStr
                    return $ normalise srcBasedPath
                
            let withExt    = map (basePath ++) extensions
                withIndex  = map (\ext -> basePath </> "index" ++ ext) extensions
                allPaths   = withExt ++ withIndex ++ [basePath]
            
            result <- findFirst allPaths
            case result of
                Just path -> return $ Just path
                Nothing -> do
                    let rootBasePath  = rootDir </> importStr
                        rootWithExt   = map (rootBasePath ++) extensions
                        rootWithIndex = map (\ext -> rootBasePath </> "index" ++ ext) extensions
                        rootAllPaths  = rootWithExt ++ rootWithIndex ++ [rootBasePath]
                    findFirst rootAllPaths
  where
    findFirst [] = return Nothing
    findFirst (p:ps) = do
        exists <- doesFileExist p
        if exists
            then Just <$> canonicalizePath p
            else findFirst ps

-- | Analisa dependências e constrói o grafo
analyzeDependencies :: FilePath -> [FilePath] -> IO AnalysisResult
analyzeDependencies rootDir files = do
    absRootDir <- canonicalizePath rootDir
    absFiles <- mapM canonicalizePath files
    
    putStrLn "   - Carregando arquivos em cache..."
    cache <- loadFileCache absFiles
    
    putStrLn "   - Criando registro de arquivos..."
    let fileRegistry = createRegistry absRootDir absFiles
    let fileToId = createFileToIdMap absFiles
    
    putStrLn "   - Parseando imports..."
    fileNodes <- mapConcurrently (analyzeFile cache absRootDir fileToId fileRegistry) absFiles
    
    putStrLn "   - Calculando dependencias reversas..."
    let finalNodes = calculateImportedBy fileNodes
    
    putStrLn "   - Construindo indice de imports..."
    index <- buildImportIndex cache absFiles
    
    let styleFiles = filter isStyleFile absFiles
    let styleCount = length styleFiles
    putStrLn $ "   - Analisando " ++ show styleCount ++ " arquivos de estilos e verificando exports em paralelo..."
    
    (unusedStylesList, unusedExportsList) <- 
        let styleAnalysis  = analyzeUnusedStyles cache index absRootDir styleFiles fileToId
            exportAnalysis = analyzeUnusedExports cache index absRootDir absFiles fileToId
        in concurrently styleAnalysis exportAnalysis
    
    return $ AnalysisResult
        { projectName   = T.pack $ takeFileName absRootDir
        , analyzedAt    = "2026-04-13T09:15:02Z"
        , fileRegistry  = fileRegistry
        , dependencies  = finalNodes
        , unusedStyles  = unusedStylesList
        , unusedExports = unusedExportsList
        }

-- | Verifica se um arquivo é um arquivo de estilos
isStyleFile :: FilePath -> Bool
isStyleFile path = ".styles.ts" `isSuffixOf` path || ".styles.tsx" `isSuffixOf` path

-- | Analisa estilos não utilizados
analyzeUnusedStyles :: FileCache -> ImportIndex -> FilePath -> [FilePath] -> Map.Map FilePath Text -> IO [UnusedStyle]
analyzeUnusedStyles cache index rootDir styleFiles fileToId = do
    allUnused <- Style.findUnusedStyles cache index rootDir styleFiles
    return $ concatMap (convertReports fileToId) allUnused
  where
    convertReports :: Map.Map FilePath Text -> (FilePath, [Style.StyleUsageReport]) -> [UnusedStyle]
    convertReports idMap (filePath, reports) =
        let fid = Map.findWithDefault "?" filePath idMap
        in [ UnusedStyle
                { unusedStyleName   = Style.styleName report
                , unusedStyleFileId = fid
                , unusedImportType  = Style.importType report
                }
           | report <- reports
           ]

-- | Analisa exports não utilizados
analyzeUnusedExports :: FileCache -> ImportIndex -> FilePath -> [FilePath] -> Map.Map FilePath Text -> IO [UnusedExport]
analyzeUnusedExports cache index rootDir allFiles fileToId = do
    reports <- Exports.analyzeUnusedExports cache index rootDir allFiles
    return $ map (convertReport fileToId) reports
  where
    convertReport :: Map.Map FilePath Text -> Exports.UnusedExportReport -> UnusedExport
    convertReport idMap report = 
        let filePath = Exports.unusedExportFile report
            fid      = Map.findWithDefault "?" filePath idMap
        in UnusedExport
            { unusedExportName   = Exports.unusedExportName report
            , unusedExportType   = T.pack $ show (Exports.unusedExportType report)
            , unusedExportFileId = fid
            , canBeInternal      = determineIfCanBeInternal report
            }
    
    determineIfCanBeInternal :: Exports.UnusedExportReport -> Bool
    determineIfCanBeInternal report =
        Exports.usedInSameFile report && not (Exports.isUsedAnywhere report)

-- | Cria o registry de arquivos
createRegistry :: FilePath -> [FilePath] -> Map.Map Text Text
createRegistry rootDir files =
    let root        = Map.singleton "0" (T.pack rootDir)
        indexed     = zip [1..] files
        fileEntries = map (\(i, f) -> (T.pack (show i), T.pack (makeRelative rootDir f))) indexed
    in Map.union root (Map.fromList fileEntries)

-- | Cria mapa de arquivo para ID
createFileToIdMap :: [FilePath] -> Map.Map FilePath Text
createFileToIdMap files =
    Map.fromList $ zip files (map (T.pack . show) [1..])

-- | Analisa um arquivo
analyzeFile :: FileCache -> FilePath -> Map.Map FilePath Text -> Map.Map Text Text -> FilePath -> IO FileNode
analyzeFile cache rootDir fileToId registry filePath = do
    importStmts <- parseImports filePath
    resolvedIds <- mapM (resolveToId rootDir fileToId filePath) importStmts
    
    let myId     = fileToId Map.! filePath
        validIds = [i | Just i <- resolvedIds]
        nType    = nodeTypeToText (classifyNode filePath)
    
    return $ FileNode
        { fileId     = myId
        , nodeType   = nType
        , imports    = validIds
        , importedBy = []
        }

-- | Resolve import para ID
resolveToId :: FilePath -> Map.Map FilePath Text -> FilePath -> ImportStatement -> IO (Maybe Text)
resolveToId rootDir fileToId currentFile stmt = do
    let impSrc = importSource stmt
    resolved <- resolveImport rootDir currentFile impSrc
    case resolved of
        Just absPath -> return $ Map.lookup absPath fileToId
        Nothing      -> return Nothing

-- | Calcula quem importa cada arquivo
calculateImportedBy :: [FileNode] -> [FileNode]
calculateImportedBy nodes =
    map updateNode nodes
  where
    importersMap = foldr buildMap Map.empty nodes
    buildMap node acc =
        foldr (\imp m -> Map.insertWith (++) imp [fileId node] m) acc (imports node)
    updateNode node =
        node { importedBy = Map.findWithDefault [] (fileId node) importersMap }
