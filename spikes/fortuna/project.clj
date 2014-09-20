(defproject fortuna "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [clj-http "1.0.0"]
                 [org.clojure/data.json "0.2.5"]]
  :plugins [[lein-kibit "0.0.8"]]
  :main fortuna.core
  #_(:aot [fortuna.core]))
