module.exports = (function (bilby, R, m, subprocess) {
    "use strict";
    var jar = "spikes/fortuna/target/fortuna-0.0.1-standalone.jar";

    function run(bp, u) {
        return subprocess.run("java", "-jar", jar, bp.toString(),
                m.toOption(u).getOrElse(1).toString(), "")
            .then(R.compose(JSON.parse, R.prop("stdout")));
    }

    return bilby.environment()
        .property("run", run);
}(
    require("bilby"),
    require("ramda"),
    require("./monad"),
    require("./subprocess")
));