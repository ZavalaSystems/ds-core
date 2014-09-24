match (bp:BusinessPeriod)<-[:DURING]-(o:Order)-[:PLACED_BY]->(d:Distributor)
where o.id = {orderID} and d.id = {distributorID}
return bp, o, d;