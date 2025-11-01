module Main where

import FileFilter (getFilteredFiles)
import Config (allowedExtensions)
import ImportParser (parseImports, ImportStatement(..), supportedImportFormats)
import qualified Data.Set as Set
import qualified Data.Text as T

main :: IO ()
main = do
  putStrLn "=== HaskTreeView - Teste de Import Parser ==="
  putStrLn ""
  
  -- Mostrar formatos suportados
  putStrLn "Formatos de import suportados:"
  mapM_ putStrLn (map ("  - " ++) supportedImportFormats)
  putStrLn ""
  
  -- Analisar pasta de teste
  let testDir = "fakePathTestTree"
  putStrLn $ "Analisando diretório: " ++ testDir
  putStrLn ""
  
  -- Obter arquivos filtrados
  files <- getFilteredFiles testDir
  
  putStrLn $ "Arquivos encontrados: " ++ show (length files)
  putStrLn (replicate 60 '=')
  putStrLn ""
  
  -- Analisar imports de cada arquivo
  mapM_ analyzeFile files

analyzeFile :: FilePath -> IO ()
analyzeFile filePath = do
  putStrLn $ "Arquivo: " ++ filePath
  imports <- parseImports filePath
  
  if null imports
    then putStrLn "  Nenhum import encontrado"
    else do
      putStrLn $ "  Imports encontrados (" ++ show (length imports) ++ "):"
      mapM_ printImport imports
  
  putStrLn ""

printImport :: ImportStatement -> IO ()
printImport imp = do
  putStrLn $ "    Linha " ++ show (lineNumber imp) ++ ":"
  putStrLn $ "      Code: " ++ T.unpack (importLine imp)
  putStrLn $ "      From: " ++ T.unpack (importSource imp)
