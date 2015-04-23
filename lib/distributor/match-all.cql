// FZ - 4.2.2015 - Added distinct in the return to filter out duplicates. 
match (d:Distributor)
optional match (enroller:Distributor)-[:ENROLLED]->(d)<-[:SPONSORS]-(sponsor:Distributor)
optional match (leader:Distributor)-[:SPONSORS*]->(d)
where leader.rank =~ '.*(D|d)irector.*'
return collect(distinct d), enroller, sponsor, leader;

