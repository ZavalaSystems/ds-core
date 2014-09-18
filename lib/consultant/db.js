module.exports = (function (_, cache, cypher, common) {
    "use strict";
    var ordersByConsultant = "start c=node({cid}) match (c)<-[:PLACED_BY]-(o) return id(o) as id, o";
    return {
        list: function () {
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
        },
        orders: function (cid) {
            return cypher.cypherToObj(ordersByConsultant, {cid: cid})
                .then(function (rows) {
                    var orders = common.multipluck(rows, "o", "data"),
                        ids = _.map(rows, _.partialRight(_.pick, ["id"]));

                    return common.zipMerge(orders, ids);
                });
        }
    };
}(
    require("lodash"),
    require("../cache"),
    require("../neo4j/cypher"),
    require("../common")
));