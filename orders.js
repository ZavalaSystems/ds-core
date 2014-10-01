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
            .then(m.getOrElse(response.status.notFound({})))
            .catch(response.catcher(req));
    }

    function listOrders(req) {
        return orders.matchOrderListForDistributor(orders.transformLookupOrderListInput(req.params))
            .then(orders.orderMultiLinker(uri.absoluteUri(req))(formatOrder))
            .then(mach.json)
            .catch(response.catcher(req));
    }

    function deleteOrder(req) {
        return orders.setOrderStatus(common.merge({status: "cancelled"},
                orders.transformLookupOrderInput(request.params(req))))
            .then(decodeSetResults)
            .catch(response.catcher(req));
    }

    function deleteLineItem(req) {
        return orders.setLineItemStatus(common.merge({status: "cancelled"},
                orders.transformLookupLineItemInput(request.params(req))))
            .then(decodeSetResults)
            .catch(response.catcher(req));
    }

    function listLineItems(req) {
        return orders.matchLineItemListForDistributor(orders.transformLookupOrderInput(req.params))
            .then(orders.lineItemMultiLinker(uri.absoluteUri(req))(formatLineItem))
            .then(mach.json)
            .catch(response.catcher(req));
    }

    function getLineItem(req) {
        return orders.matchLineItemForDistributor(orders.transformLookupLineItemInput(req.params))
            .then(m.firstOption)
            .then(orders.lineItemLinker(uri.absoluteUri(req))(formatLineItem))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.notFound({})))
            .catch(response.catcher(req));
    }

    function setOrderStatus(req) {
        return orders.setOrderStatus(orders.transformLookupOrderInput(req.params))
            .then(decodeSetResults)
            .catch(response.catcher(req));
    }

    function setLineItemStatus(req) {
        return orders.setLineItemStatus(orders.transformLookupLineItemInput(req.params))
            .then(decodeSetResults)
            .catch(response.catcher(req));
    }

    env = env.method("createOrder", R.compose(orders.createOrderPrecondition, request.params), createOrder)
        .method("createOrder", R.alwaysTrue, R.always(response.status.badRequest({})))
        .method("listOrders", R.compose(orders.lookupOrderListPrecondition, request.params), listOrders)
        .method("listOrders", R.alwaysTrue, R.always(response.status.notFound({})))
        .method("getOrder", R.compose(orders.lookupOrderPrecondition, request.params), getOrder)
        .method("getOrder", R.alwaysTrue, R.always(response.status.notFound({})))
        .method("listItems", R.compose(orders.lookupOrderListPrecondition, request.params), listLineItems)
        .method("listItems", R.alwaysTrue, R.always(response.status.notFound({})))
        .method("getItem", R.compose(orders.lookupLineItemPrecondition, request.params), getLineItem)
        .method("getItem", R.alwaysTrue, R.always(response.status.notFound({})))
        .method("setOrderStatus", R.compose(orders.setOrderStatusPrecondition, request.params), setOrderStatus)
        .method("setOrderStatus", R.alwaysTrue, R.always(response.status.notFound({})))
        .method("setLineItemStatus", R.compose(orders.setLineItemStatusPrecondition, request.params), setLineItemStatus)
        .method("setLineItemStatus", R.alwaysTrue, R.always(response.status.notFound({})))
        .property("deleteOrder", deleteOrder)
        .property("deleteItem", deleteLineItem);

    return function (app) {
        app.get("/distributor/:distributorID/order", env.listOrders);
        app.post("/distributor/:distributorID/order", env.createOrder);
        app.get("/distributor/:distributorID/order/:orderID", env.getOrder);
        app.post("/distributor/:distributorID/order/:orderID/status", env.setOrderStatus);
        app.delete("/distributor/:distributorID/order/:orderID", env.deleteOrder);
        app.get("/distributor/:distributorID/order/:orderID/item", env.listItems);
        app.get("/distributor/:distributorID/order/:orderID/item/:lineItemID", env.getItem);
        app.post("/distributor/:distributorID/order/:orderID/item/:lineItemID/status", env.setLineItemStatus);
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