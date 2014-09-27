match (prev:BusinessPeriod) where not (prev)-[:PRECEDES]->(:BusinessPeriod)
create (current:BusinessPeriod {start: {now}})<-[:PRECEDES]-(prev)
set prev.end = {now}
return prev, id(prev) as prev_id, current, id(current) as current_id;