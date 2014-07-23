/*jslint maxlen: 120*/
/*global
    describe: true,
    it: true,
    expect: true,
    beforeEach: true
*/
(function () {
    "use strict";
    describe("uri helper library", function () {
        var uri = require("../uri"),
            request = {
                protocol: "http:",
                host: "google.com",
                port: 666
            };

        it("should allow fulfillment of absolute URI", function () {
            expect(uri.absoluteUri(request, "/hello")).toBe("http://google.com:666/hello");
        });
    });
}());