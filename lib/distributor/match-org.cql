// Get all distributors in the organization given by org
match (org:Distributor)-[:SPONSORS*]->(d:Distributor)
where org.id = {distributorID}
with d
match (leader:Distributor)-[:SPONSORS*]->(d:Distributor)
where leader.rank =~ '.*(D|d)irector.*'
optional match (enroller:Distributor)-[:ENROLLED]->(d)<-[:SPONSORS]-(sponsor:Distributor)
return d, enroller, sponsor, leader;
