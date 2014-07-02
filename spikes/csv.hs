{-# LANGUAGE OverloadedStrings #-}

import Control.Applicative
import qualified Data.Aeson as JSON
import Data.ByteString.Lazy as BSL
import qualified Data.Csv as CSV
import Data.Text.Lazy as DTL
import Data.Vector
import Network.HTTP.Types.Status
import System.Environment
import Web.Scotty

type ListDatabase = Vector [String]

consultantEndpoint :: ListDatabase -> ScottyM()
consultantEndpoint db = do
    get "/consultant" $ do
        status status300
        json db
        setHeader "Content-Type" "application/vnd.core.hypermedia+json; profile=consultant"

app :: Either String ListDatabase -> ScottyM()
app (Right db) = do
    consultantEndpoint db
app (Left err) = error err

main :: IO()
main = do
    args <- getArgs
    db <- BSL.readFile $ args !! 0
    scotty 3000 $ app $ CSV.decode CSV.HasHeader db