module.exports = (function (bilby, cfg) {
    "use strict";
    return {
        absoluteUri: bilby.curry(function (request, relative) {
            return cfg.templates.host(request) + "/api" + relative;
        })
    };
}(
    require("bilby"),
    require("../config.js")
));