/*jslint maxlen: 120*/
/*global
    describe: true,
    it: true,
    expect: true,
    beforeEach: true,
    afterEach: true
*/
(function (cfg, _) {
    "use strict";
    describe("consultant core library", function () {
        var con = require("../../lib/consultant.js");

        describe("consultant couch cleanup", function () {
            it("should provide a function to remove couch implementation details.", function () {
                var item = {
                    id: "hello",
                    something: "orother"
                },
                    output = con.clean(item);

                expect(output.id).toBeUndefined();
            });
        });

        describe("hypermedia link generator", function () {
            var item,
                output;

            beforeEach(function () {
                item = {
                    id: "hello"
                };
                output = con.links(_.identity, item);
            });

            it("should provide a self link.", function () {
                expect(output.self).toEqual({
                    href: "/consultant/hello",
                    contentType: cfg.mediatypes.hypermedia.consultant
                });
            });

            it("should provide a firstLine link.", function () {
                expect(output.firstLine).toEqual({
                    href: "/consultant/hello/firstLine",
                    contentType: cfg.mediatypes.list.hypermedia.consultant
                });
            });
        });
    });
}(
    require("../../config.js"),
    require("lodash")
));
