(function main(mach, cfg, m, uri) {
    "use strict";
    var app = mach.stack(),
        port = m.toOption(process.argv[2])
            .getOrElse(cfg.server.port);

    app.use(mach.params);
    app.get("/", function (request) {
        var resolve = uri.absoluteUri(request);

        return mach.json({
            rank: {
                list: resolve("/rank")
            },
            distributor: {
                create: resolve("/distributor"),
                list: resolve("/distributor")
            },
            businessperiod: {
                current: resolve("/bp"),
                find: resolve("/bp")
            }
        });
    });
    require("./rank")(app);
    require("./distributor")(app);
    require("./businessperiod")(app);
    require("./orders")(app);

    mach.serve(app, port);
}(
    require("mach"),
    require("./config.js"),
    require("./lib/monad"),
    require("./lib/uri")
));
