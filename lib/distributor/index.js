module.exports = (function (_, R, bilby, common, lens, hypermedia, db) {
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

    /*jslint unparam: true */
    var baseTemplate = _.template("/distributor/${id}"),
        spec = {
            santizie: {
                black: []
            },
            links: {
                self: true,
                fields: [
                    ["enroller", function (b, blob) {
                        if (db.hasEnroller(blob)) {
                            return bilby.some(baseTemplate(db.enroller(blob)));
                        }
                        return bilby.none;
                    }],
                    ["sponsor", function (b, blob) {
                        if (db.hasSponsor(blob)) {
                            return bilby.some(baseTemplate(db.sponsor(blob)));
                        }
                        return bilby.none;
                    }],
                    ["upgrade", function (b, blob) {
                        if (!db.hasEnroller(blob)) {
                            return bilby.some(b + "/upgrade");
                        }
                        return bilby.none;
                    }],
                    /*  This is a function type because you can only have a downline
                        if you are a full distributor
                     */
                    ["downline", function (b, blob) {
                        if (!db.hasSponsor(blob)) {
                            return bilby.none;
                        }
                        return bilby.some(b + "/downline");
                    }],
                    ["order", function (b, blob) {
                        if (!db.hasSponsor(blob)) {
                            return bilby.none;
                        }
                        return bilby.some(b + "/order");
                    }]
                ],
                base: _.template("/distributor/${d.data.id}")
            }
        },
        linker = hypermedia.hyperlink(spec),
        multilinker = hypermedia.multiHyperlink(spec),
        env = null,
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
        transformOutput = transformOffsetToEnrollDate;
    /*jslint unparam: false */
    env = bilby.environment()
        .property("spec", spec)
        .property("linker", linker)
        .property("multilinker", multilinker)
        .property("partialPredicates", partialPredicates)
        .property("upgradePredicates", upgradePredicates)
        .property("fullPredicates", fullPredicates)
        .property("isValidPartial", isValidPartial)
        .property("isValidFull", isValidFull)
        .property("isValidUpgrade", isValidUpgrade)
        .property("transformEnrollDateToOffset", transformEnrollDateToOffset)
        .property("transformOffsetToEnrollDate", transformOffsetToEnrollDate)
        .property("transformPartialInput", transformPartialInput)
        .property("transformUpgradeInput", transformUpgradeInput)
        .property("transformFullInput", transformFullInput)
        .property("transformGetInput", transformGetInput)
        .property("transformOutput", transformOutput);
    return db.envAppend(env);
}(
    require("lodash"),
    require("ramda"),
    require("bilby"),
    require("../common"),
    require("../lens"),
    require("../hypermedia"),
    require("./db")
));
