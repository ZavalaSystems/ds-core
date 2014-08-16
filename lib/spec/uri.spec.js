/*jslint maxlen: 120*/
/*global
    describe: true,
    it: true,
    expect: true,
    beforeEach: true,
    _: true
*/
(function (_) {
    "use strict";
    describe("uri helper library", function () {
        var uri = require("../uri"),
            request = {
                protocol: "http:",
                host: "google.com",
                port: 666,
                headers: {}
            };

        it("should allow fulfillment of absolute URI", function () {
            expect(uri.absoluteUri(request, "/hello")).toBe("http://google.com:666/hello");
        });

        it("should allow fulfillment of alternate server root", function () {
            var altRequest = _.merge({}, request, {
                headers: {"x-api-root": "gophercackes://kgfdljsl.com/path/to/large/root"}
            });
            expect(uri.absoluteUri(altRequest, "/hello")).toBe("gophercackes://kgfdljsl.com/path/to/large/root/hello");
        });
    });
}(
    require("lodash")
));