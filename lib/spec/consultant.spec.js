/*jslint maxlen: 120*/
/*global
    describe: true,
    it: true,
    expect: true,
    beforeEach: true,
    afterEach: true
*/
(function (cfg, _, bilby) {
    "use strict";
    describe("consultant core library", function () {
        var con = require("../consultant.js");

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

        describe("getGCV", function () {
            var nodeA = {pcv: 10},
                nodeB = {pcv: 20},
                nodeC = {pcv: 30},
                nodeD = {pcv: 40},
                local = bilby.environment()
                    .method("stubGetChildren", function (x) { return _.isEqual(x, nodeA); }, _.constant([nodeB, nodeC]))
                    .method("stubGetChildren", function (x) { return _.isEqual(x, nodeC); }, _.constant([nodeD]))
                    .method("stubGetChildren", _.constant(true), _.constant([]));

            it("should recursively calculate the GCV for a given node", function () {
                var nodeWithGCV = con.assignGCV(local.stubGetChildren, nodeA);

                expect(nodeWithGCV).toEqual({
                    pcv: 10,
                    gcv: 100
                });
            });
        });
    });
}(
    require("../../config.js"),
    require("lodash"),
    require("bilby")
));
