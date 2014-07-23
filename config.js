/*jslint maxlen: 120*/
module.exports = (function (_) {
    "use strict";
    return {
        server: {
            port: 8080
        },
        mediatypes: {
            list: {
                hypermedia: {
                    consultant: "application/vnd.core.list.hypermedia+json; profile=consultant"
                }
            },
            hypermedia: {
                consultant: "application/vnd.core.hypermedia+json; profile=consultant"
            },
            consultant: "application/vnd.core.consultant+json"
        },
        templates: {
            host: _.template("${protocol}//${host}:${port}")
        },
        dbUri: "http://localhost:7474/"
    };
}(
    require("lodash")
));