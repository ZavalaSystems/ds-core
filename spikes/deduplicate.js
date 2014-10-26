/*jslint stupid: true */
module.exports = (function (path, fs, q, bilby, R, cypher) {
    var orders = cypher.cypherToObj("match (o:Order) return o, id(o) as o_id;"),
        deleteOrderQuery = fs.readFileSync(path.join(__dirname, "order-delete.cql"), {encoding: "utf8"}),
        deleteOrder = cypher.cypherToObj(deleteOrderQuery),
        lineItems = cypher.cypherToObj("match (li:LineItem)-[:PART_OF]->(o:Order) return li, id(li) as li_id, o"),
        deleteLineItemQuery = fs.readFileSync(path.join(__dirname, "lineitem-delete.cql"), {encoding: "utf8"}),
        deleteLineItem = cypher.cypherToObj(deleteLineItemQuery),
        order = R.prop("o"),
        orderData = R.compose(R.prop("data"), order),
        orderNodeID = R.prop("o_id"),
        orderID = R.compose(R.prop("id"), R.prop("data"), order),
        lineItem = R.prop("li"),
        lineItemData = R.compose(R.prop("data"), lineItem),
        lineItemID = R.compose(R.prop("id"), lineItemData),
        lineItemNodeID = R.prop("li_id"),
        groupLenGt1 = R.compose(R.gt(1), R.prop("length"), R.prop("1")),
        // Produce params for a query that contains id(n)={nodeID} as the predicate for selecting deletions
        mkDeleteParams = function (id) { return {nodeID: id}; },
        serializeDelete = R.curry(function (fDelTask, arr) {
            return R.reduce(function (acc, params) {
                return acc.then(function () {
                    return fDelTask(params);
                });
            }, q.when(), arr);
        });

    /* Return a strong key for line items, i.e. order id and line item id together */
    function lineItemKey(blob) {
        return lineItemID(blob) + "-" + orderID(blob)
    }

    function deduplicate(label, fID, fNodeID, fDelTask, fData, listPromise) {
        var toDelete = listPromise.then(R.groupBy(fID)) // Group by order id
            .then(R.toPairs) // Convert to pairs
            .then(R.filter(groupLenGt1)) // Filter out groups of size 1
            .then(R.map(R.prop("1"))) // Get just the list
            .then(R.map(R.tail)) // Drop the first element in each group (assumed as the canonical version)
            .then(R.flatten);
        return toDelete.then(function (x) {
                console.log("Deleting " + label);
                return x;
            })
            .then(R.map(fData))
            .then(R.map(JSON.stringify))
            .then(R.forEach(console.log))
            .then(R.always(toDelete))
            .then(R.map(fNodeID))
            .then(R.map(mkDeleteParams))
            .then(serializeDelete(fDelTask))
    }

    function main() {
        deduplicate("Duplicate Orders", orderID, orderNodeID, deleteOrder, orderData, orders({}))
            .then(function () {
                return deduplicate("Duplicate LineItems",
                    lineItemID, lineItemNodeID, deleteLineItem, lineItemData, lineItems({}));
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