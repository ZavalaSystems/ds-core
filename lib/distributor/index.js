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
                    }]
                ],
                base: _.template("/distributor/${d.data.id}")
            }
        },
        linker = hypermedia.hyperlink(spec),
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
        transformDateToOffset = lens.transform(Date.parse, ["enrollDate"]),
        transformOffsetToDate = lens.transform(function (o) { return new Date(o); }, ["enrollDate"]);
    /*jslint unparam: false */
    env = bilby.environment()
        .property("spec", spec)
        .property("linker", linker)
        .property("transformDateToOffset", transformDateToOffset)
        .property("transformOffsetToDate", transformOffsetToDate)
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
    require("../lens"),
    require("../hypermedia"),
    require("./db")
));
