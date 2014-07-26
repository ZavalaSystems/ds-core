/*jslint maxlen: 120*/
/*global
    describe: true,
    it: true,
    expect: true,
    beforeEach: true,
    afterEach: true,
    spyOn: true
*/
(function (pq) {
    "use strict";
    var cache = {},
        conDb = pq("../consultant.db", {
            "../cache": cache
        });
    describe("consultant db library", function () {
        describe("list", function () {
            it("should provide a list, from cache, of consultants", function () {
                var output,
                    expected = [{a: "b"}, {b: "c"}];
                spyOn(cache, "get").andReturn(expected);
                output = conDb.list();
                expect(output).toEqual(expected);
                expect(cache.get).toHaveBeenCalledWith("consultants");
            });
        });
    });
}(
    require("proxyquire")
));