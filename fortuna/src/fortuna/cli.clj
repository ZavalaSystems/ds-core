(ns fortuna.cli
  (:gen-class)
  (use [fortuna.core :only [cmd-main]]))

(defn -main [& more] (try
                       (apply cmd-main more)
                       (catch Exception e (throw e))
                       (finally (shutdown-agents))))
