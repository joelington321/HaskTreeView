module Main where

import FileFilter (getFilteredFiles)
import DependencyAnalyzer (analyzeDependencies)
import JsonGenerator (saveJsonToFile)
import System.FilePath ((</>))

main :: IO ()
main = do
  putStrLn "=== HaskTreeView - Analisador de Dependências ==="
  putStrLn ""
  
  -- Definir diretório de análise
  let testDir = "fakePathTestTree"
      outputFile = "output" </> "dependencies.json"
  
  putStrLn $ "Analisando diretório: " ++ testDir
  putStrLn "Ignorando: node_modules, .git, dist, build, .stack-work, vendor, etc."
  putStrLn ""
  
  -- Obter todos os arquivos permitidos
  files <- getFilteredFiles testDir
  putStrLn $ "Arquivos encontrados: " ++ show (length files)
  putStrLn ""
  
  -- Analisar dependências
  putStrLn "Construindo grafo de dependências..."
  result <- analyzeDependencies testDir files
  
  -- Salvar JSON
  putStrLn "Gerando JSON..."
  saveJsonToFile outputFile result
  putStrLn ""
  putStrLn "Análise concluída com sucesso!"
