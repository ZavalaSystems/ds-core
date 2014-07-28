/*global
    angular: true
*/
(function () {
    "use strict";
    var deps = ["$scope", "$http", "$q"];
    function Controller($scope, $http, $q) {
        $scope.vm = {
        };

        $http.get("http://localhost:8000/consultant/root")
            .then(function (response) {
                return response.data;
                // return $http.get(root.links.firstLine.href);
            })
            .then(function (root) {
                var df = $q.defer();
                $http.get(root.links.firstLine.href)
                    .error(function (err, status) {
                        if (status === 300) {
                            df.resolve(err);
                        } else {
                            df.reject(err);
                        }
                    });
                return df.promise;
            })
            .then(function (response) {
                $scope.vm.consultants = response;
            });

        $scope.toggleChildren = function (consultant) {
            if (consultant.displayChildren) {
                consultant.children = [];
                consultant.displayChildren = false;
            } else {
                $http.get(consultant.links.firstLine.href)
                    .error(function (err, status) {
                        if (status === 300) {
                            consultant.children = err;
                            consultant.displayChildren = true;
                        } else {
                            throw err;
                        }
                    });
            }
        };
    }
    angular
        .module("coreapi")
        .controller("ConsultantController", deps.concat(Controller));
}());