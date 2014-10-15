/*jslint maxlen: 120*/
module.exports = (function (_) {
    "use strict";
    return {
        server: {
            port: process.env.GSATI_API_PORT || 8080
        },
        templates: {
            host: _.template("${protocol}//${host}:${port}")
        },
        database: {
            uri: process.env.NEO4J_URI || "http://db:7474",
            discoveryDepth: 2
        },
        fortuna: {
            uri: process.env.FORTUNA_URI || "http://localhost:8081"
        }
    };
}(
    require("lodash")
));
