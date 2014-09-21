module.exports = (function (bilby, cypher) {
    "use strict";
    var distributors = cypher.cypherToObj("match (d:Disributor) return d;"),
        distributorById = cypher.cypherToObj("match (d:Distributor) where d.id={id} return d"),
        createPlaceholder = cypher.cypherToObj("create (d:Distributor { " +
            "id: {id}, firstName: {firstName}, lastName: {lastName}}) " +
            "return d"),
        createDistributor = cypher.cypherToObj("match (enroller:Distributor) " +
            "where enroller.id = {enroller} " +
            "create (d:Distributor {id: {id}, firstName: {firstName}, lastName: {lastName} " +
                "rank: {rank}, enrollDate: {enrollDate}})<-[:SPONSORS]-(enroller), " +
            "(d)<-[:ENROLLED]-(enroller) " +
            "return d, enroller"),
        upgradePlaceholder = cypher.cypherToObj("match (d:Distributor), (enroller:Distributor) " +
            "where d.id = {id} and enroller.id= {enroller} " +
            "create (d)<-[:ENROLLED]-(enroller), (d)<-[:SPONSORS]-(enroller) " +
            "return d, enroller");
    return bilby.environment()
        .property("distributorsQuery", function () { return distributors({}); })
        .property("distributorByIdQuery", distributorById)
        .property("createDistributorQuery", createDistributor)
        .property("createPlaceholderQuery", createPlaceholder)
        .property("upgradePlaceholderQuery", upgradePlaceholder);
}(
    require("bilby"),
    require("../neo4j/cypher")
));
