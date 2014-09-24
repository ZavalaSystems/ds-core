module.exports = (function (mach, R, request, response, uri, m, orders) {
    var env = null;

    function createOrder(req) {
        return orders.createOrderAndItems(request.params(req))
            .then(orders.orderLinker(uri.absoluteUri(req))(orders.order))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.internalServerError({})))
            .catch(response.catcher);
    }

    function getOrder(req) {
        return orders.matchOrderForDistributor(request.params(req))
            .then(orders.orderLinker(uri.absoluteUri(req))(orders.order))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.notFound({})))
            .catch(response.catcher);
    }

    function listOrders(req) {

    }

    env = env.method("createOrder", R.compose(orders.createOrderPrecondition, request.params), createOrder)
        .method("createOrder", R.alwaysTrue, R.always(response.status.badRequest({})))
        .property("llistOrders", listOrders)
        .property("getOrder", getOrder);

    return function (app) {
        app.get("/distributor/:distributorID/order", env.listOrders);
        app.post("/distributor/:distributorID/order", env.createOrder);
        app.post("/distributor/:distributorID/order/:orderID", env.getOrder);
    };
}(
    require("mach"),
    require("ramda"),
    require("./lib/request"),
    require("./lib/response"),
    require("./lib/uri"),
    require("./lib/monad"),
    require("./lib/orders")
));