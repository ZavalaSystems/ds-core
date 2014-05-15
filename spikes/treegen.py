from random import choice, shuffle
import json
import sys
from uuid import uuid4

with open("names.txt") as namefile:
    names = [n.strip() for n in namefile.readlines()]

fnames = list(names)
lnames = list(names)
shuffle(fnames)
shuffle(lnames)

supernames = ("{} {}".format(j, k) for k in lnames for j in fnames)

def calc_gv(node):
    if len(node["children"]) == 0:
        return node["pcv"]
    else:
        return node["pcv"] + sum([calc_gv(n) for n in node["children"]])

def make_children(num, *flist):
    return [choice(flist)() for i in range(num)]

def make_rec(level, gv, children):
    estimate_pcv = gv - sum([calc_gv(n) for n in children])
    return {
        "pcv": estimate_pcv if estimate_pcv > 500 else 500,
        "name": next(supernames),
        "children": children,
        "class": level
    }

def make_wa():
    return make_rec("Wine Ambassador", 500, [])

def make_aa():
    children = make_children(1, make_wa)
    return make_rec("Associate Ambassador", 500, children)

def make_sa():
    children = make_children(2, make_wa, make_aa)
    return make_rec("Senior Ambassador", 2500, children)

def make_ta():
    children = make_children(3, make_wa, make_aa, make_sa)
    return make_rec("Team Ambassador", 5000, children)

def make_ea():
    children = make_children(1, make_ta)
    children.extend(make_children(4, make_wa, make_aa, make_sa, make_ta))
    return make_rec("Executive Ambassador", 10000, children)

def make_sea():
    children = make_children(1, make_ea)
    children.extend(make_children(2, make_ea, make_ta))
    children.extend(make_children(6, make_ea, make_ta, make_sa, make_aa, make_wa))
    return make_rec("Senior Executive Ambassador", 30000, children)

def make_ca():
    children = make_children(2, make_sea, make_ea)
    children.extend(make_children(4, make_sea, make_ea, make_ta))
    children.extend(make_children(8, make_sea, make_ea, make_ta, make_sa, make_aa, make_wa))
    return make_rec("Crystal Ambassador", 70000, children)

def make_da():
    children = make_children(4, make_ca, make_sea, make_ea)
    children.extend(make_children(8, make_ca, make_sea, make_ea, make_ta))
    children.extend(make_children(12, make_ca, make_sea, make_ea, make_ta, make_sa, make_aa, make_wa))
    return make_rec("Diamond Ambassador", 100000, children)

def count_tree(top):
    return 1 + len(top["children"]) + sum([count_tree(n) for n in top["children"]])

def couch_reduce(node, parent, acc):
    id_ = str(uuid4())
    acc.append({
        "pcv": node["pcv"],
        "id": id_,
        "name": node["name"],
        "parent": parent
    })
    for child in node["children"]:
        couch_reduce(child, id_, acc)
    return acc

print json.dumps(couch_reduce(eval(sys.argv[1], globals(), locals())(), None, []), indent=2)

