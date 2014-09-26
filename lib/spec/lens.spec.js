/*jslint maxlen: 120*/
/*global
    describe: true,
    it: true,
    expect: true,
    beforeEach: true
*/
(function (bilby, lens) {
    "use strict";
    describe("lens", function () {
        describe("transform", function () {
            it("should transform values inside of nested maps", function () {
                var transformer = lens.transform(bilby.add(1), ["a", "b"]),
                    result = transformer({a: {b: 1}, c: 2});
                expect(result).toEqual({a: {b: 2}, c: 2});
            });
            it("should not break when the lensed value isn't present", function () {
                var transformer = lens.transform(bilby.add(1), ["a"]);
                expect(transformer({c: 2})).toEqual({c: 2});
            });
        });
    });
    describe("common lens transforms", function () {
        describe("mkCents", function () {
            it("should convert decimals into ints", function () {
                expect(lens.mkCents(100.01)).toEqual(10001);
            });
            it("should convert decimal strings to ints", function () {
                expect(lens.mkCents("100.01")).toEqual(10001);
            });
            it("should truncate extra decimal places", function () {
                expect(lens.mkCents("100.015")).toEqual(10001);
            });
        });
    });
}(
    require("bilby"),
    require("../lens")
));