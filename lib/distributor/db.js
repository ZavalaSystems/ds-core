module.exports = (function (fs, path, R, bilby, common, cypher) {
    "use strict";
    /*jslint stupid:true*/
    var readFileSync = R.rPartial(fs.readFileSync, {encoding: "utf8"}),
        distributors = cypher.cypherToObj("match (d:Disributor) return d;"),
        distributorById = cypher.cypherToObj("match (d:Distributor) where d.id={distributorID} return d"),
        createPartial = cypher.cypherToObj(readFileSync(path.join(__dirname, "create-partial.cql"))),
        createDistributor = cypher.cypherToObj(readFileSync(path.join(__dirname, "create-distributor.cql"))),
        upgradePartial = cypher.cypherToObj(readFileSync(path.join(__dirname, "upgrade-partial.cql"))),
        hasEnroller = R.compose(common.negate, common.isNullOrUndefined, R.prop("enroller")),
        hasSponsor = R.compose(common.negate, common.isNullOrUndefined, R.prop("sponsor")),
        matched = R.compose(R.prop("data"), R.prop("d")),
        enroller = R.compose(R.prop("data"), R.prop("enroller")),
        sponsor = R.compose(R.prop("data"), R.prop("sponsor"));
    /*jslint stupid:false*/
    return bilby.environment()
        .property("distributorsCypher", function () { return distributors({}); })
        .property("hasEnroller", hasEnroller)
        .property("hasSponsor", hasSponsor)
        .property("matched", matched)
        .property("enroller", enroller)
        .property("sponsor", sponsor)
        .property("distributorByIdCypher", distributorById)
        .property("createDistributorCypher", createDistributor)
        .property("createPartialCypher", createPartial)
        .property("upgradePartialCypher", upgradePartial);
}(
    require("fs"),
    require("path"),
    require("ramda"),
    require("bilby"),
    require("../common"),
    require("../neo4j/cypher")
));
