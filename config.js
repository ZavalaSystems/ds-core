/*jslint maxlen: 120*/
module.exports = (function (_) {
    "use strict";
    return {
        server: {
            port: process.env.GSATI_API_PORT
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
        database: {
            uri: process.env.NEO4J_URI,
            discoveryDepth: 2
        }
    };
}(
    require("lodash")
));
