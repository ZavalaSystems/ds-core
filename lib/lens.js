module.exports = (function (R, bilby, m) {
    "use strict";

    var transform = R.curry(function (f, ks) {
            var lenses = R.map(bilby.objectLens, ks),
                head = R.head(lenses),
                rest = R.skip(1, lenses),
                composite = R.foldl(function (c, x) { return x.compose(c); }, head, rest);
            return function (x) {
                try {
                    var r = composite.run(x);
                    if (r.getter !== undefined) {
                        return r.setter(f(r.getter));
                    }
                } catch (ignore) {

                }
                /* If the value was undefined or couldn't be reached, don't bother */
                return x;
            };
        }),
        /* Define a bunch of common transformations */
        mkInt = function (x) {
            if (bilby.isNumber(x)) {
                return Math.floor(x);
            }
            return parseInt(x, 10);
        },
        mkNumber = function (x) {
            if (bilby.isNumber(x)) {
                return x;
            }
            return parseFloat(x, 10);
        },
        mkCents = R.compose(Math.floor, R.multiply(100), mkNumber),
        mkCurrency = R.divide(100),
        transformToInt = transform(mkInt),
        transformToNumber = transform(mkNumber),
        transformToCents = transform(mkCents),
        transformToCurrency = transform(mkCurrency),
        transformToString = transform(function (x) { return x.toString(); }),
        transformStrToEpochOffset = transform(function (x) { return Date.parse(x); }),
        transformEpochOffsetToString = transform(function (x) { return new Date(x).toISOString(); }),
        optionGet = R.curry(function (l, x) {
            try {
                return m.toOption(l(x));
            } catch (ignored) {
                return bilby.none;
            }
        });

    function props(xs) {
        return R.reduce(R.compose, R.identity, R.reverse(R.map(R.prop, xs)));
    }

    return bilby.environment()
        .property("get", function (l) { return l.getter; })
        .property("optionGet", optionGet)
        .property("props", props)
        .property("transform", transform)
        .property("mkInt", mkInt)
        .property("mkNumber", mkNumber)
        .property("mkCents", mkCents)
        .property("transformToString", transformToString)
        .property("transformToInt", transformToInt)
        .property("transformToNumber", transformToNumber)
        .property("transformToCents", transformToCents)
        .property("transformToCurrency", transformToCurrency)
        .property("transformStrToEpochOffset", transformStrToEpochOffset)
        .property("transformEpochOffsetToStr", transformEpochOffsetToString);
}(
    require("ramda"),
    require("bilby"),
    require("./monad")
));