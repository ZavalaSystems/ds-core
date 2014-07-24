module.exports = (function (request, q, _, config) {
    "use strict";
    function discovery(root, depth) {
        if (!depth) { return q.when(root); }
        var df = q.defer();
        request.get(root, function (err, response, body) {
            if (err) {
                df.reject(err);
                return;
            }
            if (response.statusCode !== 200) {
                df.reject(response);
                return;
            }
            df.resolve(JSON.parse(body));
        });
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
        services: discovery(config.database.uri, config.database.discoveryDepth)
    };
}(
    require("request"),
    require("q"),
    require("lodash"),
    require("../../config")
));