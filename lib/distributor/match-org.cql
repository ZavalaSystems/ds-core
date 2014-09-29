// Match all distributors downline from the query
match (d:Distributor)<-[:SPONSORS*]-(orgRoot:Distributor)
where orgRoot.id = {distributorID}
// Add a second match against the actual sponsor to allow building the tree
with d
match (d)<-[:SPONSORS]-(sponsor:Distributor)
return d, sponsor