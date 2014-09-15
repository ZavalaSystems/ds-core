/*jslint maxlen: 120*/
module.exports = (function (mach, _, bilby, response) {
    "use strict";
    function hasDate(request) {
        return request.query.d !== null;
    }

    function formatDate(date) {
        var year = date.getFullYear(),
            month = date.getMonth() + 1;
        return year.toString() + (month < 10 ? "0" + month : month.toString());
    }

    function datePeriod(request) {
        var date = new Date(request.query.d);
        if (_.isNaN(date.getFullYear())) {
            return response.status.badRequest({});
        }
        return mach.json(formatDate(date));
    }

    function todayPeriod() {
        return mach.json(formatDate(new Date()));
    }

    var local = bilby.environment()
        .method("period", hasDate, datePeriod)
        .method("period", _.constant(true), todayPeriod);

    return function (app) {
        app.get("/bp", local.period);
    };
}(
    require("mach"),
    require("lodash"),
    require("bilby"),
    require("./lib/response")
));