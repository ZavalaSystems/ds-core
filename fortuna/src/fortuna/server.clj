(ns fortuna.server
  (:gen-class)
  (:require [compojure.core :refer :all]
            [compojure.handler :as handler]
            [compojure.route :as route]))

(use '[fortuna.core :only [server-main]])
(use 'ring.adapter.jetty)

(defroutes app-routes
  (GET "/:bp" [bp] (server-main bp))
  (GET "/:bp/:rep" [bp rep] (server-main bp rep))
  (route/resources "/")
  (route/not-found "Not Found"))

(def app
  (handler/site app-routes))

(defn -main [port]
  (run-jetty app {:port (read-string port)}))
