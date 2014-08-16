/*global
    angular: true,
    d3: true,
    _: true
*/
(function () {
    "use strict";
    var deps = ["$scope", "$http", "$q", "$location", "discovery"];
    function Controller($scope, $http, $q, $location, discovery) {
        console.log(discovery);
        $scope.vm = {
            search: {},
            ready: false,
            results: []
        };

        $scope.doSearch = function () {
            var df = $q.defer(),
                criteria = _.pick($scope.vm.search, _.identity);

            $http.get(discovery.consultant.find, {params: criteria})
                .success(df.resolve)
                .error(df.reject);

            return df.promise.then(function (list) {
                $scope.vm.ready = true;
                $scope.vm.results = list.payload;
            });
        };

        $scope.searchBySponsor = function (payload) {
            $scope.vm.search = {
                sponsorrep: payload.sponsorrep
            };
            $scope.doSearch();
        };

        $scope.toDetails = function (rep) {
            $location.path("/consultant/" + rep);
        };

        $scope.doSearch();
    }
    angular
        .module("coreapi")
        .controller("ConsultantController", deps.concat(Controller));
}());