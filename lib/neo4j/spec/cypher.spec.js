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
        var neo4j = pq("../cypher", {
            request: request,
            "./discovery": {services: {then: function (cb) { return cb({data: {cypher: "dafkjhkasdjhfkjd"}}); }}}
        });

        function cypherTest(ret, f, exp) {
            /*jslint unparam: true*/
            spyOn(request, "post").andCallFake(function (url, opts, cb) {
                cb(null, {statusCode: 200}, ret);
            });
            /*jslint unparam: false*/
            var result,
                done;

            runs(function () {
                neo4j.cypherWithTransform("", {}, f)
                    .then(function (res) {
                        done = true;
                        result = res;
                    });
            });

            waitsFor(function () {
                return done;
            }, "never finished", 0);

            runs(function () {
                expect(result).toEqual(exp);
                expect(request.post).toHaveBeenCalledWith("dafkjhkasdjhfkjd", {
                    json: {
                        query: "",
                        params: {}
                    }
                }, jasmine.any(Function));
            });
        }

        function failCypher() {
            var args = _.toArray(arguments),
                fail = false,
                done;
            /*jslint unparam: true*/
            spyOn(request, "post").andCallFake(function (url, opts, cb) {
                cb.apply(null, args);
            });
            /*jslint unparam: false*/

            runs(function () {
                neo4j.cypher("", {})
                    .then(null, function () {
                        done = true;
                        fail = true;
                    });
            });

            waitsFor(function () {
                return done;
            }, "never finised", 0);

            runs(function () {
                expect(fail).toBe(true);
            });
        }

        describe("cypher function", function () {
            it("should turn a query and parameters into a promise for a list of records", function () {
                cypherTest({columns: ["a"], data: [["b"]]}, _.identity, {columns: ["a"], data: [["b"]]});
            });
            it("should additionally take a transform function", function () {
                function sum(l) { return _.reduce(l, function (a, b) { return a + b; }, 0); }
                function trans(body) {
                    return sum(body.data[0]);
                }
                cypherTest({columns: ["a"], data: [[1, 2, 3]]}, trans, 6);
            });
            it("should reject if there is an http err.", function () {
                failCypher({}, null, null);
            });
            it("should reject if there is a non 200 status code.", function () {
                failCypher(null, {statusCode: 123}, null);
            });
        });

        describe("cypher to js function", function () {
            it("should take standard cypher output and make a list of js objs.", function () {
                expect(neo4j.toJsObjs({columns: ["a"], data: [["b"]]})).toEqual([{a: "b"}]);
            });
        });
    });
}(
    require("lodash"),
    require("proxyquire"),
    require("request")
));