var fs = require("fs"),
    q = require("q"),
    _ = require("lodash");

(function () {
    "use strict";

    function crossgenerator(coll) {
        var iters = 0,
            rowiter = coll.length,
            maxiter = coll.length * coll.length;

        return {
            next: function () {
                var row = parseInt(iters / rowiter, 10),
                    col = iters % rowiter,
                    yld = iters >= maxiter ? null : coll[row] + " " + coll[col];

                iters += 1;
                return yld;
            }
        };
    }

    function getNameDB(db) {
        var df = q.defer();
        fs.readFile(db, {encoding: "utf-8"}, function (err, data) {
            if (err) {
                df.reject(err);
            } else {
                df.resolve(data);
            }
        });
        return df.promise;
    }

    function strip(s) {
        return s.replace(/^\s+|\s+$/g, "");
    }

    function toLines(data) {
        var lines = _.map(data.split("\n"), strip);
        return _.filter(lines, function (x) { return _.contains(x, " "); });
    }

    function dump(input) {
        console.log(JSON.stringify(input, null, "  "));
        return input;
    }

    function countTree(node) {
        return 1 + node.children.length + _.reduce(
            _.map(node.children, countTree),
            function (x, y) { return x + y; },
            0
        );
    }

    function main() {
        getNameDB("names.txt")
            .then(toLines)
            .then(_.shuffle)
            .then(crossgenerator)
            .then(require("./ambassador.js"))
            .then(function (amb) { return amb.diamondMin(); })
            .then(dump)
            .then(countTree)
            .then(dump)
            .done();
    }

    main();
}());
