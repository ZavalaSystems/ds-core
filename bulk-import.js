(function (fs, q, R, cypher) {
    "use strict";
    /*jslint stupid: true*/
    var slurpJsonSync = R.compose(JSON.parse, fs.readFileSync),
        isActive = function (x) {
            return x["rep-id"] !== "5" && x.rank !== "Cancelled";
        },
        slurpActiveReps = R.compose(R.filter(isActive), slurpJsonSync),
        addDistributor = function (d) {
            return cypher.cypherToObj("create (d:Distributor {firstName: {firstName}, " +
                    "lastName: {lastName}, id: {id}, rank: {rank}, enrollDate: {enrollDate}})",
                {
                    firstName: d["first-name"],
                    lastName: d["last-name"],
                    id: d["rep-id"], // not parseInt'ed intentionally
                    rank: d.rank,
                    enrollDate: Date.parse(d.joindate)
                });
        },
        addSponsor = function (d) {
            return cypher.cypherToObj("match (child:Distributor), (parent:Distributor) " +
                "where child.id = {child} and parent.id = {parent} " +
                "create (parent)-[s:SPONSORS]->(child), (parent)-[e:ENROLLED]->(child) " +
                "return s, e",
                {
                    child: d["rep-id"],
                    parent: d["upline-num"]
                });
        },
        addOrder = function (o) {
            return cypher.cypherToObj("match (bp:BusinessPeriod), (d:Distributor) " +
                "where d.id = {distributor} " +
                "create (bp)<-[during:DURING]-(o:Order {id: {id}, date: {date}, status: {status}}) " +
                "<-[dist:DISTRIBUTES]-(d) " +
                "return during, o, dist",
                {
                    distributor: o["rep-num"],
                    id: o["order-num"],
                    date: Date.parse(o["order-date"]),
                    status: o.status
                });
        },
        addBusinessPeriod = function (start) {
            return cypher.cypherToObj("create (bp:BusinessPeriod {start: {start}}) " +
                "return bp",
                {
                    start: start
                });
        },
        addLineItem = function (li) {
            return cypher.cypherToObj("match (o:Order) where o.id = {order} " +
                "create (li:LineItem {id: {id}, sku: {sku}, price: {price}, volume: {volume}, status: {status}}) " +
                "-[r:PART_OF]->(o) " +
                "return li", {
                    order: li["order-num"],
                    id: li.id,
                    sku: li["product-num"],
                    price: Math.floor(parseFloat(li.price, 10) * 100),
                    volume: parseFloat(li.volume),
                    status: li.status
                });
        };

    function main(repsFile, ordersFile, lineItemsFile) {
        return cypher.cypherToObj("match (n) optional match (n)-[r]->() delete r, n", {})
            .then(function () {
                /* Create reps */
                var reps = slurpActiveReps(repsFile);
                return q.all(R.map(addDistributor, reps))
                    .then(R.always(reps));
            })
            .then(function (reps) {
                /* Link genealogy */
                return q.all(R.map(addSponsor, reps));
            })
            .then(function () {
                var orders = slurpJsonSync(ordersFile);
                return q.when(orders);
            })
            .then(function (orders) {
                // Find the oldest and the newest
                var orderEpochOffset = R.compose(Date.parse, R.prop("date-created")),
                    oldest = R.min(R.map(orderEpochOffset, orders));
                return addBusinessPeriod(oldest)
                    .then(R.always(orders));
            })
            .then(function (orders) {
                return q.all(R.map(addOrder, orders));
            })
            .then(function () {
                var lineItems = slurpJsonSync(lineItemsFile);
                return q.when(lineItems);
            })
            .then(function (lineItems) {
                return q.all(R.map(addLineItem, lineItems));
            })
            .then(function () {
                /* Construct a new business period that is current */
                return cypher.cypherToObj("match (bp:BusinessPeriod) " +
                    "set bp.end = {now} " +
                    "create (cur:BusinessPeriod {start: {now}})<-[:PRECEDES]-(bp) " +
                    "return bp, cur", {now: Date.now()});
            })
            .done(function () { process.exit(0); },
                function (err) {
                    console.error(err);
                    process.exit(1);
                });
    }
    main(process.argv[2], process.argv[3], process.argv[4]);
}(
    require("fs"),
    require("q"),
    require("ramda"),
    require("./lib/neo4j/cypher")
));