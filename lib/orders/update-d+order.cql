match (bp:BusinessPeriod)<-[:DURING]-(o:Order)<-[:DISTRIBUTES]-(d:Distributor)
where d.id = {distributorID} and o.id = {orderID}
set o = {map}
return bp, d, o;