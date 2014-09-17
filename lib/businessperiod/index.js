
module.exports = (function (bilby, _, hypermedia) {
    "use strict";

    /*jslint unparam: true */
    var dateRe = /([0-9][0-9][0-9][0-9])\-([0-9][0-9])\-([0-9][0-9])/,
        specRe = /([0-9][0-9][0-9][0-9])([0-9][0-9])/,
        /*endDateChecks = [28, 29, 30, 31],*/
        spec = {
            sanitize: {
                black: []
            },
            links: {
                base: "/bp",
                links:  [
                    ["next", function (b, data) {
                        return false;
                    }],
                    ["prev", function (b, data) {
                        return false;
                    }],
                    ["canonical", function (b, data) {
                        return false;
                    }],
                    ["close", function (b, data) {
                        return false;
                    }]
                ]
            }
        },
        not = function (v) { return !v; },
        isDateParseable =  _.compose(not, _.isNaN, Date.parse),
        local = bilby.environment();
    /*jslint unparam: false */

    function isDateString(v) {
        return !_.isNull(v.match(dateRe));
    }

    function isSpecString(v) {
        return !_.isNull(v.match(specRe));
    }

    function decodeDate(v) {
        var m = v.match(dateRe);
        return new Date(parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10));
    }

    function decodeSpec(v) {
        var m = v.match(specRe);
        return new Date(parseInt(m[1], 10), parseInt(m[2], 10));
    }

    function decodeParseable(v) {
        var d = new Date(Date.parse(v)),
            f = new Date(d);
        f.setDate(1);
        return f;
    }

    local = local
        .method("decode", isDateString, decodeDate)
        .method("decode", isSpecString, decodeSpec)
        .method("decode", isDateParseable, decodeParseable)
        .method("decode", _.constant(true), _.constant(null));

    return {
        db: require("./db"),
        decode: local.decode,
        linker: hypermedia.hyperlink(spec),
        /* Private methods */
        isDateParseable: isDateParseable,
        isDateString: isDateString,
        isSpecString: isSpecString,
        decodeDate: decodeDate,
        decodeSpec: decodeSpec,
        decodeParseable: decodeParseable
    };
}(
    require("bilby"),
    require("lodash"),
    require("../hypermedia")
));