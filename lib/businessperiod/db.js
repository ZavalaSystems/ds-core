module.exports = (function (bilby, cypher) {
    "use strict";
    var cypherCurrent = "match (current:BusinessPeriod) " +
                            "optional match (prev:BusinessPeriod)-[:PRECEDES]->(current) " +
                            "where not (current)-[:PRECEDES]->() " +
                            "return current, id(current), prev, id(prev);",
        cypherByOffset = "match (current:BusinessPeriod) " +
                            "optional match (prev:BusinessPeriod)-[:PRECEDES]->(current) " +
                            "-[:PRECEDES]->(next:BusinessPeriod) " +
                            "where current.start <= {offset} and (current.end = null || current.end > {offset}) " +
                            "return current, id(current), prev, id(prev), next, id(next)",
        cypherById = "start current=node({id}) match (current:BusinessPeriod) " +
                        "optional match (prev:BusinessPeriod)-[:PRECEDES]->(current) " +
                        "-[:PRECEDES]->(next:BusinessPeriod) " +
                        "return current, id(current), prev, id(prev), next, id(next)";

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

    function getByDate(date) {
        return cypher.cypherToObj(cypherByOffset, {offset: date.getTime()})
            .then(first);
    }

    function getById(id) {
        return cypher.cypherToObj(cypherById, {id: id})
            .then(first);
    }

    return bilby.environment()
        .property("getCurrent", getCurrent)
        .property("getByDate", getByDate)
        .property("getById", getById)
        .property("currentLens", bilby.objectLens("current"))
        .property("currentIdLens", bilby.objectLens("id(current)"))
        .property("prevLens", bilby.objectLens("prev"))
        .property("prevIdLens", bilby.objectLens("id(prev)"))
        .property("nextLens", bilby.objectLens("next"))
        .property("nextIdLens", bilby.objectLens("id(next)"));
}(
    require("bilby"),
    require("../neo4j/cypher")
));