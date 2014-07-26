/*global
    describe: true,
    it: true,
    expect: true,
    beforeEach: true,
    afterEach: true,
    runs: true,
    waitsFor: true
*/
(function (_, q, cache) {
    "use strict";
    describe("runtime cache", function () {
        describe("expiry cache", function () {
            it("should allow cache and refresh based on time.", function () {
                var val,
                    retrieved = false,
                    incrementer = (function () {
                        var value = 0;
                        return function () {
                            value += 1;
                            return value;
                        };
                    }());

                runs(function () {
                    cache.timed("myval", 50, incrementer)
                        .then(function (value) {
                            val = value;
                            retrieved = true;
                        });
                });

                waitsFor(function () {
                    return retrieved;
                }, "cache never updated", 0);

                runs(function () {
                    expect(val).toBe(1);
                });

                runs(function () {
                    retrieved = false;
                    var df = q.defer();
                    _.delay(function () {
                        df.resolve();
                    }, 60);
                    return df.promise
                        .then(function () {
                            return cache.get("myval");
                        })
                        .then(function (value) {
                            retrieved = true;
                            val = value;
                        });
                });

                waitsFor(function () {
                    return retrieved;
                }, "value never retrieved", 60);

                runs(function () {
                    expect(val).toBe(2);
                });
            });
        });
    });
}(
    require("lodash"),
    require("q"),
    require("../cache")
));