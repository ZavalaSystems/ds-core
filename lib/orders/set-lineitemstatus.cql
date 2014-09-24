match (d:Distributor)<-[:PLACED_BY]-(o:Order)<-[:PART_OF]-(li:LineItem)
where d.id = {distributorID} and o.id = {orderID} and li.id = {lineItemID}
set li.status = {status}
return d, o, li;