/*jslint maxlen: 120*/
module.exports = (function (bilby, _, cfg, con, m, res, uri, db) {
    "use strict";
    var hyperlink = bilby.curry(function (request, consultant) {
        return {
            payload: con.clean(consultant),
            links: con.links(uri.absoluteUri(request), consultant)
        };
    }),
        consultantType = res.header.contentType(cfg.mediatypes.hypermedia.consultant),
        consultantListType = res.header.contentType(cfg.mediatypes.list.hypermedia.consultant),
        local = bilby.environment();

    function hasQueryString(request) {
        return m.get("query", request)
            .map(_.isEmpty)
            .getOrElse(false);
    }

    local = local
        .method("consultantList", hasQueryString, function (request) {
            return m.toOption(_.map(db, hyperlink(request)))
                .map(res.respond)
                .map(res.status.multipleChoices)
                .map(consultantListType)
                .getOrElse(res.status.internalServerError({}));
        })
        .method("consultantList", _.constant(true), function (request) {
            return m.toOption(_.map(_.reduce(request.query, function (acc, value, key) {
                return _.filter(acc, function (x) { return x[key].toString() === value; });
            }, db), hyperlink(request)))
                .map(res.respond)
                .map(res.status.multipleChoices)
                .map(consultantListType)
                .getOrElse(res.status.internalServerError({}));
        })
        .property("getChildren", bilby.curry(function (db, node) {
            return _.filter(db, function (x) { return x.parent === node.id; });
        }));

    function findNode(db, id) {
        return m.find(db, function (x) { return x.id === id; });
    }

    return function (app) {
        app.get("/consultant", local.consultantList);

        app.get("/consultant/root", function (request) {
            return m.find(db, function (x) { return _.isNull(x.parent); })
                .map(hyperlink(request))
                .map(res.respond)
                .map(consultantType)
                .getOrElse(res.status.notFound({}));
        });

        app.get("/consultant/:cid", function (request, cid) {
            return findNode(db, cid)
                .map(hyperlink(request))
                .map(res.respond)
                .map(consultantType)
                .getOrElse(res.status.notFound({}));
        });

        app.get("/consultant/:cid/firstLine", function (request, cid) {
            return findNode(db, cid)
                .map(local.getChildren(db))
                .map(_.partialRight(_.map, hyperlink(request)))
                .map(res.respond)
                .map(res.status.multipleChoices)
                .map(consultantListType)
                .getOrElse(res.status.notFound({}));
        });

        return app;
    };
}(
    require("bilby"),
    require("lodash"),
    require("./config.js"),
    require("./lib/consultant.js"),
    require("./lib/monad.js"),
    require("./lib/response.js"),
    require("./lib/uri.js"),
    require("./spikes/flatcouch.json")
));