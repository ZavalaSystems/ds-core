module.exports = (function (bilby, R, m, subprocess) {
    "use strict";
    var jar = "spikes/fortuna/target/fortuna-0.0.1-standalone.jar",
        // Getters for data returned by fortuna
        personalVolume = R.prop("pcv"),
        groupVolume = R.prop("group-volume"),
        orgVolume = R.prop("orgVolume"),
        directors = R.prop("qualified-directors"),
        ambassadors = R.prop("qualified-ambassadors");

    function run(bp, u) {
        return subprocess.run("java", "-jar", jar, bp.toString(),
                m.toOption(u).getOrElse(1).toString(), "")
            .then(R.compose(JSON.parse, R.prop("stdout")));
    }

    return bilby.environment()
        .property("run", run)
        .property("personalVolume", personalVolume)
        .property("groupVolume", groupVolume)
        .property("orgVolume", orgVolume)
        .property("directors", directors)
        .property("ambassadors", ambassadors);
}(
    require("bilby"),
    require("ramda"),
    require("./monad"),
    require("./subprocess")
));