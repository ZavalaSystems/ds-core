match (enroller:Distributor), (sponsor:Distributor) 
where enroller.id = {enrollerID} and sponsor.id = {sponsorID}
create (sponsor)-[:SPONSORS]->
    (d:Distributor {id: {distributorID}, firstName: {firstName}, lastName: {lastName}, rank: {rank}, enrollDate: {enrollDate}})
        <-[:ENROLLED]-(enroller)
return d, enroller, sponsor;