/*jslint maxlen: 120*/
/*global
    describe: true,
    it: true,
    expect: true,
    beforeEach: true
*/
(function (bilby, lens) {
    "use strict";
    describe("lens helpers", function () {
        describe("transform", function () {
            it("should transform values inside of nested maps", function () {
                var transformer = lens.transform(bilby.add(1), ["a", "b"]),
                    result = transformer({a: {b: 1}, c: 2});
                expect(result).toEqual({a: {b: 2}, c: 2});
            });
        });
    });
}(
    require("bilby"),
    require("../lens")
));