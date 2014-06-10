(function main(mach, _, cfg, toggle) {
    "use strict";
    var app = mach.stack();

    app.get("/", function (request) {
        var host = cfg.templates.host(request),
            version = toggle.getToggleOn(request, "feature.version") ?
                        {version: "0.0.2"} :
                        {};

        return mach.json(_.merge(version, {
            consultant: {
                list: host + "/consultant",
                root: host + "/consultant/root",
                find: host + "/consultant"
            }
        }));
    });

    app = require("./consultant.js")(app);

    mach.serve(app, cfg.server.port);
}(
    require("mach"),
    require("lodash"),
    require("./config.js"),
    require("./lib/toggle.js")
));