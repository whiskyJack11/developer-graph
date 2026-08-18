import dotenv from "dotenv";
import neo4j from "neo4j-driver";

dotenv.config({
  path: ".env.local",
});

const uri = process.env.COGNODB_URI;
const username = process.env.COGNODB_USERNAME;
const password = process.env.COGNODB_PASSWORD;

if (!uri || !username || !password) {
  throw new Error("Missing CognoDB environment variables.");
}

const driver = neo4j.driver(
  uri,
  neo4j.auth.basic(username, password)
);

async function seed() {
  const session = driver.session();

  try {
    console.log("Clearing database...");

    await session.run(`
      MATCH (n)
      DETACH DELETE n
    `);

    console.log("Creating developers...");

    await session.run(
      `
      UNWIND $developers AS developer
      CREATE (:Developer {
        id: developer.id,
        name: developer.name,
        role: developer.role,
        experienceYears: developer.experienceYears
      })
      `,
      {
        developers: [
          {
            id: "dev-001",
            name: "Sarah Chen",
            role: "Senior Frontend Engineer",
            experienceYears: 8,
          },
          {
            id: "dev-002",
            name: "Alex Johnson",
            role: "Full Stack Engineer",
            experienceYears: 6,
          },
          {
            id: "dev-003",
            name: "David Kim",
            role: "Backend Engineer",
            experienceYears: 7,
          },
          {
            id: "dev-004",
            name: "Emma Wilson",
            role: "Frontend Engineer",
            experienceYears: 5,
          },
          {
            id: "dev-005",
            name: "Michael Brown",
            role: "Platform Engineer",
            experienceYears: 9,
          },
          {
            id: "dev-006",
            name: "Priya Sharma",
            role: "Full Stack Engineer",
            experienceYears: 4,
          },
          {
            id: "dev-007",
            name: "Daniel Lee",
            role: "Backend Engineer",
            experienceYears: 6,
          },
          {
            id: "dev-008",
            name: "Sophia Martinez",
            role: "Frontend Engineer",
            experienceYears: 3,
          },
          {
            id: "dev-009",
            name: "Arjun Mehta",
            role: "Senior Full Stack Engineer",
            experienceYears: 8,
          },
          {
            id: "dev-010",
            name: "Olivia Taylor",
            role: "Software Engineer",
            experienceYears: 5,
          },
        ],
      }
    );

    console.log("Creating technologies...");

    await session.run(
      `
      UNWIND $technologies AS technology
      CREATE (:Technology {
        id: technology.id,
        name: technology.name,
        category: technology.category
      })
      `,
      {
        technologies: [
          { id: "tech-react", name: "React", category: "Frontend" },
          { id: "tech-next", name: "Next.js", category: "Frontend" },
          { id: "tech-vue", name: "Vue.js", category: "Frontend" },
          { id: "tech-typescript", name: "TypeScript", category: "Language" },
          { id: "tech-javascript", name: "JavaScript", category: "Language" },
          { id: "tech-node", name: "Node.js", category: "Backend" },
          { id: "tech-express", name: "Express", category: "Backend" },
          { id: "tech-python", name: "Python", category: "Language" },
          { id: "tech-django", name: "Django", category: "Backend" },
          { id: "tech-postgres", name: "PostgreSQL", category: "Database" },
          { id: "tech-mongodb", name: "MongoDB", category: "Database" },
          { id: "tech-redis", name: "Redis", category: "Database" },
          { id: "tech-docker", name: "Docker", category: "DevOps" },
          { id: "tech-aws", name: "AWS", category: "Cloud" },
        ],
      }
    );

    console.log("Creating domains...");

    await session.run(
      `
      UNWIND $domains AS domain
      CREATE (:Domain {
        id: domain.id,
        name: domain.name
      })
      `,
      {
        domains: [
          { id: "domain-fintech", name: "Fintech" },
          { id: "domain-ecommerce", name: "E-commerce" },
          { id: "domain-healthcare", name: "Healthcare" },
          { id: "domain-education", name: "Education" },
          { id: "domain-logistics", name: "Logistics" },
          { id: "domain-media", name: "Media" },
        ],
      }
    );

    console.log("Creating projects...");

    await session.run(
      `
      UNWIND $projects AS project
      CREATE (:Project {
        id: project.id,
        name: project.name,
        description: project.description
      })
      `,
      {
        projects: [
          {
            id: "project-finledger",
            name: "FinLedger",
            description:
              "A digital finance platform for managing transactions and financial accounts.",
          },
          {
            id: "project-shopsphere",
            name: "ShopSphere",
            description:
              "An e-commerce platform for browsing and purchasing products.",
          },
          {
            id: "project-healthtrack",
            name: "HealthTrack",
            description:
              "A healthcare platform for managing patient appointments and medical records.",
          },
          {
            id: "project-eduflow",
            name: "EduFlow",
            description:
              "An online learning platform for courses, students, and instructors.",
          },
          {
            id: "project-fleetops",
            name: "FleetOps",
            description:
              "A logistics platform for managing delivery fleets and shipment tracking.",
          },
          {
            id: "project-streambox",
            name: "StreamBox",
            description:
              "A media streaming platform for managing and delivering digital content.",
          },
        ],
      }
    );

    console.log("Creating KNOWS relationships...");

    await session.run(`
      MATCH
        (sarah:Developer {id: "dev-001"}),
        (alex:Developer {id: "dev-002"}),
        (david:Developer {id: "dev-003"}),
        (emma:Developer {id: "dev-004"}),
        (michael:Developer {id: "dev-005"}),
        (priya:Developer {id: "dev-006"}),
        (daniel:Developer {id: "dev-007"}),
        (sophia:Developer {id: "dev-008"}),
        (arjun:Developer {id: "dev-009"}),
        (olivia:Developer {id: "dev-010"}),

        (react:Technology {id: "tech-react"}),
        (next:Technology {id: "tech-next"}),
        (vue:Technology {id: "tech-vue"}),
        (typescript:Technology {id: "tech-typescript"}),
        (javascript:Technology {id: "tech-javascript"}),
        (node:Technology {id: "tech-node"}),
        (express:Technology {id: "tech-express"}),
        (python:Technology {id: "tech-python"}),
        (django:Technology {id: "tech-django"}),
        (postgres:Technology {id: "tech-postgres"}),
        (mongodb:Technology {id: "tech-mongodb"}),
        (redis:Technology {id: "tech-redis"}),
        (docker:Technology {id: "tech-docker"}),
        (aws:Technology {id: "tech-aws"})

      CREATE
        (sarah)-[:KNOWS]->(react),
        (sarah)-[:KNOWS]->(next),
        (sarah)-[:KNOWS]->(typescript),
        (sarah)-[:KNOWS]->(javascript),

        (alex)-[:KNOWS]->(react),
        (alex)-[:KNOWS]->(node),
        (alex)-[:KNOWS]->(postgres),
        (alex)-[:KNOWS]->(mongodb),

        (david)-[:KNOWS]->(node),
        (david)-[:KNOWS]->(postgres),
        (david)-[:KNOWS]->(redis),
        (david)-[:KNOWS]->(docker),

        (emma)-[:KNOWS]->(react),
        (emma)-[:KNOWS]->(typescript),
        (emma)-[:KNOWS]->(vue),
        (emma)-[:KNOWS]->(javascript),

        (michael)-[:KNOWS]->(aws),
        (michael)-[:KNOWS]->(docker),
        (michael)-[:KNOWS]->(redis),
        (michael)-[:KNOWS]->(node),

        (priya)-[:KNOWS]->(next),
        (priya)-[:KNOWS]->(typescript),
        (priya)-[:KNOWS]->(node),
        (priya)-[:KNOWS]->(postgres),

        (daniel)-[:KNOWS]->(python),
        (daniel)-[:KNOWS]->(django),
        (daniel)-[:KNOWS]->(postgres),
        (daniel)-[:KNOWS]->(redis),

        (sophia)-[:KNOWS]->(vue),
        (sophia)-[:KNOWS]->(typescript),
        (sophia)-[:KNOWS]->(javascript),
        (sophia)-[:KNOWS]->(react),

        (arjun)-[:KNOWS]->(react),
        (arjun)-[:KNOWS]->(next),
        (arjun)-[:KNOWS]->(node),
        (arjun)-[:KNOWS]->(postgres),
        (arjun)-[:KNOWS]->(aws),

        (olivia)-[:KNOWS]->(python),
        (olivia)-[:KNOWS]->(node),
        (olivia)-[:KNOWS]->(mongodb),
        (olivia)-[:KNOWS]->(aws),
        (olivia)-[:KNOWS]->(express)
    `);

    console.log("Creating project relationships...");

    await session.run(`
      MATCH
        (finledger:Project {id: "project-finledger"}),
        (shopsphere:Project {id: "project-shopsphere"}),
        (healthtrack:Project {id: "project-healthtrack"}),
        (eduflow:Project {id: "project-eduflow"}),
        (fleetops:Project {id: "project-fleetops"}),
        (streambox:Project {id: "project-streambox"}),

        (fintech:Domain {id: "domain-fintech"}),
        (ecommerce:Domain {id: "domain-ecommerce"}),
        (healthcare:Domain {id: "domain-healthcare"}),
        (education:Domain {id: "domain-education"}),
        (logistics:Domain {id: "domain-logistics"}),
        (media:Domain {id: "domain-media"}),

        (react:Technology {id: "tech-react"}),
        (next:Technology {id: "tech-next"}),
        (vue:Technology {id: "tech-vue"}),
        (typescript:Technology {id: "tech-typescript"}),
        (node:Technology {id: "tech-node"}),
        (express:Technology {id: "tech-express"}),
        (python:Technology {id: "tech-python"}),
        (django:Technology {id: "tech-django"}),
        (postgres:Technology {id: "tech-postgres"}),
        (mongodb:Technology {id: "tech-mongodb"}),
        (redis:Technology {id: "tech-redis"}),
        (docker:Technology {id: "tech-docker"}),
        (aws:Technology {id: "tech-aws"})

      CREATE
        (finledger)-[:IN_DOMAIN]->(fintech),
        (next)-[:USED_IN]->(finledger),
        (typescript)-[:USED_IN]->(finledger),
        (node)-[:USED_IN]->(finledger),
        (postgres)-[:USED_IN]->(finledger),
        (redis)-[:USED_IN]->(finledger),

        (shopsphere)-[:IN_DOMAIN]->(ecommerce),
        (react)-[:USED_IN]->(shopsphere),
        (typescript)-[:USED_IN]->(shopsphere),
        (node)-[:USED_IN]->(shopsphere),
        (mongodb)-[:USED_IN]->(shopsphere),

        (healthtrack)-[:IN_DOMAIN]->(healthcare),
        (react)-[:USED_IN]->(healthtrack),
        (typescript)-[:USED_IN]->(healthtrack),
        (python)-[:USED_IN]->(healthtrack),
        (django)-[:USED_IN]->(healthtrack),
        (postgres)-[:USED_IN]->(healthtrack),

        (eduflow)-[:IN_DOMAIN]->(education),
        (next)-[:USED_IN]->(eduflow),
        (typescript)-[:USED_IN]->(eduflow),
        (node)-[:USED_IN]->(eduflow),
        (postgres)-[:USED_IN]->(eduflow),

        (fleetops)-[:IN_DOMAIN]->(logistics),
        (react)-[:USED_IN]->(fleetops),
        (node)-[:USED_IN]->(fleetops),
        (postgres)-[:USED_IN]->(fleetops),
        (redis)-[:USED_IN]->(fleetops),
        (docker)-[:USED_IN]->(fleetops),
        (aws)-[:USED_IN]->(fleetops),

        (streambox)-[:IN_DOMAIN]->(media),
        (vue)-[:USED_IN]->(streambox),
        (node)-[:USED_IN]->(streambox),
        (express)-[:USED_IN]->(streambox),
        (mongodb)-[:USED_IN]->(streambox),
        (redis)-[:USED_IN]->(streambox),
        (aws)-[:USED_IN]->(streambox)
    `);

    console.log("Seed completed successfully.");
  } finally {
    await session.close();
    await driver.close();
  }
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});