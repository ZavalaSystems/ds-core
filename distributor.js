/*jslint maxlen: 120*/
module.exports = (function (mach, bilby, R, monad) {
    "use strict";
    return function (app) {

        return [app, mach, bilby, R, monad];
    };
}(
    require("mach"),
    require("bilby"),
    require("ramda"),
    require("monad"),
    require("./lib/distributor")
));
