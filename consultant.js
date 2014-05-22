module.exports = (function (_, con, uri, cfg, res, db) {
    "use strict";
    return function (app) {
        app.get("/consultant", function (request) {
            var content = _.map(db, function (consultant) {
                return {
                    payload: con.clean(consultant),
                    links: con.links(uri.absoluteUri(request), consultant)
                };
            });
            return res.respond(
                content,
                res.status.multipleChoices,
                res.header.contentType(cfg.mediatypes.list.hypermedia.consultant)
            );
        });
        return app;
    };
}(
    require("lodash"),
    require("./lib/consultant.js"),
    require("./lib/uri.js"),
    require("./config.js"),
    require("./lib/response.js"),
    require("./spikes/flatcouch.json")
));