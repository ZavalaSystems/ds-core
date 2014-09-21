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
(function () {
    "use strict";
    return function (x) {
        return x + 1;
    };
}(
    require("proxyquire"),
    require("q")
));