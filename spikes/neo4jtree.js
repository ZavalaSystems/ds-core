(function (_, req, inspect) {
    "use strict";
    function buildTree(root, db) {
        return _.merge({}, root, {
            downline: _.map(root.downline, function (item) {
                return buildTree(db.get({consultant: item}), db);
            })
        });
    }

    function Hashable(hashF, coll) {
        var self = this;
        self.coll = _.reduce(coll, function (acc, item) {
            acc[hashF(item)] = item;
            return acc;
        }, {});

        self.get = function (item) {
            return self.coll[hashF(item)];
        };
    }

    var query = "match (cons:Consultant) " +
                "optional match (cons)<-[:REPORTS_TO]-(sub) " +
                "with cons as consultant, collect(sub) as downline " +
                "optional match (consultant)<-[:PLACED_BY]-(order:Order)<-[:PART_OF]-(li:LineItem) " +
                "return consultant, downline, collect(li) as lineItems";
    req.post("http://localhost:7474/db/data/cypher", {json: {
        query: query,
        params: {}
    }}, function (err, res, body) {
        if (err) { throw err; }
        if (res.statusCode !== 200) { throw inspect(res); }
        var objs = _.reduce(body.data, function (acc, row) {
                return acc.concat(_.zipObject(body.columns, row));
            }, []),
            hashSet = new Hashable(function (x) { return x.consultant.data.rep; }, objs),
            root = hashSet.get({consultant: {data: {rep: "1"}}});

        inspect(buildTree(root, hashSet));
    });
}(
    require("lodash"),
    require("request"),
    require("eyes").inspector({maxLength: false})
));