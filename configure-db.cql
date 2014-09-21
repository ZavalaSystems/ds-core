create index on :Distributor(id);
create constraint on (d:Distributor) assert d.id is unique;
