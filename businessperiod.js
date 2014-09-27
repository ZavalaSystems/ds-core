/*jslint maxlen: 120 */
module.exports = (function (R, bilby, mach, m, uri, response, request, bp) {
    "use strict";

    var env = null,
        formatBusinessPeriod = R.compose(bp.transformOutput, bp.current);

    function resolveCurrent(req) {
        return bp.matchCurrent()
            .then(m.firstOption)
            .then(bp.linker(uri.absoluteUri(req))(formatBusinessPeriod))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.notFound({content: "There are no business periods"})))
            .catch(response.catcher);
    }

    function resolveByDate(req) {
        return bp.matchByDate(bp.transformFindInput(req.params))
            .then(m.firstOption)
            .then(bp.linker(uri.absoluteUri(req))(formatBusinessPeriod))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.notFound({})))
            .catch(response.catcher);
    }

    function resolveByID(req) {
        return bp.matchByDate(bp.transformInput(req.params))
            .then(m.firstOption)
            .then(bp.linker(uri.absoluteUri(req))(formatBusinessPeriod))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.notFound({})))
            .catch(response.catcher);
    }

    function close(req) {
        var now = Date.now();
        return bp.createNext({
            id: bp.transformInput(req.params).id,
            now: now
        })
            .then(m.firstOption)
            .then(bp.linker(uri.absoluteUri(req))(formatBusinessPeriod))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.conflict({content: "BP is not the latest"})))
            .catch(response.catcher);
    }

    env = bilby.environment()
        .method("resolve", R.compose(bp.hasFind, request.params), resolveByDate)
        .method("resolve", request.emptyParams, resolveCurrent)
        .method("resolve", R.alwaysTrue, R.always(response.status.badRequest({})))
        .method("resolveByID", R.compose(bp.idPrecondition, request.params), resolveByID)
        .method("resolveByID", R.alwaysTrue, R.always(response.status.notFound({})))
        .method("close", R.compose(bp.idPrecondition, request.params), close)
        .method("close", R.alwaysTrue, R.always(response.status.notFound({})));

    return function (app) {
        app.get("/bp", env.resolve);
        app.get("/bp/:id", env.resolveByID);
        app.post("/bp/:id/close", close);
    };
}(
    require("ramda"),
    require("bilby"),
    require("mach"),
    require("./lib/monad"),
    require("./lib/uri"),
    require("./lib/response"),
    require("./lib/request"),
    require("./lib/businessperiod")
));