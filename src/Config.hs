module Config
    ( allowedExtensions
    , isAllowedExtension
    ) where

import Data.Set (Set)
import qualified Data.Set as Set
import System.FilePath (takeExtension)

-- | Whitelist de extensões permitidas para análise
allowedExtensions :: Set String
allowedExtensions = Set.fromList
    [ ".ts"      -- TypeScript
    , ".tsx"     -- TypeScript React
    , ".js"      -- JavaScript
    , ".jsx"     -- JavaScript React
    , ".mjs"     -- JavaScript Module
    , ".cjs"     -- JavaScript CommonJS
    , ".css"     -- CSS
    , ".scss"    -- SASS/SCSS
    , ".sass"    -- SASS
    , ".less"    -- LESS
    , ".styl"    -- Stylus
    ]

-- | Verifica se uma extensão está na whitelist
isAllowedExtension :: String -> Bool
isAllowedExtension ext = ext `Set.member` allowedExtensions

-- | Verifica se um caminho de arquivo tem extensão permitida
isAllowedFile :: FilePath -> Bool
isAllowedFile path = isAllowedExtension (takeExtension path)
