/*global
    angular: true
*/
(function () {
    "use strict";
    angular
        .module("coreapi", ["ngRoute", "ui.bootstrap"])
        .config(["$routeProvider", function ($routeProvider) {
            $routeProvider.
                when("/consultant", {
                    templateUrl: "partials/consultant.html",
                    controller: "ConsultantController"
                }).
                otherwise({
                    redirectTo: "/consultant"
                });
        }]);
}());
