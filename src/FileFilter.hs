{-# LANGUAGE OverloadedStrings #-}

module FileFilter
    ( getAllFiles
    , getFilteredFiles
    , isBlacklistedDir
    ) where

import Control.Monad (filterM)
import System.Directory (doesDirectoryExist, doesFileExist, listDirectory)
import System.FilePath ((</>), takeExtension, takeFileName)
import Config (isAllowedExtension)

-- | Lista de diretórios que devem ser ignorados
blacklistedDirs :: [String]
blacklistedDirs =
    [ "node_modules"
    , ".git"
    , ".svn"
    , ".hg"
    , "dist"
    , "build"
    , "target"
    , ".stack-work"
    , ".cabal-sandbox"
    , "vendor"
    , "bower_components"
    , ".npm"
    , ".yarn"
    , "__pycache__"
    , ".pytest_cache"
    , ".mypy_cache"
    , "venv"
    , "env"
    , ".venv"
    , "coverage"
    , ".next"
    , ".nuxt"
    , "out"
    , "tmp"
    , "temp"
    , ".cache"
    , ".parcel-cache"
    , ".turbo"
    ]

-- | Verifica se um diretório está na blacklist
isBlacklistedDir :: FilePath -> Bool
isBlacklistedDir path = takeFileName path `elem` blacklistedDirs

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
            -- Filtrar diretórios blacklisted
            let allowedDirs = filter (not . isBlacklistedDir) dirs
            subFiles <- concat <$> mapM getAllFiles allowedDirs
            return (files ++ subFiles)

-- | Filtra arquivos com base na whitelist de extensões
filterByExtension :: [FilePath] -> [FilePath]
filterByExtension = filter (isAllowedExtension . takeExtension)

-- | Obtém todos os arquivos permitidos de um diretório
getFilteredFiles :: FilePath -> IO [FilePath]
getFilteredFiles dir = do
    allFiles <- getAllFiles dir
    return (filterByExtension allFiles)
