export const technologyGraphQuery = `
  MATCH (t:Technology {id: $id})
  OPTIONAL MATCH path =
    (t)-[:RELATED_TO|USED_IN*1..2]-(connected)
  RETURN
    t,
    collect(path) AS paths
`;