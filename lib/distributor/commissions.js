/*jslint maxlen: 160*/
module.exports = (function (moment, bilby, R, q, m, rankList, fortuna, db) {
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
        // TASK Extract into a currency module
        jumpStartGoal = 200000,
        mkCurrency = R.divide(100),
        mapCurrencyObj = R.curry(function (fields, obj) {
            var converted = R.mapObj(mkCurrency, R.pick(fields, obj)),
                other = R.omit(fields, obj);
            return R.mixin(converted, other);
        }),
        mapVolumeObj = mapCurrencyObj(["personalVolume", "groupVolume", "orgVolume"]),
        mapCommissionDetails = mapCurrencyObj(["volume", "commissions"]),
        // Getters for the above tables. Copied from fortuna
        targetPersonalVolume = R.prop("0"),
        targetGroupVolume = R.prop("1"),
        targetOrgVolume = R.prop("4"),
        targetAmbassadors = R.prop("2"),
        targetDirectors = R.prop("3"),
        currentVolumes = function (fortunaOut) {
            return {
                paidAs: fortuna.paidAs(fortunaOut),
                personalVolume: fortuna.personalVolume(fortunaOut),
                groupVolume: fortuna.groupVolume(fortunaOut),
                orgVolume: fortuna.orgVolume(fortunaOut),
                directors: fortuna.directors(fortunaOut),
                ambassadors: fortuna.ambassadors(fortunaOut)
            };
        },
        ranks = R.map(R.prop("rankName"), rankList),
        targetVolumes = function (r) {
            return {
                personalVolume: targetPersonalVolume(requirements[r]),
                groupVolume: targetGroupVolume(requirements[r]),
                orgVolume: targetOrgVolume(requirements[r]),
                directors: targetDirectors(requirements[r]),
                ambassadors: targetAmbassadors(requirements[r])
            };
        },
        commissionsVolumes = function (r) {
            var teamDetails = fortuna.teamDetails(r),
                lev1Details = fortuna.lev1Details(r);
            return {
                personal: mapCommissionDetails(fortuna.personalDetails(r)),
                // Add presentation rule
                team: mapCommissionDetails({
                    volume: teamDetails.volume + lev1Details.commissions,
                    commissions: teamDetails.commissions + lev1Details.commissions,
                    percent: teamDetails.percent + lev1Details.percent
                }),
                sales: mapCommissionDetails(fortuna.salesDetails(r)),
                gen1: mapCommissionDetails(fortuna.gen1Details(r)),
                gen2: mapCommissionDetails(fortuna.gen2Details(r)),
                gen3: mapCommissionDetails(fortuna.gen3Details(r)),
                paidAs: fortuna.paidAs(r)
            };
        },
        zipWithDivide = R.zipWith(R.divide),
        currentProgress = R.curry(function (goal, current) {
            // For each key in goal and current, return current[key]/goal[key]
            // We must use goal keys to ensure we don't try and divide things like rank
            var keys = R.keys(goal),
                mkObj = R.zipObj(keys),
                getters = R.map(R.prop, R.keys(goal)),
                goalVals = R.ap(getters, [goal]),
                currentVals = R.ap(getters, [current]),
                percents = zipWithDivide(currentVals, goalVals);
            return mkObj(percents);
        }),
        rankGoalVolumes = R.map(targetVolumes, ranks),
        rankProgress = R.map(currentProgress, rankGoalVolumes),
        getProgress = function (params) {
            var results = fortuna.service(params.bp, params.distributorID),
                current = results.then(currentVolumes),
                commissions = results.then(commissionsVolumes),
                distributorOpt = db.matchByID(params)
                    .then(m.first)
                    .then(m.map(db.matched));
            // For each rank, create a goal and a progress
            return q.spread([current, commissions, distributorOpt], function (c, comm, dOpt) {
                return dOpt.map(function (d) {
                    var startDate = moment(d.enrollDate),
                        fastStartMixin = {
                            jumpStart: {
                                newDistributor: false,
                                jumpStart: null,
                                jumpStartGoal: null,
                                jumpStartProgress: null
                            }
                        };
                    if (moment().subtract(90, "days").isBefore(startDate)) {
                        fastStartMixin = {
                            jumpStart: {
                                newDistributor: true,
                                jumpStart: mkCurrency(c.personalVolume),
                                jumpStartGoal: mkCurrency(jumpStartGoal),
                                jumpStartProgress: c.personalVolume / jumpStartGoal
                            }
                        };
                    }
                    return R.mixin({
                        commissions: comm,
                        current: mapVolumeObj(c),
                        ranks: ranks, // Included as convenience
                        goals: R.zipObj(ranks, R.map(mapVolumeObj, rankGoalVolumes)),
                        progress: R.zipObj(ranks, R.ap(rankProgress, [c]))
                    }, fastStartMixin);
                });
            });
        },
        // Format the commissions output data.
        formatCommissions = R.mapObj(function (field) {
            // We are in the fields
            if (R.is(Object, field)) {
                return mapCommissionDetails(field);
            }
            return field;
        }),
        groupByBp = R.groupBy(R.prop("bp")),
        sortMostRecent = R.compose(R.reverse, R.sortBy(R.prop("computed"))),
        commissionData = R.omit(["_rev", "_id"]);

    return bilby.environment()
        .property("currentVolumes", currentVolumes)
        .property("ranks", ranks)
        .property("targetVolumes", targetVolumes)
        .property("currentProgress", currentProgress)
        .property("mapCurrencyObj", mapCurrencyObj)
        .property("getProgress", getProgress)
        .property("formatCommissions", formatCommissions)
        .property("groupByBp", groupByBp)
        .property("sortMostRecent", sortMostRecent)
        .property("commissionData", commissionData)
        .property("commissionsVolumes", commissionsVolumes);
}(
    require("moment"),
    require("bilby"),
    require("ramda"),
    require("q"),
    require("../monad"),
    require("../../ranks"),
    require("../fortuna"),
    require("./db")
));