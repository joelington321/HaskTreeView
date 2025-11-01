{-# LANGUAGE OverloadedStrings #-}

module FileFilter
    ( getAllFiles
    , getFilteredFiles
    ) where

import Control.Monad (filterM)
import System.Directory (doesDirectoryExist, doesFileExist, listDirectory)
import System.FilePath ((</>), takeExtension)
import Config (isAllowedExtension)

-- | Lista recursivamente todos os arquivos em um diretório
getAllFiles :: FilePath -> IO [FilePath]
getAllFiles dir = do
    exists <- doesDirectoryExist dir
    if not exists
        then return []
        else do
            contents <- listDirectory dir
            let fullPaths = map (dir </>) contents
            files <- filterM doesFileExist fullPaths
            dirs <- filterM doesDirectoryExist fullPaths
            subFiles <- concat <$> mapM getAllFiles dirs
            return (files ++ subFiles)

-- | Filtra arquivos com base na whitelist de extensões
filterByExtension :: [FilePath] -> [FilePath]
filterByExtension = filter (isAllowedExtension . takeExtension)

-- | Obtém todos os arquivos permitidos de um diretório
getFilteredFiles :: FilePath -> IO [FilePath]
getFilteredFiles dir = do
    allFiles <- getAllFiles dir
    return (filterByExtension allFiles)
