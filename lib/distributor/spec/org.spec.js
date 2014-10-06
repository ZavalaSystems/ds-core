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
(function (org) {
    "use strict";
    describe("org", function () {
        describe("mkTreeData", function () {
            it("should generate data necessary for synthesizing trees", function () {
                var blob = {
                    d: {
                        data: {
                            id: 10,
                            firstName: "Ryan"
                        }
                    },
                    leader: {
                        data: {
                            id: 1
                        }
                    }
                };
                expect(org.mkTreeData(blob)).toEqual({id: 10, firstName: "Ryan", leaderID: 1});
            });
        });
    });
}(
    require("../org")
));