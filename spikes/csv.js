/*jslint maxlen:120*/
(function (fs, csv, q, _, request, pb) {
    "use strict";
    var hasError = _.identity;

    function selectSecond(e, d) { return d; }

    function getCsvData(file) {
        return function () {
            return pb.asPromise(
                fs.readFile,
                [file, {encoding: "utf8"}],
                hasError,
                selectSecond
            ).then(function (data) {
                return pb.asPromise(
                    csv.parse,
                    [data],
                    hasError,
                    _.compose(function (d) { return [d[0], d.slice(1)]; }, selectSecond)
                );
            });
        };
    }

    function sanitize(header) {
        return header
            .replace(" ", "")
            .replace(/\W/, "")
            .replace("-", "")
            .replace("#", "")
            .toLowerCase();
    }

    function makeObjectsFromCsv(data) {
        var headers = _.map(_.first(data), sanitize),
            info = _.last(data);

        return _.reduce(info, function (acc, item) {
            return acc.concat(_.reduce(headers, function (acc2, header, pos) {
                acc2[header] = item[pos];
                return acc2;
            }, {}));
        }, [
            {rep: "0", sponsorrep: "0"},
            {rep: "1", sponsorrep: "0"},
            {rep: "5", sponsorrep: "0"}
        ]);
    }

    function stripInfo(data) {
        return _.reduce(data, function (acc, item) {
            _.each(stripInfo.stripFields, function (field) {
                delete item[field];
            });
            return acc.concat(item);
        }, []);
    }
    stripInfo.stripFields = ["phone", "url", "joindate", "rank", "company", "address2", "email", "coappemail"];

    function cleanup(node) {
        var n = _.merge({}, node);
        delete n.children;
        return n;
    }

    /*jslint unparam:true*/
    function notCreated(err, res, bod) {
        return res.statusCode !== 201 ? bod : null;
    }

    function getLocation(err, res) {
        return res.headers.location;
    }
    /*jslint unparam:false*/

    function createNodeInDb(node) {
        return pb.asPromise(
            request.post,
            ["http://localhost:7474/db/data/node", {json: node}],
            [hasError, notCreated],
            getLocation
        );
    }

    function createReportsTo(from, to) {
        return pb.asPromise(
            request.post,
            [from + "/relationships", {json: {to: to, type: "REPORTS_TO"}}],
            [hasError, notCreated],
            getLocation
        );
    }

    dropDatabase()
        .then(getCsvData("data.csv"))
        .then(makeObjectsFromCsv)
        .then(function (data) {
            var urlsPromise = _.compose(q.all, _.partialRight(_.map, _.compose(createNodeInDb, cleanup)));
            return urlsPromise(data)
                .then(function (urls) { return _.zip(data, urls); });
        })
        .then(function (map) {
            _.each(map, function (item) {
                var toUrl = _.find(map, function (kvpair) { return kvpair[0].rep === item[0].sponsorrep; })[1];
                createReportsTo(item[1], toUrl);
            });
        })
        .done();
}(
    require("fs"),
    require("csv"),
    require("q"),
    require("lodash"),
    require("request"),
    require("./promisebuilder")
));