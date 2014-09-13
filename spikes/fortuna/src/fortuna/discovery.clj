(ns fortuna.discovery
  (:require [clj-http.client :as client]))

(defn- discovery [uri, depth]
  (if (zero? depth)
    uri
    (let [discovery-level (:body (client/get uri {:as :json}))]
      (zipmap (keys discovery-level) (pmap #(discovery % (dec depth)) (vals discovery-level))))))

(def services (discovery "http://localhost:7474" 2))