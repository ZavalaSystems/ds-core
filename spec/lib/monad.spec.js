/*jslint maxlen: 120*/
/*global
    describe: true,
    it: true,
    expect: true,
    beforeEach: true
*/
(function (m) {
    "use strict";
    describe("monad library", function () {
        describe("find", function () {
            it("should return a maybe of a value", function () {
                var out = m.find([1, 2, 3], function (x) { return x === 1; });
                expect(out.getOrElse(0)).toBe(1);
                out = m.find([1, 2, 3], function (x) { return x === 4; });
                expect(out.getOrElse(0)).toBe(0);
            });
        });
        describe("toOption", function () {
            it("should return an option from a javascript primitive", function () {
                var out = m.toOption(null);
                expect(out.getOrElse(0)).toBe(0);
                out = m.toOption(5);
                expect(out.getOrElse(0)).toBe(5);
            });
        });
        describe("get", function () {
            it("should return a maybe of an object inspection", function () {
                var out = m.get("hello")({"hello": "goodbye"});
                expect(out.getOrElse(0)).toBe("goodbye");
                out = m.get("jfdkl")({"hello": "goodbye"});
                expect(out.getOrElse(0)).toBe(0);
            });
        });
    });
}(
    require("../../lib/monad.js")
));