(function main(mach, cfg) {
    "use strict";
    var app = mach.stack();

    app.get("/", function (request) {
        var host = cfg.templates.host(request);

        return mach.json({
            version: "0.0.3",
            consultant: {
                list: host + "/consultant",
                root: host + "/consultant/root",
                find: host + "/consultant"
            }
        });
    });

    app = require("./consultant.js")(app);

    mach.serve(app, cfg.server.port);
}(
    require("mach"),
    require("./config.js")
));