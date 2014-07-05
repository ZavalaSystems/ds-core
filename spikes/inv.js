/*jslint stupid:true, maxlen: 120, unparam: true*/
module.exports = (function (fs, cheerio, _) {
    "use strict";
    var getSome,
        rand = {
            int: function (floor, ceil) {
                return Math.floor(rand.real(floor, ceil));
            },
            real: function (floor, ceil) {
                var range = ceil - floor;
                return Math.random() * range + floor;
            },
            date: function (start) {
                var then = start.getTime(),
                    now = new Date().getTime(),
                    scale = now - then;
                return new Date(parseInt(Math.random() * scale + then, 10));
            }
        };

    function getCatalog(file) {
        var scr = fs.readFileSync(file, {encoding: "utf-8"}),
            $ = cheerio.load(scr),
            text = function (i, x) { return $(x).text(); },
            descs = $(".ItemDesc").map(text),
            prices = _.map($(".YourPrice").map(text), function (x) {
                return Math.floor(parseFloat(x.replace("$", "")) * 100);
            }),
            expls = $(".ItemExpl").map(text),
            ids = _.map($(".ItemNo").map(text), function (x) { return _.last(x.split(" ")); }),
            catalog = _.map(_.zip(ids, descs, prices, expls), function (x) {
                return {
                    id: x[0],
                    desc: x[1],
                    price: x[2],
                    explanation: x[3].trim()
                };
            });
        return catalog;
    }

    getSome = _.curry(function (type, which) {
        return _.reduce(_.take(which, parseInt(Math.random() * 3, 10)), function (acc, x) {
            return acc.concat({
                id: x[0],
                qty: parseInt(Math.random() * 4 + 1, 10),
                type: type,
                price: x[1]
            });
        }, []);
    });

    function validCandidateOrder(c) {
        return _.reduce(c, function (acc, val) {
            return acc || !_.isEmpty(val);
        }, false);
    }

    function makeOrder(dategen) {
        var candidate = _.reduce(["retail", "gifts", "wineclub"],
            function (obj, key) {
                var getId = _.partialRight(_.pluck, "id"),
                    getPrice = _.partialRight(_.pluck, "price"),
                    pairIdToPrice = function (x) {
                        var ids = getId(x),
                            prices = getPrice(x);

                        return _.zip(ids, prices);
                    },
                    orders = _.compose(
                        getSome(key),
                        pairIdToPrice,
                        _.shuffle,
                        getCatalog,
                        function (x) { return x + ".html"; }
                    );
                obj[key] = orders(key);
                return obj;
            },
            { when: dategen() });
        return validCandidateOrder(candidate) ? candidate : makeOrder(dategen);
    }

    function OrderStream(date) {
        var self = this,
            dateProvider = _.partial(rand.date, new Date(date)),
            orderProvider = _.partial(makeOrder, dateProvider);

        _.merge(this, {
            next: orderProvider,
            take: function (x) {
                return _.reduce(_.range(x), function (acc) {
                    return acc.concat(self.next());
                }, []);
            }
        });
    }

    return {
        orderStream: function (date) { return new OrderStream(date); },
        rand: rand
    };
}(
    require("fs"),
    require("cheerio"),
    require("lodash")
));