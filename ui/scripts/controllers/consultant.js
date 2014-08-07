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
                .success(_.noop)
                .error(function (response, status) {
                    if (status === 300) {
                        df.resolve(response);
                    } else {
                        df.reject(response);
                    }
                });
            return df.promise.then(function (list) {
                $scope.vm.ready = true;
                $scope.vm.results = list;
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