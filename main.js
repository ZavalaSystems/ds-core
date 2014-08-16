(function main(mach, cfg, m) {
    "use strict";
    console.log("hello");
    var app = mach.stack(),
        port = m.toOption(process.argv[2])
            .getOrElse(cfg.server.port);

    app.get("/", function (request) {
        var host = cfg.templates.host(request);

        return mach.json({
            consultant: {
                list: host + "/consultant",
                root: host + "/consultant/root",
                find: host + "/consultant"
            }
        });
    });

    app = require("./consultant.js")(app);

    mach.serve(app, port);
}(
    require("mach"),
    require("./config.js"),
    require("./lib/monad")
));
