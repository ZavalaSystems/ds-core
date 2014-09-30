(ns fortuna.cypher
  (:require [clj-http.client :as client]
            [fortuna.discovery :as d]
            [fortuna.util :as util]))

(defn cypher [query, params]
  (:body (client/post (-> (d/discover) :data :cypher)
                      {:form-params {:query query, :params params}
                       :content-type :json
                       :as :json})))

(letfn [(process-cypher-datapoint [point]
          (cond (map? point) (:data point)
                (vector? point) (process-cypher-row point)
                (float? point) (util/conservative-int point)
                :else point))
        (process-cypher-row [row]
          (map process-cypher-datapoint row))]
  (defn extract-data [cypher-data-rows]
    (map process-cypher-row cypher-data-rows)))