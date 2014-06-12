module.exports = (function (_, cfg) {
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
                self: {
                    href: resolver(base),
                    contentType: cfg.mediatypes.hypermedia.consultant
                },
                firstLine: {
                    href: resolver(base + "/firstLine"),
                    contentType: cfg.mediatypes.list.hypermedia.consultant
                }
            };
        }),
        clean: function (consultant) {
            return _.reduce(consultant, function (acc, value, key) {
                if (!_.contains(dbImplementationFields, key)) {
                    acc[key] = value;
                }
                return acc;
            }, {});
        },
        getGCV: _.curry(function (getChildren, node) {
            return _.merge({}, node, {gcv: getGCV(getChildren, node)});
        })
    };
}(
    require("lodash"),
    require("../config.js")
));