/*jslint maxlen: 120*/
module.exports = (function (R, bilby, mach, m, uri, response, distributor) {
    "use strict";
    var env = bilby.environment(),
        formatDistributor = R.compose(distributor.transformOutput, distributor.matched);

    function createFull(req) {
        /* Duplicate ids should be taken care of by constraints in configure-db */
        return distributor.createDistributorCypher(distributor.transformFullInput(req.params))
            .then(m.first)
            .then(distributor.linker(uri.absoluteUri(req))(formatDistributor))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.badRequest({})))
            .catch(response.catcher(req));
    }

    function createPartial(req) {
        return distributor.createPartialCypher(distributor.transformPartialInput(req.params))
            .then(m.first)
            .then(distributor.linker(uri.absoluteUri(req))(formatDistributor))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.badRequest({})))
            .catch(response.catcher(req));
    }

    function upgradeDistributor(req) {
        return distributor.upgradePartialCypher(distributor.transformUpgradeInput(req.params))
            .then(m.first)
            .then(distributor.linker(uri.absoluteUri(req))(formatDistributor))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.badRequest({})))
            .catch(response.catcher(req));
    }

    function getDistributor(req) {
        return distributor.distributorByIdCypher(distributor.transformGetInput(req.params))
            .then(m.first)
            .then(distributor.linker(uri.absoluteUri(req))(formatDistributor))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.notFound({})))
            .catch(response.catcher(req));
    }

    function listDistributors(req) {
        return distributor.distributorsCypher()
            .then(distributor.multilinker(uri.absoluteUri(req))(formatDistributor))
            .then(mach.json)
            .catch(response.catcher(req));
    }

    function mockOrg() {
        var mockPayloads = [{
            payload: {
                id: 10001,
                personalVolume: 100.01,
                groupVolume: 2000.05,
                orgVolume: 10000.50,
                paidAs: "Diamond Director",
                leg: 4,
                level: 3,
                relationshipTag: "Group"
            },
            links: {
                self: "fake_url",
                enroller: "fake_url",
                sponsor: "fake_url",
                leader: "fake_url"
            }
        }];
        return mach.json([{
            payload: mockPayloads,
            links: {}
        }]);
    }

    env = bilby.environment()
        .method("createDistributor", R.compose(distributor.isValidFull, R.prop("params")), createFull)
        .method("createDistributor", R.compose(distributor.isValidPartial, R.prop("params")), createPartial)
        .method("createDistributor", R.alwaysTrue, R.always(response.status.badRequest({})))
        .method("upgradeDistributor", R.compose(distributor.isValidUpgrade, R.prop("params")), upgradeDistributor)
        .method("upgradeDistributor", R.alwaysTrue, R.always(response.status.badRequest({})))
        .property("listDistributors", listDistributors)
        .property("getDistributor", getDistributor);

    return function (app) {
        app.get("/distributor", env.listDistributors);
        app.post("/distributor", env.createDistributor);
        app.get("/distributor/:distributorID", env.getDistributor);
        app.post("/distributor/:distributorID/upgrade", env.upgradeDistributor);
        app.get("/distributor/:distributorID/org", mockOrg);
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
