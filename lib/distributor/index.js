module.exports = (function (_, R, bilby, common, lens, hypermedia, db, org) {
    "use strict";
    /*jslint unparam: true */
    var distributorRootTemplate = _.template("/distributor/${id}"),
        hasRank = R.compose(common.isDefined, R.prop("rank")),
        containsDirector = function (x) { return x.toLowerCase().search("director") >= 0; },
        isDirector = R.compose(containsDirector, R.prop("rank")),
        spec = {
            santizie: {
                black: []
            },
            links: {
                self: true,
                fields: [
                    ["enroller", function (b, blob) {
                        if (db.hasEnroller(blob)) {
                            return bilby.some(distributorRootTemplate(db.enroller(blob)));
                        }
                        return bilby.none;
                    }],
                    ["sponsor", function (b, blob) {
                        if (db.hasSponsor(blob)) {
                            return bilby.some(distributorRootTemplate(db.sponsor(blob)));
                        }
                        return bilby.none;
                    }],
                    ["leader", function (b, blob) {
                        if (db.hasLeader(blob)) {
                            return bilby.some(distributorRootTemplate(db.leader(blob)));
                        }
                        return bilby.none;
                    }],
                    ["upgrade", function (b, blob) {
                        if (!db.hasEnroller(blob)) {
                            return bilby.some(b + "/upgrade");
                        }
                        return bilby.none;
                    }],
                    ["order", function (b, blob) {
                        if (!db.hasSponsor(blob)) {
                            return bilby.none;
                        }
                        return bilby.some(b + "/order");
                    }],
                    "organization",
                    "performance",
                    "relation_to"
                ],
                base: _.template("/distributor/${d.data.id}")
            }
        },
        linker = hypermedia.hyperlink(spec),
        multilinker = hypermedia.multiHyperlink(spec),
        isDefined = R.compose(common.negate, common.isNullOrUndefined),
        partialPredicates = [
            R.compose(isDefined, R.prop("distributorID")),
            R.compose(common.isNumberLike, R.prop("distributorID")),
            R.compose(isDefined, R.prop("firstName")),
            R.compose(isDefined, R.prop("lastName"))
        ],
        upgradePredicates = [
            /* distributorID is not checked for defined because the upgrade request encodes it in the path */
            R.compose(common.isNumberLike, R.prop("distributorID")),
            R.compose(isDefined, R.prop("enrollerID")),
            R.compose(common.isNumberLike, R.prop("enrollerID")),
            R.compose(isDefined, R.prop("sponsorID")),
            R.compose(common.isNumberLike, R.prop("sponsorID")),
            R.compose(isDefined, R.prop("enrollDate")),
            R.compose(common.isDateParseable, R.prop("enrollDate")),
            R.compose(isDefined, R.prop("rank"))
        ],
        fullPredicates = R.concat(partialPredicates, upgradePredicates),
        isValidPartial = R.allPredicates(partialPredicates),
        isValidUpgrade = R.allPredicates(upgradePredicates),
        isValidFull = R.allPredicates(fullPredicates),
        isValidGetPredicates = [
            R.compose(common.isDefined, R.prop("distributorID")),
            R.compose(common.isNumberLike, R.prop("distributorID"))
        ],
        hasBusinessPeriod = R.compose(common.isDefined, R.prop("bp")),
        isValidGetPrecondition = R.allPredicates(isValidGetPredicates),
        transformEnrollDateToOffset = lens.transformStrToEpochOffset(["enrollDate"]),
        transformOffsetToEnrollDate = lens.transformEpochOffsetToStr(["enrollDate"]),
        transformPartialInput = lens.transformToInt(["distributorID"]),
        transformUpgradeInput = R.compose(
            transformEnrollDateToOffset,
            lens.transformToInt(["enrollerID"]),
            lens.transformToInt(["sponsorID"]),
            lens.transformToInt(["distributorID"])
        ),
        transformFullInput = R.compose(transformPartialInput, transformUpgradeInput),
        transformGetInput = lens.transformToInt(["distributorID"]),
        transformGetPerformanceInput = R.compose(
            transformGetInput,
            lens.transformToInt("bp")
        ),
        transformOutput = transformOffsetToEnrollDate;

    /*jslint unparam: false */
    return bilby.environment()
        .property("spec", spec)
        .property("linker", linker)
        .property("multilinker", multilinker)
        .property("hasRank", hasRank)
        .property("isDirectory", isDirector)
        .property("partialPredicates", partialPredicates)
        .property("upgradePredicates", upgradePredicates)
        .property("fullPredicates", fullPredicates)
        .property("isValidPartial", isValidPartial)
        .property("isValidFull", isValidFull)
        .property("isValidUpgrade", isValidUpgrade)
        .property("isValidGetPrecondition", isValidGetPrecondition)
        .property("hasBusinessPeriod", hasBusinessPeriod)
        .property("transformEnrollDateToOffset", transformEnrollDateToOffset)
        .property("transformOffsetToEnrollDate", transformOffsetToEnrollDate)
        .property("transformPartialInput", transformPartialInput)
        .property("transformUpgradeInput", transformUpgradeInput)
        .property("transformFullInput", transformFullInput)
        .property("transformGetInput", transformGetInput)
        .property("transformGetPerformanceInput", transformGetPerformanceInput)
        .property("transformOutput", transformOutput)
        .envAppend(db)
        .envAppend(org);
}(
    require("lodash"),
    require("ramda"),
    require("bilby"),
    require("../common"),
    require("../lens"),
    require("../hypermedia"),
    require("./db"),
    require("./org")
));
