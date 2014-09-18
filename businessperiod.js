/*jslint maxlen: 120*/
module.exports = (function (R, bilby, response, bp) {
    "use strict";
    var local = null;

    function isFind(request) {
        var find = request.query.find;
        return find !== null && find !== undefined;
    }

    function isCurrent(request) {
        return R.keys(request.query).length === 0;
    }

    function lookupCurrent(request) {
        return request;

    }

    function lookupFind(request) {
        return bp + request;
    }

    function lookupUnknown() {
        return response.status.notFound({});
    }

    local = bilby.environment()
        .method("lookup", isFind, lookupFind)
        .method("lookup", isCurrent, lookupCurrent)
        .method("lookup", R.alwaysTrue, lookupUnknown);

    return function (app) {
        app.get("/bp", local.lookup);
    };
}(
    require("ramda"),
    require("bilby"),
    require("./lib/response"),
    require("./lib/businessperiod")
));