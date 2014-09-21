module.exports = (function (_, R, bilby, common, hypermedia, db) {
    "use strict";
    /*
    var dbImplementationFields = ["id", "parent", "children"],
        getGCV;

    function sum(nums) {
        return _.reduce(nums, function (x, y) { return x + y; }, 0);
    }

    function childrenToGCV(getChildren, children) {
        return _.reduce(children, function (acc, child) {
            return acc.concat(getGCV(getChildren, child));
        }, []);
    }

    getGCV = function (getChildren, consultant) {
        var children = getChildren(consultant);
        return consultant.pcv + sum(childrenToGCV(getChildren, children));
    };

    return {
        linker: hypermedia.hyperlink({
            sanitize: {
                black: []
            },
            links: {
                self: true,
                fields: [],
                base: _.template("/consultant/${id}")
            }
        }),
        clean: function (consultant) {
            return _.omit(consultant, dbImplementationFields);
        },
        assignGCV: _.curry(function (getChildren, node) {
            return _.merge({}, node, {gcv: getGCV(getChildren, node)});
        })
    };
    */

    var linker = hypermedia.hyperlink({
            santizie: {
                black: []
            },
            links: {
                self: true,
                fields: [],
                base: _.template("/distributor/${id}")
            }
        }),
        env = null,
        isDefined = R.compose(common.negate, common.isNullOrUndefined),
        partialPredicates = [
            R.compose(isDefined, R.prop("distributorID")),
            R.compose(isDefined, R.prop("firstName")),
            R.compose(isDefined, R.prop("lastName"))
        ],
        upgradePredicates = [
            /* distributorID is not present because the upgrade request encodes it in the path */
            R.compose(isDefined, R.prop("enrollerID")),
            R.compose(isDefined, R.prop("sponsorID")),
            R.compose(isDefined, R.prop("enrollDate")),
            R.compose(isDefined, R.prop("rank")),
            R.compose(common.isDateParseable, R.prop("enrollDate"))
        ],
        fullPredicates = R.concat(partialPredicates, upgradePredicates),
        isValidPartial = R.allPredicates(partialPredicates),
        isValidUpgrade = R.allPredicates(upgradePredicates),
        isValidFull = R.allPredicates(fullPredicates),
        hasAllData = null,
        hasPartialData = null;

    function createFull(enrollee) {
        return db.createDistributor(enrollee);
    }

    function createPartial(enrollee) {
        return db.createPlaceholder(enrollee);
    }

    env = bilby.environment()
        .property("linker", linker)
        .method("createDistributor", hasAllData, createFull)
        .method("createDistributor", hasPartialData, createPartial)
        .method("createDistributor", R.alwaysTrue, R.always(bilby.none))
        .property("partialPredicates", partialPredicates)
        .property("upgradePredicates", upgradePredicates)
        .property("fullPredicates", fullPredicates)
        .property("isValidPartial", isValidPartial)
        .property("isValidFull", isValidFull)
        .property("isValidUpgrade", isValidUpgrade);
    return db.envAppend(env);
}(
    require("lodash"),
    require("ramda"),
    require("bilby"),
    require("../common"),
    require("../hypermedia"),
    require("./db")
));
