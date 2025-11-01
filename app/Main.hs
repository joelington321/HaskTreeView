module Main where

import FileFilter (getFilteredFiles)
import Config (allowedExtensions)
import qualified Data.Set as Set

main :: IO ()
main = do
  putStrLn "=== HaskTreeView - Teste de Whitelist ==="
  putStrLn ""
  
  -- Mostrar extensões permitidas
  putStrLn "Extensões permitidas:"
  mapM_ putStrLn (map ("  - " ++) (Set.toList allowedExtensions))
  putStrLn ""
  
  -- Analisar pasta de teste
  let testDir = "fakePathTestTree"
  putStrLn $ "Analisando diretório: " ++ testDir
  putStrLn ""
  
  -- Obter arquivos filtrados
  files <- getFilteredFiles testDir
  
  -- Mostrar resultados
  putStrLn $ "Arquivos encontrados (" ++ show (length files) ++ "):"
  mapM_ putStrLn (map ("  - " ++) files)
