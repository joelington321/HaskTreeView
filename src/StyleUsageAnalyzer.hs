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
import System.FilePath (takeExtension, takeDirectory, (</>))
import qualified Data.Map.Strict as Map
import Control.Monad (filterM, forM)
import System.Directory (doesFileExist)

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
analyzeStyleUsage :: FilePath -> IO [StyleUsageReport]
analyzeStyleUsage styleFilePath = do
    -- Extrair todos os exports do arquivo de estilos
    exports <- extractStyleExports styleFilePath
    
    -- Encontrar arquivos que importam este arquivo de estilos
    importers <- findImporters styleFilePath
    
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

-- | Encontra arquivos que importam o arquivo de estilos
findImporters :: FilePath -> IO [FilePath]
findImporters styleFilePath = do
    -- Buscar arquivos .tsx e .ts no mesmo diretório
    let dir = takeDirectory styleFilePath
        baseName = getStyleBaseName styleFilePath
    
    -- Procurar por arquivos que podem importar este estilo
    -- Primeiro verificar arquivo com mesmo nome no mesmo diretório
    let possibleImporters = 
            [ dir </> baseName ++ ".tsx"
            , dir </> baseName ++ ".ts"
            ]
    
    existingFiles <- filterM doesFileExist possibleImporters
    
    -- Filtrar apenas arquivos que realmente importam o estilo
    actualImporters <- filterM (importsStyle styleFilePath) existingFiles
    
    return actualImporters
  where
    -- Remove .styles.ts ou .styles.tsx do nome do arquivo
    -- Exemplo: "Legend.styles.ts" -> "Legend"
    getStyleBaseName :: FilePath -> String
    getStyleBaseName path =
        let fileName = reverse $ takeWhile (\c -> c /= '/' && c /= '\\') $ reverse path
            -- Se termina com .styles.ts, remove 10 caracteres
            -- Se termina com .styles.tsx, remove 11 caracteres
        in if ".styles.tsx" `isSuffixOf` fileName
           then take (length fileName - 11) fileName
           else if ".styles.ts" `isSuffixOf` fileName
           then take (length fileName - 10) fileName
           else fileName

-- | Verifica se um arquivo importa o arquivo de estilos
importsStyle :: FilePath -> FilePath -> IO Bool
importsStyle styleFile targetFile = do
    content <- TIO.readFile targetFile
    let styleBaseName = T.pack $ getStyleFileName styleFile
    -- Verificar em todo o conteúdo (não linha por linha) para suportar imports multi-linha
    return $ ("import" `T.isInfixOf` content)
          && ("from" `T.isInfixOf` content)
          && (styleBaseName `T.isInfixOf` content)
  where
    getStyleFileName :: FilePath -> String
    getStyleFileName path =
        let fileName = reverse $ takeWhile (\c -> c /= '/' && c /= '\\') $ reverse path
            -- Remove a extensão completa: .styles.ts ou .styles.tsx
            withoutExt = if ".styles.tsx" `isSuffixOf` fileName
                        then take (length fileName - 11) fileName
                        else if ".styles.ts" `isSuffixOf` fileName
                        then take (length fileName - 10) fileName
                        else fileName
        in withoutExt ++ ".styles"

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
findUnusedStyles :: [FilePath] -> IO [(FilePath, [StyleUsageReport])]
findUnusedStyles styleFiles = do
    reports <- mapM analyzeStyleFile styleFiles
    return [(file, filter (not . isUsed) report) | (file, report) <- reports, not (null (filter (not . isUsed) report))]
  where
    analyzeStyleFile :: FilePath -> IO (FilePath, [StyleUsageReport])
    analyzeStyleFile file = do
        report <- analyzeStyleUsage file
        return (file, report)
