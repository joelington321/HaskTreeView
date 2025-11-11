{-# LANGUAGE OverloadedStrings #-}

module StyleUsageAnalyzer
    ( StyleExport(..)
    , StyleUsageReport(..)
    , analyzeStyleUsage
    , findUnusedStyles
    ) where

import qualified Data.Text as T
import qualified Data.Text.IO as TIO
import Data.Text (Text)
import Data.List (isPrefixOf, find, isSuffixOf)
import System.FilePath (takeExtension, takeDirectory, (</>), makeRelative)
import qualified Data.Map.Strict as Map
import Control.Monad (filterM, forM)
import System.Directory (doesFileExist)
import FileFilter (getFilteredFiles)

-- | Representa um export de styled-component
data StyleExport = StyleExport
    { exportName :: Text
    , exportLine :: Text
    , lineNumber :: Int
    , sourceFile :: FilePath
    } deriving (Show, Eq)

-- | Relatório de uso de um estilo
data StyleUsageReport = StyleUsageReport
    { styleName :: Text
    , styleFile :: FilePath
    , isUsed :: Bool
    , usedIn :: [FilePath]  -- Arquivos onde é usado
    , importType :: Text    -- "direct" ou "namespace"
    } deriving (Show, Eq)

-- | Analisa o uso de styled-components em um arquivo de estilos
analyzeStyleUsage :: FilePath -> FilePath -> IO [StyleUsageReport]
analyzeStyleUsage rootDir styleFilePath = do
    -- Extrair todos os exports do arquivo de estilos
    exports <- extractStyleExports styleFilePath
    
    -- Encontrar arquivos que importam este arquivo de estilos em todo o projeto
    importers <- findImportersInProject rootDir styleFilePath
    
    -- Para cada export, verificar se é usado
    mapM (checkUsage importers) exports

-- | Extrai todos os exports de styled-components de um arquivo
extractStyleExports :: FilePath -> IO [StyleExport]
extractStyleExports filePath = do
    content <- TIO.readFile filePath
    let linesWithNumbers = zip [1..] (T.lines content)
        exports = filter isStyledExport linesWithNumbers
    return $ map (createExport filePath) exports
  where
    -- Verifica se uma linha é um export de styled-component
    isStyledExport :: (Int, Text) -> Bool
    isStyledExport (_, line) =
        let trimmed = T.strip line
        in ("export const " `T.isPrefixOf` trimmed && "styled." `T.isInfixOf` trimmed)
           || ("export const " `T.isPrefixOf` trimmed && "styled(" `T.isInfixOf` trimmed)
    
    createExport :: FilePath -> (Int, Text) -> StyleExport
    createExport path (lineNum, line) = StyleExport
        { exportName = extractExportName line
        , exportLine = line
        , lineNumber = lineNum
        , sourceFile = path
        }
    
    -- Extrai o nome do export de uma linha como "export const Button = styled.button`"
    extractExportName :: Text -> Text
    extractExportName line =
        let afterConst = T.strip $ T.drop (T.length "export const ") $ T.stripStart line
            name = T.takeWhile (/= '=') afterConst
        in T.strip name

-- | Encontra arquivos que importam o arquivo de estilos em todo o projeto
findImportersInProject :: FilePath -> FilePath -> IO [FilePath]
findImportersInProject rootDir styleFilePath = do
    -- Buscar todos os arquivos .tsx e .ts no projeto
    allFiles <- getFilteredFiles rootDir
    let jsFiles = filter (\f -> takeExtension f `elem` [".tsx", ".ts", ".js", ".jsx"]) allFiles
    
    -- Filtrar apenas arquivos que realmente importam o estilo
    actualImporters <- filterM (importsStyleFile rootDir styleFilePath) jsFiles
    
    return actualImporters

-- | Verifica se um arquivo importa o arquivo de estilos
importsStyleFile :: FilePath -> FilePath -> FilePath -> IO Bool
importsStyleFile rootDir styleFile targetFile = do
    content <- TIO.readFile targetFile
    let styleRelativePath = makeRelative rootDir styleFile
        -- Gerar possíveis caminhos de import
        possibleImportPaths = generateImportPaths rootDir targetFile styleFile
    
    -- Verificar se algum dos caminhos possíveis está no conteúdo
    return $ any (\path -> isImportPresent content path) possibleImportPaths

-- | Gera possíveis caminhos de import baseado nos arquivos
generateImportPaths :: FilePath -> FilePath -> FilePath -> [Text]
generateImportPaths rootDir fromFile toFile =
    let fromDir = takeDirectory fromFile
        toPath = toFile
        -- Remover extensão do arquivo de destino
        toPathNoExt = if ".styles.ts" `isSuffixOf` toPath
                      then take (length toPath - 10) toPath ++ ".styles"
                      else if ".styles.tsx" `isSuffixOf` toPath  
                      then take (length toPath - 11) toPath ++ ".styles"
                      else toPath
        
        -- Calcular caminho relativo
        relativePath = makeRelative fromDir toPathNoExt
        
        -- Normalizar para import path (usar / ao invés de \)
        normalizedPath = map (\c -> if c == '\\' then '/' else c) relativePath
        
        -- Calcular caminho absoluto baseado em src/
        srcRelativePath = makeRelative (rootDir </> "src") toPathNoExt
        srcNormalizedPath = map (\c -> if c == '\\' then '/' else c) srcRelativePath
        
        -- Calcular caminho absoluto baseado no root
        rootRelativePath = makeRelative rootDir toPathNoExt  
        rootNormalizedPath = map (\c -> if c == '\\' then '/' else c) rootRelativePath
        
        -- Gerar variações do caminho
        variations = [ T.pack normalizedPath
                     , T.pack ("./" ++ normalizedPath)
                     , T.pack ("../" ++ normalizedPath)
                     -- Caminhos absolutos baseados em src/ (mais comum em projetos React/RN)
                     , T.pack srcNormalizedPath
                     , T.pack ("./" ++ srcNormalizedPath)
                     -- Caminhos absolutos do root do projeto
                     , T.pack rootNormalizedPath
                     , T.pack ("./" ++ rootNormalizedPath)
                     ]
        
        -- Remover duplicatas e caminhos vazios
        uniqueVariations = filter (not . T.null) $ map T.strip variations
    in uniqueVariations

-- | Verifica se um import está presente no conteúdo
isImportPresent :: Text -> Text -> Bool
isImportPresent content importPath =
    let cleanContent = T.unwords $ T.words content  -- Remove quebras de linha extras
    in ("import" `T.isInfixOf` cleanContent) 
       && ("from" `T.isInfixOf` cleanContent)
       && (importPath `T.isInfixOf` cleanContent)

-- | Verifica se um export de estilo é usado
checkUsage :: [FilePath] -> StyleExport -> IO StyleUsageReport
checkUsage importers export = do
    usages <- mapM (checkFileUsage export) importers
    let usedFiles = [f | (f, True) <- usages]
    importTypeDetected <- if null usedFiles 
                          then return "none" 
                          else detectImportType (head usedFiles) export
    
    return $ StyleUsageReport
        { styleName = exportName export
        , styleFile = sourceFile export
        , isUsed = not (null usedFiles)
        , usedIn = usedFiles
        , importType = importTypeDetected
        }

-- | Verifica se um estilo é usado em um arquivo específico
checkFileUsage :: StyleExport -> FilePath -> IO (FilePath, Bool)
checkFileUsage export filePath = do
    content <- TIO.readFile filePath
    let name = exportName export
        
    -- Verificar import tipo namespace (import * as S)
    namespaceUsed <- checkNamespaceUsage content name filePath
    
    -- Verificar import direto (import { Button })
    let directUsed = checkDirectUsage content name
    
    return (filePath, namespaceUsed || directUsed)

-- | Verifica uso através de namespace import (S.Button)
checkNamespaceUsage :: Text -> Text -> FilePath -> IO Bool
checkNamespaceUsage content componentName filePath = do
    let lines' = T.lines content
    -- Encontrar linhas de import namespace
    let namespaceImports = filter isNamespaceImport lines'
    
    case namespaceImports of
        [] -> return False
        imports -> do
            let namespaces = map extractNamespace imports
            -- Verificar se algum uso como "namespace.Component" existe no código
            let hasUsage = any (\ns -> T.isInfixOf (ns <> "." <> componentName) content) namespaces
            return hasUsage
  where
    isNamespaceImport :: Text -> Bool
    isNamespaceImport line =
        let trimmed = T.strip line
        in ("import * as " `T.isPrefixOf` trimmed)
           && ("from" `T.isInfixOf` trimmed)
    
    extractNamespace :: Text -> Text
    extractNamespace line =
        let afterAs = T.strip $ T.drop (T.length "import * as ") $ T.stripStart line
            namespace = T.takeWhile (\c -> c /= ' ' && c /= '\t') afterAs
        in namespace

-- | Verifica uso através de import direto (<Button>)
checkDirectUsage :: Text -> Text -> Bool
checkDirectUsage content componentName =
    -- Procurar por <ComponentName> ou <ComponentName /> ou <ComponentName>...</ComponentName>
    let openTag = "<" <> componentName
        closeTag = "</" <> componentName <> ">"
    in openTag `T.isInfixOf` content || closeTag `T.isInfixOf` content

-- | Detecta o tipo de import usado
detectImportType :: FilePath -> StyleExport -> IO Text
detectImportType filePath export = do
    content <- TIO.readFile filePath
    let lines' = T.lines content
        name = exportName export
    
    -- Verificar se há import namespace
    let hasNamespace = any (\line -> "import * as " `T.isPrefixOf` T.strip line) lines'
    
    -- Verificar se há import direto com o nome
    let hasDirect = any (\line -> 
            let trimmed = T.strip line
            in ("import {" `T.isPrefixOf` trimmed || "import { " `T.isPrefixOf` trimmed)
               && name `T.isInfixOf` trimmed) lines'
    
    return $ if hasNamespace then "namespace"
             else if hasDirect then "direct"
             else "unknown"

-- | Encontra estilos não utilizados em um conjunto de arquivos
findUnusedStyles :: FilePath -> [FilePath] -> IO [(FilePath, [StyleUsageReport])]
findUnusedStyles rootDir styleFiles = do
    reports <- mapM (analyzeStyleFile rootDir) styleFiles
    return [(file, filter (not . isUsed) report) | (file, report) <- reports, not (null (filter (not . isUsed) report))]
  where
    analyzeStyleFile :: FilePath -> FilePath -> IO (FilePath, [StyleUsageReport])
    analyzeStyleFile root file = do
        report <- analyzeStyleUsage root file
        return (file, report)
