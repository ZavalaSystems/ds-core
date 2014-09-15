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
                    return cypher.cypherToObj('create (c:Consultant {firstname: {firstname}, lastname: {lastname}, rep: {rep}, rank: {rank}, joindate: {joindate}})\
                        -[:PERFORMED]->(cp:ConsultantPerformance)',
                        {
                            firstname: rep['first-name'],
                            lastname: rep['last-name'], 
                            rep: rep['rep-id'], 
                            rank: rep['rank'], 
                            joindate: new Date(rep['joindate']).toISOString()
                        });
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
                        return cypher.cypherToObj('match (c:Consultant {rep: {child}})-[:PERFORMED]->(downline:ConsultantPerformance), \
                            (p:Consultant {rep: {parent}})-[:PERFORMED]->(upline:ConsultantPerformance) \
                            create (downline)-[r:REPORTS_TO]->(upline), (c)-[e:ENROLLED_BY]->(p) return r, e', {child: rep['rep-id'], parent: rep['sponsor-num']});
                    }
                }))
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