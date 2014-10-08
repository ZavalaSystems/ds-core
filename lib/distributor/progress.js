/*jslint maxlen: 160*/
module.exports = (function (bilby, R, commissions) {
    "use strict";
    // var headers = ["pcv", "gv", "amb", "dir", "org", "is-dir", "base", "fstart", "personal", "lev1", "team", "gen1", "gen2", "gen3"],
    var requirements = {
            "Diamond Director":     [75000, 400000,  4,    4,   5000000,   true,   0.25,    0.30,  0.08,     0,  0.05,  0.06,  0.04,  0.02],
            "Crystal Director":     [75000, 400000,  4,    2,   2000000,   true,   0.25,    0.30,  0.07,     0,  0.05,  0.06,  0.04,     0],
            "Senior Director":      [50000, 400000,  4,    1,   1000000,   true,   0.25,    0.30,  0.06,     0,  0.05,  0.06,  0.03,     0],
            "Director":             [50000, 400000,  4,    0,         0,   true,   0.25,    0.30,  0.05,     0,  0.05,  0.03,     0,     0],
            "Senior Ambassador":    [25000, 100000,  2,    0,         0,  false,   0.25,    0.30,     0,  0.03,     0,     0,     0,     0],
            "Associate Ambassador": [25000,  50000,  1,    0,         0,  false,   0.25,    0.30,     0,  0.02,     0,     0,     0,     0],
            "Ambassador":               [0,      0,  0,    0,         0,  false,   0.25,    0.30,     0,     0,     0,     0,     0,     0]
        },
        // Requirement array accessors
        convert = R.rPartial(R.divide, 100),
        personalVolumeGoal = R.compose(convert, R.prop("0")),
        groupVolumeGoal = R.compose(convert, R.prop("1")),
        ambassadorsGoal = R.prop("2"),
        directorsGoal = R.prop("3"),
        orgVolumeGoal = R.compose(convert, R.prop("4")),
        personalVolume = R.compose(convert, R.prop("pcv")),
        groupVolume = R.compose(convert, R.prop("group-volume")),
        orgVolume = R.compose(convert, R.prop("orgVolume")),
        directors = R.prop("qualified-directors"),
        ambassadors = R.prop("qualified-ambassadors");

    /*  Get proress of a distributor in a business period.
        Preconditions:
        params contains a valid distributorID and bp token
     */
    function getProgress(params) {
        // TASK investigate sequencing to invert option and promise and allow easier checking
        // TASK cope with invalid ranks. Currently not done because we provide a rank endpoint to get ranks
        return commissions.run(params.bp, params.distributorID)
            .then(function (results) {
                var targetLine = requirements[params.goal],
                    pvGoal = personalVolumeGoal(targetLine),
                    gvGoal = groupVolumeGoal(targetLine),
                    ovGoal = orgVolumeGoal(targetLine),
                    dGoal = directorsGoal(targetLine),
                    aGoal = ambassadorsGoal(targetLine),
                    pVol = personalVolume(results),
                    gVol = groupVolume(results),
                    oVol = orgVolume(results),
                    ds = directors(results),
                    as = ambassadors(results);
                return {
                    current: {
                        personalVolume: pVol,
                        groupVolume: gVol,
                        orgVolume: oVol,
                        directors: ds,
                        ambassadors: as
                    },
                    goal: {
                        // rank: params.goal,
                        personalVolume: pvGoal,
                        groupVolume: gvGoal,
                        orgVolume: ovGoal,
                        directors: dGoal,
                        ambassadors: aGoal
                    },
                    progress: {
                        personalVolume: pvGoal === 0 ? 1 : pVol / pvGoal,
                        groupVolume: gvGoal === 0 ? 1 : gVol / gvGoal,
                        orgVolume: ovGoal === 0 ? 1 : oVol / ovGoal,
                        directors: dGoal === 0 ? 1 : ds / dGoal,
                        ambassadors: aGoal === 0 ? 1 : as / aGoal
                    }
                };
            });
    }

    return bilby.environment()
        .property("getProgress", getProgress);
}(
    require("bilby"),
    require("ramda"),
    require("../commissions")
));