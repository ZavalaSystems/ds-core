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
                    aGoal = ambassadorsGoal(targetLine);
                return {
                    rankGoal: params.goal,
                    personalVolumeGoal: pvGoal,
                    groupVolumeGoal: gvGoal,
                    orgVolumeGoal: ovGoal,
                    directorsGoal: dGoal,
                    ambassadorsGoal: aGoal,
                    personalVolumeProgress: pvGoal === 0 ? 1 : personalVolume(results) / pvGoal,
                    groupVolumeProgress: gvGoal === 0 ? 1 : groupVolume(results) / gvGoal,
                    orgVolumeProgress: ovGoal === 0 ? 1 : orgVolume(results) / ovGoal,
                    directorsProgress: dGoal === 0 ? 1 : directors(results) / dGoal,
                    ambassadorsProgress: aGoal === 0 ? 1 : ambassadors(results) / aGoal
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