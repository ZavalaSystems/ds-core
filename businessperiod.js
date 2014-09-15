/*jslint maxlen: 120*/
module.exports = (function(mach, _, bilby) {
    "use strict";
    var local = bilby.environment();

    function hasDate(request) {
        return request.query.d != null;
    }

    function formatDate(date) {
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        return year.toString() + (month < 10 ? "0"+month : month.toString());
    }

    function datePeriod(request) {
        var date = new Date(request.query.d);
        if (_.isNaN(date.getFullYear())) {
            return 404;
        } else {
            return mach.json(formatDate(date));
        }
    }

    function todayPeriod(request) {
        return mach.json(formatDate(new Date()));
    }

    var local = bilby.environment()
        .method("period", hasDate, datePeriod)
        .method("period", _.constant(true), todayPeriod);

    return function(app) {
        app.get("/bp", local.period);
    }
}(
    require("mach"),
    require("lodash"),
    require("bilby")
));