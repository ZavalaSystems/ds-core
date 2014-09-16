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
(function (pq, q) {
    "use strict";
    var cypher = {},
        db = pq("../db", {
            "../neo4j/cypher": cypher
        });

    describe("business period db", function () {
        describe("byDate", function () {
            it("should call cypher with date parameters", function () {
                spyOn(cypher, "cypherToObj").andReturn(q.when([{bp: {}}]));
                db.byDate(new Date(2014, 8));
                expect(cypher.cypherToObj).toHaveBeenCalledWith(jasmine.any(String), {year: 2014, month: 9});
            });
        });
        describe("byId", function () {
            it("should call cypher with id parameters", function () {
                spyOn(cypher, "cypherToObj").andReturn(q.when([{bp: {}}]));
                db.byId("112");
                expect(cypher.cypherToObj).toHaveBeenCalledWith(jasmine.any(String), {id: 112});
            });
        });
    });
}(
    require("proxyquire"),
    require("q")
));