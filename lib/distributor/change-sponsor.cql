match (d:Distributor)<-[orig:SPONSORS]-(sponsor:Distributor), (nsponsor: Distributor)
where d.id = {distributorID} and nsponsor.id = {sponsor}
delete orig
create (d)<-[:SPONSORS]-(nsponsor)
return d, nsponsor as sponsor;