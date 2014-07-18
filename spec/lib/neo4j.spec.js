/*jslint maxlen: 120*/
/*global
    describe: true,
    it: true,
    expect: true,
    beforeEach: true,
    spyOn: true,
    runs: true,
    waitsFor: true,
    jasmine: true
*/
(function (_, pq, request) {
    "use strict";
    describe("neo4j helper library", function () {
        var neo4j = pq("../../lib/neo4j.js", {
            request: request,
            "../config": {dbUri: "dafkjhkasdjhfkjd"}
        });
        describe("cypher function", function () {
            it("should turn a query and parameters into a promise for a list of records", function () {
                /*jslint unparam: true*/
                spyOn(request, "post").andCallFake(function (url, opts, cb) {
                    cb(null, {statusCode: 200}, {columns: ["a"], data: [["b"]]});
                });
                /*jslint unparam: false*/
                var result,
                    done;

                runs(function () {
                    neo4j.cypher("", {})
                        .then(function (res) {
                            done = true;
                            result = res;
                        });
                });

                waitsFor(function () {
                    return done;
                }, "never finished", 0);

                runs(function () {
                    expect(_.isArray(result)).toBe(true);
                    expect(result).toEqual([{a: "b"}]);
                    expect(request.post).toHaveBeenCalledWith("dafkjhkasdjhfkjd", {
                        json: {
                            query: "",
                            params: {}
                        }
                    }, jasmine.any(Function));
                });
            });
        });
    });
}(
    require("lodash"),
    require("proxyquire"),
    require("request")
));