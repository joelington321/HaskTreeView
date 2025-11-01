{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE DeriveGeneric #-}

module DependencyAnalyzer
    ( AnalysisResult(..)
    , FileNode(..)
    , analyzeDependencies
    ) where

import qualified Data.Map.Strict as Map
import qualified Data.Text as T
import Data.Text (Text)
import Data.List (isPrefixOf)
import System.FilePath (takeDirectory, (</>), normalise, makeRelative, takeFileName, splitDirectories)
import System.Directory (canonicalizePath, doesFileExist)
import GHC.Generics (Generic)
import Data.Aeson (ToJSON, object, (.=))

import ImportParser (parseImports, ImportStatement(..), importSource)

-- | Pastas que devem ser ignoradas (sempre externas)
ignoredPaths :: [String]
ignoredPaths = ["node_modules", ".git", "dist", "build", ".next", "coverage"]

-- | Nó de arquivo no grafo de dependências
data FileNode = FileNode
    { fileId :: Text
    , imports :: [Text]
    , importedBy :: [Text]
    } deriving (Show, Eq, Generic)

instance ToJSON FileNode

-- | Resultado completo da análise
data AnalysisResult = AnalysisResult
    { projectName :: Text
    , analyzedAt :: Text
    , fileRegistry :: Map.Map Text Text
    , dependencies :: [FileNode]
    } deriving (Show, Generic)

instance ToJSON AnalysisResult

-- | Verifica se um path contém diretórios ignorados
containsIgnoredPath :: FilePath -> Bool
containsIgnoredPath path = 
    any (\ignored -> ignored `elem` splitDirectories path) ignoredPaths

-- | Verifica se um import é externo
isExternalImport :: String -> Bool
isExternalImport path = 
    not ("./" `isPrefixOf` path || "../" `isPrefixOf` path)
    || containsIgnoredPath path

-- | Resolve import para caminho de arquivo
resolveImport :: FilePath -> FilePath -> Text -> IO (Maybe FilePath)
resolveImport rootDir currentFile importPath = do
    let importStr = T.unpack importPath
    if isExternalImport importStr
        then return Nothing
        else do
            let currentDir = takeDirectory currentFile
                extensions = [".ts", ".tsx", ".js", ".jsx"]
                basePath = normalise (currentDir </> importStr)
                -- Tentar com extensões
                withExt = map (basePath ++) extensions
                -- Tentar com /index.{ext}
                withIndex = map (\ext -> basePath </> "index" ++ ext) extensions
                allPaths = basePath : (withExt ++ withIndex)
            findFirst allPaths
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
    
    -- Criar registry (0 = rootPath, 1+ = arquivos, -1- = externos)
    let fileRegistry = createRegistry absRootDir absFiles
    let fileToId = createFileToIdMap absFiles
    
    -- Analisar imports de cada arquivo
    fileNodes <- mapM (analyzeFile absRootDir fileToId fileRegistry) absFiles
    
    -- Calcular importedBy
    let finalNodes = calculateImportedBy fileNodes
    
    return $ AnalysisResult
        { projectName = T.pack $ takeFileName absRootDir
        , analyzedAt = "2025-11-01T00:00:00Z"
        , fileRegistry = fileRegistry
        , dependencies = finalNodes
        }

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
analyzeFile :: FilePath -> Map.Map FilePath Text -> Map.Map Text Text -> FilePath -> IO FileNode
analyzeFile rootDir fileToId registry filePath = do
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
