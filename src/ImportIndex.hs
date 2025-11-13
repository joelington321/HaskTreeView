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
    { symbolToFiles :: Map.Map Text (Set FilePath)  -- Símbolo -> Arquivos que o usam
    , fileToSymbols :: Map.Map FilePath (Set Text)  -- Arquivo -> Símbolos que importa
    } deriving (Show, Eq)

-- | Constrói o índice de imports analisando todos os arquivos uma única vez
buildImportIndex :: FileCache -> [FilePath] -> IO ImportIndex
buildImportIndex cache allFiles = do
    let jsFiles = filter isJsFile allFiles
    
    -- Analisar todos os arquivos em paralelo
    fileSymbolPairs <- mapConcurrently (extractSymbolsFromFile cache) jsFiles
    
    -- Construir maps
    let fileToSymbolsMap = Map.fromList fileSymbolPairs
        
        -- Inverter: para cada símbolo, listar arquivos que o usam
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

-- | Extrai todos os símbolos (imports e usos) de um arquivo
extractSymbolsFromFile :: FileCache -> FilePath -> IO (FilePath, Set Text)
extractSymbolsFromFile cache filePath = do
    let content = getLines cache filePath
        allSymbols = Set.fromList $ concatMap extractSymbolsFromLine content
    return (filePath, allSymbols)

-- | Extrai símbolos de uma linha (imports e usos no código)
extractSymbolsFromLine :: Text -> [Text]
extractSymbolsFromLine line =
    let -- Imports nomeados: import { Foo, Bar } from '...'
        namedImports = extractNamedImports line
        
        -- Import default: import Foo from '...'
        defaultImports = extractDefaultImport line
        
        -- Namespace imports: import * as S from '...'
        namespaceImports = extractNamespaceImport line
        
        -- Usos diretos no código (identificadores)
        -- Buscar padrões como: Foo(...), <Foo, {Foo}, S.Foo, etc
        identifiers = extractIdentifiersFromCode line
        
    in namedImports ++ defaultImports ++ namespaceImports ++ identifiers

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
                            let cleaned = T.strip $ T.drop 1 imports  -- Remove '{'
                                parts = T.splitOn "," cleaned
                                names = map extractImportName parts
                            in filter (not . T.null) names
  where
    extractImportName :: Text -> Text
    extractImportName part =
        let trimmed = T.strip part
        in case T.breakOn " as " trimmed of
            (original, "") -> trimmed  -- Sem alias
            (original, alias) -> T.strip $ T.drop 4 alias  -- Com alias, pegar depois do 'as'

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
                        [] -> []
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

-- | Extrai identificadores usados no código (fora de imports)
extractIdentifiersFromCode :: Text -> [Text]
extractIdentifiersFromCode line
    | "import" `T.isPrefixOf` T.strip line = []  -- Não processar linhas de import
    | "export" `T.isPrefixOf` T.strip line = []  -- Não processar exports
    | otherwise = 
        -- Quebrar a linha em tokens considerando diversos delimitadores
        -- Capturar TODOS os identificadores (PascalCase + camelCase)
        let tokens = extractAllTokens line
            -- Filtrar identificadores válidos (mais de 2 caracteres, não palavras-chave)
            validIds = filter isValidIdentifier tokens
        in validIds
  where
    -- Extrai todos os tokens/identificadores da linha
    extractAllTokens :: Text -> [Text]
    extractAllTokens txt = go txt []
      where
        go t acc
            | T.null t = reverse acc
            | otherwise =
                let (token, rest) = extractNextToken t
                in if T.null token
                   then go (T.tail rest) acc  -- Pular um caractere e continuar
                   else go rest (token : acc)
    
    -- Extrai o próximo token (identificador válido)
    extractNextToken :: Text -> (Text, Text)
    extractNextToken t =
        let -- Pular caracteres não-identificadores
            cleaned = T.dropWhile (not . isIdentifierStart) t
        in if T.null cleaned
           then ("", t)
           else
               let token = T.takeWhile isIdentifierChar cleaned
                   rest = T.drop (T.length token) cleaned
               in (token, rest)
    
    isIdentifierStart :: Char -> Bool
    isIdentifierStart c = (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || c == '_'
    
    isIdentifierChar :: Char -> Bool
    isIdentifierChar c = (c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9') || c == '_'
    
    -- Valida se é um identificador que deve ser indexado
    isValidIdentifier :: Text -> Bool
    isValidIdentifier t = 
        let len = T.length t
            firstChar = T.head t
        in len > 2  -- Mínimo 3 caracteres
           && not (isJsKeyword t)  -- Não é palavra-chave JS/TS
           && (firstChar >= 'A' && firstChar <= 'Z' || firstChar >= 'a' && firstChar <= 'z')  -- Começa com letra
    
    -- Palavras-chave comuns de JS/TS que devem ser ignoradas
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
        Nothing -> False
        Just files -> not (Set.null files)

-- | Retorna lista de arquivos que usam um símbolo
getFilesUsingSymbol :: ImportIndex -> Text -> [FilePath]
getFilesUsingSymbol index symbol =
    case Map.lookup symbol (symbolToFiles index) of
        Nothing -> []
        Just files -> Set.toList files
