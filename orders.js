module.exports = (function (mach, bilby, R, request, response, uri, m, orders) {
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

    env = env.method("createOrder", R.compose(orders.createOrderPrecondition, request.params), createOrder)
        .method("createOrder", R.alwaysTrue, R.always(response.status.badRequest({})))
        .property("listOrders", listOrders)
        .property("getOrder", getOrder);

    return function (app) {
        app.get("/distributor/:distributorID/order", env.listOrders);
        app.post("/distributor/:distributorID/order", env.createOrder);
        app.post("/distributor/:distributorID/order/:orderID", env.getOrder);
    };
}(
    require("mach"),
    require("bilby"),
    require("ramda"),
    require("./lib/request"),
    require("./lib/response"),
    require("./lib/uri"),
    require("./lib/monad"),
    require("./lib/orders")
));