/*jslint maxlen: 120*/
/*global
    describe: true,
    it: true,
    expect: true,
    beforeEach: true,
    afterEach: true
*/
(function (d) {
    "use strict";
    describe("distributor core library", function () {
        describe("input precondition tests", function () {
            describe("isValidPartial", function () {
                it("should return true when all fields are present", function () {
                    expect(d.isValidPartial({distributorID: "1", firstName: "Ryan", lastName: "Zeigler"}))
                        .toBe(true);
                });
                it("should return false when distributorID is missing", function () {
                    expect(d.isValidPartial({firstName: "Ryan", lastName: "Zeigler"}))
                        .toBe(false);
                });
                it("should return false when firstName is mising", function () {
                    expect(d.isValidPartial({distributorID: "1", lastName: "Zeigler"}))
                        .toBe(false);
                });
                it("should return false when lastName is missing", function () {
                    expect(d.isValidPartial({distributorID: "1", firstName: "Ryan"}))
                        .toBe(false);
                });
            });
            describe("isValidUpgrade", function () {
                it("should return true when all fields are present and valid", function () {
                    expect(d.isValidUpgrade({
                        distributorID: "1",
                        enrollerID: "1",
                        sponsorID: "1",
                        enrollDate: "10/1/2015",
                        rank: "Ambassador"
                    })).toBe(true);
                });
                it("should return false when enrollerID is missing", function () {
                    expect(d.isValidUpgrade({sponsorID: "1", enrollDate: "10/1/2015", rank: "Ambassador"}))
                        .toBe(false);
                });
                it("should return false when sponsorID is missing", function () {
                    expect(d.isValidUpgrade({enrollerID: "1", enrollDate: "10/1/2015", rank: "Ambassador"}))
                        .toBe(false);
                });
                it("should return false when date is missing", function () {
                    expect(d.isValidUpgrade({enrollerID: "1", sponsorID: "1", rank: "Ambassador"}))
                        .toBe(false);
                });
                it("should return false when the date is invalid", function () {
                    expect(d.isValidUpgrade({
                        enrollerID: "1",
                        sponsorID: "1",
                        enrollDate: "Banana",
                        rank: "Ambassador"
                    })).toBe(false);
                });
                it("should return false when rank is missing", function () {
                    expect(d.isValidUpgrade({enrollerID: "1", sponsorID: "1", enrollDate: "10/1/2015"}))
                        .toBe(false);
                });
            });
            describe("isValidFull", function () {
                it("should return true when all fields are present and valid", function () {
                    expect(d.isValidFull({
                        distributorID: "2",
                        enrollerID: "1",
                        sponsorID: "1",
                        firstName: "Ryan",
                        lastName: "Zeigler",
                        enrollDate: "10/1/2015",
                        rank: "Ambassador"
                    })).toBe(true);
                });
                /*  isValidFull is constructor by composing isValidUpgrade and isValidPartial,
                    thus the remainder isn't tested
                 */
            });
        });
        describe("transformDateToOffset", function () {
            it("should transform nested dates", function () {
                var date = new Date();
                expect(d.transformEnrollDateToOffset({
                    firstName: "Ryan",
                    lastName: "Zeigler",
                    enrollDate: date.toISOString()
                })).toEqual({
                    firstName: "Ryan",
                    lastName: "Zeigler",
                    enrollDate: date.getTime()
                });
            });
        });
        /*
        describe("consultant couch cleanup", function () {
            it("should provide a function to remove couch implementation details.", function () {
                var item = {
                        id: "hello",
                        something: "orother"
                    },
                    output = con.clean(item);

                expect(output.id).toBeUndefined();
            });
        });

        describe("getGCV", function () {
            var nodeA = {pcv: 10},
                nodeB = {pcv: 20},
                nodeC = {pcv: 30},
                nodeD = {pcv: 40},
                local = bilby.environment()
                    .method("stubGetChildren", function (x) { return _.isEqual(x, nodeA); }, _.constant([nodeB, nodeC]))
                    .method("stubGetChildren", function (x) { return _.isEqual(x, nodeC); }, _.constant([nodeD]))
                    .method("stubGetChildren", _.constant(true), _.constant([]));

            it("should recursively calculate the GCV for a given node", function () {
                var nodeWithGCV = con.assignGCV(local.stubGetChildren, nodeA);

                expect(nodeWithGCV).toEqual({
                    pcv: 10,
                    gcv: 100
                });
            });
        });
        */
    });
}(
    require("../index")
));
