module.exports = (function (_) {
    "use strict";
    var dbImplementationFields = ["id", "parent", "children"],
        getGCV;

    function sum(nums) {
        return _.reduce(nums, function (x, y) { return x + y; }, 0);
    }

    function childrenToGCV(getChildren, children) {
        return _.reduce(children, function (acc, child) {
            return acc.concat(getGCV(getChildren, child));
        }, []);
    }

    getGCV = function (getChildren, consultant) {
        var children = getChildren(consultant);
        return consultant.pcv + sum(childrenToGCV(getChildren, children));
    };

    return {
        links: _.curry(function (resolver, consultant) {
            var base = _.template("/consultant/${id}", consultant);
            return {
                self: resolver(base),
                firstLine: resolver(base + "/firstLine"),
                commissions: resolver(base + "/commissions")
            };
        }),
        clean: function (consultant) {
            return _.omit(consultant, dbImplementationFields);
        },
        assignGCV: _.curry(function (getChildren, node) {
            return _.merge({}, node, {gcv: getGCV(getChildren, node)});
        })
    };
}(
    require("lodash"),
    require("../../config.js")
));