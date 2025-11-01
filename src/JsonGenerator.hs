{-# LANGUAGE OverloadedStrings #-}

module JsonGenerator
    ( generateJson
    , saveJsonToFile
    ) where

import qualified Data.Map.Strict as Map
import qualified Data.Text as T
import Data.Text (Text)
import Data.Aeson (encode)
import Data.Aeson.Encode.Pretty (encodePretty, defConfig, confIndent, Indent(..))
import qualified Data.ByteString.Lazy as BL
import System.Directory (createDirectoryIfMissing)
import System.FilePath ((</>), takeDirectory)
import Data.Time.Clock (getCurrentTime)
import Data.Time.Format (formatTime, defaultTimeLocale)

import DependencyAnalyzer (AnalysisResult(..))

-- | Configuração para pretty printing
prettyConfig = defConfig { confIndent = Spaces 2 }

-- | Gera o JSON a partir do resultado da análise
generateJson :: AnalysisResult -> BL.ByteString
generateJson result = encodePretty result

-- | Salva o JSON em um arquivo
saveJsonToFile :: FilePath -> AnalysisResult -> IO ()
saveJsonToFile outputPath result = do
    -- Criar diretório output se não existir
    let outputDir = takeDirectory outputPath
    createDirectoryIfMissing True outputDir
    
    -- Atualizar timestamp
    now <- getCurrentTime
    let timestamp = T.pack $ formatTime defaultTimeLocale "%Y-%m-%dT%H:%M:%SZ" now
        updatedResult = result { analyzedAt = timestamp }
    
    -- Gerar e salvar JSON
    let jsonContent = encodePretty updatedResult
    BL.writeFile outputPath jsonContent
    
    putStrLn $ "JSON salvo em: " ++ outputPath
