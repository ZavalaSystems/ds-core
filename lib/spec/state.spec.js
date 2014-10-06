/*jslint maxlen: 120*/
/*global
    describe: true,
    it: true,
    expect: true,
    beforeEach: true,
    _: true
*/
(function (R, state) {
    "use strict";
    describe("state", function () {
        describe("pure", function () {
            it("should produce a state with a constant value", function () {
                expect(state.pure(5)([])).toEqual([5, []]);
            });
        });
        describe("map", function () {
            it("should alter the value while leaving the state", function () {
                expect(state.map(state.map(state.pure(5), R.add(1)), R.multiply(2))([])).toEqual([12, []]);
            });
        });
    });
}(
    require("ramda"),
    require("../state")
));