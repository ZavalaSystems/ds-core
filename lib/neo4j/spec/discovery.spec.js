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
(function (pq, request) {
    "use strict";
    describe("neo4j discovery lib", function () {
        var discTrivial = pq("../discovery", {
                request: request,
                "../../config": {database: {uri: "http://example.com", discoveryDepth: 0, maxRetries: 0, retryDelay: 0}}
            }),
            discoveryTable = {
                "http://example.com": JSON.stringify({a: "http://example.com/a", b: "http://example.com/b"}),
                "http://example.com/a": JSON.stringify({c: "http://example.com/a/c", d: "http://example.com/a/d"}),
                "http://example.com/b": JSON.stringify({e: "http://example.com/b/e", f: "http://example.com/b/f"})
            };
        describe("discovery", function () {
            it("should return base case", function () {
                var uri,
                    done;

                runs(function () {
                    discTrivial.services.then(function (root) {
                        done = true;
                        uri = root;
                    });
                });

                waitsFor(function () { return done; }, "never finished", 0);

                runs(function () {
                    expect(uri).toBe("http://example.com");
                });
            });

            it("should return recursive case", function () {
                spyOn(request, "get").andCallFake(function (url, cb) {
                    return cb(null, {statusCode: 200}, discoveryTable[url]);
                });
                var discNormal = pq("../discovery", {
                        request: request,
                        "../../config": {
                            database: {
                                uri: "http://example.com",
                                discoveryDepth: 2,
                                maxRetries: 0,
                                retryDelay: 0
                            }
                        }
                    }),
                    tree = {},
                    done = false;

                runs(function () {
                    discNormal.services.then(function (response) {
                        done = true;
                        tree = response;
                    });
                });

                waitsFor(function () { return done; }, "never finished", 0);

                runs(function () {
                    expect(tree).toEqual({
                        a: {c: "http://example.com/a/c", d: "http://example.com/a/d"},
                        b: {e: "http://example.com/b/e", f: "http://example.com/b/f"}
                    });
                });
            });

            it("should fail if it encounters a failure in the discovery tree.", function () {
                spyOn(request, "get").andCallFake(function (url, cb) {
                    return cb(null, {statusCode: 404}, discoveryTable[url]);
                });
                var discNormal = pq("../discovery", {
                        request: request,
                        "../../config": {
                            database: {
                                uri: "http://example.com",
                                discoveryDepth: 2,
                                maxRetries: 0,
                                retryDelay: 0
                            }
                        }
                    }),
                    fail = false,
                    done = false;

                runs(function () {
                    discNormal.services.then(null, function () {
                        fail = true;
                        done = true;
                    });
                });

                waitsFor(function () { return done; }, "never finished", 0);

                runs(function () {
                    expect(fail).toBe(true);
                });
            });

            it("should fail if it encounters a failure the http request.", function () {
                spyOn(request, "get").andCallFake(function (url, cb) {
                    return cb({}, null, url);
                });
                var discNormal = pq("../discovery", {
                        request: request,
                        "../../config": {
                            database: {
                                uri: "http://example.com",
                                discoveryDepth: 2,
                                maxRetries: 0,
                                retryDelay: 0
                            }
                        }
                    }),
                    fail = false,
                    done = false;

                runs(function () {
                    discNormal.services.then(null, function () {
                        fail = true;
                        done = true;
                    });
                });

                waitsFor(function () { return done; }, "never finished", 0);

                runs(function () {
                    expect(fail).toBe(true);
                });
            });
        });
    });
}(
    require("proxyquire"),
    require("request")
));