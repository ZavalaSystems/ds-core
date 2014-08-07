/*jslint maxlen: 120*/
module.exports = (function (bilby, _, q, cfg, con, conDb, m, res, uri) {
    "use strict";
    var hyperlink = _.curry(function (request, consultant) {
            return {
                payload: con.clean(consultant),
                links: con.links(uri.absoluteUri(request), consultant)
            };
        }),
        consultantType = res.header.contentType(cfg.mediatypes.hypermedia.consultant),
        consultantListType = res.header.contentType(cfg.mediatypes.list.hypermedia.consultant),
        local = bilby.environment();

    function emptyQueryString(request) {
        return m.get("query", request)
            .map(_.isEmpty)
            .getOrElse(false);
    }

    function defaultConsultantList(request) {
        return conDb.list()
            .then(local.listEndpoint(request));
    }

    function queryConsultantList(request) {
        return conDb.list()
            .then(function (db) {
                return _.reduce(request.query, function (acc, value, key) {
                    var normalizedSearch = _.isString(value) ? value.toLowerCase() : value;
                    return _.filter(acc, function (item) {
                        var inspectedValue = item[key],
                            normalizedText = _.isString(inspectedValue) ? inspectedValue.toLowerCase() : inspectedValue;
                        return normalizedSearch === normalizedText;
                    });
                }, db);
            })
            .then(local.listEndpoint(request));
    }

    local = local
        .method("consultantList", emptyQueryString, defaultConsultantList)
        .method("consultantList", _.constant(true), queryConsultantList)
        .property("getChildren", bilby.curry(function (db, node) {
            return _.filter(db, function (x) { return x.parent === node.id; });
        }))
        .property("consultantEndpoint", _.curry(function (request, consultant) {
            return q.when(consultant)
                .then(hyperlink(request))
                .then(res.respond)
                .then(consultantType, _.constant(res.status.notFound({})));
        }))
        .property("listEndpoint", _.curry(function (request, consList) {
            return q.when(consList)
                .then(_.partialRight(_.map, hyperlink(request)))
                .then(res.respond)
                .then(res.status.multipleChoices)
                .then(consultantListType, res.status.internalServerError({}));
        }));

    function findNodeById(id) {
        return conDb.list()
            .then(function (db) {
                return _.find(db, {id: id});
            });
    }

    function findRoot() {
        return conDb.list()
            .then(function (db) {
                return _.find(db, {rep: "1"});
            });
    }

    function findNodeChildren(id) {
        return conDb.list().then(function (db) {
            var node = _.find(db, {id: id});
            return _.filter(db, {sponsorrep: node.rep});
        });
    }

    return function (app) {
        app.get("/consultant", local.consultantList);

        app.get("/consultant/:cid", function (request) {
            console.log("here");
            return findNodeById(_.parseInt(request.params.cid))
                .then(local.consultantEndpoint(request));
        });

        app.get("/consultant/:cid/firstLine", function (request) {
            return findNodeChildren(_.parseInt(request.params.cid))
                .then(local.listEndpoint(request));
        });

        app.get("/consultant/root", function (request) {
            return findRoot()
                .then(local.consultantEndpoint(request));
        });

        // app.get("/consultant/:cid/full", function (request, cid) {
        //     return toggles.getToggleOff(request, "feature.full") ?
        //             findNode(db, cid)
        //                 .map(con.assignGCV(local.getChildren(db)))
        //                 .map(hyperlink(request))
        //                 .map(res.respond)
        //                 .map(consultantType)
        //                 .map(res.status.ok)
        //                 .getOrElse(res.status.notFound({})) :
        //             res.status.notFound({});
        // });

        return app;
    };
}(
    require("bilby"),
    require("lodash"),
    require("q"),
    require("./config"),
    require("./lib/consultant/consultant"),
    require("./lib/consultant/consultant.db"),
    require("./lib/monad"),
    require("./lib/response"),
    require("./lib/uri")
));