/*jslint maxlen: 120*/
module.exports = (function (bilby, _, cfg, con, m, res, uri, toggles, neo4j, db) {
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
        return m.toOption(_.map(db, hyperlink(request)))
            .map(res.respond)
            .map(res.status.multipleChoices)
            .map(consultantListType)
            .getOrElse(res.status.internalServerError({}));
    }

    function queryConsultantList(request) {
        return m.toOption(_.map(_.reduce(request.query, function (acc, value, key) {
            return _.filter(acc, function (x) { return x[key].toString() === value; });
        }, db), hyperlink(request)))
            .map(res.respond)
            .map(res.status.multipleChoices)
            .map(consultantListType)
            .getOrElse(res.status.internalServerError({}));
    }

    local = local
        .method("consultantList", emptyQueryString, defaultConsultantList)
        .method("consultantList", _.constant(true), queryConsultantList)
        .property("getChildren", bilby.curry(function (db, node) {
            return _.filter(db, function (x) { return x.parent === node.id; });
        }));

    function findNode(db, id) {
        return m.find(db, function (x) { return x.id === id; });
    }

    function findNodeById(id) {
        return neo4j.cypherToObj("start n=node({id}) return n", {id: id})
            .then(function (rows) {
                var node = _.first(rows).n;

                return _.merge({}, node.data, {id: id});
            });
    }

    function findRoot() {
        return neo4j.cypherToObj("match (n:Consultant) where n.rep = {rep} return n, id(n) as id", {rep: "1"})
            .then(function (rows) {
                var row = _.first(rows);

                return _.merge({}, row.n.data, {id: row.id});
            });
    }

    return function (app) {
        app.get("/consultant", local.consultantList);

        app.get("/consultant/root", function (request) {
            return findRoot()
                .then(hyperlink(request))
                .then(res.respond)
                .then(consultantType);
        });

        app.get("/consultant/:cid", function (req, cid) {
            return findNodeById(_.parseInt(cid))
                .then(hyperlink(req))
                .then(res.respond)
                .then(consultantType, _.constant(res.status.notFound({})));
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

        app.get("/consultant/:cid/full", function (request, cid) {
            return toggles.getToggleOff(request, "feature.full") ?
                    findNode(db, cid)
                        .map(con.assignGCV(local.getChildren(db)))
                        .map(hyperlink(request))
                        .map(res.respond)
                        .map(consultantType)
                        .map(res.status.ok)
                        .getOrElse(res.status.notFound({})) :
                    res.status.notFound({});
        });

        return app;
    };
}(
    require("bilby"),
    require("lodash"),
    require("./config"),
    require("./lib/consultant"),
    require("./lib/monad"),
    require("./lib/response"),
    require("./lib/uri"),
    require("./lib/toggle"),
    require("./lib/neo4j"),
    require("./spikes/flatcouch.json")
));