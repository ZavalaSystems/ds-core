module.exports = (function (path, fs, bilby, R, q, common, m, cypher) {
    "use strict";
    /*jslint stupid: true */
    var readFile = R.rPartial(fs.readFileSync, {encoding: "utf8"}),
        createOrder = cypher.cypherToObj(readFile(path.join(__dirname, "create-order.cql"))),
        createLineItem = cypher.cypherToObj(readFile(path.join(__dirname, "create-lineitem.cql"))),
        matchOrderForDistributor = cypher.cypherToObj(readFile(path.join(__dirname, "match-d+order.cql"))),
        matchOrderListForDistributor = cypher.cypherToObj(readFile(path.join(__dirname, "match-d+order-list.cql"))),
        setOrderStatus = cypher.cypherToObj(readFile(path.join(__dirname, "set-orderstatus.cql"))),
        setLineItemStatus = cypher.cypherToObj(readFile(path.join(__dirname, "set-lineitemstatus.cql"))),
        pickOrderData = R.pick(["orderID", "orderStatus", "orderDate", "distributorID"]),
        distributor = common.props(["d", "data"]),
        order = common.props(["o", "data"]),
        lineItem = common.props(["li", "data"]);
    /*jslint stupid: false */

    function createOrderAndItems(input) {
        var orderData = pickOrderData(input);
        return createOrder(orderData)
            .then(function (orderResult) {
                if (orderResult.length > 0) {
                    var lineItemParams = R.map(common.merge({orderID: input.orderID}), input.lineItems);
                    return q.all(R.map(createLineItem, lineItemParams))
                        .then(R.always(q.when(m.firstOption(orderResult))));
                }
                return bilby.none;
            });
    }

    return bilby.environment()
        .property("createOrderAndItems", createOrderAndItems)
        .property("matchOrderForDistributor", matchOrderForDistributor)
        .property("matchOrderListForDistributor", matchOrderListForDistributor)
        .property("setOrderStatus", setOrderStatus)
        .property("setLineItemStatus", setLineItemStatus)
        .property("distributor", distributor)
        .property("order", order)
        .property("lineItem", lineItem);
}(
    require("path"),
    require("fs"),
    require("bilby"),
    require("ramda"),
    require("q"),
    require("../common"),
    require("../monad"),
    require("../neo4j/cypher")
));