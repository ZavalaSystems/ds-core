(function (_, req, inspect) {
    "use strict";
    function tap(x, f) {
        console.log((f || _.identity)(x));
        return x;
    }
    function buildTree(root, db) {
        return _.merge({}, root, {
            downline: _.map(root.downline, function (item) {
                return buildTree(db.get({consultant: item}), db);
            })
        });
    }

    function putsItem(name) {
        var interp = /\{\{([\s\S]+?)\}\}/g;
        return _.template("{{name}}: ${ {{name}} }\n", {name: name}, {interpolate: interp});
    }

    function puts(tree, tab) {
        var tpl = _.template(tab + "name: ${consultant.data.firstname} ${consultant.data.lastname}\n" +
                tab + putsItem("consultant.data.rep") +
                tab + putsItem("retail") +
                tab + putsItem("wineclub") +
                tab + putsItem("gifts") +
                tab + putsItem("pcv") +
                tab + putsItem("pbv") +
                tab + putsItem("tbv") +
                tab + putsItem("dbv1") +
                tab + putsItem("dbv2") +
                tab + putsItem("dbv3") +
                tab + putsItem("qualified") +
                tab + putsItem("qualSubs") +
                tab + putsItem("teamVolume") +
                tab + putsItem("orgVolume") +
                tab + putsItem("qualDirs") +
                tab + putsItem("rank") +
                tab + putsItem("commissions"));
        console.log(tpl(tree));
        _.forEach(tree.downline, function (x) { return puts(x, tab + "\t"); });
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

    function isDirectorOrHigher(cons) {
        return _.contains(cons.rank, "Director");
    }

    function isNotDirectorOrHigher(cons) {
        return !isDirectorOrHigher(cons);
    }

    function getTeam(classCons) {
        return _(classCons.downline)
            .filter({qualified: true})
            .filter(isNotDirectorOrHigher)
            .value();
    }

    function getTeamVolume(classCons) {
        return classCons.pcv + _.reduce(getTeam(classCons), function (acc, sub) {
            return acc + getTeamVolume(sub);
        }, 0);
    }

    function getOrgVolume(cons) {
        return cons.pcv + _.reduce(cons.downline, function (acc, sub) {
            return acc + getOrgVolume(sub);
        }, 0);
    }

    function classify(cons) {
        var ranks = [
                ["Diamond Director", [75000, 400000, 4, 4, 5000000]],
                ["Crystal Director", [75000, 400000, 4, 2, 2000000]],
                ["Senior Director", [50000, 400000, 4, 1, 1000000]],
                ["Director", [50000, 400000, 4, 0, 0]],
                ["Senior Ambassador", [25000, 100000, 2, 0, 0]],
                ["Associate Ambassador", [25000, 50000, 1, 0, 0]],
                ["Ambassador", [0, 0, 0, 0, 0]]
            ],
            withClassyChildren = _.merge({}, cons, {
                downline: _.map(cons.downline, classify)
            }),
            teamVolume = getTeamVolume(withClassyChildren),
            qualSubs = _.filter(getTeam(withClassyChildren), {qualified: true}).length,
            qualDirs = _.filter(withClassyChildren.downline, isDirectorOrHigher).length,
            orgVolume = getOrgVolume(withClassyChildren);
        return _.merge({}, withClassyChildren, {
            teamVolume: teamVolume,
            qualSubs: qualSubs,
            qualDirs: qualDirs,
            orgVolume: orgVolume,
            rank: _.find(ranks, function (candidate) {
                var cRank = candidate[1];
                return cons.pcv >= cRank[0] &&
                       teamVolume >= cRank[1] &&
                       qualSubs >= cRank[2] &&
                       qualDirs >= cRank[3] &&
                       orgVolume >= cRank[4];
            })[0]
        });
    }

    function calculatePCV(obj) {
        function add(a, b) { return a + b; }
        var sum = _.partialRight(_.reduce, add, 0),
            itemsThatAre = _.partial(_.filter, obj.lineItems),
            lineItemSub = _.partialRight(_.map, function (x) { return x.data.price * x.data.qty; }),
            totalFor = _.compose(sum, lineItemSub, itemsThatAre),
            retail = totalFor({data: {type: "retail"}}),
            wineclub = totalFor({data: {type: "wineclub"}}),
            gifts = totalFor({data: {type: "gifts"}}),
            pcv = retail + Math.floor(0.8 * wineclub) + Math.floor(0.5 * gifts);

        return _.merge({}, obj, {
            retail: retail,
            wineclub: wineclub,
            gifts: gifts,
            pcv: pcv,
            qualified: pcv > 25000
        });
    }

    function getPBV(classCons) {
        return Math.floor(0.8 * (classCons.retail + classCons.wineclub)) + Math.floor(0.5 * classCons.gifts);
    }

    function getTBV(classCons) {
        return _.reduce(getTeam(classCons), function (acc, sub) {
            return acc + getTBV(sub);
        }, classCons.pbv);
    }

    function getDBVSearch(classCons, depth, horizon) {
        var nextStep = _.partialRight(getDBVSearch, depth - 1, _.filter(classCons.downline, isDirectorOrHigher));
        return !depth ? horizon : _.reduce(_.map(horizon, nextStep), function (acc, list) {
            return acc.concat(list);
        }, []);
    }

    function getDBV(classCons, depth) {
        return _.reduce(getDBVSearch(classCons, depth, [classCons]), function (acc, dir) {
            return acc + dir.pbv;
        }, 0);
    }

    function calcBV(classCons) {
        var withPBV = _.merge({}, classCons, {
                pbv: getPBV(classCons)
            }),
            withBVChildren = _.merge({}, withPBV, {
                downline: _.map(classCons.downline, calcBV)
            }),
            withTBV = _.merge({}, withBVChildren, {
                tbv: getTBV(withBVChildren),
                dbv1: getDBV(withBVChildren, 1),
                dbv2: getDBV(withBVChildren, 2),
                dbv3: getDBV(withBVChildren, 3)
            });
        return withTBV;
    }

    function baseCommission(cons) {
        return cons.qualified ? Math.floor(0.2 * cons.pcv) : 0;
    }

    function firstLevelBv(cons) {
        return _.reduce(_.map(cons.downline, "pbv"), function (a, b) { return a + b; }, 0);
    }

    function commissions(cons, salesCom, lev1Com, teamCom, gen1Com, gen2Com, gen3Com) {
        return baseCommission(cons) +
            Math.floor(salesCom * cons.pbv) +
            Math.floor(lev1Com * firstLevelBv(cons)) +
            Math.floor(teamCom * cons.tbv) +
            Math.floor(gen1Com * cons.dbv1) +
            Math.floor(gen2Com * cons.dbv2) +
            Math.floor(gen3Com * cons.dbv3);
    }

    function calculateCommissions(classCons) {
        var commissionRates = {
                Ambassador: [0, 0, 0, 0, 0, 0],
                "Associate Ambassador": [0, 0.02, 0, 0, 0, 0],
                "Senior Ambassador": [0, 0.03, 0, 0, 0, 0],
                Director: [0.05, 0, 0.05, 0.03, 0, 0],
                "Senior Director": [0.06, 0, 0.05, 0.06, 0.03, 0],
                "Crystal Director": [0.07, 0, 0.05, 0.06, 0.04, 0],
                "Diamond Director": [0.08, 0, 0.05, 0.06, 0.04, 0.02]
            };
        return commissions.apply(null, [classCons].concat(commissionRates[classCons.rank]));
    }

    function asReadableMoney(x) { return "$" + (x / 100).toFixed(2); }

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
        var createObj = _.partial(_.zipObject, body.columns),
            objs = _.reduce(body.data, function (acc, row) {
                return acc.concat(_.compose(calculatePCV, createObj)(row));
            }, []),
            hashSet = new Hashable(function (x) { return x.consultant.data.rep; }, objs),
            root = hashSet.get({consultant: {data: {rep: "1"}}}),
            tree = _.compose(calcBV, classify)(buildTree(root, hashSet)),
            withCommissions = (function calcComms(tree) {
                return _.merge({}, tree, {
                    commissions: calculateCommissions(tree),
                    downline: _.map(tree.downline, calcComms)
                });
            }(tree)),
            sales = tree.orgVolume,
            totalCommissions = (function grossCommissions(tree) {
                return _.reduce(_.map(tree.downline, grossCommissions), function (a, b) {
                    return a + b;
                }, tree.commissions);
            }(withCommissions)),
            netSales = sales - totalCommissions;

        puts(withCommissions, "\t");
        console.log("Sales: " + asReadableMoney(sales));
        console.log("Commissions: " + asReadableMoney(totalCommissions));
        console.log("Net Sales: " + asReadableMoney(netSales));
    });
}(
    require("lodash"),
    require("request"),
    require("eyes").inspector({maxLength: false})
));