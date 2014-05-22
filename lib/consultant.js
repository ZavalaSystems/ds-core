module.exports = (function (_) {
    "use strict";
    var dbImplementationFields = ["id", "parent", "children"];
    return {
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
    require("lodash")
));