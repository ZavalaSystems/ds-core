module.exports = (function (bilby, R, m) {
    "use strict";
    var isLeaf = null,
        accepted = null,
        rejected = null,
        label = null,
        children = null;

    function Tree(l, c) {
        this.label = l;
        this.children = c;
    }

    Tree.prototype.map = function (f) {
        return new Tree(f(this.label), R.map(m.map(f), this.children));
    };

    function tree() {
        var args = R.map(R.identity, arguments),
            l = R.head(args),
            c = args.length === 2 && bilby.isArray(args[1]) ?
                    args[1] : R.tail(args);
        return new Tree(l, c);
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

    accepted = R.prop("accepted");
    rejected = R.prop("rejected");

    /*  Perform a DFS traversal of the tree.
        Parameters:
        - pred - function to accept or reject the labels of tree nodes
        - all - should the search continue until all available paths are exhausted or
            short circuit
        - tree - the tree to operate on
     */
     /* TASK Better implementation */
    function dfs(pred, all, tree) {
        if (pred(label(tree))) {
            return {
                accepted: [tree],
                rejected: []
            };
        }
        var acceptedLenGt0 = R.compose(R.gt(0), R.length, accepted),
            descent = R.reduce(function (a, c) {
                // Short circuit in the event of completion
                if (acceptedLenGt0(a) && !all) {
                    return a;
                }
                var child = dfs(pred, all, c);
                return {
                    accepted: R.concat(accepted(a), accepted(child)),
                    /* We rejected the current node */
                    rejected: R.concat(rejected(a), rejected(child))
                };
            }, {accepted: [], rejected: []}, children(tree));
        return {
            accepted: descent.accepted,
            rejected: R.cons(tree, descent.rejected)
        };
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

    return bilby.environment()
        .property("Tree", Tree)
        .property("tree", tree)
        .property("label", label)
        .property("children", children)
        .property("isLeaf", isLeaf)
        .property("mkTree", mkTree)
        .property("toArray", toArray)
        .property("dfs", dfs);
}(
    require("bilby"),
    require("ramda"),
    require("./monad")
));
