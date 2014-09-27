match (current:BusinessPeriod)
where not (current)-[:PRECEDES]->(:BusinessPeriod)
optional match (prev:BusinessPeriod)-[:PRECEDES]->(current)
return current, id(current) as current_id, prev, id(prev) as prev_id;