match (current:BusinessPeriod) 
where id(current)={id} 
optional match (current)-[:PRECEDES]->(next:BusinessPeriod)
optional match (prev:BusinessPeriod)-[:PRECEDES]->(current)
return current, id(current) as current_id, prev, id(prev) as prev_id, next, id(next) as next_id