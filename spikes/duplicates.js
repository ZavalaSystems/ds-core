module.exports = (function (R, cypher) {
    var lis = cypher.cypherToObj("match (li:LineItem)-[:PART_OF]->(o:Order) " +
            "return li, id(li) as li_id, o, id(o) as o_id;"),
        os = cypher.cypherToObj("match (o:Order) return o, id(o) as o_id;"),
        ds = cypher.cypherToObj("match (d:Distributor) return d, id(d) as d_id;"),
        li = R.prop("li"),
        liID = R.prop("li_id"),
        o = R.prop("o"),
        oID = R.prop("o_id"),
        d = R.prop("d"),
        dID = R.prop("d_id"),
        lineItemID = R.compose(R.prop("id"), R.prop("data"), li),
        orderID = R.compose(R.prop("id"), R.prop("data"), o),
        distID = R.compose(R.prop("id"), R.prop("data"), d),
        format = R.curry(function (fmt, pair) {
            return R.join("\n", R.map(fmt, pair[1])) + "\n";
        }),
        formatLineItem = function (data) {
            return " li_id: " + liID(data) + " li: " + JSON.stringify(li(data).data) +
                " o: " + JSON.stringify(o(data).data);
        },
        formatOrder = function (data) {
            return "o_id: " + oID(data) + " o: " + JSON.stringify(o(data).data);
        },
        formatDist = function (data) {
            return "d: " + JSON.stringify(d(data).data);
        },
        groupLenGt1 = R.compose(R.gt(1), R.prop("length"), R.prop("1"));

    function main() {
        var allLineItems = lis({}),
            allOrders = os({}),
            allDistributors = ds({});

        allLineItems.then(R.groupBy(lineItemID))
            .then(R.toPairs)
            .then(R.filter(groupLenGt1))
            .then(R.map(format(formatLineItem)))
            .then(function (format) {
                console.log("Duplicate Line Items: ");
                return format;
            })
            .then(R.forEach(console.log))
            .then(R.always(allOrders))
            .then(R.groupBy(orderID))
            .then(R.toPairs)
            .then(R.filter(groupLenGt1))
            .then(R.map(format(formatOrder)))
            .then(function (format) {
                console.log("Duplicate Orders: ");
                return format;
            })
            .then(R.forEach(console.log))
            .then(R.always(allDistributors))
            .then(R.groupBy(distID))
            .then(R.toPairs)
            .then(R.filter(groupLenGt1))
            .then(R.map(format(formatDist)))
            .then(function (format) {
                console.log("Duplicate Distributors: ");
                return format;
            })
            .then(R.forEach(console.log))
            .done();
    }

    main();
}(
    require("ramda"),
    require("../lib/neo4j/cypher")
));