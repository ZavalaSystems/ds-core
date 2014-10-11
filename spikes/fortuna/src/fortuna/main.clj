(ns fortuna.main
  (:gen-class)
  (:require [compojure.core :refer :all]
            [compojure.handler :as handler]
            [compojure.route :as route]))

(use '[fortuna.core :only [main]])
(use 'ring.adapter.jetty)

(defroutes app-routes
  (GET "/:bp" [bp] (main bp))
  (GET "/:bp/:rep" [bp rep] (main bp rep))
  (route/resources "/")
  (route/not-found "Not Found"))

(def app
  (handler/site app-routes))

(defn -main []
  (run-jetty app {:port 8081}))