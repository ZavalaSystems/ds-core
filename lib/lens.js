module.exports = (function (R, bilby) {
    "use strict";

    function transform(f, ks) {
        var lenses = R.map(bilby.objectLens, ks),
            head = R.head(lenses),
            rest = R.skip(1, lenses),
            composite = R.foldl(function (c, x) { return x.compose(c); }, head, rest);
        return function (x) {
            var r = composite.run(x);
            return r.setter(f(r.getter));
        };
    }

    return {
        get: function (lr) { return lr.getter; },
        /* Transform the value described by the array ks using transformer f in object x.
           ks should be specified in the order of access
           An inner function is returned as an optimization on building the lenses.
           We don't want to do that per value.
        */
        transform: R.curry(transform)
    };
}(
    require("ramda"),
    require("bilby")
));