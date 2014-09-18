module.exports = (function (bilby) {
    "use strict";
    var queryLens = bilby.objectLens("query"),
        paramLens = bilby.objectLens("param"),
        bodyLens = bilby.objectLens("body");

    return {
        queryLens: queryLens,
        paramLens: paramLens,
        bodyLens: bodyLens
    };
}(require("bilby")));