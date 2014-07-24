module.exports = (function (q, request, _, bilby, discovery) {
    "use strict";

    var local = bilby.environment()
            .property("cypher", _.curry(function (query, params, transform, uri) {
                var df = q.defer();
                request.post(uri, {json: {query: query, params: params}},
                    function (err, response, body) {
                        if (err) {
                            df.reject(err);
                            return;
                        }
                        if (response.statusCode !== 200) {
                            df.reject(response);
                            return;
                        }
                        df.resolve(transform(body));
                    });
                return df.promise;
            }));

    function toJsObjs(cypherData) {
        var columns = cypherData.columns,
            rows = cypherData.data;

        return _.map(rows, function (row) { return _.zipObject(columns, row); });
    }

    function cypher(query, params, transform) {
        return discovery.services.then(local.cypher(query, params, transform));
    }

    return {
        cypherWithTransform: _.curry(cypher),
        cypher: _.curry(_.partialRight(cypher, _.identity)),
        cypherToObj: _.curry(_.partialRight(cypher, toJsObjs)),
        toJsObjs: toJsObjs
    };
}(
    require("q"),
    require("request"),
    require("lodash"),
    require("bilby"),
    require("./discovery")
));