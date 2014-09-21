match (d:Distributor), (enroller:Distributor), (sponsor:Distributor)
where d.id = {distributorID} and enroller.id = {enrollerID} and sponsor.id = {sponsorID}
create (sponsor)-[s:SPONSORS]->(d)<-[e:ENROLLED]-(enroller)
set d.enrollDate = {enrollDate}, d.rank = {rank}
return d, enroller, sponsor