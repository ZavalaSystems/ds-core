/*jslint maxlen: 120*/
/*global
    describe: true,
    it: true,
    expect: true,
    beforeEach: true
*/
(function (_, t) {
    "use strict";
    function addCookiesToRequest(request, obj) {
        return _.merge({}, request, {cookies: obj});
    }

    function addTogglesToRequest(request, obj) {
        return addCookiesToRequest(request, {"gsati-toggles": JSON.stringify(obj)});
    }
    describe("feature toggle library", function () {
        var request = {},
            addToggles;
        describe("getToggleOff", function () {
            beforeEach(function () {
                addToggles = _.partial(addTogglesToRequest, request);
            });

            it("should get a toggle if exists", function () {
                var toggle = t.getToggleOff(addToggles({test: true}), "test");
                expect(toggle).toBe(true);
            });
            it("should default to false if no cookies", function () {
                var toggle = t.getToggleOff(request, "test");
                expect(toggle).toBe(false);
            });
            it("should default to false if no toggles at all", function () {
                var toggle = t.getToggleOff(addToggles(""), "test");
                expect(toggle).toBe(false);
            });
            it("should default to false if toggle not present", function () {
                var toggle = t.getToggleOff(addToggles({other: true}), "test");
                expect(toggle).toBe(false);
            });
            it("should default to false if broken input", function () {
                var toggle = t.getToggleOff(addCookiesToRequest(request, {"gsati-toggles": "{"}), "test");
                expect(toggle).toBe(false);
            });
        });

        describe("getToggleOn", function () {
            it("should default to true if no cookies", function () {
                var toggle = t.getToggleOn(request, "test");
                expect(toggle).toBe(true);
            });
        });
    });
}(
    require("lodash"),
    require("../toggle")
));