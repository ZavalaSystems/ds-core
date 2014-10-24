module.exports = (function (R, request, q, config) {
    "use strict";
    var get = q.denodeify(request.get),
        body = R.prop("1"), // Upon denodification the result is an array of [response, body]
        retryGet = function (retries, delay, url) {
            var attempts = 0,
                df = q.defer();
            function resolve(body) {
                df.resolve(body);
            }
            (function attempt() {
                get(url).then(resolve, function (err) {
                    if (attempts < retries) {
                        attempts += 1;
                        setTimeout(attempt, delay);
                    } else {
                        df.reject(err);
                    }
                });
            }());
            return df.promise;
        },
        /* a -> Promise b -> (c, a) -> Promise (c, b) */
        kvPairThen = R.curry(function (f, pair) {
            return f(pair[1]).then(function (x) {
                return [pair[0], x];
            });
        });

    function discovery(root, depth, retries, delay) {
        var response = null,
            // We dont' use retries or delay for recurses
            recurseDiscovery = R.rPartial(discovery, depth - 1, undefined, undefined);
        if (!depth) { return q.when(root); }
        if (retries !== undefined && delay !== undefined) {
            response = retryGet(retries, delay, root);
        } else {
            response = get(root);
        }
        return response
            .then(body)
            .then(JSON.parse)
            .then(R.toPairs)
            // Run discovery on each key in the body
            .then(function (kvs) {
                var recursed = R.map(kvPairThen(recurseDiscovery), kvs);
                return q.all(recursed)
                    .then(R.fromPairs);
            });
    }

    return {
        discovery: discovery,
        services: discovery(config.database.uri, config.database.discoveryDepth,
            config.database.maxRetries, config.database.retryDelay)
    };
}(
    require("ramda"),
    require("request"),
    require("q"),
    require("../../config")
));