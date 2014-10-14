(ns fortuna.discovery
  (:require [clj-http.client :as client]))

(defn- discovery [uri, depth]
  (if (zero? depth)
    uri
    (let [discovery-level (:body (client/get uri {:as :json}))]
      (zipmap (keys discovery-level) (pmap #(discovery % (dec depth)) (vals discovery-level))))))

(defn discover [] 
  ; "http://db:7474" is the default as specified in config.js
  (discovery (or (System/getenv "NEO4J_URI") "http://db:7474") 2))