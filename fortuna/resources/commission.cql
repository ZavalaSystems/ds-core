match (d:Distributor)
optional match (d)-[:SPONSORS]->(other)
with d as dist, collect(distinct other.id) as children
optional match (bp)<-[:DURING]-(orders)<-[:DISTRIBUTES]-(dist)
where orders.status <> "cancelled" or orders.status <> "canceled" and id(bp) = %1$s

with dist, orders, children
optional match (orders)<-[:PART_OF]-(li)
where li.status <> "cancelled" or li.status <> "canceled"


with dist, sum(li.volume) as pcv, children
optional match (dist)-[:DISTRIBUTES]->(orders)-[:DURING]->(bp)
where id(bp) = %1$s


with dist, orders, pcv, children
optional match (orders)<-[:PART_OF]-(li)
where li.status <> "cancelled" or li.status <> "canceled" and orders.status <> "cancelled" or orders.status <> "canceled"


with dist, pcv, sum(li.volume) as ppcv, children
optional match (dist)-[:SPONSORS*]->(other)-[:DISTRIBUTES]->(orders)-[:DURING]->(bp)
where id(bp) = %1$s


with dist, pcv, ppcv, children, orders
optional match (orders)<-[:PART_OF]-(lineitems)
where orders.status <> "cancelled" or orders.status <> "canceled" and lineitems.status <> "cancelled" or lineitems.status <> "canceled"
return dist, floor(pcv) as pcv, floor(ppcv) as ppcv, children, floor((sum(lineitems.volume) + pcv)) as orgVolume