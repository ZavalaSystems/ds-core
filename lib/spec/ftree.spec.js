/*jslint maxlen: 120*/
/*global
    describe: true,
    it: true,
    expect: true,
    beforeEach: true,
    _: true
*/
(function (R, ftree) {
    "use strict";
    describe("ftree", function () {
        describe("tree", function () {
            it("should create a leaf node when given a single argument", function () {
                var node = ftree.tree("1");
                expect(node.label).toEqual("1");
                expect(node.children).toEqual([]);
            });
            it("should create a tree node when given multiple arguments", function () {
                var node = ftree.tree("1",
                        ftree.tree("2"),
                        ftree.tree("3"));
                expect(node.label).toEqual("1");
                expect(node.children.length).toEqual(2);
                expect(node.children[0].label).toEqual("2");
            });
            it("should create a tree node when passed an array as the second argument", function () {
                var node = ftree.tree("1", [
                        ftree.tree("2"),
                        ftree.tree("3")
                    ]);
                expect(node.label).toEqual("1");
                expect(node.children.length).toEqual(2);
                expect(node.children[0].label).toEqual("2");
                expect(node.children[1].label).toEqual("3");
            });
        });
        describe("label", function () {
            it("should return the label of a node", function () {
                expect(ftree.label(ftree.tree("1"))).toEqual("1");
            });
        });
        describe("children", function () {
            it("should return the children of a node", function () {
                expect(ftree.children(ftree.tree("1", [
                    ftree.tree("2"),
                    ftree.tree("3")
                ]))).toEqual([
                    ftree.tree("2"),
                    ftree.tree("3")
                ]);
            });
        });
        describe("isLeaf", function () {
            it("should return true when no children are present", function () {
                expect(ftree.isLeaf(ftree.tree("1"))).toEqual(true);
            });
            it("should return false when children are present", function () {
                expect(ftree.isLeaf(ftree.tree("1", [
                    ftree.tree("2"),
                    ftree.tree("3")
                ]))).toEqual(false);
            });
        });
        describe("mkTree", function () {
            function Record(id, pid) {
                var self = this;
                self.id = id;
                self.pid = pid;
            }

            function fid(x) {
                return x.id;
            }

            function pfid(x) {
                return x.pid;
            }

            it("should work with just a root", function () {
                expect(ftree.mkTree(R.identity, R.identity, [], 1)).toEqual(ftree.tree(1));
            });
            it("should construct a tree", function () {
                var records = [new Record(2, 1), new Record(3, 1), new Record(4, 2), new Record(5, 2)],
                    root = new Record(1),
                    tree = ftree.mkTree(fid, pfid, records, root);
                expect(tree.label.id).toEqual(1);
                expect(tree.children[0].label).toEqual(new Record(2, 1));
                expect(tree.children[1].label).toEqual(new Record(3, 1));
                expect(tree.children[0].children[0].label).toEqual(new Record(4, 2));
                expect(tree.children[0].children[1].label).toEqual(new Record(5, 2));
                expect(tree.children[1].children.length).toEqual(0);
            });
        });
        describe("dfs", function () {
            var isEven = R.compose(R.eq(0), R.rPartial(R.modulo, 2));
            it("should collect only the first result", function () {
                var result = ftree.dfs(isEven, false, ftree.tree(1, [
                    ftree.tree(2, []),
                    ftree.tree(3, [])
                ]));
                expect(result.rejected[0].label).toEqual(1);
                expect(result.accepted[0].label).toEqual(2);
            });
            it("should collect first found via dfs when all is specified", function () {
                var result = ftree.dfs(isEven, true, ftree.tree(1, [
                    ftree.tree(2, [
                        ftree.tree(3, []),
                        ftree.tree(4, [])
                    ]),
                    ftree.tree(5, [
                        ftree.tree(6, []),
                        ftree.tree(7, [])
                    ])
                ]));
                expect(result.rejected.length).toEqual(3);
                expect(result.accepted.length).toEqual(2);
            });
        });
        describe("toArray", function () {
            it("should convert a tree to an array", function () {
                var arr = ftree.toArray(ftree.tree(1, [
                    ftree.tree(2, [
                        ftree.tree(3, []),
                        ftree.tree(4, [])
                    ]),
                    ftree.tree(5, [])
                ]));
                expect(arr).toEqual([1, [[2, [[3], [4]]], [5]]]);
            });
        });
        describe("map", function () {
            it("should implement functor properties for a tree", function () {
                var altered = ftree.tree(1, [
                    ftree.tree(3, []),
                    ftree.tree(5, [])
                ]).map(R.multiply(2));
                expect(altered.label).toEqual(2);
                expect(altered.children[0].label).toEqual(6);
                expect(altered.children[1].label).toEqual(10);
            });
        });
    });
}(
    require("ramda"),
    require("../ftree")
));
