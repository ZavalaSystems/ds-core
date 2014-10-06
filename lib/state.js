module.exports = (function (bilby) {
    "use strict";
    var state = function (f) {
            return function (s) {
                return f(s);
            };
        },
        pure = function (x) {
            return state(function (s) {
                return [x, s];
            });
        },
        map = function (fa, f) {
            return state(function (s) {
                var r = fa(s);
                return [f(r[0]), r[1]];
            });
        };
    return bilby.environment()
        .property("pure", pure)
        .property("map", map);
}(
    require("bilby")
));