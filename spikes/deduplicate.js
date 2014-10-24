/*jslint stupid: true */
module.exports = (function (path, fs, q, bilby, R, cypher) {
    var orders = cypher.cypherToObj("match (o:Order) return o, id(o) as o_id;"),
        deleteOrderQuery = fs.readFileSync(path.join(__dirname, "order-delete.cql"), {encoding: "utf8"}),
        deleteOrder = cypher.cypherToObj(deleteOrderQuery),
        order = R.prop("o"),
        orderData = R.compose(R.prop("data"), order),
        orderNodeID = R.prop("o_id"),
        orderID = R.compose(R.prop("id"), R.prop("data"), order),
        groupLenGt1 = R.compose(R.gt(1), R.prop("length"), R.prop("1")),
        mkDeleteParams = function (id) { return {orderNodeID: id}; },
        serializeDelete = function (arr) {
            return R.reduce(function (acc, params) {
                return acc.then(function () {
                    return deleteOrder(params);
                });
            }, q.when(), arr);
        };

    function main() {
        var dropList = orders({})
            .then(R.groupBy(orderID)) // Group by order id
            .then(R.toPairs) // Convert to pairs
            .then(R.filter(groupLenGt1)) // Filter out groups of size 1
            .then(R.map(R.prop("1"))) // Get just the list
            .then(R.map(R.tail)) // Drop the first element in each group (assumed as the canonical version)
            .then(R.flatten);
        // Log the pending drops
        console.log("Dropping");
        dropList.then(R.map(orderData))
            .then(R.map(JSON.stringify))
            .then(R.forEach(console.log))
            .then(R.always(dropList))
            .then(R.map(orderNodeID)) // Get the neo4j internal node id for ever order to drop
            .then(R.map(mkDeleteParams))
            .then(serializeDelete)
            .catch(function (err) {
                console.log(err);
            })
            .done();
    }

    main();
}(
    require("path"),
    require("fs"),
    require("q"),
    require("bilby"),
    require("ramda"),
    require("../lib/neo4j/cypher")
));