module.exports = (function (bilby, R, m) {
    "use strict";
    var isLeaf = null,
        label = null,
        children = null;

    function Tree(l, c) {
        this.label = l;
        this.children = c || [];
    }

    Tree.prototype.map = function (f) {
        return new Tree(f(this.label), R.map(m.map(f), this.children));
    };

    function tree(l, c) {
        return new Tree(l, c);
    }

    // Better option for this
    function mutateLabel(f, x) {
        x.label = f(x.label);
    }

    label = R.prop("label");

    children = R.prop("children");

    isLeaf = R.compose(R.eq(0), R.length, children);

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

    function toArray(tree) {
        if (isLeaf(tree)) {
            return [label(tree)];
        }
        // Compress leaf nodes down to single elements if we aren't at the root level
        var xs = R.map(function (x) {
            if (x.length === 1) {
                return x[0];
            }
            return x;
        }, R.map(toArray, children(tree)));
        return R.cons(label(tree), xs);
    }

    function toSeq(tree) {
        if (isLeaf(tree)) {
            return [label(tree)];
        }
        return R.cons(label(tree), R.chain(toSeq, children(tree)));
    }

    return bilby.environment()
        .property("Tree", Tree)
        .property("tree", tree)
        .property("label", label)
        .property("children", children)
        .property("isLeaf", isLeaf)
        .property("mkTree", R.curry(mkTree))
        .property("toArray", toArray)
        .property("toSeq", toSeq)
        .property("mutateLabel", mutateLabel);
}(
    require("bilby"),
    require("ramda"),
    require("./monad")
));
