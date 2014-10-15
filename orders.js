module.exports = (function (mach, bilby, R, request, response, uri, common, m, orders) {
    "use strict";
    var env = bilby.environment(),
        formatOrder = R.compose(orders.transformOrderOutput, orders.order),
        formatLineItem = R.compose(orders.transformLineItemOutput, orders.lineItem),
        matchOrderForDistributorQuery = R.compose(orders.matchOrderForDistributor,
            orders.transformLookupOrderInput, request.params);

    /* Updating properties returns the updated items by convention */
    function decodeSetResults(r) {
        if (r.length === 0) {
            return response.status.notFound({});
        }
        return response.status.ok({});
    }

    function createOrder(req) {
        return orders.createOrderAndItems(orders.transformOrderInput(req.params))
            .then(orders.orderLinker(uri.absoluteUri(req))(formatOrder))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.internalServerError({})));
    }

    function getOrder(req) {
        return matchOrderForDistributorQuery(req)
            .then(m.firstOption)
            .then(orders.orderLinker(uri.absoluteUri(req))(formatOrder))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.notFound({})));
    }

    function listOrders(req) {
        return orders.matchOrderListForDistributor(orders.transformLookupOrderListInput(req.params))
            .then(orders.orderMultiLinker(uri.absoluteUri(req))(formatOrder))
            .then(mach.json);
    }

    function deleteOrder(req) {
        return orders.setOrderStatus(common.merge({status: "cancelled"},
                orders.transformLookupOrderInput(request.params(req))))
            .then(decodeSetResults);
    }

    function deleteLineItem(req) {
        return orders.setLineItemStatus(common.merge({status: "cancelled"},
                orders.transformLookupLineItemInput(request.params(req))))
            .then(decodeSetResults);
    }

    function createSingleLineItem(req) {
        var input = orders.transformCreateLineItemInput(req.params);
        return orders.createLineItem(input)
            .then(m.first)
            .then(orders.lineItemLinker(uri.absoluteUri(req))(formatLineItem))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.notFound({})));
    }

    function listLineItems(req) {
        return orders.matchLineItemListForDistributor(orders.transformLookupOrderInput(req.params))
            .then(orders.lineItemMultiLinker(uri.absoluteUri(req))(formatLineItem))
            .then(mach.json);
    }

    function getLineItem(req) {
        return orders.matchLineItemForDistributor(orders.transformLookupLineItemInput(req.params))
            .then(m.firstOption)
            .then(orders.lineItemLinker(uri.absoluteUri(req))(formatLineItem))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.notFound({})));
    }

    function updateOrder(req) {
        return orders.updateOrderData(orders.transformOrderInput(req.params))
            .then(orders.orderLinker(uri.absoluteUri(req))(formatOrder))
            .then(m.map(mach.json))
            // Not found if we didn't get anything back on the update
            .then(m.getOrElse(response.status.notFound({})));
    }

    function updateLineItem(req) {
        // Requires lookuporder input due to needing distributor id etc converted
        return orders.updateLineItemData(orders.transformLookupOrderInput(orders.transformLineItemInput(req.params)))
            .then(orders.lineItemLinker(uri.absoluteUri(req))(formatLineItem))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.notFound({})));
    }

    env = env.method("createOrder", R.compose(orders.createOrderPrecondition, request.params), createOrder)
        .method("createOrder", R.alwaysTrue, R.always(response.status.badRequest({})))
        .method("listOrders", R.compose(orders.lookupOrderListPrecondition, request.params), listOrders)
        .method("listOrders", R.alwaysTrue, R.always(response.status.notFound({})))
        .method("getOrder", R.compose(orders.lookupOrderPrecondition, request.params), getOrder)
        .method("getOrder", R.alwaysTrue, R.always(response.status.notFound({})))
        // Lookup order precondition requires distributor and order ids, everything else is optional for the update
        .method("updateOrder", R.compose(orders.lookupOrderPrecondition, request.params), updateOrder)
        .method("updateOrder", R.alwaysTrue, R.always(response.status.notFound({})))
        .method("updateLineItem", R.compose(orders.lookupLineItemPrecondition, request.params), updateLineItem)
        .method("updateLineItem", R.alwaysTrue, R.always(response.status.notFound({})))
        .method("createSingleLineItem", R.compose(orders.createSingleLineItemPrecondition, request.params),
            createSingleLineItem)
        .method("createSingleLineItem", R.alwaysTrue, R.always(response.status.badRequest({})))
        .method("listItems", R.compose(orders.lookupOrderListPrecondition, request.params), listLineItems)
        .method("listItems", R.alwaysTrue, R.always(response.status.notFound({})))
        .method("getItem", R.compose(orders.lookupLineItemPrecondition, request.params), getLineItem)
        .method("getItem", R.alwaysTrue, R.always(response.status.notFound({})))
        .property("deleteOrder", deleteOrder)
        .property("deleteItem", deleteLineItem);

    return function (app) {
        app.get("/distributor/:distributorID/order", env.listOrders);
        app.post("/distributor/:distributorID/order", env.createOrder);
        app.get("/distributor/:distributorID/order/:orderID", env.getOrder);
        app.post("/distributor/:distributorID/order/:orderID", env.updateOrder);
        app.delete("/distributor/:distributorID/order/:orderID", env.deleteOrder);
        app.get("/distributor/:distributorID/order/:orderID/item", env.listItems);
        app.post("/distributor/:distributorID/order/:orderID/item", env.createSingleLineItem);
        app.get("/distributor/:distributorID/order/:orderID/item/:lineItemID", env.getItem);
        app.post("/distributor/:distributorID/order/:orderID/item/:lineItemID", env.updateLineItem);
        app.delete("/distributor/:distributorID/order/:orderID/item/:lineItemID", env.deleteItem);
    };
}(
    require("mach"),
    require("bilby"),
    require("ramda"),
    require("./lib/request"),
    require("./lib/response"),
    require("./lib/uri"),
    require("./lib/common"),
    require("./lib/monad"),
    require("./lib/orders")
));