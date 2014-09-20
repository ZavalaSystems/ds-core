/*jslint maxlen: 120*/
module.exports = (function (mach, bilby, R, _, q, con, conDb, m, res, uri, subprocess) {
    "use strict";
    /*jslint unparam: true*/
    var hyperlink = con.linker,
        listHyperlink = _.curry(function (request, consList) {
            return {
                payload: consList,
                links: {}
            };
        }),
        local = bilby.environment();
    /*jslint unparam: false*/

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
        .property("getChildren", _.curry(function (db, node) {
            return _.filter(db, function (x) { return x.parent === node.id; });
        }))
        .property("consultantEndpoint", _.curry(function (request, consultant) {
            return q.when(consultant)
                .then(hyperlink(uri.absoluteUri(request))(_.identity))
                .then(m.map(mach.json))
                .then(m.getOrElse(res.status.notFound({})));
        }))
        .property("listEndpoint", _.curry(function (request, consList) {
            return q.when(consList)
                // Map each distributor to an element
                .then(R.map(hyperlink(uri.absoluteUri(request))(R.identity)))
                // Cope with the fact hyperlink produces options
                .then(R.compose(R.flatten, R.map(m.optionToArray)))
                .then(m.map(listHyperlink(request)))
                .then(mach.json, res.status.internalServerError({}));
        }));

    function findNodeById(id) {
        return conDb.list()
            .then(function (db) {
                return m.toOption(R.find(R.propEq("id", id), db));
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
            return findNodeById(request.params.cid)
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

        app.get("/consultant/:cid/commissions", function (request) {
            return findNodeById(_.parseInt(request.params.cid))
                .then(function (n) {
                    return subprocess.run("node", "lib/processes/commissions.js", n.rep, null);
                })
                .then(_.property("stdout"))
                .then(JSON.parse)
                .then(mach.json);
        });

        app.get("/consultant/:cid/orders", function (request) {
            var consultantId = _.parseInt(request.params.cid);
            return conDb.orders(consultantId)
                .then(mach.json);
        });

        return app;
    };
}(
    require("mach"),
    require("bilby"),
    require("ramda"),
    require("lodash"),
    require("q"),
    require("./lib/distributor"),
    require("./lib/distributor/db"),
    require("./lib/monad"),
    require("./lib/response"),
    require("./lib/uri"),
    require("./lib/subprocess")
));
