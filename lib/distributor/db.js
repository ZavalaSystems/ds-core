module.exports = (function (bilby, R, _, cache, cypher, common) {
    "use strict";
    var ordersByConsultant = "start c=node({cid}) match (c)<-[:PLACED_BY]-(o) return id(o) as id, o",
        createConsumer = "create (d:Distributor {id: {id}, firstName: {firstName}, lastName: {lastName}}) " +
            "return id(d), d",
        createDistributor = "match (sponsor:Distributor) where sponsor.id={sponsor} " +
            "create (d:Distributor {id: {id}, firstName: {firstName}, lastName: {lastName}, " +
                "joinDate: {joinDate}, rank: {rank}})<-[:SPONSORS]-(sponsor), " +
            "(d)<-[:ENROLLED]-(sponsor) " +
            "return d",
        upgradeDistributor = "match (sponsor:Distributor), (d: Distributor) " +
            "where sponsor.id={sponsor} and d.id={id} " +
            "create (d)<-[:SPONSORS]-(sponsor), (d)<-[:ENROLLED]-(sponsor) " +
            "set d.joinDate = {joinDate}, d.rank = {rank} " +
            "return d";

    function getList() {
        return cache.get("consultants").then(function (list) {
            return list || cache.timed("consultants", 60000, function () {
                return cypher.cypherToObj("match (n:Consultant) return id(n) as id, n", {})
                    .then(function (rows) {
                        var consultants = common.multipluck(rows, "n", "data"),
                            ids = _.map(rows, _.partialRight(_.pick, ["id"]));

                        return common.zipMerge(consultants, ids);
                    });
            });
        });
    }

    function getOrders(cid) {
        return cypher.cypherToObj(ordersByConsultant, {cid: cid})
            .then(function (rows) {
                var orders = common.multipluck(rows, "o", "data"),
                    ids = _.map(rows, _.partialRight(_.pick, ["id"]));

                return common.zipMerge(orders, ids);
            });
    }

    return bilby.environment()
        .property("list", getList)
        .property("orders", getOrders);
}(
    require("bilby"),
    require("ramda"),
    require("lodash"),
    require("../cache"),
    require("../neo4j/cypher"),
    require("../common")
));