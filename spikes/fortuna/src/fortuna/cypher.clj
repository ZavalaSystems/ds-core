(ns fortuna.cypher
  (:require [clj-http.client :as client]
            [fortuna.discovery :as d]))

(defn cypher [query, params]
  (:body (client/post (-> d/services :data :cypher) {:form-params {:query query :params params}
                                                     :content-type :json
                                                     :as :json})))
