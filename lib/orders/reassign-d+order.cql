match (d:Distributor)-[old:DISTRIBUTES]->(o:Order)-[:DURING]->(bp:BusinessPeriod), (target:Distributor)
where d.id = {distributorID} and target.id = {target} and o.id = {orderID}
delete old
create (target)-[:DISTRIBUTES]->(o)
return o, target as d, bp;