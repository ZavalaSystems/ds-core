(function main(mach, cfg, m, uri) {
    "use strict";
    var app = mach.stack(),
        port = m.toOption(process.argv[2])
            .getOrElse(cfg.server.port);

    app.get("/", function (request) {
        var resolve = uri.absoluteUri(request);

        return mach.json({
            consultant: {
                list: resolve("/consultant"),
                root: resolve("/consultant/root"),
                find: resolve("/consultant")
            }
        });
    });
    require("./consultant.js")(app);
    require("./businessperiod.js")(app);

    mach.serve(app, port);
}(
    require("mach"),
    require("./config.js"),
    require("./lib/monad"),
    require("./lib/uri")
));
