module.exports = (function (R, _, cache, cypher, common) {
    "use strict";
    var ordersByDistributor = cypher.cypherToObj("match (c)<-[:PLACED_BY]-(o) " +
        "where id(c)={cid} " +
        "return id(o) as id, o"),
        distributors = cypher.cypherToObj("match (d:Distributor) return d");
    return {
        list: function () {
            return cache.get("consultants").then(function (list) {
                return list || cache.timed("consultants", 60000, function () {
                    return distributors({})
                        .then(R.map(R.compose(R.prop("data"), R.prop("d"))));
                });
            });
        },
        orders: function (cid) {
            return cypher.cypherToObj(ordersByDistributor, {cid: cid})
                .then(function (rows) {
                    var orders = common.multipluck(rows, "o", "data"),
                        ids = _.map(rows, _.partialRight(_.pick, ["id"]));

                    return common.zipMerge(orders, ids);
                });
        }
    };
}(
    require("ramda"),
    require("lodash"),
    require("../cache"),
    require("../neo4j/cypher"),
    require("../common")
));
