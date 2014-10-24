module.exports = (function (R, bilby, cypher, orders) {
    var matchOrders = cypher.cypherToObj("match (o:Order)<-[:PART_OF]-(li:LineItem) return o, li"),
        orderData = R.compose(R.prop("data"), R.prop("o")),
        orderID = R.compose(R.prop("id"), orderData),
        lineItemData = R.compose(R.prop("data"), R.prop("li")),
        lineItemID = R.compose(R.prop("id"), lineItemData);

    function format(o) {
        var sortedFields = R.sortBy(R.prop("0"), R.toPairs(o));
        // Return only the values
        return R.join(", ", R.map(R.join(": "), sortedFields));
    }

    (function main() {
        matchOrders({})
            .then(R.groupBy(orderID))
            .then(R.toPairs)
            .then(R.map(R.prop("1"))) // Pick only the elements
            // We get the same order joined with each line item, filter this out
            .then(R.map(function (group) {
                return {
                    order: orders.transformOrderOutput(orderData(group[0])),
                    lineItems: R.map(R.compose(orders.transformLineItemOutput, lineItemData), group)
                }
            }))
            .then(R.map(function (group) {
                var stringArr = R.cons(format(group.order),
                    R.map(format, group.lineItems));
                return R.join("\n", stringArr) + "\n";
            }))
            .then(R.forEach(console.log))
            .done();
    }());
}(
    require("ramda"),
    require("bilby"),
    require("../lib/neo4j/cypher"),
    require("../lib/orders")
));