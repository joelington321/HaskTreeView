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

-- | Nó de arquivo no grafo de dependências
data FileNode = FileNode
    { fileId :: Text
    , imports :: [Text]
    , importedBy :: [Text]
    } deriving (Show, Eq, Generic)

instance ToJSON FileNode

-- | Informação sobre estilo não utilizado
data UnusedStyle = UnusedStyle
    { unusedStyleName :: Text
    , unusedStyleFileId :: Text  -- Mudado para usar ID
    , unusedImportType :: Text
    } deriving (Show, Eq, Generic)

instance ToJSON UnusedStyle where
    toJSON us = object
        [ "name" .= unusedStyleName us
        , "fileId" .= unusedStyleFileId us
        , "importType" .= unusedImportType us
        ]

-- | Informação sobre export não utilizado
data UnusedExport = UnusedExport
    { unusedExportName :: Text
    , unusedExportType :: Text
    , unusedExportFileId :: Text  -- Mudado para usar ID
    , canBeInternal :: Bool  -- Novo campo: pode ser convertido para uso interno
    } deriving (Show, Eq, Generic)

instance ToJSON UnusedExport where
    toJSON ue = object
        [ "name" .= unusedExportName ue
        , "type" .= unusedExportType ue
        , "fileId" .= unusedExportFileId ue
        , "canBeInternal" .= canBeInternal ue
        ]

-- | Resultado completo da análise
data AnalysisResult = AnalysisResult
    { projectName :: Text
    , analyzedAt :: Text
    , fileRegistry :: Map.Map Text Text
    , dependencies :: [FileNode]
    , unusedStyles :: [UnusedStyle]
    , unusedExports :: [UnusedExport]
    } deriving (Show, Generic)

instance ToJSON AnalysisResult where
    toJSON ar = object
        [ "projectName" .= projectName ar
        , "analyzedAt" .= analyzedAt ar
        , "fileRegistry" .= fileRegistry ar
        , "dependencies" .= dependencies ar
        , "unusedStyles" .= unusedStyles ar
        , "unusedExports" .= unusedExports ar
        ]

-- | Verifica se um path contém diretórios ignorados
containsIgnoredPath :: FilePath -> Bool
containsIgnoredPath path = 
    any (\ignored -> ignored `elem` splitDirectories path) ignoredPaths

-- | Verifica se um import é externo
isExternalImport :: String -> Bool
isExternalImport path = 
    -- Se contém paths ignorados, é externo
    containsIgnoredPath path
    -- Se é uma biblioteca conhecida, é externo
    || any (\pkg -> pkg `isPrefixOf` path) knownExternalPackages
    -- Se começa com @ mas não é path alias do projeto (@/), provavelmente é pacote scoped
    || ("@" `isPrefixOf` path && not ("@/" `isPrefixOf` path) && not ("./" `isPrefixOf` path || "../" `isPrefixOf` path))
    -- Se é path relativo ou path alias, é interno
    && not ("./" `isPrefixOf` path || "../" `isPrefixOf` path || "@/" `isPrefixOf` path)
    -- Se começa com diretórios típicos de projeto, é interno
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
                
            -- Determinar o caminho base
            basePath <- if "./" `isPrefixOf` importStr || "../" `isPrefixOf` importStr
                then do
                    -- Path relativo
                    return $ normalise (currentDir </> importStr)
                else if "@/" `isPrefixOf` importStr
                then do
                    -- Path alias TypeScript: @/ -> src/
                    let aliasPath = drop 2 importStr  -- Remove "@/"
                    return $ normalise (rootDir </> "src" </> aliasPath)
                else do
                    -- Path absoluto baseado em src/ (preferido) ou root do projeto
                    let srcBasedPath = rootDir </> "src" </> importStr
                        rootBasedPath = rootDir </> importStr
                    -- Tentar primeiro com src/, depois com root
                    return $ normalise srcBasedPath
                
            -- Tentar resolver arquivo em várias formas:
            -- 1. Como arquivo direto com extensões
            let withExt = map (basePath ++) extensions
            -- 2. Como diretório com /index.{ext}
                withIndex = map (\ext -> basePath </> "index" ++ ext) extensions
            -- 3. Como path exato (pode ser sem extensão)
                allPaths = withExt ++ withIndex ++ [basePath]
            
            result <- findFirst allPaths
            case result of
                Just path -> return $ Just path
                Nothing -> do
                    -- Se falhou com src/, tentar com root/
                    let rootBasePath = rootDir </> importStr
                        rootWithExt = map (rootBasePath ++) extensions
                        rootWithIndex = map (\ext -> rootBasePath </> "index" ++ ext) extensions
                        rootAllPaths = rootWithExt ++ rootWithIndex ++ [rootBasePath]
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
    
    -- Carregar todos os arquivos em cache UMA VEZ
    putStrLn "   - Carregando arquivos em cache..."
    cache <- loadFileCache absFiles
    
    -- Criar registry (0 = rootPath, 1+ = arquivos, -1- = externos)
    putStrLn "   - Criando registro de arquivos..."
    let fileRegistry = createRegistry absRootDir absFiles
    let fileToId = createFileToIdMap absFiles
    
    -- Analisar imports de cada arquivo
    putStrLn "   - Parseando imports..."
    fileNodes <- mapM (analyzeFile cache absRootDir fileToId fileRegistry) absFiles
    
    -- Calcular importedBy
    putStrLn "   - Calculando dependencias reversas..."
    let finalNodes = calculateImportedBy fileNodes
    
    -- Analisar estilos não utilizados
    let styleFiles = filter isStyleFile absFiles
    let styleCount = length styleFiles
    putStrLn $ "   - Analisando " ++ show styleCount ++ " arquivos de estilos..."
    unusedStylesList <- analyzeUnusedStyles cache absRootDir styleFiles fileToId
    
    -- Analisar exports não utilizados (todos os arquivos)
    putStrLn "   - Verificando uso de exports..."
    unusedExportsList <- analyzeUnusedExports cache absRootDir absFiles fileToId
    
    return $ AnalysisResult
        { projectName = T.pack $ takeFileName absRootDir
        , analyzedAt = "2025-11-11T00:00:00Z"
        , fileRegistry = fileRegistry
        , dependencies = finalNodes
        , unusedStyles = unusedStylesList
        , unusedExports = unusedExportsList
        }

-- | Verifica se um arquivo é um arquivo de estilos
isStyleFile :: FilePath -> Bool
isStyleFile path = ".styles.ts" `isSuffixOf` path || ".styles.tsx" `isSuffixOf` path

-- | Analisa estilos não utilizados
analyzeUnusedStyles :: FileCache -> FilePath -> [FilePath] -> Map.Map FilePath Text -> IO [UnusedStyle]
analyzeUnusedStyles cache rootDir styleFiles fileToId = do
    allUnused <- Style.findUnusedStyles cache rootDir styleFiles
    return $ concatMap (convertReports fileToId) allUnused
  where
    convertReports :: Map.Map FilePath Text -> (FilePath, [Style.StyleUsageReport]) -> [UnusedStyle]
    convertReports idMap (filePath, reports) =
        let fileId = Map.findWithDefault "?" filePath idMap
        in [ UnusedStyle
                { unusedStyleName = Style.styleName report
                , unusedStyleFileId = fileId
                , unusedImportType = Style.importType report
                }
           | report <- reports
           ]

-- | Analisa exports não utilizados
analyzeUnusedExports :: FileCache -> FilePath -> [FilePath] -> Map.Map FilePath Text -> IO [UnusedExport]
analyzeUnusedExports cache rootDir allFiles fileToId = do
    reports <- Exports.analyzeUnusedExports cache rootDir allFiles
    return $ map (convertReport fileToId) reports
  where
    convertReport :: Map.Map FilePath Text -> Exports.UnusedExportReport -> UnusedExport
    convertReport idMap report = 
        let filePath = Exports.unusedExportFile report
            fileId = Map.findWithDefault "?" filePath idMap
        in UnusedExport
            { unusedExportName = Exports.unusedExportName report
            , unusedExportType = T.pack $ show (Exports.unusedExportType report)
            , unusedExportFileId = fileId
            , canBeInternal = determineIfCanBeInternal report
            }
    
    -- Determina se um export pode ser convertido para uso interno
    -- Critério: usado apenas no próprio arquivo e não usado externamente
    determineIfCanBeInternal :: Exports.UnusedExportReport -> Bool
    determineIfCanBeInternal report =
        Exports.usedInSameFile report && not (Exports.isUsedAnywhere report)

-- | Cria o registry de arquivos
createRegistry :: FilePath -> [FilePath] -> Map.Map Text Text
createRegistry rootDir files =
    let root = Map.singleton "0" (T.pack rootDir)
        indexed = zip [1..] files
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
    
    -- Resolver imports
    resolvedIds <- mapM (resolveToId rootDir fileToId filePath) importStmts
    
    let myId = fileToId Map.! filePath
        validIds = [i | Just i <- resolvedIds]
    
    return $ FileNode
        { fileId = myId
        , imports = validIds
        , importedBy = []  -- Será preenchido depois
        }

-- | Resolve import para ID
resolveToId :: FilePath -> Map.Map FilePath Text -> FilePath -> ImportStatement -> IO (Maybe Text)
resolveToId rootDir fileToId currentFile stmt = do
    let impSrc = importSource stmt
    resolved <- resolveImport rootDir currentFile impSrc
    case resolved of
        Just absPath -> return $ Map.lookup absPath fileToId
        Nothing -> return Nothing  -- Ignorar externos por enquanto

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
