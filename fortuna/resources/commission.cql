match (d:Distributor)
optional match (d)-[:SPONSORS]->(other)
with d as dist, collect(other.id) as children
start bp=node(%s)
optional match (bp)<-[:DURING]-(orders)<-[:DISTRIBUTES]-(dist)
where orders.status <> "cancelled" and orders.status <> "canceled"
with bp, dist, orders, children
optional match (orders)<-[:PART_OF]-(li)
where li.status <> "cancelled" and li.status <> "canceled"
with bp, dist, sum(li.volume) as pcv, children
optional match (dist)-[:DISTRIBUTES]->(orders)-[:DURING]->(bp)
where not(has(orders.placedFor)) or dist.id <> orders.placedFor
with bp, dist, orders, pcv, children
optional match (orders)<-[:PART_OF]-(li)
where li.status <> "cancelled" and li.status <> "canceled" and orders.status <> "cancelled" and orders.status <> "canceled"
with bp, dist, pcv, sum(li.volume) as ppcv, children
optional match (dist)-[:SPONSORS*]->(other)-[:DISTRIBUTES]->(orders)-[:DURING]->(bp)
with dist, pcv, ppcv, children, orders
optional match (orders)<-[:PART_OF]-(lineitems)
where orders.status <> "cancelled" and orders.status <> "canceled" and lineitems.status <> "cancelled" and lineitems.status <> "canceled"
return dist, floor(pcv) as pcv, floor(ppcv) as ppcv, children, floor((sum(lineitems.volume) + pcv)) as orgVolume