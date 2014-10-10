match (bp:BusinessPeriod)<-[:DURING]-(o:Order)<-[:DISTRIBUTES]-(d:Distributor)
where o.id = {orderID} and d.id = {distributorID}
set o = {map}
return bp, d, o;