module.exports = (function (mach, _, con, uri, db) {
    "use strict";
    return function (app) {
        app.get("/consultant", function (request) {
            return mach.json(_.map(db, function (consultant) {
                return {
                    payload: con.clean(consultant),
                    links: con.links(uri.absoluteUri(request), consultant)
                };
            }));
        });
        return app;
    };
}(
    require("mach"),
    require("lodash"),
    require("./lib/consultant.js"),
    require("./lib/uri.js"),
    require("./spikes/flatcouch.json")
));