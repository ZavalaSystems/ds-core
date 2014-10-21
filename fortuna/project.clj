(defproject fortuna "0.0.2"
  :description "Commission Calculator"
  :dependencies [[org.clojure/clojure "1.6.0"]
                 [clj-http "1.0.0"]
                 [org.clojure/data.json "0.2.5"]
                 [compojure "1.1.9"]
                 [ring/ring-core "1.3.0"]
                 [ring/ring-jetty-adapter "1.3.0"]]
  :plugins [[lein-kibit "0.0.8"]
            [lein-ring "0.8.12"]]
  :ring {:handler test.handler/app}
  :main fortuna.cli
  :global-vars {*warn-on-reflection* true}
  :profiles {:uberjar {:aot :all}
             :dev {:dependencies [[javax.servlet/servlet-api "2.5"]
                        [ring-mock "0.1.5"]]}})
