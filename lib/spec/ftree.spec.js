/*jslint maxlen: 120*/
/*global
    describe: true,
    it: true,
    expect: true,
    beforeEach: true,
    _: true
*/
(function (ftree) {
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
    });
}(
    require("../ftree")
));
