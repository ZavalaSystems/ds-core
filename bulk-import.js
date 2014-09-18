(function (fs, q, _, R, cypher) {
    "use strict";
    /*jslint stupid: true*/
    var slurpJsonSync = _.compose(JSON.parse, fs.readFileSync),
        inactiveRepNum = "5";

    function main(repsFile) {
        cypher.cypher("match (n) optional match (n)-[r]->() delete r, n", {})
            .then(function () {
                // Create the the first business period
                return cypher.cypherToObj("create (bp:BusinessPeriod {start: {start}, end: null}) return bp",
                    {start: Date.now()}
                    );
            })
            .then(function (bp) {
                var reps = slurpJsonSync(repsFile),
                    activeReps = R.filter(function (x) {
                        /* We only want reps that aren't on the inactive tree */
                        return x["rep-id"] !== inactiveRepNum && x.rank !== "Cancelled";
                    }, reps),
                // We can assume only 1 bp at this point
                    creations = R.map(function (rep) {
                        return cypher.cypherToObj("create (c:Consultant {firstname: {firstname}, " +
                                "lastname: {lastname}, " +
                                "rep: {rep}, rank: {rank}, joindate: {joindate}})" +
                                "-[:PERFORMED]->(cp:ConsultantPerformance)",
                            {
                                firstname: rep["first-name"],
                                lastname: rep["last-name"],
                                rep: rep["rep-id"],
                                rank: rep.rank,
                                joindate: new Date(rep.joindate).toISOString()
                            });
                    }, activeReps);
                return q.all(creations)
                    .then(function () {
                        return {
                            consultants: reps,
                            bp: bp
                        };
                    });
            })
            .then(function (results) {
                // Connect every consultant to their sponsor
                return q.all(_.map(results.consultants, function (rep) {
                    if (!rep["upline-num"]) { // We have found the toplevel metanode
                        /* Consider how to do this with the relationship api */
                        return cypher.cypherToObj(
                            "match (:Consultant {rep: {rep}})-[:PERFORMED]->(meta:ConsultantPerformance), " +
                                "(bp:BusinessPeriod) " +
                                "create (bp)<-[r:DURING]-(meta) return r",
                            {rep: rep["rep-id"]}
                        );
                    }
                    return cypher.cypherToObj(
                        "match (c:Consultant)-[:PERFORMED]->(downline:ConsultantPerformance), " +
                            "(p:Consultant)-[:PERFORMED]->(upline:ConsultantPerformance) " +
                            "where c.rep = {child} and p.rep = {parent} " +
                            "create (downline)-[r:REPORTS_TO]->(upline), (c)-[e:ENROLLED_BY]->(p) return r, e",
                        {child: rep["rep-id"], parent: rep["upline-num"]}
                    );
                }));
            })
            .done(function () {
                console.log("done");
                process.exit(0);
            }, function (err) {
                console.error(err);
                process.exit(1);
            });
    }
    main(process.argv[2], process.argv[3], process.argv[4]);
}(
    require("fs"),
    require("q"),
    require("lodash"),
    require("ramda"),
    require("./lib/neo4j/cypher")
));