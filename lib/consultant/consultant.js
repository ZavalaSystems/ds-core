module.exports = (function (_, hypermedia) {
    "use strict";
    var dbImplementationFields = ["id", "parent", "children"],
        getGCV,
        linksSpec = {
            self: "",
            firstLine: "/firstLine",
            commissions: "/commissions",
            orders: "/orders"
        };

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
        linker: _.curry(function (resolver, consultant) {
            return hypermedia.hyperlink({
                sanitize: {
                    black: ["id", "parent", "children"]
                },
                links: {
                    self: true,
                    fields: ["firstLine", "commission", "orders"],
                    base: _.template("/consultant/${id}")
                },
                resolver: resolver
            }, consultant);
        }),
        links: _.curry(function (resolver, consultant) {
            var base = _.template("/consultant/${id}", consultant);
            return _.transform(linksSpec, function (acc, fragment, name) {
                acc[name] = resolver(base + fragment);
            });
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
    require("../hypermedia"),
    require("../../config.js")
));