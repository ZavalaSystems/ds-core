var db = require("./flatcouch.json"),
    _ = require("lodash"),
    root = _.find(db, function (x) { return _.isNull(x.parent); });

function build_tree(top) {
    return _.merge({}, top, {
        children: _.map(_.filter(db, function (x) { return x.parent === top.id}), build_tree)
    });
}

console.log(JSON.stringify(build_tree(root), null, "  "));