module.exports = (function (bilby, _, m) {
    "use strict";
    function jsonTryParse(string) {
        var out;
        try {
            out = bilby.some(JSON.parse(string));
        } catch (e) {
            out = bilby.none;
        }
        return out;
    }

    function getToggle(dflt, request, qualifiedName) {
        var parts = qualifiedName.split(".");
        return _.reduce(
            parts,
            function (acc, sub) {
                return acc.flatMap(m.get(sub));
            },
            m.toOption(request.cookies)
                .flatMap(m.get("gsati-toggles"))
                .flatMap(jsonTryParse)
        )
            .getOrElse(dflt);
    }

    return {
        getToggleOn: _.partial(getToggle, true),
        getToggleOff: _.partial(getToggle, false)
    };
}(
    require("bilby"),
    require("lodash"),
    require("./monad")
));