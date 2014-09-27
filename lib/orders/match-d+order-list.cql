match (d:Distributor)-[:DISTRIBUTES]->(o:Order)
where d.id = {distributorID}
return d, o;