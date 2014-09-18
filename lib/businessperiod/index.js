
module.exports = (function (bilby, R, monad, hypermedia, db) {
    "use strict";
    /*jslint unparam: true */
    var dateRe = /([0-9][0-9][0-9][0-9])\-([0-9][0-9])\-([0-9][0-9])/,
        optionLens = R.curry(function (lens, d) {
            return monad.toOption(lens.run(d).getter);
        }),
        strJoin = R.curry(function (delim, f, s) {
            return [f, s].join(delim);
        }),
        nextIdLens = optionLens(db.nextIdLens),
        prevIdLens = optionLens(db.prevIdLens),
        currentIdLens = optionLens(db.currentIdLens),
        spec = {
            sanitize: {
                black: []
            },
            links: {
                base: "/bp",
                fields:  [
                    ["next", function (b, data) {
                        return nextIdLens(data).map(strJoin("/", b));
                    }],
                    ["prev", function (b, data) {
                        return prevIdLens(data).map(strJoin("/", b));
                    }],
                    ["canonical", function (b, data) {
                        return currentIdLens(data).map(strJoin("/", b));
                    }],
                    ["close", function (b, data) {
                        return currentIdLens(data).map(strJoin("/", b))
                            .map(strJoin("/"))
                            .ap(bilby.some("close"));
                    }]
                ]
            }
        },
        not = function (v) { return !v; },
        isDateParseable =  R.compose(not, isNaN, Date.parse),
        local = bilby.environment();
    /*jslint unparam: false */

    function isDateString(v) {
        return v.match(dateRe) !== null;
    }

    function decodeDateSpec(v) {
        var m = v.match(dateRe);
        return bilby.some(new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10)));
    }

    function decodeParseable(v) {
        var d = new Date(Date.parse(v)),
            f = new Date(d);
        f.setDate(1);
        return bilby.some(f);
    }

    return local.method("decodeDate", isDateString, decodeDateSpec)
        .method("decodeDate", isDateParseable, decodeParseable)
        .method("decodeDate", R.alwaysTrue, R.always(bilby.none))
        .property("spec", R.always(spec))
        .property("linker", hypermedia.hyperlink(spec))
        .property("isDateParseable", isDateParseable)
        .property("isDateString", isDateString)
        .property("decodeDateSpec", decodeDateSpec)
        .property("decodeParseable", decodeParseable)
        .envAppend(db);
}(
    require("bilby"),
    require("ramda"),
    require("../monad"),
    require("../hypermedia"),
    require("./db")
));