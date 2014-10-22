match (bp:BusinessPeriod), (d:Distributor) where not (bp)-[:PRECEDES]->() and d.id = {distributorID}
create (bp)<-[:DURING]-(o:Order {id: {orderID}, status: {orderStatus}, date: {orderDate}, placedFor: {placedFor}})<-[:DISTRIBUTES]-(d)
return bp, o, d;