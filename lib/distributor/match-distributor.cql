// FZ - 4.2.2015 added a distinct to filter out dupes in the return
// FZ Added collect to the return condition

match (d:Distributor)
where d.id = {distributorID}
optional match (enroller:Distributor)-[:ENROLLED]->(d)<-[:SPONSORS]-(sponsor:Distributor)
optional match (leader:Distributor)-[:SPONSORS*]->(d)
where leader.rank =~ '.*(D|d)irector.*'
return distinct d, enroller, sponsor, leader;