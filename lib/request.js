module.exports = (function (bilby) {
    "use strict";
    return bilby.environment()
        .property("queryLens", bilby.objectLens("query"))
        .property("paramsLens", bilby.objectLens("params"))
        .property("bodyLens", bilby.objectLens("body"));
}(require("bilby")));