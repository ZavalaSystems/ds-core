match (d:Distributor)
optional match (enroller:Distributor)-[:ENROLLED]->(d)<-[:SPONSORS]-(sponsor:Distributor)
optional match (leader:Distributor)-[:SPONSORS*]->(d)
where leader.rank =~ '.*(D|d)irector.*'
return d, enroller, sponsor, leader