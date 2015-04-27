// Get all distributors in the organization given by org
// FZ - 4-2-2015 Added a distinct in the return, to filter out dupes as part of the cartesian product.
// FZ - Also added collect, to return distinct nodes of an org. *Derp* -  


match (org:Distributor)-[:SPONSORS*]->(d:Distributor), (enroller:Distributor)-[:ENROLLED]->(d)<-[:SPONSORS]-(sponsor:Distributor)
where org.id = {distributorID}
return  distinct d, enroller, sponsor;
