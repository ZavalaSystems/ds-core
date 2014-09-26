module.exports = (function (toggle, cypher) {
    "use strict";
    return function (app) {
        app.post("/nuke", function (req) {
            if (process.env.NODE_ENV === "development" && toggle.getToggleOff(req, "thermonuclearwar")) {
                return cypher.cypherToObj("match (d) optional match (d)-[r]-() delete d, r", {})
                    .then(function () {
                        return cypher.cypherToObj("create (bp:BusinessPeriod {start: {start}}) return bp", {
                            start: Date.now()
                        });
                    }).then(function () {
                        return cypher.cypherToObj("create (d:Distributor {id: 1, enrollDate: {now}})",
                            {now: Date.now()});
                    }).then(function () {
                        return {
                            status: 200,
                            content: "The only winning move is not to play.\n"
                        };
                    });
            }
            return {
                status: 403,
                content: "How about a nice game of chess?\n"
            };
        });
    };
}(
    require("./lib/toggle"),
    require("./lib/neo4j/cypher")
));