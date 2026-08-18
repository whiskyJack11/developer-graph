export const technologyByIdQuery = `
  MATCH (t:Technology {id: $id})

  OPTIONAL MATCH (d:Developer)-[:KNOWS]->(t)
  OPTIONAL MATCH (t)-[:USED_IN]->(p:Project)
  OPTIONAL MATCH (t)-[:RELATED_TO]-(related:Technology)

  RETURN
    properties(t) AS technology,
    collect(DISTINCT properties(d)) AS developers,
    collect(DISTINCT properties(p)) AS projects,
    collect(DISTINCT properties(related)) AS relatedTechnologies
`;