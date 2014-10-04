// Get all distributors in the organization given by org
match (org:Distributor)-[:SPONSORS*]->(d:Distributor)
where org.id = {distributorID}
return org, collect(d) as distributors;