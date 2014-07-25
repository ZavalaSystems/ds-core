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
    });
}(
    require("../common")
));