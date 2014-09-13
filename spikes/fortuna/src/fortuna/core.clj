(ns fortuna.core
    (require [fortuna.discovery :as d]
             [fortuna.cypher :as c]
             [clojure.data.json :as json]))

(def commission-query (str "match (cons:Consultant) "
                           "optional match (cons)<-[:REPORTS_TO]-(sub) "
                           "with cons as consultant, collect(sub) as downline "
                           "optional match (consultant)<-[:PLACED_BY]-(order:Order)<-[:PART_OF]-(li:LineItem) "
                           "return consultant, downline, collect(li) as lineItems"))

(defn- get-data-sanely [m k]
    (let [v (get m k)]
        (if (map? v)
            (assoc m k (:data v))
            (assoc m k (map #(:data %) v)))))

(defn- no-neo4j [m & ks]
    (println (count m) ks)
    (reduce get-data-sanely m ks))

(defn -main []
  (json/pprint (let [result (c/cypher commission-query, {})
        make-obj (partial zipmap (map keyword (:columns result)))]
    (no-neo4j (first (map make-obj (:data result))) :lineItems :downline :consultant)))
  (shutdown-agents))
