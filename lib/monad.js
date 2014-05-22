module.exports = (function (_, bilby) {
    "use strict";
    function toOption(val) {
        return _.isNull(val) || _.isUndefined(val) ? bilby.none : bilby.some(val);
    }
    return {
        find: function () {
            return toOption(_.find.apply(null, arguments));
        },
        get: bilby.curry(function (field, obj) {
            return toOption(obj[field]);
        }),
        toOption: toOption
    };
}(
    require("lodash"),
    require("bilby")
));