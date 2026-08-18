export const developerByIdQuery = `
  MATCH (d:Developer {id: $id})
  OPTIONAL MATCH (d)-[:KNOWS]->(t:Technology)
  OPTIONAL MATCH (d)-[:CONTRIBUTED_TO]->(p:Project)
  RETURN
    d,
    collect(DISTINCT t) AS technologies,
    collect(DISTINCT p) AS projects
`;

export const developersForProjectQuery = `
  MATCH (p:Project {id: $id})
  MATCH (t:Technology)-[:USED_IN]->(p)
  MATCH (d:Developer)-[:KNOWS]->(t)
  WITH d, count(DISTINCT t) AS matchedTechnologies
  RETURN d, matchedTechnologies
  ORDER BY matchedTechnologies DESC
  LIMIT 10
`;