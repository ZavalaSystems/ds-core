(function (R, q, request) {
    "use strict";
    var opURI = process.env.CORE_URI || "http://localhost:8080",
        getAsync = q.denodeify(request.get),
        postAsync = q.denodeify(request.post);
    getAsync(opURI)
        .then(R.prop("1"))
        .then(JSON.parse)
        .then(R.prop("businessperiod"))
        .then(function (ops) {
            return {
                close: ops.close,
                current: ops.current
            };
        })
        .then(function (urls) {
            return getAsync(urls.current)
                .then(R.prop("1"))
                .then(JSON.parse)
                .then(function (res) {
                    return {
                        close: urls.close,
                        commissions: res.links.commissions
                    };
                })
                .then(function (urls) {
                    return postAsync(urls.close)
                        .then(function () {
                            return postAsync(urls.commissions, {form: {commit: 'true'}});
                        });
                });
        })
        .done();
}(
    require("ramda"),
    require("q"),
    require("request")
));