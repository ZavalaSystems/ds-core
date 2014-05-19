var _ = require("lodash");
module.exports = function (nameGen) {
    "use strict";

    function sum(coll) {
        return _.reduce(coll, function (x, y) { return x + y; }, 0);
    }

    function calculateGV(node) {
        return _.isEmpty(node.children) ?
                node.pcv :
                sum(_.map(node.children, calculateGV));
    }

    function pick(coll) {
        var index = parseInt(Math.random() * coll.length, 10);
        return coll[index];
    }

    function makeChildren(howMany) {
        var childBuilders = _.rest(_.toArray(arguments));
        return _.reduce(_.range(howMany), function (acc) {
            return acc.concat(pick(childBuilders)());
        }, []);
    }

    function makeRecursive(level, gv, children) {
        var estimatePCV = gv - sum(_.map(children, calculateGV));
        return {
            pcv: estimatePCV > 500 ? estimatePCV : 500,
            name: nameGen.next(),
            children: children,
            level: level
        };
    }

    var builders = {
            wine: function () { return makeRecursive("Wine Ambassador", 500, []); },
            associate: function () {
                return makeRecursive(
                    "Associate Ambassador",
                    500,
                    makeChildren(1,
                        builders.wine)
                );
            },
            senior: function () {
                return makeRecursive(
                    "Senior Ambassador",
                    2500,
                    makeChildren(2,
                        builders.wine,
                        builders.associate)
                );
            },
            team: function () {
                return makeRecursive(
                    "Team Ambassador",
                    5000,
                    makeChildren(3,
                        builders.wine,
                        builders.associate,
                        builders.senior)
                );
            },
            executive: function () {
                return makeRecursive(
                    "Executive Ambassador",
                    10000,
                    makeChildren(4,
                        builders.wine,
                        builders.associate,
                        builders.senior,
                        builders.team)
                        .concat(makeChildren(1, builders.team))
                );
            },
            seniorExecutive: function () {
                return makeRecursive(
                    "Senior Executive Ambassador",
                    30000,
                    makeChildren(6,
                        builders.wine,
                        builders.associate,
                        builders.senior,
                        builders.team,
                        builders.executive)
                        .concat(makeChildren(2,
                            builders.team,
                            builders.executive))
                        .concat(makeChildren(1, builders.executive))
                );
            },
            crystal: function () {
                return makeRecursive(
                    "Crystal Ambassador",
                    70000,
                    makeChildren(8,
                        builders.wine,
                        builders.associate,
                        builders.senior,
                        builders.team,
                        builders.executive,
                        builders.seniorExecutive)
                        .concat(makeChildren(4,
                            builders.team,
                            builders.executive,
                            builders.seniorExecutive))
                        .concat(makeChildren(2,
                            builders.executive,
                            builders.seniorExecutive))
                );
            },
            diamond: function () {
                return makeRecursive(
                    "Diamond Ambassador",
                    100000,
                    makeChildren(12,
                        builders.wine,
                        builders.associate,
                        builders.senior,
                        builders.team,
                        builders.executive,
                        builders.seniorExecutive,
                        builders.crystal)
                        .concat(makeChildren(8,
                            builders.team,
                            builders.executive,
                            builders.seniorExecutive,
                            builders.crystal))
                        .concat(makeChildren(4,
                            builders.executive,
                            builders.seniorExecutive,
                            builders.crystal))
                );
            }
        };

    return builders;
};