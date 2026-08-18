export const getAllProjectsQuery = `
  MATCH (p:Project)
  OPTIONAL MATCH (p)-[:IN_DOMAIN]->(d:Domain)

  RETURN
    properties(p) AS project,
    properties(d) AS domain

  ORDER BY p.name
`;

export const getProjectDetailsQuery = `
  MATCH (p:Project {id: $id})

  OPTIONAL MATCH (p)-[:IN_DOMAIN]->(domain:Domain)
  OPTIONAL MATCH (technology:Technology)-[:USED_IN]->(p)

  WITH
    p,
    domain,
    collect(DISTINCT technology) AS technologies

  OPTIONAL MATCH
    (developer:Developer)
    -[:KNOWS]->
    (matchedTechnology:Technology)
    -[:USED_IN]->
    (p)

  WITH
    p,
    domain,
    technologies,
    developer,
    count(DISTINCT matchedTechnology) AS matchedTechnologies

  ORDER BY matchedTechnologies DESC

  RETURN
    properties(p) AS project,
    properties(domain) AS domain,

    [technology IN technologies |
      properties(technology)
    ] AS technologies,

    collect(
      CASE
        WHEN developer IS NULL THEN NULL
        ELSE {
          developer: properties(developer),
          matchedTechnologies: matchedTechnologies
        }
      END
    ) AS developerMatches
`;