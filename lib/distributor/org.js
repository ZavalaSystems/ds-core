/*jslint stupid: true */
module.exports = (function (path, fs, bilby, R, q, m, ftree, cypher, db) {
    "use strict";
    /* Database implementation related to org */
    var readFile = R.rPartial(fs.readFileSync, {encoding: "utf8"}),
        matchOrg = cypher.cypherToObj(readFile(path.join(__dirname, "match-org.cql")));

    /*  Precondition:
        params contains a distributorID key
     */
    function getOrg(params) {
        var org = db.distributorByIdCypher(params).then(m.first),
            members = matchOrg(params);
                // Construct the tree
        return q.spread([org, members], function (org, members) {
            return org.map(function (org) {
                return ftree.mkTree(db.distributorID, db.leaderID, members, org);
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
    require("../neo4j/cypher"),
    require("./db")
));