module.exports = (function (_, bilby, cfg) {
    "use strict";
    var dbImplementationFields = ["id", "parent", "children"];

    return {
        links: bilby.curry(function (resolver, consultant) {
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
        }
    };
}(
    require("lodash"),
    require("bilby"),
    require("../config.js")
));