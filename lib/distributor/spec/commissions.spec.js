/*global
    describe: true,
    it: true,
    expect: true,
    beforeEach: true,
    _: true
*/
(function (commissions) {
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
    describe("commissions", function () {
        describe("progressVolumes", function () {
            it("should return current volumes from fortuna output", function () {
                expect(commissions.currentVolumes(fortunaOut))
                    .toEqual({
                        personalVolume: 100,
                        groupVolume: 1200,
                        orgVolume: 1500,
                        directors: 2,
                        ambassadors: 1
                    });
            });
        });
        describe("targetVolumes", function () {
            it("should return the desired volumes from constants", function () {
                expect(commissions.targetVolumes("Associate Ambassador"))
                    .toEqual({
                        personalVolume: 25000,
                        groupVolume: 50000,
                        orgVolume: 0,
                        ambassadors: 1,
                        directors: 0
                    });
            });
        });
        describe("currentProgress", function () {
            it("should return fractional elements", function () {
                expect(commissions.currentProgress({
                    personalVolume: 25000,
                    groupVolume: 50000,
                    orgVolume: 100000,
                    directors: 4,
                    ambassadors: 2
                }, {
                    personalVolume: 12500,
                    groupVolume: 12500,
                    orgVolume: 100000,
                    directors: 3,
                    ambassadors: 1
                })).toEqual({
                    personalVolume: 0.5,
                    groupVolume: 0.25,
                    orgVolume: 1,
                    directors: 0.75,
                    ambassadors: 0.5
                });
            });
        });
        describe("mapCurrencyObj", function () {
            it("should convert fields in an object to decimals", function () {
                expect(commissions.mapCurrencyObj(["a"], {a: 100, b: 1})).toEqual({a: 1, b: 1});
            });
        });
    });
}(
    require("../commissions")
));