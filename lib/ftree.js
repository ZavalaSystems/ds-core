module.exports = (function (bilby, R) {
    "use strict";
    function Tree(label, children) {
        this.label = label;
        this.children = children;
    }

    function tree() {
        var args = R.map(R.identity, arguments),
            label = R.head(args),
            children = args.length === 2 && bilby.isArray(args[1]) ?
                    args[1] : R.tail(args);
        return new Tree(label, children);
    }

    function label(x) {
        return x.label;
    }

    function children(x) {
        return x.children;
    }

    var isLeaf = R.compose(R.eq(0), R.length, children);

    return bilby.environment()
        .property("tree", tree)
        .property("label", label)
        .property("children", children)
        .property("isLeaf", isLeaf);
}(
    require("bilby"),
    require("ramda")
));
