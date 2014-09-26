module.exports = (function (mach, uri) {
    return function (app) {
        app.get("/distributor/:distributorID/org", function (req) {
            return mach.json({
                payload: {
                    personalVolume: 9001,
                    groupVolume: 900001,
                    organizationVolume: 10000000000,
                    recognizedLevel: "Crystal Director",
                    paidAsLevel: "Associate Ambassador",
                    leg: 9,
                    level: 1,
                    relationshipTag: "You're it"
                },
                links: {
                    distributor: uri.absoluteUri(req, "/distributor/" + req.params.distributorID),
                    leader: uri.absoluteUri(req, "/distributor/1")
                }
            });
        });
    };
}(
    require("mach"),
    require("./lib/uri")
));