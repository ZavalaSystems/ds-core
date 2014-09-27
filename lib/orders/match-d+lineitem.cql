match (bp:BusinessPeriod)<-[:DURING]-(o:Order)<-[:DISTRIBUTES]-(d:Distributor), (o)<-[:PART_OF]-(li:LineItem)
where o.id = {orderID} and d.id = {distributorID} and li.id = {lineItemID}
return bp, o, d, li;