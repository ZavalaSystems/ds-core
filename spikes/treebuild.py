import sys
import json
import uuid

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
