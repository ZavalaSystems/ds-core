/*jslint stupid: true */
module.exports = (function (path, fs, bilby, R, q, m, lens, cypher, db) {
    "use strict";
    /* Database implementation related to org */
    var readFile = R.rPartial(fs.readFileSync, {encoding: "utf8"}),
        matchOrg = cypher.cypherToObj(readFile(path.join(__dirname, "match-org.cql"))),
        orgDistributor = lens.props(["d", "data"]),
        orgLeaderID = lens.props(["leader", "data", "id"]);

    function mkTreeData(record) {
        return R.mixin(orgDistributor(record), {leaderID: orgLeaderID(record)});
    }

    /*  Precondition:
        params contains a distributorID key
     */
    function getOrg(params) {
        return [q, m, db, matchOrg, params];
    }

    return bilby.environment()
        .property("mkTreeData", mkTreeData)
        .property("getOrg", getOrg);
}(
    require("path"),
    require("fs"),
    require("bilby"),
    require("ramda"),
    require("q"),
    require("../monad"),
    require("../lens"),
    require("../neo4j/cypher"),
    require("./db")
));