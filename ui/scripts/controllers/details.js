/*global
    angular: true,
    _: true
*/
(function () {
    "use strict";
    var deps = ["$scope", "$routeParams", "$http", "$location", "discovery"];
    function Controller($scope, $routeParams, $http, $location, discovery) {
        $scope.vm = {
            consultant: null
        };
        $http.get(discovery.consultant.find, {params: {rep: $routeParams.cid}})
            .error(function (response, status) {
                if (status === 300) {
                    $scope.vm.consultant = _.first(response);
                }
            });

        $scope.toDetails = function (rep) {
            $location.path("/consultant/" + rep);
        };
    }
    angular
        .module("coreapi")
        .controller("DetailsController", deps.concat(Controller));
}());