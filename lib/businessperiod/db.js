module.exports = (function (bilby, cypher) {
    "use strict";
    var cypherCurrent = "match (current:BusinessPeriod) " +
                            "optional match (prev:BusinessPeriod)-[:PRECEDES]->(current) " +
                            "where not (current)-[:PRECEDES]->() " +
                            "return current, prev;",
        cypherByOffset = "match (current:BusinessPeriod) " +
                            "optional match (prev:BusinessPeriod)-[:PRECEDES]->(current) " +
                            "-[:PRECEDES]->(next:BusinessPeriod) " +
                            "where current.start <= {offset} and (current.end = null || current.end > {offset}) " +
                            "return current, prev, next";

    function first(xs) {
        if (xs.length === 0) {
            return bilby.none;
        }
        return bilby.some(xs[0]);
    }

    function getCurrent() {
        return cypher.cypherToObj(cypherCurrent, {})
            .then(first);
    }

    function getByOffset(offset) {
        return cypher.cypherToObj(cypherByOffset, {offset: offset})
            .then(first);
    }

    return {
        getCurrent: getCurrent,
        getByOffset: getByOffset
    };
}(
    require("bilby"),
    require("../neo4j/cypher")
));