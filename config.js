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
            discoveryDepth: 2,
            maxRetries: 30,
            retryDelay: 1000
        },
        couch: {
            uri: process.env.COUCH_URI || "http://localhost:5984",
            database: "commissions",
            view: "/commissions/_design/commissions/_view/by_distributor_bp"
        },
        fortuna: {
            uri: process.env.FORTUNA_URI || "http://localhost:8081"
        }
    };
}(
    require("lodash")
));
