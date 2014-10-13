module.exports = (function (request, bilby, R, Q, config, monad, subprocess) {
    "use strict";
    var jar = "spikes/fortuna/target/fortuna-0.0.2-standalone.jar",
        // Getters for data returned by fortuna
        personalVolume = R.prop("pcv"),
        groupVolume = R.prop("group-volume"),
        orgVolume = R.prop("orgVolume"),
        directors = R.prop("qualified-directors"),
        ambassadors = R.prop("qualified-ambassadors"),
        requester = Q.denodeify(request);

    function batch(bp, u) {
        return subprocess.run("java", "-jar", jar, bp.toString(),
                monad.toOption(u).getOrElse(1).toString(), "")
            .then(R.compose(JSON.parse, R.prop("stdout")));
    }

    function service(bp, u) {
        return requester(config.fortuna.uri + "/" + bp + "/" + u)
            .then(R.prop("1"))
            .then(JSON.parse);
    }

    return bilby.environment()
        .property("service", service)
        .property("batch", batch)
        .property("personalVolume", personalVolume)
        .property("groupVolume", groupVolume)
        .property("orgVolume", orgVolume)
        .property("directors", directors)
        .property("ambassadors", ambassadors);
}(
    require("request"),
    require("bilby"),
    require("ramda"),
    require("q"),
    require("../config"),
    require("./monad"),
    require("./subprocess")
));