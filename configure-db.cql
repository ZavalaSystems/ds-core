create index on :Distributor(id);
create constraint on (d:Distributor) assert d.id is unique;
create index on :Order(id)
create constraint on (o:Order) assert d.id is unique;
create index on :LineItem(id)
create constraint on (li:LineItem) assert li.id is unique;
