// Get all distributors in the organization given by org
// FZ - 4-2-2015 Added a distinct in the return, to filter out dupes as part of the cartesian product.
// Filtering Dupes


match 	(org:Distributor)-[:SPONSORS*]->(d:Distributor), (enroller:Distributor)-[:ENROLLED]->(d)<-[:SPONSORS]-(sponsor:Distributor)
where 	org.id = {distributorID}
or 	sponsor.id <> org.id
or 	sponsor.id <> enroller.id
return  distinct d, sponsor, enroller;
	
