/*global
    describe: true,
    it: true,
    expect: true,
    beforeEach: true,
    afterEach: true
*/
(function (common) {
    "use strict";
    describe("common library", function () {
        describe("translateTable", function () {
            it("should take columns as arguments, and translate them into rows.", function () {
                var table = [[1, 2, 3], [4, 5, 6]],
                    expected = [[1, 4], [2, 5], [3, 6]];

                expect(common.translateTable.apply(null, table)).toEqual(expected);
            });
        });

        describe("zipMerge", function () {
            it("should take lists of partial objects and zip them together.", function () {
                var partials = [
                        [{a: "b"}, {a: "c"}],
                        [{b: "d"}, {b: "e"}]
                    ],
                    expected = [
                        {a: "b", b: "d"},
                        {a: "c", b: "e"}
                    ];

                expect(common.zipMerge.apply(null, partials)).toEqual(expected);
            });
        });

        describe("multipluck", function () {
            it("should allow multiple pluck operations in one go.", function () {
                var input = [{a: {b: "c"}}, {a: {b: "d"}}],
                    expected = ["c", "d"];

                expect(common.multipluck(input, "a", "b")).toEqual(expected);
            });
        });

        describe("isNullOrUndefined", function () {
            it("should return true for null", function () {
                expect(common.isNullOrUndefined(null)).toEqual(true);
            });
            it("should return true for undefined", function () {
                expect(common.isNullOrUndefined(undefined)).toEqual(true);
            });
            it("should return false for a value", function () {
                expect(common.isNullOrUndefined(1)).toEqual(false);
            });
        });

        describe("negate", function () {
            it("should negate true->false", function () {
                expect(common.negate(true)).toEqual(false);
            });
            it("should negate false->true", function () {
                expect(common.negate(false)).toEqual(true);
            });
        });

        describe("merge", function () {
            it("should merge 2 objects", function () {
                expect(common.merge({a: 1}, {b: 2})).toEqual({a: 1, b: 2});
            });
        });

        describe("props", function () {
            it("should compose multiple properties together", function () {
                expect(common.props(["a", "b"])({a: {b: 1}})).toEqual(1);
            });
        });

        describe("isCurrency", function () {
            it("should return true for integers", function () {
                expect(common.isCurrency("100")).toEqual(true);
            });
            it("should return true for values with 2 decimal places", function () {
                expect(common.isCurrency("100.05")).toEqual(true);
            });
            it("should return false for non numeric inputs", function () {
                expect(common.isCurrency("1ab")).toEqual(false);
            });
            it("should return false or other than 2 decimal places", function () {
                expect(common.isCurrency("100.1")).toEqual(false);
            });
        });
    });
}(
    require("../common")
));