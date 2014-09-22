/*jslint maxlen: 120*/
module.exports = (function (R, bilby, mach, m, uri, response, distributor) {
    "use strict";
    var env = bilby.environment(),
        formatDistributor = R.compose(distributor.transformOffsetToDate, distributor.matched);

    function createFull(req) {
        /* Duplicate ids should be taken care of by constraints in configure-db */
        return distributor.createDistributorCypher(distributor.transformDateToOffset(req.params))
            .then(m.first)
            .then(distributor.linker(uri.absoluteUri(req))(formatDistributor))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.badRequest({})))
            .catch(response.catcher);
    }

    function createPartial(req) {
        return distributor.createPartialCypher(req.params)
            .then(m.first)
            .then(distributor.linker(uri.absoluteUri(req))(formatDistributor))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.badRequest({})))
            .catch(response.catcher);
    }

    function upgradeDistributor(req) {
        return distributor.upgradePartialCypher(distributor.transformDateToOffset(req.params))
            .then(m.first)
            .then(distributor.linker(uri.absoluteUri(req))(formatDistributor))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.badRequest({})))
            .catch(response.catcher);
    }

    function getDistributor(req) {
        return distributor.distributorByIdCypher(req.params)
            .then(m.first)
            .then(distributor.linker(uri.absoluteUri(req))(formatDistributor))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.notFound({})))
            .catch(response.catcher);
    }

    env = bilby.environment()
        .method("createDistributor", R.compose(distributor.isValidFull, R.prop("params")), createFull)
        .method("createDistributor", R.compose(distributor.isValidPartial, R.prop("params")), createPartial)
        .method("createDistributor", R.alwaysTrue, R.always(response.status.badRequest({})))
        .method("upgradeDistributor", R.compose(distributor.isValidUpgrade, R.prop("params")), upgradeDistributor)
        .method("upgradeDistributor", R.alwaysTrue, R.always(response.status.badRequest({})))
        .property("getDistributor", getDistributor);

    return function (app) {
        app.get("/distributor/:distributorID", env.getDistributor);
        app.post("/distributor", env.createDistributor);
        app.post("/distributor/:distributorID/upgrade", env.upgradeDistributor);
        return app;
    };
}(
    require("ramda"),
    require("bilby"),
    require("mach"),
    require("./lib/monad"),
    require("./lib/uri"),
    require("./lib/response"),
    require("./lib/distributor")
));
