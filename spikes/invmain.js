/*jslint maxlen: 120*/
(function (_, request, q, inv, pb) {
    "use strict";
    var hasError = _.identity,
        orderStream = inv.orderStream("July 1 2014"),
        getNodes = pb.asPromise(request.post, [
            "http://localhost:7474/db/data/cypher",
            {
                json: {
                    query: "start n=node({id}) match (n)<-[:REPORTS_TO*0..]-(m) return m",
                    params: {id: 328692}
                }
            }
        ], [
            _.identity,
            function (err, response) { return response.statusCode !== 200; }
        ], function () {
            return _.last(arguments);
        }),
        createPlacedByRel,
        createOrderRels;

    function getRefs(response) {
        return _.pluck(_.map(response.data, _.first), "self");
    }

    /*jslint unparam:true*/
    function notCreated(err, res, bod) {
        return res.statusCode !== 201 ? new Error(JSON.stringify(bod, null, " ")) : null;
    }

    function getLocation(err, res) {
        return res.headers.location;
    }
    /*jslint unparam:false*/

    function removeComplexData(order) {
        var newOrder = _.cloneDeep(order);
        delete newOrder.retail;
        delete newOrder.gifts;
        delete newOrder.wineclub;
        return newOrder;
    }

    function createOrder(order) {
        return pb.asPromise(
            request.post,
            ["http://localhost:7474/db/data/node", {json: removeComplexData(order)}],
            [hasError, notCreated],
            getLocation
        ).then();
    }

    function createOrders(listOfOrders) {
        return _.reduce(listOfOrders, function (acc, order) {
            return acc.concat(createOrder(order));
        }, []);
    }

    createPlacedByRel = _.curry(function (ref, url) {
        return pb.asPromise(
            request.post,
            [url + "/relationships", {json: {
                to: ref,
                type: "PLACED_BY"
            }}],
            [hasError, notCreated],
            getLocation
        );
    });

    createOrderRels = _.curry(function (ref, locations) {
        return q.all(_.map(locations, createPlacedByRel(ref)));
    });

    function attachOrders(refs) {
        var promises = _.reduce(refs, function (acc, ref) {
            var howMany = inv.rand.int(1, 6),
                orderPromises = createOrders(orderStream.take(howMany)),
                ordersPromise = q.all(orderPromises),
                refPromise = ordersPromise.then(createOrderRels(ref));

            return acc.concat(refPromise);

        }, []);
        return q.all(promises);
    }

    getNodes
        .then(getRefs)
        .then(attachOrders)
        .done();
}(
    require("lodash"),
    require("request"),
    require("q"),
    require("./inv"),
    require("./promisebuilder")
));