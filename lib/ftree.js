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

    /*  Construct a tree given a set of records, a root, and id functions
        Preconditions:
            - records and root are the same type of object
            - fid produces an id from a record
            - pfid produces the id of a parent from a record
            - root is the root object of the tree
    */
    function mkTree(fid, pfid, records, root) {
        var isRootID = R.eq(fid(root)),
            isRootChild = R.compose(isRootID, pfid),
            xs = R.filter(isRootChild, records),
            partialSelf = R.lPartial(mkTree, fid, pfid, records);
        // Recursivlely construct the sub tree
        return tree(root, R.map(partialSelf, xs));
    }

    return bilby.environment()
        .property("tree", tree)
        .property("label", label)
        .property("children", children)
        .property("isLeaf", isLeaf)
        .property("mkTree", mkTree);
}(
    require("bilby"),
    require("ramda")
));
