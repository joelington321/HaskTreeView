{-# LANGUAGE OverloadedStrings #-}

module FileCache 
    ( FileCache
    , loadFileCache
    , readFromCache
    , containsText
    , getLines
    ) where

import qualified Data.Map.Strict as Map
import qualified Data.Text as T
import qualified Data.Text.IO as TIO
import Data.Text (Text)
import Control.Concurrent.Async (mapConcurrently)

-- | Cache de conteúdo de arquivos em memória
type FileCache = Map.Map FilePath Text

-- | Carrega todos os arquivos em paralelo
loadFileCache :: [FilePath] -> IO FileCache
loadFileCache files = do
    putStrLn $ "   - Carregando " ++ show (length files) ++ " arquivos em cache..."
    contents <- mapConcurrently TIO.readFile files
    return $ Map.fromList $ zip files contents

-- | Lê do cache (retorna empty se não encontrado)
readFromCache :: FileCache -> FilePath -> Text
readFromCache cache filePath = 
    Map.findWithDefault T.empty filePath cache

-- | Verifica se arquivo contém texto
containsText :: FileCache -> FilePath -> Text -> Bool
containsText cache filePath searchText =
    searchText `T.isInfixOf` readFromCache cache filePath

-- | Retorna linhas do arquivo do cache
getLines :: FileCache -> FilePath -> [Text]
getLines cache filePath =
    T.lines $ readFromCache cache filePath
