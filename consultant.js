/*jslint maxlen: 120*/
module.exports = (function (bilby, _, request, q, cfg, con, m, res, uri, toggles, db) {
    "use strict";
    var hyperlink = bilby.curry(function (request, consultant) {
            return {
                payload: con.clean(consultant),
                links: con.links(uri.absoluteUri(request), consultant)
            };
        }),
        consultantType = res.header.contentType(cfg.mediatypes.hypermedia.consultant),
        consultantListType = res.header.contentType(cfg.mediatypes.list.hypermedia.consultant),
        neo4j = "http://localhost:7474/db/data",
        cypherEndpoint = neo4j + "/cypher",
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

    function execCypherQuery(query, params) {
        var cypherQuery = {query: query, params: params || {}},
            defer = q.defer();

        request.post(cypherEndpoint, {json: cypherQuery}, function (err, response, body) {
            if (err) { defer.reject(err); }
            if (response.statusCode !== 200) {
                defer.reject(response);
            }

            defer.resolve(body);
        });

        return defer.promise;
    }

    function findNodeById(id) {
        var cypherPromise = execCypherQuery("start n=node({id}) return n", {id: id});

        return cypherPromise.then(function (body) {
            var dbResult = _.first(body.data),
                node = _.first(dbResult);

            return _.merge({}, node.data, {id: id});
        });
    }

    function findRoot() {
        var cypherPromise = execCypherQuery("match (n:Consultant) where n.rep = \"1\" return n, id(n)");

        return cypherPromise.then(function (body) {
            var dbResult = _.first(body.data),
                node = _.first(dbResult),
                id = _.last(dbResult);

            return _.merge({}, node.data, {id: id});
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
    require("request"),
    require("q"),
    require("./config"),
    require("./lib/consultant"),
    require("./lib/monad"),
    require("./lib/response"),
    require("./lib/uri"),
    require("./lib/toggle"),
    require("./spikes/flatcouch.json")
));