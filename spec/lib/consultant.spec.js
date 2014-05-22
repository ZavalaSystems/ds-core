/*jslint maxlen: 120*/
/*global
    describe: true,
    it: true,
    expect: true
*/
describe("consultant core library", function () {
    "use strict";
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
});