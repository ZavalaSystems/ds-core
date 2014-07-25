module.exports = (function (_) {
    "use strict";
    /*jslint unparam: true*/
    function translateTable() {
        var columns = _.toArray(arguments),
            rows = _.reduce(_.first(columns), function (acc, obj, i) {
                return acc.concat([_.reduce(columns, function (acc2, column) {
                    return acc2.concat(column[i]);
                }, [])]);
            }, []);
        return rows;
    }
    /*jslint unparam: false*/

    function zipMerge() {
        var translated = translateTable.apply(null, arguments);
        return _.reduce(translated, function (acc, partials) {
            return acc.concat(_.reduce(partials, function (acc2, partial) {
                _.merge(acc2, partial);
                return acc2;
            }, {}));
        }, []);
    }

    function multipluck() {
        var arr = _.first(arguments),
            plucks = _.rest(arguments);

        return _.reduce(plucks, function (acc, pluck) {
            return _.pluck(acc, pluck);
        }, arr);
    }

    return {
        multipluck: multipluck,
        translateTable: translateTable,
        zipMerge: zipMerge
    };
}(
    require("lodash")
));