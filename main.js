(function main(mach, _, cfg) {
    "use strict";
    var app = mach.stack(),
        hostTpl = _.template("${protocol}//${host}:${port}");

    app.get("/", function (request) {
        var host = hostTpl(request);
        return mach.json({
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
    require("lodash"),
    require("./config.json")
));