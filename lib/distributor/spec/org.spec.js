/*jslint maxlen: 120*/
/*global
    describe: true,
    it: true,
    expect: true,
    beforeEach: true,
    afterEach: true,
    spyOn: true,
    runs: true,
    waitsFor: true
*/
(function (org) {
    "use strict";
    describe("org", function () {
        describe("leaderID", function () {
            it("should pull the id of a leader from a blob", function () {
                expect(org.leaderID({leader: {data: {id: 1}}})).toEqual(1);
            });
        });
        describe("distributorID", function () {
            it("should pull the id of focused distributor from a result blob", function () {
                expect(org.distributorID({d: {data: {id: 1}}})).toEqual(1);
            });
        });
    });
}(
    require("../org")
));