/*jslint stupid: true */
module.exports = (function (path, fs, bilby, R, cypher, db) {
    /* Database implementation related to org */
    var readFile = R.rPartial(fs.readFileSync, {encoding: "utf8"}),
        matchOrg = cypher.cypherToObj(readFile(path.join(__dirname, "match-org.cql")));

    function composite(blob) {

    }

    function generateOrg(params) {
        var orgMembers = null;

        orgMembers = matchOrg(params)
            .then(R.map(composite));

        return orgMembers;
    }

    return bilby.environment()
        .property("generateOrg", generateOrg);
}(
    require("path"),
    require("fs"),
    require("bilby"),
    require("ramda"),
    require("../neo4j/cypher"),
    require("./db")
));