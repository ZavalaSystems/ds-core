match (d:Distributor) 
where d.id = {distributorID}
set d.rank = {rank}
return d;