match (d:Distributor)
where d.id = {distributorID}
optional match (enroller:Distributor)-[:ENROLLED]->(d)<-[:SPONSORS]-(sponsor:Distributor)
return d, enroller, sponsor