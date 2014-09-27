module.exports = (function (R, bilby) {
    "use strict";
    return bilby.environment()
        .property("query", R.prop("query"))
        .property("params", R.prop("params"))
        .property("emptyParams", R.compose(R.eq(0), R.length, R.keys, R.prop("params")));
}(
    require("ramda"),
    require("bilby")
));