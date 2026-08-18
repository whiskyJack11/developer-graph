export const searchNodesQuery = `
  MATCH (n)
  WHERE
    (n:Developer AND toLower(n.name) CONTAINS toLower($search))
    OR
    (n:Technology AND toLower(n.name) CONTAINS toLower($search))
    OR
    (n:Project AND toLower(n.name) CONTAINS toLower($search))
    OR
    (n:Domain AND toLower(n.name) CONTAINS toLower($search))
  RETURN
    labels(n) AS labels,
    properties(n) AS properties
  LIMIT 20
`;