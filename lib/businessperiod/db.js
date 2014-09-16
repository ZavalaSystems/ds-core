module.exports = (function (_, monad, cypher) {
    "use strict";
    var matchByDate = "match (bp:BusinessPeriod {year: {year}, month: {month}}) " +
        "optional match (prev:BusinessPeriod)-[:PRECEDES]->(bp) " +
        "optional match (bp)-[:PRECEDES]->(next:BusinessPeriod) " +
        "return id(prev), bp, id(bp), id(next) limit 1",
        matchByNode = "start bp=node({id}) match (bp:BusinessPeriod) return bp, id(bp) limit 1";

    function lookupByDate(date) {
        return cypher.cypherToObj(matchByDate,
            {
                year: date.getFullYear(),
                month: date.getMonth() + 1
            })
            .then(_.first)
            .then(monad.toOption);
    }

    function lookupById(id) {
        /* _.parseInt is identity for numbers */
        return cypher.cypherToObj(matchByNode, {id: _.parseInt(id)})
            .then(_.first)
            .then(monad.toOption);
    }

    return {
        byDate: lookupByDate,
        byId: lookupById
    };
}(
    require("lodash"),
    require("../monad"),
    require("../neo4j/cypher")
));