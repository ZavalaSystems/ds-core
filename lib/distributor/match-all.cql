match (d:Distributor)
optional match (enroller:Distributor)-[:ENROLLED]->(d)<-[:SPONSORS]-(sponsor:Distributor)
return d, enroller, sponsor