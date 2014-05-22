/*jslint maxlen: 120*/
/*global
    describe: true,
    it: true,
    expect: true,
    beforeEach: true
*/
(function (res) {
    "use strict";
    describe("response builder library", function () {
        describe("status functions", function () {
            describe("multiple choices", function () {
                it("should set the status code to 300", function () {
                    var out = res.status.multipleChoices({});
                    expect(out.status).toBe(300);
                });
            });
            describe("ok", function () {
                it("should set the status code to 200", function () {
                    var out = res.status.ok({});
                    expect(out.status).toBe(200);
                });
            });
            describe("notFound", function () {
                it("should set the status code to 404", function () {
                    var out = res.status.notFound({});
                    expect(out.status).toBe(404);
                });
            });
            describe("internalServerError", function () {
                it("should set the status code to 500", function () {
                    var out = res.status.internalServerError({});
                    expect(out.status).toBe(500);
                });
            });
        });
        describe("header functions", function () {
            describe("contentType", function () {
                it("should set the content type to a value", function () {
                    var out = res.header.contentType("application/json")({});
                    expect(out.headers["Content-Type"]).toBe("application/json");
                });
            });
        });
        describe("respond", function () {
            it("should set the content and chain the continuations.", function () {
                var out = res.respond(
                    {"hello": "goodbye"},
                    res.status.ok,
                    res.header.contentType("application/json")
                );
                expect(out.content).toEqual(JSON.stringify({"hello": "goodbye"}));
                expect(out.status).toBe(200);
                expect(out.headers["Content-Type"]).toBe("application/json");
            });
        });
    });
}(
    require("../../lib/response.js")
));