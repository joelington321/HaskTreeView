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
    , "export * from "   -- export * from './module'
    , "export { "        -- export { foo } from './module'
    , "const "           -- const React = require('react')
    , "let "             -- let React = require('react')
    , "var "             -- var React = require('react')
    , "} from "          -- } from 'react-native'
    , "require("         -- require('react')
    ]

-- | Verifica se uma linha contém um import
isImportLine :: Text -> Bool
isImportLine line = 
    let trimmed = T.strip line
        lineStr = T.unpack trimmed
    in not (T.null trimmed) 
       && not ("//" `T.isPrefixOf` trimmed)  -- ignora comentários de linha
       && not ("/*" `T.isPrefixOf` trimmed)  -- ignora comentários de bloco
       && not ("*" `T.isPrefixOf` trimmed)   -- ignora comentários de bloco (dentro de bloco)
       && (isEsImport trimmed || isExportFrom trimmed || isRequireImport trimmed)
  where
    -- Verifica se é um import ES6/TypeScript (import ... from ...)
    isEsImport :: Text -> Bool
    isEsImport txt = "import " `T.isPrefixOf` txt && "from" `T.isInfixOf` txt
    
    -- Verifica se é um re-export (export * from ... ou export { ... } from ...)
    isExportFrom :: Text -> Bool
    isExportFrom txt = "export " `T.isPrefixOf` txt && "from" `T.isInfixOf` txt
    
    -- Verifica se é um require (const/let/var ... = require(...))
    isRequireImport :: Text -> Bool
    isRequireImport txt = 
        let hasKeyword = any (`T.isPrefixOf` txt) ["const ", "let ", "var "]
            hasRequire = "require(" `T.isInfixOf` txt
        in hasKeyword && hasRequire

-- | Extrai o source do import de uma linha
extractSource :: Text -> Maybe Text
extractSource line
    | "from" `T.isInfixOf` line = extractFromClause line
    | "require(" `T.isInfixOf` line = extractRequire line
    | otherwise = Nothing
  where
    -- Extrai source de: import X from 'source' ou } from "source"
    extractFromClause :: Text -> Maybe Text
    extractFromClause txt = 
        case T.splitOn "from" txt of
            (_:rest:_) -> extractQuoted (T.strip rest)
            _ -> Nothing
    
    -- Extrai source de: require('source')
    extractRequire :: Text -> Maybe Text
    extractRequire txt =
        case T.splitOn "require(" txt of
            (_:rest:_) -> extractQuoted rest
            _ -> Nothing
    
    -- Extrai texto entre aspas (simples ou duplas)
    extractQuoted :: Text -> Maybe Text
    extractQuoted txt =
        let cleaned = T.strip txt
        in case T.uncons cleaned of
            Just ('\'', rest) -> extractUntil '\'' rest
            Just ('"', rest) -> extractUntil '"' rest
            _ -> Nothing
    
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
        importLines = filter (isImportLine . snd) linesWithNumbers
        imports = map createImport importLines
    return imports
  where
    createImport :: (Int, Text) -> ImportStatement
    createImport (lineNum, line) = ImportStatement
        { importSource = maybe "" id (extractSource line)
        , importLine = line
        , lineNumber = lineNum
        }
