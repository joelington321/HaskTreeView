module Main where

import FileFilter (getFilteredFiles)
import DependencyAnalyzer (analyzeDependencies, AnalysisResult(..), FileNode(..))
import JsonGenerator (saveJsonToFile)
import System.FilePath ((</>))
import Text.Printf (printf)

main :: IO ()
main = do
  putStrLn "+==========================================================+"
  putStrLn "|     HaskTreeView - Analisador de Dependencias v1.0      |"
  putStrLn "+==========================================================+"
  putStrLn ""
  
  -- Definir diretório de análise
  let testDir = "viewer-app"
      outputFile = "output" </> "dependencies.json"
  
  putStrLn "[*] Configuracao:"
  putStrLn $ "   -> Diretorio: " ++ testDir
  putStrLn $ "   -> Saida: " ++ outputFile
  putStrLn "   -> Ignorando: node_modules, .git, dist, build, etc."
  putStrLn ""
  
  -- Etapa 1: Buscar arquivos
  putStrLn "[1/4] Escaneando arquivos..."
  files <- getFilteredFiles testDir
  let fileCount = length files
  printf "   [OK] Encontrados: %d arquivos\n" fileCount
  putStrLn ""
  
  -- Etapa 2: Analisar dependências
  putStrLn "[2/4] Analisando dependencias..."
  result <- analyzeDependencies testDir files
  putStrLn "   [OK] Grafo de dependencias construido"
  putStrLn ""
  
  -- Etapa 3: Analisar código não utilizado
  putStrLn "[3/4] Detectando codigo nao utilizado..."
  let unusedStylesCount = length (unusedStyles result)
      unusedExportsCount = length (unusedExports result)
  printf "   [OK] Styled-components nao utilizados: %d\n" unusedStylesCount
  printf "   [OK] Exports nao utilizados: %d\n" unusedExportsCount
  putStrLn ""
  
  -- Etapa 4: Salvar JSON
  putStrLn "[4/4] Gerando arquivo JSON..."
  saveJsonToFile outputFile result
  putStrLn $ "   [OK] Salvo em: " ++ outputFile
  putStrLn ""
  
  -- Resumo final
  putStrLn "=========================================================="
  putStrLn "RESUMO DA ANALISE:"
  printf "   * Arquivos analisados: %d\n" fileCount
  printf "   * Dependencias mapeadas: %d\n" (length $ dependencies result)
  printf "   * Codigo nao utilizado: %d itens\n" (unusedStylesCount + unusedExportsCount)
  putStrLn "=========================================================="
  putStrLn "[SUCCESS] Analise concluida com sucesso!"
  putStrLn "=========================================================="
