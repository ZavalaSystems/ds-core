
module.exports = (function (_, bilby, R, lens, hypermedia, common, db) {
    "use strict";
    /*jslint unparam: true */
    var mkLink = function (x) {
            return "/bp/" + x;
        },
        spec = {
            sanitize: {
                black: []
            },
            links: {
                self: true,
                base: _.template("/bp/${current_id}"),
                fields:  [
                    ["next", function (b, data) {
                        return lens.optionGet(db.nextID, data)
                            .map(mkLink);
                    }],
                    ["prev", function (b, data) {
                        return lens.optionGet(db.prevID, data)
                            .map(mkLink);
                    }],
                    ["close", function (b, data) {
                        if (common.isDefined(R.prop("next")(data))) {
                            return bilby.none;
                        }
                        return bilby.some(b + "/close");
                    }]
                ]
            }
        },
        hasFind = R.compose(common.isDefined, R.prop("find")),
        findPredicates = [
            hasFind,
            R.compose(common.isDateParseable, R.prop("find"))
        ],
        findPrecondition = R.allPredicates(findPredicates),
        transformInput = lens.transformToInt(["id"]),
        transformFindInput = lens.transformStrToEpochOffset(["find"]),
        ensureEndDate = function (x) {
            if (common.isNullOrUndefined(x.end)) {
                var start = new Date(x.start),
                    nextMonth = new Date(start.getFullYear(), start.getMonth() + 1, 1);
                return common.merge({end: nextMonth}, x);
            }
            return x;
        },
        addDaysIn = function (x) {
            var start = new Date(x.start),
                daysInMonth = new Date(start.getFullYear(),
                    start.getMonth() + 1, 0).getDate();
            return common.merge({daysIn: daysInMonth}, x);
        },
        transformOutput = R.compose(
            addDaysIn,
            ensureEndDate,
            lens.transformEpochOffsetToStr(["start"]),
            lens.transformEpochOffsetToStr(["end"])
        );
    /*jslint unparam: false */

    return bilby.environment()
        .property("spec", R.always(spec))
        .property("linker", hypermedia.hyperlink(spec))
        .property("hasFind", hasFind)
        .property("findPrecondition", findPrecondition)
        .property("transformOutput", transformOutput)
        .property("transformFindInput", transformFindInput)
        .property("transformInput", transformInput)
        .envAppend(db);
}(
    require("lodash"),
    require("bilby"),
    require("ramda"),
    require("../lens"),
    require("../hypermedia"),
    require("../common"),
    require("./db")
));