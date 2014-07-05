(function (_, q, inv, neo4j) {
    "use strict";
    var smallRoot = 328692,
        largeRoot = 328685,
        orderStream = inv.orderStream("July 1 2014");

    function getRefs(response) {
        return _.pluck(_.map(response.data, _.first), "self");
    }

    function tap(x) {
        console.log(x);
        return x;
    }

    function randomOrders() {
        return orderStream.take(inv.rand.int(1, 6));
    }

    function makeOrdersForRef(ref) {
        var orders = randomOrders();
        return neo4j.attachOrdersToConsultant(orders, ref);
    }

    neo4j.getOrganization(smallRoot)
        .then(getRefs)
        .then(_.partialRight(_.map, makeOrdersForRef))
        .then(q.all)
        .done();
}(
    require("lodash"),
    require("q"),
    require("./inv"),
    require("./neo4j")
));




//Smaller: 328692
//Larger: 328685