module.exports = (function (_, bilby, R) {
    "use strict";
    /*jslint unparam: true*/

    var number = /^[0-9]+(\.[0-9]+)?$/g;

    function translateTable() {
        var columns = _.toArray(arguments),
            rows = _.reduce(_.first(columns), function (acc, obj, i) {
                return acc.concat([_.reduce(columns, function (acc2, column) {
                    return acc2.concat(column[i]);
                }, [])]);
            }, []);
        return rows;
    }
    /*jslint unparam: false*/

    function zipMerge() {
        var translated = translateTable.apply(null, arguments);
        return _.reduce(translated, function (acc, partials) {
            return acc.concat(_.reduce(partials, function (acc2, partial) {
                _.merge(acc2, partial);
                return acc2;
            }, {}));
        }, []);
    }

    function multipluck() {
        var arr = _.first(arguments),
            plucks = _.rest(arguments);

        return _.reduce(plucks, function (acc, pluck) {
            return _.pluck(acc, pluck);
        }, arr);
    }

    function isNullOrUndefined(v) {
        return v === null || v === undefined;
    }

    function isNumberLike(x) {
        if (bilby.isNumber(x)) {
            return true;
        }
        try {
            return x.match(number) !== null;
        } catch (ignored) {
            return false;
        }
    }

    function negate(v) {
        return !v;
    }

    function isDateParseable(v) {
        return !isNaN(Date.parse(v));
    }

    function merge(x1, x2) {
        return R.fromPairs(R.concat(R.toPairs(x1), R.toPairs(x2)));
    }

    function props(xs) {
        return R.reduce(R.compose, R.identity, R.reverse(R.map(R.prop, xs)));
    }

    function asString(x) {
        return x.toString();
    }

    function join(sep, xs) {
        return xs.join(sep);
    }

    return bilby.environment()
        .property("multipluck", multipluck)
        .property("translateTable", translateTable)
        .property("zipMerge", zipMerge)
        .property("isNullOrUndefined", isNullOrUndefined)
        .property("isDefined", R.compose(negate, isNullOrUndefined))
        .property("merge", R.curry(merge))
        .property("negate", negate)
        .property("isDateParseable", isDateParseable)
        .property("isNumberLike", isNumberLike)
        .property("asString", asString)
        .property("join", R.curry(join))
        .property("props", props);
}(
    require("lodash"),
    require("bilby"),
    require("ramda")
));