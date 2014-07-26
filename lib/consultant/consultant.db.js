module.exports = (function (_, cache, cypher, common) {
    "use strict";

    return {
        list: function () {
            if (!cache.get("consultants")) {
                cache.timed("consultants", 60000, function () {
                    return cypher.cypherToObj("match (n:Consultant) return id(n) as id, n")
                        .then(function (rows) {
                            var consultants = common.multipluck(rows, "n", "data"),
                                ids = _.pluck(rows, "id");

                            return common.zipMerge(consultants, ids);
                        });
                });
            }
            return cache.get("consultants");
        }
    };
}(
    require("lodash"),
    require("../cache"),
    require("../neo4j/cypher"),
    require("../common")
));