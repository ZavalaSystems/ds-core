/*jslint maxlen: 120*/
var mach = require("mach"),
    _ = require("lodash"),
    db = require("./flatcouch.json");

(function () {
    "use strict";

    function build_tree(top) {
        return _.merge({}, top, {
            children: _.map(_.filter(db, function (x) { return x.parent === top.id; }), build_tree)
        });
    }

    var outer = mach.stack(),
        text = mach.stack(),
        json = mach.stack(),
        prefix = _.template("${protocol}//${host}:${port}"),
        consultantHypermedia;

    consultantHypermedia = _.curry(function (request, response) {
        return _.merge({}, response, {
            links: [
                {
                    rel: "self",
                    href: _.template("${prefix}/api/consultant/${id}", {
                        prefix: prefix(request),
                        id: response.id
                    }),
                    contentType: "application/vnd.core.hypermedia+json; profile=consultant"
                },
                {
                    rel: "lines",
                    href: _.template("${prefix}/api/consultant/${id}/lines", {
                        prefix: prefix(request),
                        id: response.id
                    }),
                    contentType: "application/vnd.core.collection+json"
                }
            ]
        });
    });

    function consultantCleanup(consultant) {
        return _.reduce(consultant, function (acc, value, key) {
            if (!_.contains(["id", "parent", "children"], key)) {
                acc[key] = value;
            }
            return acc;
        }, {});
    }

    json.use(mach.contentType, "application/vnd.core.hypermedia+json; profile=consultant");
    json.get("/consultant", function (request) {
        var process = _.compose(consultantCleanup, consultantHypermedia(request));
        return mach.json(_.map(db, process), 300);
    });

    json.get("/consultant/root", function (request) {
        var out = _.compose(
            JSON.stringify,
            consultantCleanup,
            consultantHypermedia(request)
        );
        return out(_.find(db, function (x) { return _.isNull(x.parent); }));
    });

    json.get("/consultant/:cid", function (request, cid) {
        var out = _.compose(
            consultantCleanup,
            consultantHypermedia(request)
        );
        return out(_.find(db, function (x) { return x.id === cid; }));
    });

    json.get("/consultant/:cid/line", function (request, cid) {
        var lines = ["first", "second", "third", "fourth", "fifth"];
        return {
            content: JSON.stringify(_.reduce(lines, function (acc, item, index) {
                return acc.concat({
                    rel: item,
                    href: _.template("${prefix}/api/consultant/${id}/line/${lineId}", {
                        prefix: prefix(request),
                        id: cid,
                        lineId: index
                    }),
                    contentType: "application/vnd.core.collection+json"
                });
            }, [])),
            status: 300,
            headers: {"Content-Type": "application/vnd.core.collection+json"}
        };
    });

    json.get("/consultant/:cid/line/:line", function (request, cid) {
        var consultant = build_tree(_.find(db, function (x) { return x.id === cid; })),
            out = _.compose(
                consultantCleanup,
                consultantHypermedia(request)
            );
        return {
            content: JSON.stringify(_.map(consultant.children, out)),
            status: 300,
            headers: {"Content-Type": "application/vnd.core.collection+json"}
        };
    });

    outer.map("/", function (app) {
        app.run(text);
    });
    outer.map("/api", function (app) {
        app.run(json);
    });

    mach.serve(outer);
}());