/*jslint maxlen: 120
    unparam: true */
module.exports = (function (R, bilby, mach, uri, response, request, bp) {
    "use strict";

    function formatPeriod(blob) {
        var currentId = bp.currentIdLens.run(blob).getter,
            current = bp.currentLens.run(blob).getter,
            startdate = new Date(current.start),
            enddate = (current.end && new Date(current.end)) || null;
        return {
            token: currentId,
            startdate: startdate.toISOString(),
            enddate: enddate !== null ? enddate.toISOString() : null,
            year: startdate.getFullYear(),
            month: startdate.getMonth() + 1,
            closed: enddate !== null
        };
    }

    function current(req) {
        return bp.getCurrent()
            .then(bp.linker(uri.absoluteUri(req))(formatPeriod))
            .then(mach.json)
            .catch(response.catcher);
    }

    return function (app) {
        app.get("/bp", current);
    };
}(
    require("ramda"),
    require("bilby"),
    require("mach"),
    require("./lib/uri"),
    require("./lib/response"),
    require("./lib/request"),
    require("./lib/businessperiod")
));