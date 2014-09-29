/*jslint maxlen: 120*/
module.exports = (function (R, bilby, mach, q, m, uri, hypermedia, response, request, distributor) {
    "use strict";
    var env = bilby.environment(),
        formatDistributor = R.compose(distributor.transformOutput, distributor.matched);

    function createFull(req) {
        /* Duplicate ids should be taken care of by constraints in configure-db */
        return distributor.createDistributorCypher(distributor.transformFullInput(req.params))
            .then(m.first)
            .then(distributor.linker(uri.absoluteUri(req))(formatDistributor))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.badRequest({})));
    }

    function createPartial(req) {
        return distributor.createPartialCypher(distributor.transformPartialInput(req.params))
            .then(m.first)
            .then(distributor.linker(uri.absoluteUri(req))(formatDistributor))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.badRequest({})));
    }

    function upgradeDistributor(req) {
        return distributor.upgradePartialCypher(distributor.transformUpgradeInput(req.params))
            .then(m.first)
            .then(distributor.linker(uri.absoluteUri(req))(formatDistributor))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.badRequest({})));
    }

    function getDistributor(req) {
        return distributor.distributorByIdCypher(distributor.transformGetInput(req.params))
            .then(m.first)
            .then(distributor.linker(uri.absoluteUri(req))(formatDistributor))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.notFound({})));
    }

    function listDistributors(req) {
        return distributor.distributorsCypher()
            .then(distributor.multilinker(uri.absoluteUri(req))(formatDistributor))
            .then(mach.json);
    }

    function getOrg(req) {
        return distributor.generateOrg(distributor.transformGetInput(req.params))
            .then(mach.json);
    }

    function getPerf(req) {
        var params = distributor.transformGetPerformanceInput(req.params),
            personalVolume = distributor.computePv(params);
        return q.spread([personalVolume], function (pv) {
            return {
                personalVolume: pv
            };
        })
            .then(hypermedia.unlinked)
            .then(mach.json);
    }

    env = bilby.environment()
        .method("createDistributor", R.compose(distributor.isValidFull, R.prop("params")), createFull)
        .method("createDistributor", R.compose(distributor.isValidPartial, R.prop("params")), createPartial)
        .method("createDistributor", R.alwaysTrue, R.always(response.status.badRequest({})))
        .method("upgradeDistributor", R.compose(distributor.isValidUpgrade, R.prop("params")), upgradeDistributor)
        .method("upgradeDistributor", R.alwaysTrue, R.always(response.status.badRequest({})))
        .property("listDistributors", listDistributors)
        .property("getDistributor", getDistributor)
        .method("getOrg", R.compose(distributor.isValidGetPrecondition, request.params), getOrg)
        .method("getOrg", R.alwaysTrue, R.always(response.status.notFound({})))
        .method("getPerf", R.compose(
            R.and(distributor.isValidGetPrecondition, distributor.hasBusinessPeriod),
            request.params
        ),
            getPerf)
        .method("getPerf", R.alwaysTrue, R.always(response.status.notFound({})));

    return function (app) {
        app.get("/distributor", env.listDistributors);
        app.post("/distributor", env.createDistributor);
        app.get("/distributor/:distributorID", env.getDistributor);
        app.post("/distributor/:distributorID/upgrade", env.upgradeDistributor);
        app.get("/distributor/:distributorID/organization", env.getOrg);
        app.get("/distributor/:distributorID/performance", env.getPerf);
        return app;
    };
}(
    require("ramda"),
    require("bilby"),
    require("mach"),
    require("q"),
    require("./lib/monad"),
    require("./lib/uri"),
    require("./lib/hypermedia"),
    require("./lib/response"),
    require("./lib/request"),
    require("./lib/distributor")
));
