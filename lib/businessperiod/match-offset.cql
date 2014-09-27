match (current:BusinessPeriod) 
where current.start <= {find} and (current.end is null or current.end > {find})
optional match (prev:BusinessPeriod)-[:PRECEDES]->(current)-[:PRECEDES]->(next:BusinessPeriod)
return current, id(current) as current_id, prev, id(prev) as prev_id, next, id(next) as next_id