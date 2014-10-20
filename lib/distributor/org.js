/*jslint stupid: true */
module.exports = (function (path, fs, bilby, R, q, m, ftree, fortuna, cypher, bp, db) {
    "use strict";
    /* Database implementation related to org */
    var readFile = R.rPartial(fs.readFileSync, {encoding: "utf8"}),
        matchOrg = cypher.cypherToObj(readFile(path.join(__dirname, "match-org.cql"))),
        director = new RegExp("(D|d)irector"),
        attachDirector = R.curry(function (i, label) {
            return R.mixin({leg: i}, label);
        }),
        attachLevel = R.curry(function (i, label) {
            return R.mixin({level: i}, label);
        }),
        volumesFrom = R.curry(function (comms, dist) {
            var isCommRecordForDist = R.compose(R.eq(db.distributorID(dist)), fortuna.distributorID),
                match = R.find(isCommRecordForDist, comms);
            return {
                personalVolume: fortuna.personalVolume(match),
                groupVolume: fortuna.groupVolume(match),
                orgVolume: fortuna.orgVolume(match)
            };
        });

    function l1Directors(x) {
        if (director.test(ftree.label(x))) {
            return [x];
        }
        return R.flatten(R.map(l1Directors, ftree.children(x)));
    }

    function recurseLevels(x, l) {
        var children = ftree.children(x),
            idx = 0;
        ftree.mutateLabel(attachLevel(l), x);
        for (idx = 0; idx < children.length; idx += 1) {
            recurseLevels(children[idx], l + 1);
        }
    }

    function recurseLeg(x, l) {
        var children = ftree.children(x),
            idx = 0;
        ftree.mutateLabel(attachDirector(l), x);
        for (idx = 0; idx < children.length; idx += 1) {
            recurseLeg(children[idx], l);
        }
    }

    /*  Precondition:
        params contains a distributorID key
        TASK: Remove mutations.
     */
    function getOrg(params) {
        var root = db.distributorByIdCypher(params).then(m.first),
            members = matchOrg(params),
                // Construct the tree
            orgOpt = q.spread([root, members], function (root, members) {
                return root.map(ftree.mkTree(db.distributorID, db.sponsorID, members));
            })
                .then(m.map(function (tree) {
                    var i = 0, directors = l1Directors(tree);
                    if (directors.length > 0) {
                        for (i = 1; i < directors.length; i += 1) {
                            recurseLeg(directors[i], i);
                            recurseLevels(directors[i], 0);
                        }
                    } else {
                        // Default leg if there are not directors
                        recurseLeg(tree, 1);
                        recurseLevels(tree, 0);
                    }
                    return tree;
                }))
                .then(m.map(ftree.toSeq)),
            commissions = bp.matchCurrent()
                .then(m.first)
                .then(m.getOrElse(null))
                .then(function (bpData) {
                    return fortuna.service(bp.currentID(bpData), params.distributorID);
                })
                .then(fortuna.toSeq);
        return q.spread([orgOpt, commissions], function (orgOpt, commissions) {
            var lookupVolume = volumesFrom(commissions);
            return orgOpt.map(function (org) {
                return R.map(function (d) {
                    return R.mixin(lookupVolume(d), d);
                }, org);
            });
        });
    }
    return bilby.environment()
        .property("getOrg", getOrg);
}(
    require("path"),
    require("fs"),
    require("bilby"),
    require("ramda"),
    require("q"),
    require("../monad"),
    require("../ftree"),
    require("../fortuna"),
    require("../neo4j/cypher"),
    require("../businessperiod"),
    require("./db")
));