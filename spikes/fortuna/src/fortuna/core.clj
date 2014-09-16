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

(defn- no-neo4j [& args]
    (let [m (last args)
          ks (drop-last args)]
      (reduce get-data-sanely m ks)))

(defn- sum-detail [obj]
  (fn [detail-name]
    (->> obj
         :lineItems
         (filter #(= detail-name (-> % :type)))
         (map #(* (-> % :price) (-> % :qty)))
         (reduce +))))

(defn- calculate-pcv [obj]
  (let [total-for (sum-detail obj)
        retail (total-for "retail")
        wineclub (total-for "wineclub")
        gifts (total-for "gifts")
        pcv (+ retail (* (/ 3 4) wineclub) (* (/ 1 2) gifts))]
    (assoc obj :retail retail
               :wineclub wineclub
               :gifts gifts
               :pcv pcv
               :qualified (> pcv 25000))))

(defn -main []
  (println (let [result (c/cypher commission-query, {})
        headers (->> result :columns (map keyword))
        make-obj (partial zipmap headers)]
    (->> result
         :data
         (map make-obj)
         (first)
         (no-neo4j :lineItems :downline :consultant)
         (calculate-pcv))))
  (shutdown-agents))
