// Get all distributors in the organization given by org
match (org:Distributor)-[:SPONSORS*]->(d:Distributor), (enroller:Distributor)-[:ENROLLED]->(d)<-[:SPONSORS]-(sponsor:Distributor)
where org.id = {distributorID}
return d, enroller, sponsor;
