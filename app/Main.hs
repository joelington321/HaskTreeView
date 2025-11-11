module Main where

import FileFilter (getFilteredFiles)
import DependencyAnalyzer (analyzeDependencies, AnalysisResult(..), FileNode(..))
import JsonGenerator (saveJsonToFile)
import System.FilePath ((</>))
import Text.Printf (printf)
import Data.Time.Clock (getCurrentTime, diffUTCTime)
import Data.Time.Format (formatTime, defaultTimeLocale)

main :: IO ()
main = do
  startTime <- getCurrentTime
  
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
  step1Start <- getCurrentTime
  files <- getFilteredFiles testDir
  let fileCount = length files
  step1End <- getCurrentTime
  let step1Time = diffUTCTime step1End step1Start
  printf "   [OK] Encontrados: %d arquivos (%.2fs)\n" fileCount (realToFrac step1Time :: Double)
  putStrLn ""
  
  -- Etapa 2: Analisar dependências
  putStrLn "[2/4] Analisando dependencias..."
  step2Start <- getCurrentTime
  result <- analyzeDependencies testDir files
  step2End <- getCurrentTime
  let step2Time = diffUTCTime step2End step2Start
  printf "   [OK] Grafo de dependencias construido (%.2fs)\n" (realToFrac step2Time :: Double)
  putStrLn ""
  
  -- Etapa 3: Analisar código não utilizado
  putStrLn "[3/4] Detectando codigo nao utilizado..."
  step3Start <- getCurrentTime
  let unusedStylesCount = length (unusedStyles result)
      unusedExportsCount = length (unusedExports result)
  step3End <- getCurrentTime
  let step3Time = diffUTCTime step3End step3Start
  printf "   [OK] Styled-components nao utilizados: %d\n" unusedStylesCount
  printf "   [OK] Exports nao utilizados: %d\n" unusedExportsCount
  printf "   (%.2fs)\n" (realToFrac step3Time :: Double)
  putStrLn ""
  
  -- Etapa 4: Salvar JSON
  putStrLn "[4/4] Gerando arquivo JSON..."
  step4Start <- getCurrentTime
  saveJsonToFile outputFile result
  step4End <- getCurrentTime
  let step4Time = diffUTCTime step4End step4Start
  putStrLn $ "   [OK] Salvo em: " ++ outputFile
  printf "   (%.2fs)\n" (realToFrac step4Time :: Double)
  putStrLn ""
  
  -- Resumo final
  endTime <- getCurrentTime
  let totalTime = diffUTCTime endTime startTime
  
  putStrLn "=========================================================="
  putStrLn "RESUMO DA ANALISE:"
  printf "   * Arquivos analisados: %d\n" fileCount
  printf "   * Dependencias mapeadas: %d\n" (length $ dependencies result)
  printf "   * Codigo nao utilizado: %d itens\n" (unusedStylesCount + unusedExportsCount)
  printf "   * Tempo total: %.2fs\n" (realToFrac totalTime :: Double)
  putStrLn "=========================================================="
  putStrLn "[SUCCESS] Analise concluida com sucesso!"
  putStrLn "=========================================================="
