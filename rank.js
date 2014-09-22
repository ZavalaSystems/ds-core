module.exports = (function (mach) {
    "use strict";
    /*jslint stupid: true */
    var ranks = require("./ranks.json");
    /*jslint stupid: false */
    return function (app) {
        app.get("/rank", function () {
            return mach.json(ranks);
        });
    };
}(
    require("mach")
));