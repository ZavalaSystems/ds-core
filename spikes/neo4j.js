/*jslint maxlen:120*/
module.exports = (function (_, bilby, request, q, pb) {
    "use strict";

    /*jslint unparam:true*/
    function notStatus(code) {
        return function (err, res, body) {
            return res.statusCode !== code ?
                    new Error(JSON.stringify(body, null, " ")) :
                    null;
        };
    }

    function getBody(err, res, body) {
        return body;
    }

    function getLocation(err, res) {
        return res.headers.location;
    }
    /*jslint unparam:false*/

    var hasError = _.identity,
        neo4j = "http://localhost:7474/db/data",
        cypherEndpoint = [neo4j, "cypher"].join("/"),
        nodeEndpoint = [neo4j, "node"].join("/"),
        e = bilby.environment()
            .property("orgQuery", "start n=node({id}) match (n)<-[:REPORTS_TO*0..]-(m) return m")
            .property("getOrganization", function (id) {
                return e.executeCypher(e.orgQuery, {id: id});
            })
            .property("executeCypher", function (query, params) {
                var options = {
                    json: {
                        query: query,
                        params: params
                    }
                };
                return pb.asPromise(
                    request.post,
                    [cypherEndpoint, options],
                    [hasError, notStatus(200)],
                    getBody
                );
            })
            .property("attachOrdersToConsultant", _.curry(function (orders, cRef) {
                return q.all(_.map(orders, e.attachOrderToConsultant(cRef)))
                    .then(_.constant(cRef));
            }))
            .property("attachOrderToConsultant", _.curry(function (cRef, order) {
                return e.createOrder(order)
                    .then(function (node) {
                        return pb.asPromise(
                            request.post,
                            [node.create_relationship, {
                                json: {to: cRef, type: "PLACED_BY"}
                            }],
                            [hasError, notStatus(201)],
                            _.identity
                        );
                    });
            }))
            .property("createOrder", function (order) {
                var orderMetaData = e.getOrderMetaData(order),
                    lineItems = e.getLineItems(order);

                return pb.asPromise(
                    request.post,
                    [nodeEndpoint, {json: orderMetaData}],
                    [hasError, notStatus(201)],
                    getLocation
                )
                    .then(e.attachLineItemsToOrder(lineItems))
                    .then(e.getNode)
                    .then(e.addLabel("Order"));
            })
            .property("getOrderMetaData", function (order) {
                return { when: order.when };
            })
            .property("getLineItems", function (order) {
                return []
                        .concat(order.retail)
                        .concat(order.gifts)
                        .concat(order.wineclub);
            })
            .property("attachLineItemsToOrder", _.curry(function (lineItems, oRef) {
                return q.all(_.map(lineItems, e.attachLineItemToOrder(oRef)))
                    .then(_.constant(oRef));
            }))
            .property("attachLineItemToOrder", _.curry(function (oRef, lineItem) {
                return e.createLineItem(lineItem)
                    .then(function (node) {
                        return pb.asPromise(
                            request.post,
                            [node.create_relationship, {
                                json: {to: oRef, type: "PART_OF"}
                            }],
                            [hasError, notStatus(201)],
                            _.identity
                        );
                    })
                    .then(_.constant(oRef));
            }))
            .property("createLineItem", function (lineItem) {
                return e.createNode(lineItem)
                    .then(e.getNode)
                    .then(e.addLabel("LineItem"));
            })
            .property("createNode", function (node) {
                return pb.asPromise(
                    request.post,
                    [nodeEndpoint, {json: node}],
                    [hasError, notStatus(201)],
                    getLocation
                );
            })
            .property("getNode", function (uri) {
                return pb.asPromise(
                    request.get,
                    [uri, {json: true}],
                    [hasError, notStatus(200)],
                    getBody
                );
            })
            .property("addLabel", _.curry(function (label, node) {
                return pb.asPromise(
                    request.post,
                    [node.labels, {json: label}],
                    [hasError, notStatus(204)],
                    _.noop
                ).then(_.constant(node));
            }));
    return e;
}(
    require("lodash"),
    require("bilby"),
    require("request"),
    require("q"),
    require("./promisebuilder")
));