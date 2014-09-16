
module.exports = (function (bilby, _, hypermedia) {
    "use strict";

    /*jslint unparam: true */
    var spec = {
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
                    }]
                ]
            }
        },
        dateRe = /([0-9][0-9][0-9][0-9])\-([0-9][0-9])\-([0-9][0-9])/,
        specRe = /([0-9][0-9][0-9][0-9])([0-9][0-9])/,
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

    local = local
        .method("decode", isDateString, decodeDate)
        .method("decode", isSpecString, decodeSpec)
        .method("decode", _.constant(true), _.constant(null));

    return {
        db: require("./db"),
        decode: local.decode,
        linker: hypermedia.hyperlink(spec),
        isDateString: isDateString,
        isSpecString: isSpecString,
        decodeDate: decodeDate,
        decodeSpec: decodeSpec
    };
}(
    require("bilby"),
    require("lodash"),
    require("../hypermedia")
));