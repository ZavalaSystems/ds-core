module.exports = (function (R, bilby, q, request, config) {
    "use strict";
    var errorStage = function (response) {
            if (response[0].statusCode >= 400) {
                throw new Error("HTTP Error: " + response[0].statusCode);
            }
            return response[1];
        },
        body = R.prop("1"),
        get = q.denodeify(request.get),
        post = q.denodeify(request.post),
        put = q.denodeify(request.put),
        uri = config.couch.uri,
        getDB = function (name) {
            return get(uri + "/" + name)
                .then(errorStage)
                .then(body);
        },
        createDB = function (name) {
            return put(uri + "/" + name)
                .then(errorStage)
                .then(body);
        },
        createDocument = R.curry(function (db, doc) {
            return post(uri + "/" + db, {json: doc})
                .then(errorStage)
                .then(body);
        }),
        createManyDocuments = R.curry(function (db, docs) {
            return post(uri + "/" + db + "/_bulk_docs", {json: {docs: docs}})
                .then(errorStage)
                .then(body);
        });

    return bilby.environment()
        .property("getDB", getDB)
        .property("createDB", createDB)
        .property("createDocument", createDocument)
        .property("createManyDocuments", createManyDocuments);
}(
    require("ramda"),
    require("bilby"),
    require("q"),
    require("request"),
    require("../config")
));