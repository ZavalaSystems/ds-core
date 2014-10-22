match (d:Distributor)-[:DISTRIBUTES]->(o:Order) where o.id = {orderID}
create unique (li:LineItem {id: {lineItemID}, priceCode: {priceCode}, price: {price}, volume: {volume}, status: {lineItemStatus}})-[:PART_OF]->(o)
return d, o, li;