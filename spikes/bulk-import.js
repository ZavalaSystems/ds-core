(function(path, fs, q, _, cypher) {
    "use strict";
    /*
    function mkPicker(props) {
        return _.partialRight(_.pick, props);
    }
    */

    var slurpJsonSync = _.compose(JSON.parse, fs.readFileSync);
    // var repProps = ['rep-id', 'url', 'first-name', 'mi', 'last-name', 'sponsor-num'];
    // var mapPickRepProps = _.partialRight(_.map, mkPicker(repProps));
    var slurpReps = slurpJsonSync;

    //var orderProps = ['order-date', 'date-created', 'rep-num', 'order-num'];
    //var mapPickOrderProps = _.partialRight(_.map, mkPicker(orderProps));
    var slurpOrders = slurpJsonSync;

    //var lineItemProps = ['id', 'order-num', 'price', 'quantity', 'status'];
    //var mapPickLineItemProps = _.partialRight(_.map, mkPicker(lineItemProps));
    var slurpLineItems = slurpJsonSync;

    function main(repsFile, ordersFile, lineItemsFile) {
        console.log("deleting database");
        cypher.cypher("match (n) optional match (n)-[r]->() delete r, n", {})
            .then(function() {
                // Create the dummy business period
                var now = new Date();
                var year = now.getFullYear();
                var month = now.getMonth() + 1; //
                return cypher.cypherToObj('create (bp:BusinessPeriod {year: {year}, month: {month}}) return bp', {year: year, month: month});
            })
            .then(function(bp) {
                console.log('importing consultants')
                var reps = slurpReps(repsFile);
                // We can assume only 1 bp at this point
                var creations = _.map(reps, function(rep) {
                    return cypher.cypherToObj('create (c:Consultant {firstname: {firstname}, lastname: {lastname}, rep: {rep}})\
                        -[:PERFORMED]->(cp:ConsultantPerformance)', {firstname: rep['first-name'], lastname: rep['last-name'], rep: rep['rep-id']});
                });
                return q.all(creations)
                    .then(function(results) {
                        return {
                            consultants: reps,
                            bp: bp
                        }
                    });
            })
            .then(function(results) {
                console.log('linking geneaology');
                // Connect every consultant to their sponsor
                return q.all(_.map(results.consultants, function(rep) {
                    if (!rep['sponsor-num']) { // We have found the toplevel metanode
                        // TODO: Consider how to do this with the relationship api
                        return cypher.cypherToObj('match (:Consultant {rep: {rep}})-[:PERFORMED]->(meta:ConsultantPerformance), \
                            (bp:BusinessPeriod) \
                            create (bp)-[r:DURING]->(meta) return r', {rep: rep['rep-id']});
                    } else {
                        return cypher.cypherToObj('match (:Consultant {rep: {child}})-[:PERFORMED]->(down:ConsultantPerformance), \
                            (:Consultant {rep: {parent}})-[:PERFORMED]->(up:ConsultantPerformance) \
                            create (down)-[r:REPORTS_TO]->(up) return r', {child: rep['rep-id'], parent: rep['sponsor-num']});
                    }
                }))
                .then(function(results) {
                    return {
                        consultants: results.consultant,
                        bp: results.bp
                    };    
                });
            })
            .then(function(results) {
                console.log('importing orders');
                var orders = slurpOrders(ordersFile);
                return q.all(_.map(orders, function(order) {
                    return cypher.cypherToObj('match (:Consultant {rep: {rep}})-[:PERFORMED]->(cp:ConsultantPerformance) \
                        create (o:Order {id: {orderid}, when: {when}})-[r:PLACED_BY]->(cp) return o, r',
                        {rep: order['rep-num'], orderid: order['order-num'], when: new Date(order['date-created']).toISOString()});
                }))
            })
            .then(function(results) {
                console.log('importing line items');
                var lineItems = slurpLineItems(lineItemsFile);
                return q.all(_.map(lineItems, function(lineItem) {
                    return cypher.cypherToObj('match (o:Order {id: {orderid}}) \
                        create (li:LineItem {id: {lineid}, price: {price}, qty: {quantity}, status: {status}, product: {product}})-[r:PART_OF]->(o) \
                        return r, li',
                        {   
                            orderid: lineItem['order-num'], 
                            lineid: lineItem['id'],
                            price: parseFloat(lineItem['price']) * 100,
                            quantity: lineItem['quantity'], 
                            status: lineItem['status'],
                            product: lineItem['product-num']
                        });
                }));
            })
            .done(function(s) {
                console.log('done');
                process.exit(0);
            }, function(err) {
                console.error(err);
                process.exit(1);
            });
    }
    main(process.argv[2], process.argv[3], process.argv[4]);
})(require('path'),
   require('fs'),
   require('q'),
   require('lodash'),
   require('../lib/neo4j/cypher'));