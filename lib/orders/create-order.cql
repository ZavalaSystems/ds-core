match (bp:BusinessPeriod) where not (bp)-[:PRECEDES]->(), (d:Distributor) where d.id = {distributorID}
create (bp)<-[:DURING]-(o:Order {id: {orderID}, status: {orderStatus}, date: {orderDate}})-[:DISTRIBUTES]->(d)
return bp, o, d;