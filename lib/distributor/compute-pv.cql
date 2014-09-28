match (d:Distributor)-[:DISTRIBUTES]->(o:Order)<-[:PART_OF]-(li:LineItem)
where d.id = {distributorID} and li.status <> "cancelled"
with o, li
match (bp:BusinessPeriod)<-[:DURING]-(o)
where id(bp) = {bp}
return sum(li.volume) as volume
