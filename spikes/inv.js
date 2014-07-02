/*jslint stupid:true, maxlen: 120, unparam: true*/
(function (fs, cheerio, _) {
    "use strict";

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

    function getSome(which) {
        return _.reduce(_.take(which, parseInt(Math.random() * 3, 10)), function (acc, x) {
            return acc.concat({
                id: x,
                qty: parseInt(Math.random() * 4 + 1, 10)
            });
        }, []);
    }

    var rand = {
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
    },
        order = _.reduce(["retail", "gifts", "wineclub"],
            function (obj, key) {
                var getId = _.partialRight(_.pluck, "id"),
                    orders = _.compose(
                        getSome,
                        getId,
                        _.shuffle,
                        getCatalog,
                        function (x) { return x + ".html"; }
                    );
                obj[key] = orders(key);
                return obj;
            }, {});
    order.when = rand.date(new Date("Jan 01 2010"));
    console.log(order);
}(
    require("fs"),
    require("cheerio"),
    require("lodash")
));