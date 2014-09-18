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
        describe("getById", function () {
            it("should call cypher with id parameters", function () {
                spyOn(cypher, "cypherToObj").andReturn(q.when([{bp: {}}]));
                db.getById(112);
                expect(cypher.cypherToObj).toHaveBeenCalledWith(jasmine.any(String), {id: 112});
            });
        });
    });
}(
    require("proxyquire"),
    require("q")
));