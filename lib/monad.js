module.exports = (function (_, bilby) {
    "use strict";
    function toOption(val) {
        return _.isNull(val) || _.isUndefined(val) ? bilby.none : bilby.some(val);
    }
    function toArray(v) {
        return _.isNull(v) || _.isUndefined(v) ? [] : [v];
    }
    function optionToArray(o) {
        return o.map(function (x) { return [x]; }).getOrElse([]);
    }
    /* Function for mapping a mappable object */
    function map(f, m) {
        return m.map(f);
    }
    /* Function for getting or else an option. Note that default is provided first */
    function getOrElse(def, o) {
        return o.getOrElse(def);
    }
    function firstOption(xs) {
        if (xs.length > 0) {
            return bilby.some(xs[0]);
        }
        return bilby.none;
    }
    return {
        find: function () {
            return toOption(_.find.apply(null, arguments));
        },
        get: bilby.curry(function (field, obj) {
            return toOption(obj[field]);
        }),
        toOption: toOption,
        toArray: toArray,
        optionToArray: optionToArray,
        map: bilby.curry(map),
        firstOption: firstOption,
        first: firstOption,
        getOrElse: bilby.curry(getOrElse)
    };
}(
    require("lodash"),
    require("bilby")
));