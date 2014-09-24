match (d:Distributor)<-[:PLACED_BY]-(o:Order)
where d.id = {distributorID}
return d, o;