module.exports = (function (R, request, q, _, config) {
    "use strict";
    var get = q.denodeify(request.get),
        body = R.prop("1"), // Upon denodification the result is an array of [response, body]
        maxAttempts = 20,
        reattemptDelay = 1000;

    function discovery(root, depth) {
        var attempts = 0,
            df = null,
            attempter = null;
        if (!depth) { return q.when(root); }
        df = q.defer();
        function resolve(body) {
            df.resolve(body);
        }
        attempter = function () {
            get(root).then(body).then(JSON.parse)
                .then(resolve)
                .catch(function (err) {
                    attempts += 1;
                    if (attempts <= maxAttempts) {
                        setTimeout(attempter, reattemptDelay);
                    } else {
                        console.error("ERROR: To many discovery failures. Giving up.");
                        console.error(err);
                        df.reject(err);
                    }
                });
        }
        attempter();
        return df.promise.then(function (body) {
            var promiseBody = _.transform(body, function (newBody, item, key) {
                newBody[key] = discovery(item, depth - 1);
            });
            return q.all(_.values(promiseBody)).then(function (values) {
                return _.zipObject(_.keys(body), values);
            });
        });
    }

    return {
        discovery: discovery,
        services: discovery(config.database.uri, config.database.discoveryDepth)
    };
}(
    require("ramda"),
    require("request"),
    require("q"),
    require("lodash"),
    require("../../config")
));