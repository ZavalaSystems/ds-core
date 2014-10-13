/*jslint maxlen: 120*/
module.exports = (function (R, bilby, mach, ftree, m, toggle, uri, hypermedia, response, request, distributor) {
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
        return distributor.getOrg(distributor.transformGetInput(req.params))
            // Run the linker across the entire tree
            .then(m.map(function (tree) {
                return tree.map(distributor.linker(uri.absoluteUri(req))(formatDistributor))
                    .map(m.getOrElse(null));
            }))
            .then(m.map(ftree.toArray))
            .then(m.map(function (t) {
                return {
                    payload: t,
                    links: {}
                };
            }))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.notFound({})));
    }

    /* TASK ensure this copes with valid input */
    function getProgress(req) {
        return distributor.getProgress(distributor.transformGetProgressInput(req.params),
                toggle.getToggleOff(req, "fortuna.service"))
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
        .method("getProgress", R.compose(
            R.and(distributor.isValidGetPrecondition, distributor.hasBusinessPeriod),
            request.params
        ),
            getProgress)
        .method("getProgress", R.alwaysTrue, R.always(response.status.badRequest({})));

    return function (app) {
        app.get("/distributor", env.listDistributors);
        app.post("/distributor", env.createDistributor);
        app.get("/distributor/:distributorID", env.getDistributor);
        app.post("/distributor/:distributorID/upgrade", env.upgradeDistributor);
        app.get("/distributor/:distributorID/organization", env.getOrg);
        app.get("/distributor/:distributorID/progress", env.getProgress);
        return app;
    };
}(
    require("ramda"),
    require("bilby"),
    require("mach"),
    require("./lib/ftree"),
    require("./lib/monad"),
    require("./lib/toggle"),
    require("./lib/uri"),
    require("./lib/hypermedia"),
    require("./lib/response"),
    require("./lib/request"),
    require("./lib/distributor")
));
