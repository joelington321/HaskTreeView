{-# LANGUAGE OverloadedStrings #-}

module ImportIndex
    ( ImportIndex(..)
    , buildImportIndex
    , isSymbolUsedInFiles
    , getFilesUsingSymbol
    ) where

import qualified Data.Text as T
import Data.Text (Text)
import qualified Data.Map.Strict as Map
import qualified Data.Set as Set
import Data.Set (Set)
import Data.List (isPrefixOf, isSuffixOf)
import System.FilePath (takeExtension, takeDirectory, takeFileName)
import FileCache (FileCache, getLines)
import Control.Concurrent.Async (mapConcurrently)

-- | Estrutura de índice invertido para buscas rápidas
data ImportIndex = ImportIndex
    { symbolToFiles :: Map.Map Text (Set FilePath)
    , fileToSymbols :: Map.Map FilePath (Set Text)
    } deriving (Show, Eq)

-- | Constrói o índice de imports analisando todos os arquivos uma única vez
buildImportIndex :: FileCache -> [FilePath] -> IO ImportIndex
buildImportIndex cache allFiles = do
    let jsFiles = filter isJsFile allFiles
    fileSymbolPairs <- mapConcurrently (extractSymbolsFromFile cache) jsFiles
    let fileToSymbolsMap = Map.fromList fileSymbolPairs
        symbolToFilesMap = Map.fromListWith Set.union
            [ (symbol, Set.singleton file)
            | (file, symbols) <- fileSymbolPairs
            , symbol <- Set.toList symbols
            ]
    return $ ImportIndex symbolToFilesMap fileToSymbolsMap

-- | Verifica se arquivo é JS/TS válido
isJsFile :: FilePath -> Bool
isJsFile path =
    let ext = takeExtension path
    in ext `elem` [".ts", ".tsx", ".js", ".jsx"]

-- | Junta imports multi-linha em uma única linha.
-- Ex:
--   import {        <+
--     ax,           < |-- vira: "import { ax, foo } from './api'"
--     foo,          < |
--   } from './api'  <+
normalizeMultilineImports :: [Text] -> [Text]
normalizeMultilineImports [] = []
normalizeMultilineImports (line:rest)
    | isOpenImport line =
        let (importLines, remaining) = collectUntilClose rest
            joined = T.unwords (line : importLines)
        in joined : normalizeMultilineImports remaining
    | otherwise = line : normalizeMultilineImports rest
  where
    isOpenImport :: Text -> Bool
    isOpenImport l =
        let trimmed = T.strip l
        in "import" `T.isPrefixOf` trimmed
           && "{" `T.isInfixOf` trimmed
           && not ("}" `T.isInfixOf` trimmed)

    collectUntilClose :: [Text] -> ([Text], [Text])
    collectUntilClose [] = ([], [])
    collectUntilClose (l:ls)
        | "}" `T.isInfixOf` l = ([l], ls)
        | otherwise =
            let (more, remaining) = collectUntilClose ls
            in (l : more, remaining)

-- | Extrai todos os símbolos (imports e usos) de um arquivo
extractSymbolsFromFile :: FileCache -> FilePath -> IO (FilePath, Set Text)
extractSymbolsFromFile cache filePath = do
    let content = getLines cache filePath
        -- Juntar imports multi-linha em uma única linha ANTES de processar
        normalizedLines = normalizeMultilineImports content
        allSymbols = Set.fromList $ concatMap extractSymbolsFromLine normalizedLines
    return (filePath, allSymbols)

-- | Extrai símbolos de uma linha (imports e usos no código)
extractSymbolsFromLine :: Text -> [Text]
extractSymbolsFromLine line =
    let namedImports    = extractNamedImports line
        defaultImports  = extractDefaultImport line
        namespaceImports = extractNamespaceImport line
        -- extrair paths de dynamic imports para conectar nós
        dynamicPaths    = extractDynamicImportPaths line
        identifiers     = extractIdentifiersFromCode line
    in namedImports ++ defaultImports ++ namespaceImports ++ dynamicPaths ++ identifiers

-- | Extrai imports nomeados: import { A, B as C } from '...'
extractNamedImports :: Text -> [Text]
extractNamedImports line =
    case T.stripPrefix "import" (T.strip line) of
        Nothing -> []
        Just rest ->
            case T.breakOn "{" rest of
                (_, "") -> []
                (_, afterBrace) ->
                    case T.breakOn "}" afterBrace of
                        (_, "") -> []
                        (imports, _) ->
                            let cleaned = T.strip $ T.drop 1 imports
                                parts   = T.splitOn "," cleaned
                                names   = map extractImportName parts
                            in filter (not . T.null) names
  where
    extractImportName :: Text -> Text
    extractImportName part =
        let trimmed = T.strip part
        in case T.breakOn " as " trimmed of
            (original, "") -> trimmed
            (_, alias)     -> T.strip $ T.drop 4 alias

-- | Extrai import default: import Foo from '...'
extractDefaultImport :: Text -> [Text]
extractDefaultImport line =
    case T.stripPrefix "import" (T.strip line) of
        Nothing -> []
        Just rest ->
            let cleaned = T.strip rest
            in if not (T.isPrefixOf "{" cleaned) && not (T.isPrefixOf "*" cleaned)
               then case T.words cleaned of
                        (name:_) -> [T.takeWhile (/= ',') name]
                        []       -> []
               else []

-- | Extrai namespace import: import * as S from '...'
extractNamespaceImport :: Text -> [Text]
extractNamespaceImport line =
    case T.stripPrefix "import" (T.strip line) of
        Nothing -> []
        Just rest ->
            if "* as " `T.isInfixOf` rest
            then case T.breakOn "* as " rest of
                (_, "") -> []
                (_, after) ->
                    let name = T.takeWhile (/= ' ') $ T.strip $ T.drop 4 after
                    in if T.null name then [] else [name]
            else []

-- | Extrai o nome do arquivo de dynamic imports para indexação de conexão.
-- Detecta: await import('./CardPaidOut') ou import('./Component')
-- Retorna o basename sem extensão para que o símbolo seja indexado
-- e a conexão entre spec <-> componente seja estabelecida.
extractDynamicImportPaths :: Text -> [Text]
extractDynamicImportPaths line
    | "import(" `T.isInfixOf` line =
        case T.splitOn "import(" line of
            (_:rest:_) ->
                let inner = T.strip rest
                    path  = extractQuoted inner
                in case path of
                    Just p  -> [takeBaseName p]
                    Nothing -> []
            _ -> []
    | otherwise = []
  where
    extractQuoted :: Text -> Maybe Text
    extractQuoted txt =
        case T.uncons txt of
            Just ('\'', rest) -> Just $ T.takeWhile (/= '\'') rest
            Just ('"',  rest) -> Just $ T.takeWhile (/= '"')  rest
            _                 -> Nothing

    -- Extrai o basename sem extensão: './CardPaidOut' -> 'CardPaidOut'
    takeBaseName :: Text -> Text
    takeBaseName p =
        let name = last' $ T.splitOn "/" p
            noExt = T.takeWhile (/= '.') name
        in noExt

    last' :: [Text] -> Text
    last' []     = ""
    last' [x]    = x
    last' (_:xs) = last' xs

-- | Extrai identificadores usados no código (fora de imports)
extractIdentifiersFromCode :: Text -> [Text]
extractIdentifiersFromCode line
    | "import" `T.isPrefixOf` T.strip line = []
    | "export" `T.isPrefixOf` T.strip line = []
    | otherwise =
        let tokens   = extractAllTokens line
            validIds = filter isValidIdentifier tokens
        in validIds
  where
    extractAllTokens :: Text -> [Text]
    extractAllTokens txt = go txt []
      where
        go t acc
            | T.null t  = reverse acc
            | otherwise =
                let (token, rest) = extractNextToken t
                in if T.null token
                   then go (T.tail rest) acc
                   else go rest (token : acc)

    extractNextToken :: Text -> (Text, Text)
    extractNextToken t =
        let cleaned = T.dropWhile (not . isIdentifierStart) t
        in if T.null cleaned
           then ("", t)
           else
               let token = T.takeWhile isIdentifierChar cleaned
                   rest  = T.drop (T.length token) cleaned
               in (token, rest)

    isIdentifierStart :: Char -> Bool
    isIdentifierStart c = (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || c == '_'

    isIdentifierChar :: Char -> Bool
    isIdentifierChar c = (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c == '_'

    -- Aceitar nomes de qualquer tamanho (corrige "ax", "fs", "id", etc.)
    isValidIdentifier :: Text -> Bool
    isValidIdentifier t =
        let firstChar = T.head t
        in not (T.null t)
           && not (isJsKeyword t)
           && (firstChar >= 'A' && firstChar <= 'Z' || firstChar >= 'a' && firstChar <= 'z')

    isJsKeyword :: Text -> Bool
    isJsKeyword t = t `elem`
        [ "const", "let", "var", "function", "return", "if", "else", "for", "while"
        , "class", "interface", "type", "export", "import", "from", "default"
        , "true", "false", "null", "undefined", "this", "new", "await", "async"
        , "break", "case", "catch", "continue", "debugger", "delete", "do"
        , "extends", "finally", "instanceof", "super", "switch", "throw", "try"
        , "typeof", "void", "with", "yield", "enum", "implements", "package"
        , "private", "protected", "public", "static", "any", "boolean", "number"
        , "string", "symbol", "abstract", "as", "asserts", "constructor"
        , "declare", "get", "infer", "is", "keyof", "module", "namespace"
        , "never", "readonly", "require", "unknown", "object", "props", "state"
        ]

-- | Verifica se um símbolo é usado em algum arquivo
isSymbolUsedInFiles :: ImportIndex -> Text -> Bool
isSymbolUsedInFiles index symbol =
    case Map.lookup symbol (symbolToFiles index) of
        Nothing    -> False
        Just files -> not (Set.null files)

-- | Retorna lista de arquivos que usam um símbolo
getFilesUsingSymbol :: ImportIndex -> Text -> [FilePath]
getFilesUsingSymbol index symbol =
    case Map.lookup symbol (symbolToFiles index) of
        Nothing    -> []
        Just files -> Set.toList files
