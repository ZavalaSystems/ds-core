/*global
    describe: true,
    it: true,
    expect: true,
    beforeEach: true,
    _: true
*/
(function (fortuna) {
    "use strict";
    var fortunaOut = {
        children: [],
        rank: "Ambassador",
        "group-volume": 1200,
        "qualified-ambassadors": 1,
        director: false,
        "team-volume": 800,
        pcv: 100,
        commissions: 0,
        qualified: false,
        orgVolume: 1500,
        "qualified-directors": 2,
        dist: {
            lastName: "Nicholas",
            firstName: "Anthony",
            rank: "Ambassador",
            id: 1534,
            enrollDate: 1406160000000
        },
        ppcv: 80
    };
    describe("fortuna", function () {
        describe("personalVolume", function () {
            it("should get from fortuna output", function () {
                expect(fortuna.personalVolume(fortunaOut)).toEqual(100);
            });
        });
        describe("groupVolume", function () {
            it("should get from fortuna output", function () {
                expect(fortuna.groupVolume(fortunaOut)).toEqual(1200);
            });
        });
        describe("orgVolume", function () {
            it("should get from fortuna output", function () {
                expect(fortuna.orgVolume(fortunaOut)).toEqual(1500);
            });
        });
        describe("directors", function () {
            it("should get from fortuna output", function () {
                expect(fortuna.directors(fortunaOut)).toEqual(2);
            });
        });
        describe("ambassadors", function () {
            it("should get from fortuna output", function () {
                expect(fortuna.ambassadors(fortunaOut)).toEqual(1);
            });
        });
    });
}(
    require("../fortuna")
));