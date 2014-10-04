/*jslint stupid: true */
module.exports = (function (path, fs, bilby, R, m, lens, cypher, db) {
    "use strict";
    /* Database implementation related to org */
    var readFile = R.rPartial(fs.readFileSync, {encoding: "utf8"}),
        matchOrg = cypher.cypherToObj(readFile(path.join(__dirname, "match-org.cql"))),
        org = lens.props(["org", "data"]),
        dist = R.prop("distributors");

    /*  Precondition:
        params contains a distributorID key
     */
    function getOrg(params) {
        return matchOrg(params)
            .then(m.first)
            .then(m.map(function (results) {
                var root = org(results),
                    distributors = dist(results);
                return R.cons(root, R.map(R.prop("data"), distributors));
            }));
    }

    return bilby.environment()
        .property("getOrg", getOrg);
}(
    require("path"),
    require("fs"),
    require("bilby"),
    require("ramda"),
    require("../monad"),
    require("../lens"),
    require("../neo4j/cypher"),
    require("./db")
));