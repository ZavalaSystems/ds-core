import sys
import json
import uuid

# top.children = _.filter(db, function (item) {
#         return item.parent === top.id;
#     });
#     _.forEach(top.children, function (child) {
#         build_tree(child);
#     })
#     return top;

if __name__ == '__main__':
    with open(sys.argv[1]) as f:
        doc = json.load(f)

    def build_tree(top):
        top["children"] = [child for child in doc if child["parent"] == top["id"]]
        for child in top["children"]:
            build_tree(child)
        return top

    root = [x for x in doc if x['parent'] == None][0]
    print build_tree(root)

# class Account(object):
#     def __init__(self, item):
#         self.id_ = item["id"]
#         self.pcv = item["pcv"]
#         self.parent = item["parent"]
#         self.name = item["name"]
#         self.children = None

#     def __hash__(self):
#         return uuid.UUID(self.id_).int

#     def __repr__(self):
#         return "< name: {}, pcv: {}, id: {}, children: {} >".format(self.name, self.pcv, self.id_, self.children)

#     def __eq__(self, other):
#         return self.id_ == other.id_

#     def inflate_parent(self, coll):
#         if self.parent is not None:
#             new_parent = next(x for x in coll if x.parent == self.parent)
#             self.pRef = new_parent
#         else:
#             self.pRef = Account({"id":"", "pcv": "", "parent": "", "name": ""})
#         return self

# with open(sys.argv[1]) as f:
#     doc = set(map(lambda x: Account(x), json.load(f)))

# doc = {x.inflate_parent(doc) for x in doc}

# def build_tree(top):
#     children = {x for x in doc if x.pRef == top}
#     children = [build_tree(child) for child in children]
#     top.children = children
#     return top

# teh_root = next(x for x in doc if x.parent is None)
# print build_tree(teh_root)
