/*jslint maxlen: 120*/
module.exports = (function (R, bilby, mach, q, get, config, m, uri, hypermedia, response, request, distributor) {
    "use strict";
    var env = bilby.environment(),
        formatDistributor = R.compose(distributor.transformOutput, distributor.matched),
        formatOrgRecord = function (blob) {
            return distributor.transformOutput(R.mixin(distributor.matched(blob), R.pick(["leg", "level"], blob)));
        },
        getAsync = q.denodeify(get);

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
        return distributor.getOrg(distributor.transformGetProgressInput(req.params))
            .then(m.map(distributor.multilinker(uri.absoluteUri(req))(formatOrgRecord)))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.notFound({})));
    }

    /* TASK ensure this copes with valid input */
    function getProgress(req) {
        return distributor.getProgress(distributor.transformGetProgressInput(req.params))
            .then(m.map(hypermedia.unlinked))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.notFound({})));
    }

    function changeSponsor(req) {
        return distributor.changeSponsor(distributor.transformSponsorChangeInput(req.params))
            .then(m.first)
            .then(distributor.linker(uri.absoluteUri(req))(formatDistributor))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.conflict({content: "Unable to find the new sponsor"})));
    }

    function getCommissions(req) {
        var viewURI = config.couch.uri + config.couch.view + "?" +
                        distributor.couchQueryString(req.params.distributorID, req.params.bp);
        return getAsync(viewURI)
            .then(R.prop("1"))
            .then(JSON.parse)
            .then(R.prop("rows"))
            .then(distributor.sortMostRecent)
            .then(R.head)
            .then(distributor.commissionData)
            .then(distributor.formatCommissions)
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
        .method("getProgress", R.alwaysTrue, R.always(response.status.badRequest({})))
        .method("changeSponsor", R.compose(distributor.sponsorChangePrecondition, request.params), changeSponsor)
        .method("changeSponsor", R.alwaysTrue, R.always(response.status.badRequest({})));

    return function (app) {
        app.get("/distributor", env.listDistributors);
        app.post("/distributor", env.createDistributor);
        app.get("/distributor/:distributorID", env.getDistributor);
        app.post("/distributor/:distributorID/upgrade", env.upgradeDistributor);
        app.get("/distributor/:distributorID/organization", env.getOrg);
        app.get("/distributor/:distributorID/progress", env.getProgress);
        app.get("/distributor/:distributorID/commissions", getCommissions);
        app.post("/distributor/:distributorID/change_sponsor", env.changeSponsor);
        return app;
    };
}(
    require("ramda"),
    require("bilby"),
    require("mach"),
    require("q"),
    require("request").get,
    require("./config"),
    require("./lib/monad"),
    require("./lib/uri"),
    require("./lib/hypermedia"),
    require("./lib/response"),
    require("./lib/request"),
    require("./lib/distributor")
));
