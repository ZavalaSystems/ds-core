/*jslint maxlen: 120*/
/*global
    jasmine: true,
    describe: true,
    it: true,
    expect: true,
    beforeEach: true,
    afterEach: true,
    spyOn: true,
    runs: true,
    waitsFor: true
*/
(function (db) {
    "use strict";
    describe("business period db", function () {
        describe("get helpers", function () {
            describe("current", function () {
                it("should return the current data from a blob", function () {
                    expect(db.current({current: {data: 5}})).toEqual(5);
                });
            });
            describe("next", function () {
                it("should return the next data from a blob", function () {
                    expect(db.next({next: {data: 5}})).toEqual(5);
                });
            });
            describe("prev", function () {
                it("should return the prev data from a blob", function () {
                    expect(db.prev({prev: {data: 5}})).toEqual(5);
                });
            });
            describe("hasPrev", function () {
                it("should return true when prev data is present", function () {
                    expect(db.hasPrev({prev: 1})).toEqual(true);
                });
                it("should return false when prev data is null", function () {
                    expect(db.hasPrev({prev: null})).toEqual(false);
                });
                it("should return false when prev data is undefined", function () {
                    expect(db.hasPrev({})).toEqual(false);
                });
            });
            describe("hasNext", function () {
                it("should return true when next data is present", function () {
                    expect(db.hasNext({next: 1})).toEqual(true);
                });
                it("should return false when next data is null", function () {
                    expect(db.hasNext({next: null})).toEqual(false);
                });
                it("should return false when next data is undefined", function () {
                    expect(db.hasNext({})).toEqual(false);
                });
            });
        });
    });
}(
    require("../db")
));