module.exports = (function (request, bilby, R, Q, config, monad, subprocess) {
    "use strict";
    var jar = "fortuna/target/fortuna-0.0.2-standalone.jar",
        // Getters for data returned by fortuna
        personalVolume = R.prop("pcv"),
        groupVolume = R.prop("group-volume"),
        orgVolume = R.prop("orgVolume"),
        directors = R.prop("qualified-directors"),
        ambassadors = R.prop("qualified-ambassadors"),
        distributor = R.prop("dist"),
        paidAs = R.prop("rank"),
        distributorID = R.compose(R.prop("id"), distributor),
        details = R.prop("details"),
        personalDetails = R.compose(R.prop("personal"), details),
        teamDetails = R.compose(R.prop("team"), details),
        salesDetails = R.compose(R.prop("sales"), details),
        gen1Details = R.compose(R.prop("gen1"), details),
        gen2Details = R.compose(R.prop("gen2"), details),
        gen3Details = R.compose(R.prop("gen3"), details),
        requester = Q.denodeify(request);

    function batch(bp, u) {
        return subprocess.run("java", "-jar", jar, bp.toString(),
                monad.toOption(u).getOrElse(1).toString(), "")
            .then(R.compose(JSON.parse, R.prop("stdout")));
    }

    function service(bp, u) {
        return requester(config.fortuna.uri + "/" + bp + (u ? ("/" + u) : ""))
            .then(R.prop("1"))
            .then(JSON.parse);
    }

    function toSeq(results) {
        return R.cons(R.omit(["children"], results), R.chain(toSeq, results.children));
    }

    return bilby.environment()
        .property("service", service)
        .property("batch", batch)
        .property("toSeq", toSeq)
        .property("paidAs", paidAs)
        .property("distributor", distributor)
        .property("distributorID", distributorID)
        .property("personalVolume", personalVolume)
        .property("groupVolume", groupVolume)
        .property("orgVolume", orgVolume)
        .property("directors", directors)
        .property("ambassadors", ambassadors)
        .property("personalDetails", personalDetails)
        .property("teamDetails", teamDetails)
        .property("salesDetails", salesDetails)
        .property("gen1Details", gen1Details)
        .property("gen2Details", gen2Details)
        .property("gen3Details", gen3Details);
}(
    require("request"),
    require("bilby"),
    require("ramda"),
    require("q"),
    require("../config"),
    require("./monad"),
    require("./subprocess")
));