(ns fortuna.core
  (:use [clojure.string :only [join]])
  (:require [fortuna.cypher :as cypher]
            [clojure.data.json :as json]
            [fortuna.util :as util]))

(def commission-query
  (slurp (clojure.java.io/resource "commission.cql")))

(def commission-ranks (map (partial zipmap
  [:title                  :pcv  :gv    :amb :dir :org    :is-dir :base :fstart :personal :lev1 :team :gen1 :gen2 :gen3])
 [["Diamond Director"      75000 400000  4    4   5000000   true   0.25    0.30      0.08     0  0.05  0.06  0.04  0.02],
  ["Crystal Director"      75000 400000  4    2   2000000   true   0.25    0.30      0.07     0  0.05  0.06  0.04     0],
  ["Senior Director"       50000 400000  4    1   1000000   true   0.25    0.30      0.06     0  0.05  0.06  0.03     0],
  ["Director"              50000 400000  4    0         0   true   0.25    0.30      0.05     0  0.05  0.03     0     0],
  ["Senior Ambassador"     25000 100000  2    0         0  false   0.25    0.30         0  0.03     0     0     0     0],
  ["Associate Ambassador"  25000  50000  1    0         0  false   0.25    0.30         0  0.02     0     0     0     0],
  ["Ambassador"                0      0  0    0         0  false   0.25    0.30         0     0     0     0     0     0]]))

(defn find-first [pred l]
  (first (filter pred l)))

(defn find-node [nodes id]
  (find-first #(= id (-> % :dist :id)) nodes))

(defn build-tree [root-node nodes]
  (assoc root-node :children (map (comp #(build-tree % nodes) (partial find-node nodes)) (:children root-node))))

(defn add-qualification [ds]
  (letfn [(qualify [dist] (assoc dist :qualified (<= 25000 (:ppcv dist))))]
    (map qualify ds)))

(def sum (partial reduce +))

(defn get-direct-ambassadors [root-node]
  (filter (complement :director) (:children root-node)))

(defn get-qualified-direct-ambassadors [root-node]
  (filter :qualified (get-direct-ambassadors root-node)))

(defn count-directors [root-node]
  (let [direct-directors (filter :director (:children root-node))]
    (+ (count direct-directors) (sum (map count-directors (get-qualified-direct-ambassadors root-node))))))

; This is the old version that counts the whole tree
#_(defn count-ambassadors [root-node]
  (let [direct-ambassadors (get-qualified-direct-ambassadors root-node)]
    (+ (count direct-ambassadors) (sum (map count-ambassadors direct-ambassadors)))))

(defn count-ambassadors [root-node]
  (count (get-qualified-direct-ambassadors root-node)))

(declare get-group-volume)
(defn get-team-volume [root-node]
  (let [direct-ambassadors (get-direct-ambassadors root-node)
        direct-volumes (sum (map :pcv direct-ambassadors))]
    (+ direct-volumes (sum (map get-team-volume direct-ambassadors)))))

(defn get-group-volume [root-node]
  (+ (:pcv root-node) (get-team-volume root-node)))

(defn classify-node [n]
  (letfn [(rank-qualifies [rank] (and (>= (:pcv n) (:pcv rank))
                                      (>= (:group-volume n) (:gv rank))
                                      (>= (:qualified-ambassadors n) (:amb rank))
                                      (>= (:qualified-directors n) (:dir rank))
                                      (>= (:orgVolume n) (:org rank))))]
    (let [qualified-rank (find-first rank-qualifies commission-ranks)]
      (assoc n :rank (:title qualified-rank)
               :director (:is-dir qualified-rank)))))

(defn get-directors [root-node]
  (let [direct-directors (filter :director (:children root-node))]
    (flatten (concat direct-directors (map get-directors (get-direct-ambassadors root-node))))))

(defn get-directors-at-gen [root-node gen]
  (let [current-directors (get-directors root-node)]
    (if (<= gen 1)
      (flatten (map #(get-directors-at-gen % (dec gen)) current-directors)))))

(defn collect-pcv [nodes]
  (sum (map :pcv nodes)))

(defn efficient-multiply [multiplier bonus vol]
  (if (zero? bonus) 0 (* multiplier bonus vol)))

(defn make-detail [volume multiplier]
  {:volume (util/conservative-int volume)
   :percent multiplier
   :commissions (util/conservative-int (* volume multiplier))})

(defn calculate-node [root-node]
  (let [rank (find-first #(= (:title %) (:rank root-node)) commission-ranks)
        ppcv (:ppcv root-node)
        made-fast-start? (< 200000 ppcv)
        multiplier (cond
                     (not (:qualified root-node)) 0
                     made-fast-start? (:fstart rank)
                     :else (:base rank))
        by-mult (partial efficient-multiply 0.75)
        node-dirs-at-gen (partial get-directors-at-gen root-node)
        base-commission (* multiplier ppcv)
        personal-override (by-mult (:personal rank) ppcv)
        lev1-override (by-mult (:lev1 rank) (collect-pcv (get-qualified-direct-ambassadors root-node)))
        team-volume (get-team-volume root-node)
        team-override (by-mult (:team rank) team-volume)
        gen1-volume (collect-pcv (get-directors root-node))
        gen1-override (by-mult (:gen1 rank) gen1-volume)
        gen2-volume (collect-pcv (node-dirs-at-gen 2))
        gen2-override (by-mult (:gen2 rank) gen2-volume)
        gen3-volume (collect-pcv (node-dirs-at-gen 3))
        gen3-override (by-mult (:gen3 rank) gen3-volume)]
    (assoc root-node :commissions (util/conservative-int (+ base-commission
                                                            personal-override
                                                            lev1-override
                                                            team-override
                                                            gen1-override
                                                            gen2-override
                                                            gen3-override))
                     :details {
                        :personal (make-detail ppcv multiplier)
                        :sales    (make-detail (* ppcv 0.75) (:personal rank))
                        :team     (make-detail (* team-volume 0.75) (:team rank))
                        :gen1     (make-detail (* gen1-volume 0.75) (:gen1 rank))
                        :gen2     (make-detail (* gen2-volume 0.75) (:gen2 rank))
                        :gen3     (make-detail (* gen3-volume 0.75) (:gen3 rank))
                      })))

(defn calculate-tree [root-node]
  (let [with-classy-children (assoc root-node :children (map calculate-tree (:children root-node)))
        partial-node (assoc with-classy-children :qualified-ambassadors (count-ambassadors with-classy-children)
                                                 :qualified-directors (count-directors with-classy-children)
                                                 :group-volume (get-group-volume with-classy-children)
                                                 :team-volume (get-team-volume with-classy-children))
        classified-node (classify-node partial-node)]
    (calculate-node classified-node)))

(defn entry [bpId rep]
  (let [raw-data (cypher/cypher (format commission-query bpId) {})
        cleaned-rows (-> raw-data :data cypher/extract-data)
        keywordized-columns (map keyword (:columns raw-data))
        mapped-rows (map (partial zipmap keywordized-columns) cleaned-rows)
        qualified-rows (add-qualification mapped-rows)
        root-node (find-node qualified-rows rep)]
    (json/write-str (calculate-tree (build-tree root-node qualified-rows)))))

(defn- ->json [body]
  {:status 200 :headers {"Content-Type" "application/json"} :body body})


(defn cmd-main
  ([bpId] (println (entry bpId 1)))
  ([bpId rep] (println (entry bpId (read-string rep)))))

(defn server-main
  ([bpId] (->json (entry bpId 1)))
  ([bpId rep] (->json (entry bpId (read-string rep)))))