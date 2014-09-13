(function (d, _) {
    "use strict";
    return _.reduce(_.range(1000), function (acc) {
        return acc.then(function (x) {
            console.log(x);
            return d.discovery("http://localhost:7474", 2);
        });
    }, d.discovery("http://localhost:7474", 2));
}(
    require("../../lib/neo4j/discovery"),
    require("lodash")
));