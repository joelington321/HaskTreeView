{-# LANGUAGE OverloadedStrings #-}

module UnusedExportsAnalyzer
    ( ExportInfo(..)
    , ExportType(..)
    , UnusedExportReport(..)
    , analyzeUnusedExports
    , findAllExports
    ) where

import qualified Data.Text as T
import qualified Data.Text.IO as TIO
import Data.Text (Text)
import Data.List (isPrefixOf, find, isSuffixOf)
import System.FilePath (takeExtension, takeDirectory, (</>), takeFileName)
import qualified Data.Map.Strict as Map
import Control.Monad (filterM, forM)
import System.Directory (doesFileExist, listDirectory)
import Data.Maybe (mapMaybe)

-- | Tipo de export
data ExportType 
    = FunctionExport      -- export function foo() {}
    | ConstExport         -- export const foo = ...
    | ClassExport         -- export class Foo {}
    | InterfaceExport     -- export interface Foo {}
    | TypeExport          -- export type Foo = ...
    | DefaultExport       -- export default ...
    | StyledComponentExport -- export const Foo = styled.div`...`
    deriving (Show, Eq)

-- | Informação sobre um export
data ExportInfo = ExportInfo
    { exportName :: Text
    , exportType :: ExportType
    , exportLine :: Text
    , lineNumber :: Int
    , sourceFile :: FilePath
    } deriving (Show, Eq)

-- | Relatório de export não utilizado
data UnusedExportReport = UnusedExportReport
    { unusedExportName :: Text
    , unusedExportType :: ExportType
    , unusedExportFile :: FilePath
    , isUsedAnywhere :: Bool
    , usedInFiles :: [FilePath]
    , usedInSameFile :: Bool  -- Novo campo: usado no próprio arquivo
    } deriving (Show, Eq)

-- | Analisa todos os exports não utilizados em um conjunto de arquivos
analyzeUnusedExports :: FilePath -> [FilePath] -> IO [UnusedExportReport]
analyzeUnusedExports rootDir allFiles = do
    let sourceFiles = filter isSourceFile allFiles
    
    -- Para cada arquivo, extrair seus exports
    allExportsWithFiles <- mapM extractFileExports sourceFiles
    let allExports = concat allExportsWithFiles
    
    -- Para cada export, verificar se é usado em algum lugar
    reports <- mapM (checkExportUsage rootDir allFiles) allExports
    
    -- Retornar apenas os não utilizados
    return $ filter (not . isUsedAnywhere) reports

-- | Verifica se um arquivo é um arquivo fonte válido
isSourceFile :: FilePath -> Bool
isSourceFile path = 
    let ext = takeExtension path
    in ext `elem` [".ts", ".tsx", ".js", ".jsx"]
       && not (".styles.ts" `isSuffixOf` path)
       && not (".styles.tsx" `isSuffixOf` path)
       && not (".test." `T.isInfixOf` T.pack path)
       && not (".spec." `T.isInfixOf` T.pack path)

-- | Extrai todos os exports de um arquivo
extractFileExports :: FilePath -> IO [ExportInfo]
extractFileExports filePath = do
    content <- TIO.readFile filePath
    let linesWithNumbers = zip [1..] (T.lines content)
        exports = mapMaybe (parseExportLine filePath) linesWithNumbers
    return exports

-- | Tenta parsear uma linha como export
parseExportLine :: FilePath -> (Int, Text) -> Maybe ExportInfo
parseExportLine filePath (lineNum, line) =
    let trimmed = T.strip line
    in if not ("export" `T.isPrefixOf` trimmed) || "//" `T.isPrefixOf` trimmed
       then Nothing
       else detectExportType filePath lineNum trimmed

-- | Detecta o tipo de export e extrai informações
detectExportType :: FilePath -> Int -> Text -> Maybe ExportInfo
detectExportType filePath lineNum line
    -- export default
    | "export default " `T.isPrefixOf` line =
        Just $ ExportInfo
            { exportName = "default"
            , exportType = DefaultExport
            , exportLine = line
            , lineNumber = lineNum
            , sourceFile = filePath
            }
    
    -- export const foo = styled.div`...`
    | "export const " `T.isPrefixOf` line && ("styled." `T.isInfixOf` line || "styled(" `T.isInfixOf` line) =
        let name = extractNameAfter "export const " line
        in Just $ ExportInfo
            { exportName = name
            , exportType = StyledComponentExport
            , exportLine = line
            , lineNumber = lineNum
            , sourceFile = filePath
            }
    
    -- export const foo = ...
    | "export const " `T.isPrefixOf` line =
        let name = extractNameAfter "export const " line
        in Just $ ExportInfo
            { exportName = name
            , exportType = ConstExport
            , exportLine = line
            , lineNumber = lineNum
            , sourceFile = filePath
            }
    
    -- export function foo()
    | "export function " `T.isPrefixOf` line =
        let name = extractNameAfter "export function " line
        in Just $ ExportInfo
            { exportName = name
            , exportType = FunctionExport
            , exportLine = line
            , lineNumber = lineNum
            , sourceFile = filePath
            }
    
    -- export class Foo
    | "export class " `T.isPrefixOf` line =
        let name = extractNameAfter "export class " line
        in Just $ ExportInfo
            { exportName = name
            , exportType = ClassExport
            , exportLine = line
            , lineNumber = lineNum
            , sourceFile = filePath
            }
    
    -- export interface Foo
    | "export interface " `T.isPrefixOf` line =
        let name = extractNameAfter "export interface " line
        in Just $ ExportInfo
            { exportName = name
            , exportType = InterfaceExport
            , exportLine = line
            , lineNumber = lineNum
            , sourceFile = filePath
            }
    
    -- export type Foo
    | "export type " `T.isPrefixOf` line =
        let name = extractNameAfter "export type " line
        in Just $ ExportInfo
            { exportName = name
            , exportType = TypeExport
            , exportLine = line
            , lineNumber = lineNum
            , sourceFile = filePath
            }
    
    -- export { foo, bar } - Named exports (mais complexo, pode precisar refinamento)
    | "export {" `T.isPrefixOf` line || "export { " `T.isPrefixOf` line =
        -- Por enquanto ignoramos, mas poderia ser implementado
        Nothing
    
    | otherwise = Nothing

-- | Extrai o nome após um prefixo
extractNameAfter :: Text -> Text -> Text
extractNameAfter prefix line =
    let afterPrefix = T.strip $ T.drop (T.length prefix) line
        name = T.takeWhile (\c -> c /= '=' && c /= '(' && c /= '<' && c /= ' ' && c /= '{' && c /= ':') afterPrefix
    in T.strip name

-- | Encontra todos os exports de um conjunto de arquivos
findAllExports :: [FilePath] -> IO [ExportInfo]
findAllExports files = do
    let sourceFiles = filter isSourceFile files
    allExports <- mapM extractFileExports sourceFiles
    return $ concat allExports

-- | Verifica se um export é usado em algum lugar
checkExportUsage :: FilePath -> [FilePath] -> ExportInfo -> IO UnusedExportReport
checkExportUsage rootDir allFiles exportInfo = do
    let exportFile = sourceFile exportInfo
        name = exportName exportInfo
        otherFiles = filter (/= exportFile) allFiles
    
    -- PRIMEIRO: Verificar se é usado no próprio arquivo
    usedInOwn <- checkIfUsedInOwnFile exportInfo
    
    -- SEGUNDO: Encontrar arquivos que importam o arquivo do export
    importers <- findFilesImporting exportFile otherFiles
    
    -- TERCEIRO: Verificar se o export específico é usado nesses arquivos
    usages <- mapM (checkIfExportUsedInFile exportInfo) importers
    let usedFiles = [f | (f, True) <- usages]
    
    return $ UnusedExportReport
        { unusedExportName = name
        , unusedExportType = exportType exportInfo
        , unusedExportFile = exportFile
        , isUsedAnywhere = not (null usedFiles)
        , usedInFiles = usedFiles
        , usedInSameFile = usedInOwn
        }

-- | Verifica se um export é usado no próprio arquivo onde é definido
checkIfUsedInOwnFile :: ExportInfo -> IO Bool
checkIfUsedInOwnFile exportInfo = do
    let filePath = sourceFile exportInfo
        name = exportName exportInfo
        exportLineNum = lineNumber exportInfo
    
    content <- TIO.readFile filePath
    let contentLines = T.lines content
        -- Remover a linha do export para não contar como "uso"
        linesWithNumbers = zip [1..] contentLines
        otherLines = [line | (num, line) <- linesWithNumbers, num /= exportLineNum]
        otherContent = T.unlines otherLines
        eType = exportType exportInfo
    
    -- Verificar diferentes tipos de uso no restante do arquivo
    return $ checkDirectUsageInContent otherContent name
          || checkJSXUsage otherContent name
          || checkFunctionCall otherContent name
          || checkTypeUsage otherContent name eType
          || checkClassOrInterfaceUsage otherContent name
  where
    -- Verifica uso direto do nome (não em import/export)
    checkDirectUsageInContent :: Text -> Text -> Bool
    checkDirectUsageInContent content nm =
        let lines' = filter (not . isImportOrExportLine) $ T.lines content
            contentWithoutImports = T.unlines lines'
        in nm `T.isInfixOf` contentWithoutImports
    
    isImportOrExportLine :: Text -> Bool
    isImportOrExportLine line =
        let trimmed = T.strip line
        in ("import " `T.isPrefixOf` trimmed) || ("export " `T.isPrefixOf` trimmed)
    
    -- Verifica se é usado como base de classe ou interface
    checkClassOrInterfaceUsage :: Text -> Text -> Bool
    checkClassOrInterfaceUsage content nm =
        ("extends " <> nm) `T.isInfixOf` content
        || ("implements " <> nm) `T.isInfixOf` content

-- | Encontra arquivos que importam um arquivo específico
findFilesImporting :: FilePath -> [FilePath] -> IO [FilePath]
findFilesImporting sourceFile allFiles = do
    -- Encontrar arquivos que importam diretamente
    directImporters <- filterM (importsFile sourceFile) allFiles
    
    -- Encontrar arquivos que fazem re-export
    reExporters <- findReExporters sourceFile allFiles
    
    -- Se houver re-exporters, encontrar quem importa deles também
    indirectImporters <- if null reExporters
                        then return []
                        else do
                            nested <- mapM (\re -> findFilesImporting re allFiles) reExporters
                            return $ concat nested
    
    -- Combinar e remover duplicatas
    return $ nubBy (\a b -> a == b) (directImporters ++ reExporters ++ indirectImporters)
  where
    nubBy :: (a -> a -> Bool) -> [a] -> [a]
    nubBy _ [] = []
    nubBy eq (x:xs) = x : nubBy eq (filter (not . eq x) xs)

-- | Encontra arquivos que fazem re-export de exports de um arquivo
findReExporters :: FilePath -> [FilePath] -> IO [FilePath]
findReExporters sourceFile allFiles = do
    filterM (reExportsFrom sourceFile) allFiles

-- | Verifica se um arquivo faz re-export de outro
reExportsFrom :: FilePath -> FilePath -> IO Bool
reExportsFrom sourceFile targetFile = do
    if sourceFile == targetFile
        then return False
        else do
            content <- TIO.readFile targetFile
            let fileName = T.pack $ getImportableName sourceFile
                lines' = T.lines content
            -- Verificar padrões de re-export:
            -- export { foo } from './source'
            -- export * from './source'
            return $ any (isReExportLine fileName) lines'
  where
    isReExportLine :: Text -> Text -> Bool
    isReExportLine fname line =
        let trimmed = T.strip line
        in ("export " `T.isPrefixOf` trimmed)
           && ("from" `T.isInfixOf` trimmed)
           && (fname `T.isInfixOf` trimmed)
    
    getImportableName :: FilePath -> String
    getImportableName path =
        let name = takeFileName path
        in if ".tsx" `isSuffixOf` name
           then take (length name - 4) name
           else if ".ts" `isSuffixOf` name
           then take (length name - 3) name
           else name

-- | Verifica se um arquivo importa outro
importsFile :: FilePath -> FilePath -> IO Bool
importsFile sourceFile targetFile = do
    content <- TIO.readFile targetFile
    let fileName = T.pack $ getImportableName sourceFile
        -- Também verificar path alias (@/...)
        fileNameWithAlias = T.pack $ getAliasImportName sourceFile
    -- Verificar se há import do arquivo (direto ou via alias)
    return $ ("import" `T.isInfixOf` content)
          && ("from" `T.isInfixOf` content)
          && (fileName `T.isInfixOf` content || fileNameWithAlias `T.isInfixOf` content)
  where
    -- Extrai o nome "importável" do arquivo (sem extensão)
    getImportableName :: FilePath -> String
    getImportableName path =
        let name = takeFileName path
            withoutExt = if ".tsx" `isSuffixOf` name
                        then take (length name - 4) name
                        else if ".ts" `isSuffixOf` name
                        then take (length name - 3) name
                        else if ".jsx" `isSuffixOf` name
                        then take (length name - 4) name
                        else if ".js" `isSuffixOf` name
                        then take (length name - 3) name
                        else name
        in withoutExt
    
    -- Converte path absoluto para possível path alias
    -- Ex: C:/project/src/constants/colors.ts -> @/constants/colors
    getAliasImportName :: FilePath -> String
    getAliasImportName path =
        let normalized = map (\c -> if c == '\\' then '/' else c) path
        in if "/src/" `isPrefixOf` normalized || "\\src\\" `isPrefixOf` path
           then
               let afterSrc = reverse $ takeWhile (/= '/') $ dropWhile (/= '/') $ reverse normalized
                   parts = splitPath afterSrc
                   fileName = getImportableName path
                   dir = reverse $ drop (length fileName + 1) $ reverse afterSrc
               in "@/" ++ dir ++ fileName
           else ""
    
    splitPath :: String -> [String]
    splitPath "" = []
    splitPath s = 
        let (dir, rest) = break (== '/') s
        in if null rest
           then [dir]
           else dir : splitPath (tail rest)

-- | Verifica se um export específico é usado em um arquivo
checkIfExportUsedInFile :: ExportInfo -> FilePath -> IO (FilePath, Bool)
checkIfExportUsedInFile exportInfo filePath = do
    content <- TIO.readFile filePath
    let name = exportName exportInfo
        eType = exportType exportInfo
    
    -- Verificar diferentes tipos de uso
    let isUsed = checkDirectImport content name
              || checkNamespaceUsage content name
              || checkJSXUsage content name
              || checkFunctionCall content name
              || checkTypeUsage content name eType
    
    return (filePath, isUsed)

-- | Verifica se há import direto do nome
checkDirectImport :: Text -> Text -> Bool
checkDirectImport content name =
    -- import { foo } from ...
    let importPattern1 = "{ " <> name <> " }"
        importPattern2 = "{" <> name <> "}"
        importPattern3 = "{ " <> name <> ","
        importPattern4 = ", " <> name <> " }"
        importPattern5 = ", " <> name <> ","
    in any (`T.isInfixOf` content) [importPattern1, importPattern2, importPattern3, importPattern4, importPattern5]

-- | Verifica uso via namespace (import * as X)
checkNamespaceUsage :: Text -> Text -> Bool
checkNamespaceUsage content name =
    -- Procura por padrões como: X.foo, X.foo(, X.foo<
    let lines' = T.lines content
        namespaceImports = filter isNamespaceImport lines'
        namespaces = map extractNamespace namespaceImports
    in any (\ns -> (ns <> "." <> name) `T.isInfixOf` content) namespaces
  where
    isNamespaceImport line = "import * as " `T.isPrefixOf` T.strip line
    extractNamespace line =
        let afterAs = T.strip $ T.drop (T.length "import * as ") $ T.stripStart line
        in T.takeWhile (\c -> c /= ' ' && c /= '\t') afterAs

-- | Verifica uso em JSX
checkJSXUsage :: Text -> Text -> Bool
checkJSXUsage content name =
    -- <Foo>, <Foo />, </Foo>
    let openTag = "<" <> name
        closeTag = "</" <> name
    in openTag `T.isInfixOf` content || closeTag `T.isInfixOf` content

-- | Verifica chamadas de função
checkFunctionCall :: Text -> Text -> Bool
checkFunctionCall content name =
    -- foo(, foo <, foo=, foo:
    let patterns = [name <> "(", name <> " (", name <> "<", name <> "=", name <> ":"]
    in any (`T.isInfixOf` content) patterns

-- | Verifica uso de tipos/interfaces
checkTypeUsage :: Text -> Text -> ExportType -> Bool
checkTypeUsage content name eType =
    case eType of
        InterfaceExport -> checkTypeOrInterfaceUsage content name
        TypeExport -> checkTypeOrInterfaceUsage content name
        _ -> False
  where
    checkTypeOrInterfaceUsage :: Text -> Text -> Bool
    checkTypeOrInterfaceUsage c n =
        -- : Foo, <Foo>, extends Foo, implements Foo
        let patterns = [ ": " <> n
                       , "<" <> n <> ">"
                       , "<" <> n <> ","
                       , " " <> n <> ">"
                       , "extends " <> n
                       , "implements " <> n
                       , "as " <> n
                       ]
        in any (`T.isInfixOf` c) patterns
