module.exports = (function (R, bilby) {
    "use strict";
    return bilby.environment()
        .property("query", R.prop("query"))
        .property("params", R.prop("params"))
        /*  These where used somewhere for composition that they probably
            shouldn't have been. So, leaving them
            */
        .property("queryLens", bilby.objectLens("query"))
        .property("paramsLens", bilby.objectLens("params"))
        .property("bodyLens", bilby.objectLens("body"));
}(
    require("ramda"),
    require("bilby")
));