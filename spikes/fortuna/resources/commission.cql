match (d:Distributor)
optional match (d)-[:SPONSORS]->(other)
with d as dist, collect(other.id) as children
start bp=node({nodeId})
optional match (bp)<-[:DURING]-(orders)<-[:DISTRIBUTES]-(dist)
where orders.status <> "cancelled"
with dist, orders, children
optional match (orders)<-[:PART_OF]-(li)
where li.status <> "cancelled"
with dist, sum(li.volume) as pcv, children
optional match (dist)-[:SPONSORS*]->(other)-[:DISTRIBUTES]->(orders)<-[:PART_OF]-(lineitems)
where orders.status <> "cancelled" and lineitems.status <> "cancelled"
return dist, floor(pcv*100) as pcv, children, floor((sum(lineitems.volume) + pcv)*100) as orgVolume