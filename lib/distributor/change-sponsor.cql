match (d:Distributor)<-[orig:SPONSORS]-(sponsor:Distributor), (nsponsor: Distributor)
where d.id = {distributorID} and nsponsor.id = {sponsor}
delete orig
create (d)<-[:SPONSORS]-(nsponsor)
set d.changeSponsorDate = TimeStamp()
return d, nsponsor as sponsor;