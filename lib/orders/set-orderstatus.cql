match (d:Distributor)-[:DISTRIBUTES]->(o:Order)
where d.id = {distributorID} and o.id = {orderID}
set o.status = {status}
return d, o;