module.exports = (function (R, bilby, q) {
    "use strict";
    /*  Given a function f that returns a Promise and an array
     *  xs containing a sequence of parameters for f, perform
     *  the io operation in each input with at most 1 occuring
     *  in parallel
     */
    var serializeIO = R.curry(function (f, xs) {
        return R.reduce(function (prev, x) {
            return prev.then(function () {
                return f(x);
            });
        }, q.when(), xs);
    });
    return bilby.environment()
        .property("serializeIO", serializeIO);
}(
    require("ramda"),
    require("bilby"),
    require("q")
));