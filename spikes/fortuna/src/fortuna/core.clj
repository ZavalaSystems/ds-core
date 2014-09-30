(ns fortuna.core
  (:use [clojure.string :only [join]])
  (:require [fortuna.cypher :as cypher]
            [clojure.data.json :as json]
            [fortuna.util :as util]))

(def commission-query
  (slurp (clojure.java.io/resource "commission.cql")))

(def commission-ranks (map (partial zipmap [:title                  :pcv  :gv    :amb :dir :org    :is-dir])
                                          [["Diamond Director"      75000 400000  4    4   5000000   true],
                                           ["Crystal Director"      75000 400000  4    2   2000000   true],
                                           ["Senior Director"       50000 400000  4    1   1000000   true],
                                           ["Director"              50000 400000  4    0         0   true],
                                           ["Senior Ambassador"     25000 100000  2    0         0  false],
                                           ["Associate Ambassador"  25000  50000  1    0         0  false],
                                           ["Ambassador"                0      0  0    0         0  false]]))

(defn substring? [needle haystack] (<= 0 (.indexOf haystack needle)))

(defn find-first [pred l]
  (first (filter pred l)))

(defn find-node [nodes id]
  (find-first #(= id (-> % :dist :id)) nodes))

(defn build-tree [root-node nodes]
  (assoc root-node :children (map (comp #(build-tree % nodes) (partial find-node nodes)) (:children root-node))))

(defn add-qualification [ds]
  (letfn [(qualify [dist] (assoc dist :qualified (<= 25000 (:pcv dist))))]
    (map qualify ds)))

(def sum (partial reduce +))

(defn get-direct-ambassadors [root-node]
  (filter (complement :director) (:children root-node)))

(defn count-directors [root-node]
  (let [direct-directors (filter :director (:children root-node))]
    (+ (count direct-directors) (sum (map count-directors (get-direct-ambassadors root-node))))))

(defn count-ambassadors [root-node]
  (let [direct-ambassadors (get-direct-ambassadors root-node)]
    (+ (count direct-ambassadors) (sum (map count-ambassadors direct-ambassadors)))))

(defn get-group-volume [root-node]
  (let [direct-ambassadors (get-direct-ambassadors root-node)
        direct-volumes (sum (map :pcv direct-ambassadors))]
    (+ direct-volumes (sum (map get-group-volume direct-ambassadors)))))

(defn classify-node [n]
  (letfn [(rank-qualifies [rank] (and (>= (:pcv n) (:pcv rank))
                                      (>= (:group-volume n) (:gv rank))
                                      (>= (:qualified-ambassadors n) (:amb rank))
                                      (>= (:qualified-directors n) (:dir rank))
                                      (>= (:orgVolume n) (:org rank))))]
    (let [qualified-rank (find-first rank-qualifies commission-ranks)]
      (assoc n :rank (:title qualified-rank)
               :director (:is-dir qualified-rank)))))

(defn calculate-node [root-node]
  (let [pcv (:pcv root-node)
        made-fast-start? (< 200000 pcv)
        fast-start-ratio (/ 3 10)
        slow-start-ratio (/ 1 4)
        multiplier (cond
                     (not (:qualified root-node)) 0
                     made-fast-start? (/ 3 10)
                     :else (/ 1 4))]
    (assoc root-node :commissions (util/conservative-int (* pcv multiplier)))))

(defn calculate-tree [root-node]
  (let [partial-node (assoc root-node :children (map calculate-tree (:children root-node))
                                      :qualified-ambassadors (count-ambassadors root-node)
                                      :qualified-directors (count-directors root-node)
                                      :group-volume (get-group-volume root-node))
        classified-node (classify-node partial-node)]
    (calculate-node classified-node)))

(defn main
  ([bpId] (let [raw-data (cypher/cypher commission-query {:nodeId (read-string bpId)})
                cleaned-rows (-> raw-data :data cypher/extract-data)
                keywordized-columns (map keyword (:columns raw-data))
                mapped-rows (map (partial zipmap keywordized-columns) cleaned-rows)
                qualified-rows (add-qualification mapped-rows)
                root-node (find-node qualified-rows "1")]
            (println (json/write-str (calculate-tree (build-tree root-node qualified-rows))))))
  ([bpId rep] (println (str "commissions for rep: " rep ", bp: " bpId))))