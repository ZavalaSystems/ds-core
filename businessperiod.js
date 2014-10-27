/*jslint maxlen: 120 */
module.exports = (function (R, bilby, mach, m, uri, response, request, fortuna, bp) {
    "use strict";

    var env = null,
        formatBusinessPeriod = R.compose(bp.transformOutput, function (blob) {
            return R.mixin(bp.current(blob), {id: bp.currentID(blob)});
        });

    function resolveCurrent(req) {
        return bp.matchCurrent()
            .then(m.firstOption)
            .then(bp.linker(uri.absoluteUri(req))(formatBusinessPeriod))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.notFound({content: "There are no business periods"})));
    }

    function resolveByDate(req) {
        return bp.matchByDate(bp.transformFindInput(req.params))
            .then(m.firstOption)
            .then(bp.linker(uri.absoluteUri(req))(formatBusinessPeriod))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.notFound({})));
    }

    function resolveByID(req) {
        return bp.matchByID(bp.transformInput(req.params))
            .then(m.firstOption)
            .then(bp.linker(uri.absoluteUri(req))(formatBusinessPeriod))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.notFound({})));
    }

    function close() {
        return bp.createNext({now: Date.now()})
            .then(m.first)
            .then(R.always("OK"));
    }

    function computeCommissions(req) {

    }

    /*
    function close(req) {
        var now = Date.now(),
            params = bp.transformInput(req.params),
            current = bp.;
        return bp.createNext({
            id: bp.transformInput(req.params).id,
            now: now
        })
            .then(m.first)
            .then(bp.linker(uri.absoluteUri(req))(formatBusinessPeriod))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.conflict({content: "BP is not the latest"})));
    }
    */

    env = bilby.environment()
        .method("resolve", R.compose(bp.hasFind, request.params), resolveByDate)
        .method("resolve", request.emptyParams, resolveCurrent)
        .method("resolve", R.alwaysTrue, R.always(response.status.badRequest({})))
        .method("resolveByID", R.compose(bp.idPrecondition, request.params), resolveByID)
        .method("resolveByID", R.alwaysTrue, R.always(response.status.notFound({})))
        .method("computeCommissions", R.compose(bp.idPrecondition, request.params), computeCommissions)
        .method("computeCommissions", R.alwaysTrue, R.always(response.status.notFound({})));

    return function (app) {
        app.get("/bp", env.resolve);
        app.get("/bp/:id", env.resolveByID);
        app.post("/bp/:id/commissions", env.computeCommissions)
        app.post("/bp/close", close);
    };
}(
    require("ramda"),
    require("bilby"),
    require("mach"),
    require("./lib/monad"),
    require("./lib/uri"),
    require("./lib/response"),
    require("./lib/request"),
    require("./lib/fortuna"),
    require("./lib/businessperiod")
));