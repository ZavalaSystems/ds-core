/*global
    describe: true,
    it: true,
    expect: true,
    beforeEach: true,
    _: true
*/
(function (bp) {
    "use strict";
    describe("businessperiod helper library", function () {
        describe("isDateString", function () {
            it("should return true for yyyy-mm-dd strings.", function () {
                expect(bp.isDateString("2014-12-01")).toEqual(true);
            });
            it("should return false for others.", function () {
                expect(bp.isDateString("201401")).toEqual(false);
            });
        });
        describe("decodeDate", function () {
            it("should extract dates.", function () {
                expect(bp.decodeDate("2014-12-02")).toEqual(new Date(2014, 12, 2));
            });
        });
        describe("isSpecString", function () {
            it("should return true for BP specs", function () {
                expect(bp.isSpecString("201412")).toEqual(true);
            });
            it("should return false for others", function () {
                expect(bp.isSpecString("2014-12-02")).toEqual(false);
            });
        });
        describe("decodeSpec", function () {
            it("should extract dates.", function () {
                expect(bp.decodeSpec("201412")).toEqual(new Date(2014, 12));
            });
        });
    });
}(
    require("../index")
));