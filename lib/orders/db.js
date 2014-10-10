module.exports = (function (path, fs, bilby, R, common, cypher) {
    "use strict";
    /*jslint stupid: true */
    var readFile = R.rPartial(fs.readFileSync, {encoding: "utf8"}),
        createOrder = cypher.cypherToObj(readFile(path.join(__dirname, "create-order.cql"))),
        createLineItem = cypher.cypherToObj(readFile(path.join(__dirname, "create-lineitem.cql"))),
        matchOrderForDistributor = cypher.cypherToObj(readFile(path.join(__dirname, "match-d+order.cql"))),
        matchOrderListForDistributor = cypher.cypherToObj(readFile(path.join(__dirname, "match-d+order-list.cql"))),
        matchLineItemListForDistributor = cypher.cypherToObj(
            readFile(path.join(__dirname, "match-d+lineitem-list.cql"))
        ),
        matchLineItemForDistributor = cypher.cypherToObj(readFile(path.join(__dirname, "match-d+lineitem.cql"))),
        setOrderStatus = cypher.cypherToObj(readFile(path.join(__dirname, "set-orderstatus.cql"))),
        setLineItemStatus = cypher.cypherToObj(readFile(path.join(__dirname, "set-lineitemstatus.cql"))),
        updateOrder = cypher.cypherToObj(readFile(path.join(__dirname, "update-d+order.cql"))),
        businessPeriod = common.props(["bp", "data"]),
        distributor = common.props(["d", "data"]),
        order = common.props(["o", "data"]),
        lineItem = common.props(["li", "data"]);
    /*jslint stupid: false */

    return bilby.environment()
        .property("createOrder", createOrder)
        .property("createLineItem", createLineItem)
        .property("matchOrderForDistributor", matchOrderForDistributor)
        .property("matchOrderListForDistributor", matchOrderListForDistributor)
        .property("matchLineItemListForDistributor", matchLineItemListForDistributor)
        .property("matchLineItemForDistributor", matchLineItemForDistributor)
        .property("setOrderStatus", setOrderStatus)
        .property("setLineItemStatus", setLineItemStatus)
        .property("businessPeriod", businessPeriod)
        .property("distributor", distributor)
        .property("order", order)
        .property("lineItem", lineItem);
}(
    require("path"),
    require("fs"),
    require("bilby"),
    require("ramda"),
    require("../common"),
    require("../neo4j/cypher")
));