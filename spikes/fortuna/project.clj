(defproject fortuna "0.0.1"
  :description "Commission Calculator"
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [clj-http "1.0.0"]
                 [org.clojure/data.json "0.2.5"]]
  :plugins [[lein-kibit "0.0.8"]]
  :main fortuna.main
  :profiles {:uberjar {:aot :all}})
