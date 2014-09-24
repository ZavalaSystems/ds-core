module.exports = (function (mach, bilby, R, request, response, uri, common, m, orders) {
    "use strict";
    var env = bilby.environment(),
        formatOrder = R.compose(orders.transformOffsetToDate, orders.order),
        createOrderQuery = R.compose(orders.createOrderAndItems, orders.transformOrderDateToOffset, request.params),
        matchOrderForDistributorQuery = R.compose(orders.matchOrderForDistributor, request.params);

    function createOrder(req) {
        return createOrderQuery(req)
            .then(orders.orderLinker(uri.absoluteUri(req))(formatOrder))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.internalServerError({})))
            .catch(response.catcher);
    }

    function getOrder(req) {
        return matchOrderForDistributorQuery(req)
            .then(orders.orderLinker(uri.absoluteUri(req))(formatOrder))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.notFound({})))
            .catch(response.catcher);
    }

    function listOrders() {
        return 500;
    }

    function deleteOrder(req) {
        return orders.setOrderStatus(common.merge({status: "cancelld"}, request.params(req)))
            .then(R.always("OK"))
            .catch(response.catcher);
    }

    function deleteLineItem(req) {
        return orders.setLineItemStatus(common.merge({status: "cancelled"}, request.params(req)))
            .then(R.always("OK"))
            .catch(response.catcher);
    }

    env = env.method("createOrder", R.compose(orders.createOrderPrecondition, request.params), createOrder)
        .method("createOrder", R.alwaysTrue, R.always(response.status.badRequest({})))
        .property("listOrders", listOrders)
        .property("getOrder", getOrder)
        .property("deleteOrder", deleteOrder)
        .property("deleteItem", deleteLineItem);

    return function (app) {
        app.get("/distributor/:distributorID/order", env.listOrders);
        app.post("/distributor/:distributorID/order", env.createOrder);
        app.post("/distributor/:distributorID/order/:orderID", env.getOrder);
        app.delete("/distributor/:distributorID/order/:orderID", env.deleteOrder);
        app.delete("/distributor/:distributorID/order/:orderID/item/:itemID", env.deleteItem);
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