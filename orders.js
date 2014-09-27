module.exports = (function (mach, bilby, R, request, response, uri, common, m, orders) {
    "use strict";
    var env = bilby.environment(),
        formatOrder = R.compose(orders.transformOrderOutput, orders.order),
        createOrderQuery = R.compose(orders.createOrderAndItems, orders.transformOrderInput, request.params),
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
        return createOrderQuery(req)
            .then(orders.orderLinker(uri.absoluteUri(req))(formatOrder))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.internalServerError({})))
            .catch(response.catcher);
    }

    function getOrder(req) {
        return matchOrderForDistributorQuery(req)
            .then(m.firstOption)
            .then(orders.orderLinker(uri.absoluteUri(req))(formatOrder))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.notFound({})))
            .catch(response.catcher);
    }

    function listOrders(req) {
        return orders.matchOrderListForDistributor(orders.transformLookupOrderListInput(req.params))
            .then(orders.orderMultiLinker(uri.absoluteUri(req))(formatOrder))
            .then(mach.json)
            .catch(response.catcher);
    }

    function deleteOrder(req) {
        return orders.setOrderStatus(common.merge({status: "cancelled"},
                orders.transformLookupOrderInput(request.params(req))))
            .then(decodeSetResults)
            .catch(response.catcher);
    }

    function deleteLineItem(req) {
        return orders.setLineItemStatus(common.merge({status: "cancelled"},
                orders.transformLookupLineItemInput(request.params(req))))
            .then(decodeSetResults)
            .catch(response.catcher);
    }

    env = env.method("createOrder", R.compose(orders.createOrderPrecondition, request.params), createOrder)
        .method("createOrder", R.alwaysTrue, R.always(response.status.badRequest({})))
        .method("listOrders", R.compose(orders.lookupOrderListPrecondition, request.params), listOrders)
        .method("listOrders", R.alwaysTrue, R.always(response.status.badRequest({})))
        .property("getOrder", getOrder)
        .property("deleteOrder", deleteOrder)
        .property("deleteItem", deleteLineItem);

    return function (app) {
        app.get("/distributor/:distributorID/order", env.listOrders);
        app.post("/distributor/:distributorID/order", env.createOrder);
        app.get("/distributor/:distributorID/order/:orderID", env.getOrder);
        app.delete("/distributor/:distributorID/order/:orderID", env.deleteOrder);
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