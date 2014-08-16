module.exports = (function (bilby, cfg) {
    "use strict";
    return {
        absoluteUri: bilby.curry(function (request, relative) {
            var root = request.headers["x-api-root"];
            return (root || cfg.templates.host(request)) + relative;
        })
    };
}(
    require("bilby"),
    require("../config.js")
));