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
(function (pq, q) {
    "use strict";
    var cache = {},
        conDb = pq("../consultant.db", {
            "../cache": cache
        });
    describe("consultant db library", function () {
        describe("list", function () {
            it("should provide a list, from cache, of consultants", function () {
                var expected = [{a: "b"}, {b: "c"}],
                    done = false,
                    value = null;
                runs(function () {
                    spyOn(cache, "get").andReturn(q.when(expected));
                    conDb.list().then(function (val) {
                        value = val;
                        done = true;
                    });
                });

                waitsFor(function () {
                    return done;
                }, "never finished", 0);

                runs(function () {
                    expect(value).toEqual(expected);
                    expect(cache.get).toHaveBeenCalledWith("consultants");
                });
            });
        });
    });
}(
    require("proxyquire"),
    require("q")
));