(ns fortuna.main
  (:gen-class)
  (use [fortuna.core :only [main]]))

(defn -main [& more] (try
                       (apply main more)
                       (catch Exception e (throw e))
                       (finally (shutdown-agents))))
