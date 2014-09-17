module.exports = (function (_, bilby) {
    "use strict";
    function toOption(val) {
        return _.isNull(val) || _.isUndefined(val) ? bilby.none : bilby.some(val);
    }
    function toArray(v) {
        return _.isNull(v) || _.isUndefined(v) ? [] : [v];
    }
    return {
        find: function () {
            return toOption(_.find.apply(null, arguments));
        },
        get: bilby.curry(function (field, obj) {
            return toOption(obj[field]);
        }),
        toOption: toOption,
        toArray: toArray
    };
}(
    require("lodash"),
    require("bilby")
));