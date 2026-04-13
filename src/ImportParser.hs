{-# LANGUAGE OverloadedStrings #-}

module ImportParser
    ( parseImports
    , ImportStatement(..)
    , supportedImportFormats
    ) where

import Data.Text (Text)
import qualified Data.Text as T
import qualified Data.Text.IO as TIO
import Data.List (isPrefixOf)

-- | Representa uma declaração de import
data ImportStatement = ImportStatement
    { importSource :: Text  -- O módulo/arquivo sendo importado
    , importLine :: Text    -- A linha completa do import
    , lineNumber :: Int     -- Número da linha no arquivo
    } deriving (Show, Eq)

-- | Formatos de import suportados
supportedImportFormats :: [String]
supportedImportFormats =
    [ "import "           -- import React from 'react'
    , "import{"          -- import{useState} from 'react'
    , "import {"         -- import { useState } from 'react'
    , "import '"         -- import './styles.css' (direct import)
    , "import \""        -- import \"./styles.css\" (direct import)
    , "export * from "   -- export * from './module'
    , "export { "        -- export { foo } from './module'
    , "const "           -- const React = require('react')
    , "let "             -- let React = require('react')
    , "var "             -- var React = require('react')
    , "} from "          -- } from 'react-native'
    , "require("         -- require('react')
    , "await import("    -- await import('./Component')
    , "import("          -- import('./Component')
    ]

-- | Verifica se uma linha contém um import
isImportLine :: Text -> Bool
isImportLine line = 
    let trimmed = T.strip line
    in not (T.null trimmed) 
       && not ("//" `T.isPrefixOf` trimmed)
       && not ("/*" `T.isPrefixOf` trimmed)
       && not ("*" `T.isPrefixOf` trimmed)
       && (isEsImport trimmed
           || isDirectImport trimmed
           || isExportFrom trimmed
           || isRequireImport trimmed
           || isDynamicImport trimmed)
  where
    isEsImport :: Text -> Bool
    isEsImport txt = "import " `T.isPrefixOf` txt && "from" `T.isInfixOf` txt

    isDirectImport :: Text -> Bool
    isDirectImport txt = "import " `T.isPrefixOf` txt 
                      && not ("from" `T.isInfixOf` txt)
                      && hasQuotes txt

    isExportFrom :: Text -> Bool
    isExportFrom txt = "export " `T.isPrefixOf` txt && "from" `T.isInfixOf` txt

    isRequireImport :: Text -> Bool
    isRequireImport txt = 
        let hasKeyword = any (`T.isPrefixOf` txt) ["const ", "let ", "var "]
            hasRequire = "require(" `T.isInfixOf` txt
        in hasKeyword && hasRequire

    -- detecta dynamic imports: await import('./X') ou import('./X')
    isDynamicImport :: Text -> Bool
    isDynamicImport txt =
        ("await import(" `T.isInfixOf` txt || "import(" `T.isInfixOf` txt)
        && hasQuotes txt

    hasQuotes :: Text -> Bool
    hasQuotes txt = "'" `T.isInfixOf` txt || "\"" `T.isInfixOf` txt

-- | Extrai o source do import de uma linha
extractSource :: Text -> Maybe Text
extractSource line
    | "from" `T.isInfixOf` line                 = extractFromClause line
    | "require(" `T.isInfixOf` line             = extractRequire line
    | "await import(" `T.isInfixOf` line        = extractDynamicImport line
    | "import(" `T.isInfixOf` line              = extractDynamicImport line
    | "import " `T.isPrefixOf` T.strip line     = extractDirectImport line
    | otherwise                                  = Nothing
  where
    extractFromClause :: Text -> Maybe Text
    extractFromClause txt = 
        case T.splitOn "from" txt of
            (_:rest:_) -> extractQuoted (T.strip rest)
            _ -> Nothing

    extractRequire :: Text -> Maybe Text
    extractRequire txt =
        case T.splitOn "require(" txt of
            (_:rest:_) -> extractQuoted rest
            _ -> Nothing

    -- extrai source de: await import('./Component') ou import('./Component')
    extractDynamicImport :: Text -> Maybe Text
    extractDynamicImport txt =
        case T.splitOn "import(" txt of
            (_:rest:_) -> extractQuoted rest
            _ -> Nothing

    extractDirectImport :: Text -> Maybe Text
    extractDirectImport txt =
        let afterImport = T.strip $ T.drop 6 txt
        in extractQuoted afterImport

    extractQuoted :: Text -> Maybe Text
    extractQuoted txt =
        let cleaned = T.strip txt
        in case T.uncons cleaned of
            Just ('\'', rest) -> extractUntil '\'' rest
            Just ('"', rest)  -> extractUntil '"' rest
            _                 -> Nothing

    extractUntil :: Char -> Text -> Maybe Text
    extractUntil delimiter txt =
        case T.breakOn (T.singleton delimiter) txt of
            (source, rest) | not (T.null rest) -> Just source
            _ -> Nothing

-- | Analisa um arquivo e retorna todos os imports encontrados
parseImports :: FilePath -> IO [ImportStatement]
parseImports filePath = do
    content <- TIO.readFile filePath
    let linesWithNumbers = zip [1..] (T.lines content)
        multiLineImports  = extractMultiLineImports content
        singleLineImports = filter (isImportLine . snd) linesWithNumbers
        allImports        = map createImport singleLineImports ++ multiLineImports
    return allImports
  where
    createImport :: (Int, Text) -> ImportStatement
    createImport (lineNum, line) = ImportStatement
        { importSource = maybe "" id (extractSource line)
        , importLine   = line
        , lineNumber   = lineNum
        }

-- | Extrai imports multi-linha (import { ... } from '...')
extractMultiLineImports :: Text -> [ImportStatement]
extractMultiLineImports content =
    let matches = findImportBlocks content
    in map createMultiLineImport matches
  where
    createMultiLineImport :: (Int, Text) -> ImportStatement
    createMultiLineImport (lineNum, importText) = ImportStatement
        { importSource = maybe "" id (extractSource importText)
        , importLine   = T.strip $ T.unwords $ T.words importText
        , lineNumber   = lineNum
        }

-- | Encontra blocos de import multi-linha no texto
findImportBlocks :: Text -> [(Int, Text)]
findImportBlocks content =
    let indexed = zip [1..] (T.lines content)
    in findBlocks indexed []
  where
    findBlocks :: [(Int, Text)] -> [(Int, Text)] -> [(Int, Text)]
    findBlocks [] acc = acc
    findBlocks ((lineNum, line):rest) acc
        | "import " `T.isPrefixOf` T.strip line && not ("from" `T.isInfixOf` line) =
            let (block, remaining) = collectUntilFrom rest [T.strip line]
                fullImport = T.unwords block
            in if "from" `T.isInfixOf` fullImport
               then findBlocks remaining (acc ++ [(lineNum, fullImport)])
               else findBlocks remaining acc
        | "export " `T.isPrefixOf` T.strip line && not ("from" `T.isInfixOf` line) =
            let (block, remaining) = collectUntilFrom rest [T.strip line]
                fullExport = T.unwords block
            in if "from" `T.isInfixOf` fullExport
               then findBlocks remaining (acc ++ [(lineNum, fullExport)])
               else findBlocks remaining acc
        | otherwise = findBlocks rest acc

    collectUntilFrom :: [(Int, Text)] -> [Text] -> ([Text], [(Int, Text)])
    collectUntilFrom [] acc = (acc, [])
    collectUntilFrom ((_, line):rest) acc
        | "from" `T.isInfixOf` line = (acc ++ [T.strip line], rest)
        | otherwise                  = collectUntilFrom rest (acc ++ [T.strip line])
