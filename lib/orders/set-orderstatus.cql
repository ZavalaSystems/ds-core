match (d:Distributor)<-[:PLACED_BY]-(o:Order)
where d.id = {distributorID} and o.id = {orderID}
set o.status = {status}
return d, o;