/*global
    angular: true,
    _: true
*/
(function () {
    "use strict";

    angular
        .module("coreapi", ["ngRoute"])
        .config(["$routeProvider", function ($routeProvider) {
            function serviceDiscovery($http, $q, $window) {
                var df = $q.defer();
                $http.get(_.template("http://${origin}:8000/", $window.location))
                    .success(function (response) {
                        df.resolve(response);
                    });
                return df.promise;
            }

            var discovery = ["$http", "$q", "$window", serviceDiscovery];

            $routeProvider
                .when("/consultant", {
                    templateUrl: "partials/consultant.html",
                    controller: "ConsultantController",
                    resolve: {discovery: discovery}
                })
                .when("/consultant/:cid", {
                    templateUrl: "partials/details.html",
                    controller: "DetailsController",
                    resolve: {discovery: discovery}
                })
                .otherwise({
                    redirectTo: "/consultant"
                });
        }]);
}());
