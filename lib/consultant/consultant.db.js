module.exports = (function (_, cache, cypher, common) {
    "use strict";

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
        }
    };
}(
    require("lodash"),
    require("../cache"),
    require("../neo4j/cypher"),
    require("../common")
));