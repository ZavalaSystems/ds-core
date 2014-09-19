/*jslint maxlen: 120
    unparam: true */
module.exports = (function (R, bilby, q, mach, m, lens, uri, response, request, bp) {
    "use strict";

    var env = bilby.environment(),
        findLens = bilby.objectLens("find").compose(request.queryLens),
        idLens = bilby.objectLens("id").compose(request.paramsLens),
        decodeQueryDate = R.compose(bp.decodeDate, lens.get, findLens.run);

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

    function resolveCurrent(req) {
        console.log("getting current");
        return bp.getCurrent()
            .then(bp.linker(uri.absoluteUri(req))(formatPeriod))
            .then(m.map(mach.json))
            .then(m.getOrElse(404))
            .catch(response.catcher);
    }

    function resolveByDate(req) {
        return decodeQueryDate(req).map(function (d) {
            return bp.getByDate(d)
                .then(bp.linker(uri.absoluteUri(req))(formatPeriod))
                .then(m.map(mach.json))
                .then(m.getOrElse(404))
                .catch(response.catcher);
        }).getOrElse(q.when(404));
    }

    function resolveById(req) {
        return bp.getById(parseInt(idLens.run(req).getter, 10))
            .then(bp.linker(uri.absoluteUri(req))(formatPeriod))
            .then(m.map(mach.json))
            .then(m.getOrElse(404))
            .catch(response.catcher);
    }

    function close(req) {
        return 500;
    }

    env = env.method("resolve", bilby.compose(lens.get, findLens.run), resolveByDate)
        .method("resolve", bilby.constant(true), resolveCurrent);

    return function (app) {
        app.get("/bp", env.resolve);
        app.get("/bp/:id", resolveById);
        app.post("/bp/:id/close", close);
    };
}(
    require("ramda"),
    require("bilby"),
    require("q"),
    require("mach"),
    require("./lib/monad"),
    require("./lib/lens"),
    require("./lib/uri"),
    require("./lib/response"),
    require("./lib/request"),
    require("./lib/businessperiod")
));