module.exports = (function (mach, _, con, db) {
    "use strict";
    return function (app) {
        app.get("/consultant", function () {
            return mach.json(_.map(db, con.clean));
        });
        return app;
    };
}(
    require("mach"),
    require("lodash"),
    require("./lib/consultant.js"),
    require("./spikes/flatcouch.json")
));