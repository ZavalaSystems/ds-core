/*jslint stupid: true */
module.exports = (function (path, fs, R, bilby, common, cypher) {
    "use strict";
    var readFile = R.rPartial(fs.readFileSync, {encoding: "utf8"}),
        cypherCurrent = cypher.cypherToObj(readFile(path.join(__dirname, "match-current.cql"))),
        cypherByDate = cypher.cypherToObj(readFile(path.join(__dirname, "match-offset.cql"))),
        cypherByID = cypher.cypherToObj(readFile(path.join(__dirname, "match-id.cql"))),
        cypherCreateNext = cypher.cypherToObj(readFile(path.join(__dirname, "create-next.cql"))),
        current = R.compose(R.prop("data"), R.prop("current")),
        currentID = R.prop("current_id"),
        prev = R.compose(R.prop("data"), R.prop("prev")),
        prevID = R.prop("prev_id"),
        next = R.compose(R.prop("data"), R.prop("next")),
        nextID = R.prop("next_id"),
        hasPrev = R.compose(common.negate, common.isNullOrUndefined, R.prop("prev")),
        hasNext = R.compose(common.negate, common.isNullOrUndefined, R.prop("next"));

    function matchCurrent() {
        return cypherCurrent({});
    }

    return bilby.environment()
        .property("matchCurrent", matchCurrent)
        .property("matchByDate", cypherByDate)
        .property("matchByID", cypherByID)
        .property("createNext", cypherCreateNext)
        .property("current", current)
        .property("currentID", currentID)
        .property("prev", prev)
        .property("prevID", prevID)
        .property("next", next)
        .property("nextID", nextID)
        .property("hasNext", hasNext)
        .property("hasPrev", hasPrev);
}(
    require("path"),
    require("fs"),
    require("ramda"),
    require("bilby"),
    require("../common"),
    require("../neo4j/cypher")
));