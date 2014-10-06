// Get all distributors in the organization given by org
match (org:Distributor)-[:SPONSORS*]->(d:Distributor)
where org.id = {distributorID}
with d,
match (leader:Distributor)-[:SPONSORS*]->(d:Distributor)
return d, leader;
