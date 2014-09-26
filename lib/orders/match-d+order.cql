match (bp:BusinessPeriod)<-[:DURING]-(o:Order)<-[:DISTRIBUTES]-(d:Distributor)
where o.id = {orderID} and d.id = {distributorID}
return bp, o, d;