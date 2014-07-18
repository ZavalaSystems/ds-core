module.exports = (function (q, request, _, config) {
    "use strict";
    function cypher(query, params) {
        var df = q.defer();
        request.post(config.dbUri, {json: {query: query, params: params}}, function (err, response, body) {
            if (err) { df.reject(err); }
            if (response.statusCode !== 200) { df.reject(response); }
            var columns = body.columns,
                rows = body.data,
                records = _.map(rows, function (row) { return _.zipObject(columns, row); });
            df.resolve(records);
        });
        return df.promise;
    }

    return {
        cypher: cypher
    };
}(
    require("q"),
    require("request"),
    require("lodash"),
    require("../config")
));