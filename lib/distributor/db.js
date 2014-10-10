module.exports = (function (fs, path, R, bilby, common, cypher) {
    "use strict";
    /*jslint stupid:true*/
    var readFileSync = R.rPartial(fs.readFileSync, {encoding: "utf8"}),
        distributors = cypher.cypherToObj(readFileSync(path.join(__dirname, "match-all.cql"))),
        distributorById = cypher.cypherToObj(readFileSync(path.join(__dirname, "match-distributor.cql"))),
        createPartial = cypher.cypherToObj(readFileSync(path.join(__dirname, "create-partial.cql"))),
        createDistributor = cypher.cypherToObj(readFileSync(path.join(__dirname, "create-distributor.cql"))),
        upgradePartial = cypher.cypherToObj(readFileSync(path.join(__dirname, "upgrade-partial.cql"))),
        hasEnroller = R.compose(common.negate, common.isNullOrUndefined, R.prop("enroller")),
        hasSponsor = R.compose(common.negate, common.isNullOrUndefined, R.prop("sponsor")),
        hasLeader = R.compose(common.isDefined, R.prop("leader")),
        matched = R.compose(R.prop("data"), R.prop("d")),
        enroller = R.compose(R.prop("data"), R.prop("enroller")),
        sponsor = R.compose(R.prop("data"), R.prop("sponsor")),
        leader = R.compose(R.prop("data"), R.prop("leader")),
        leaderID = R.compose(R.prop("id"), R.prop("data"), R.prop("leader")),
        distributorID = R.compose(R.prop("id"), R.prop("data"), R.prop("d")),
        sponsorID = R.compose(R.prop("id"), sponsor),
        enrollerID = R.compose(R.prop("id"), enroller);
    /*jslint stupid:false*/
    return bilby.environment()
        .property("distributorsCypher", function () { return distributors({}); })
        .property("leaderID", leaderID)
        .property("distributorID", distributorID)
        .property("hasEnroller", hasEnroller)
        .property("hasSponsor", hasSponsor)
        .property("hasLeader", hasLeader)
        .property("matched", matched)
        .property("enroller", enroller)
        .property("enrollerID", enrollerID)
        .property("sponsor", sponsor)
        .property("sponsorID", sponsorID)
        .property("leader", leader)
        // These are the original versions of the functions
        .property("distributorByIdCypher", distributorById)
        .property("createDistributorCypher", createDistributor)
        .property("createPartialCypher", createPartial)
        .property("upgradePartialCypher", upgradePartial)
        // These are duplicates to allow for the same naming conventions as other db blocks
        .property("matchByID", distributorById)
        .property("createDistributor", createDistributor)
        .property("createPartial", createPartial)
        .property("upgradePartial", upgradePartial);
}(
    require("fs"),
    require("path"),
    require("ramda"),
    require("bilby"),
    require("../common"),
    require("../neo4j/cypher")
));
