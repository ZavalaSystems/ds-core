match (o:Order) where o.id = {orderID}
create (li:LineItem {id: {lineItemID}, priceCode: {priceCode}, volume: {volume}, status: {lineItemStatus}})-[:PART_OF]->(o)
return o, li;