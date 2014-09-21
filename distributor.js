/*jslint maxlen: 120*/
module.exports = (function (R, bilby, mach, m, uri, response, distributor) {
    "use strict";
    var env = bilby.environment();

    function createFull(req) {
        /* Duplicate ids should be taken care of by constraints in configure-db */
        return distributor.createDistributorCypher(distributor.transformDate(req.params))
            .then(m.first)
            .then(distributor.linker(uri.absoluteUri(req))(distributor.matched))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.badRequest({})))
            .catch(response.catcher);
    }

    function createPartial(req) {
        return distributor.createPartialCypher(req.params)
            .then(m.first)
            .then(distributor.linker(uri.absoluteUri(req))(distributor.matched))
            .then(m.map(mach.json))
            .then(m.getOrElse(response.status.badRequest({})))
            .catch(response.catcher);
    }

    env = bilby.environment()
        .method("createDistributor", R.compose(distributor.isValidFull, R.prop("params")), createFull)
        .method("createDistributor", R.compose(distributor.isValidPartial, R.prop("params")), createPartial)
        .method("createDistributor", R.alwaysTrue, R.always(response.status.badRequest({})));

    return function (app) {
        app.post("/distributor", env.createDistributor);
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
