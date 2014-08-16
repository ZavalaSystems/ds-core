/*global
    angular: true,
    _: true
*/
(function () {
    "use strict";
    var deps = ["$scope", "$routeParams", "$http", "$location", "discovery"];
    function Controller($scope, $routeParams, $http, $location, discovery) {
        $scope.vm = {
            consultant: null,
            commissions: null
        };
        $http.get(discovery.consultant.find, {params: {rep: $routeParams.cid}})
            .success(function (response) {
                $scope.vm.consultant = _.first(response.payload);
            });

        $scope.toDetails = function (rep) {
            $location.path("/consultant/" + rep);
        };

        function flattenCommissionTree(node) {
            return _.flatten([]
                .concat(node)
                .concat(_.map(node.downline, flattenCommissionTree)));
        }

        $scope.calculateCommission = function () {
            $scope.vm.commissionsRunning = true;
            var url = $scope.vm.consultant.links.commissions;
            $http.get(url).success(function (response) {
                $scope.vm.commissions = flattenCommissionTree(response, []);
                $scope.vm.commissionsRunning = false;
            });
        };
    }
    angular
        .module("coreapi")
        .controller("DetailsController", deps.concat(Controller))
        .filter("money", function () {
            return function (x) {
                return "$" + x / 100;
            };
        });
}());