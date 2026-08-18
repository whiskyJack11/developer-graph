import dotenv from "dotenv";
import neo4j from "neo4j-driver";

dotenv.config({
  path: ".env.local",
});

const uri = process.env.COGNODB_URI;
const username = process.env.COGNODB_USERNAME;
const password = process.env.COGNODB_PASSWORD;
console.log({
  uri: process.env.COGNODB_URI,
  username: process.env.COGNODB_USERNAME,
  passwordLoaded: Boolean(process.env.COGNODB_PASSWORD),
});

if (!uri || !username || !password) {
  throw new Error(
    "Missing CognoDB environment variables."
  );
}

const driver = neo4j.driver(
  uri,
  neo4j.auth.basic(username, password)
);

async function seed() {
  
    await driver.verifyConnectivity();

console.log("Connected to CognoDB");

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
          {
            id: "tech-react",
            name: "React",
            category: "Frontend",
          },
          {
            id: "tech-next",
            name: "Next.js",
            category: "Frontend",
          },
          {
            id: "tech-typescript",
            name: "TypeScript",
            category: "Language",
          },
          {
            id: "tech-node",
            name: "Node.js",
            category: "Backend",
          },
          {
            id: "tech-postgres",
            name: "PostgreSQL",
            category: "Database",
          },
          {
            id: "tech-redis",
            name: "Redis",
            category: "Database",
          },
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
          {
            id: "domain-fintech",
            name: "Fintech",
          },
          {
            id: "domain-ecommerce",
            name: "E-commerce",
          },
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

        (react:Technology {id: "tech-react"}),
        (next:Technology {id: "tech-next"}),
        (typescript:Technology {id: "tech-typescript"}),
        (node:Technology {id: "tech-node"}),
        (postgres:Technology {id: "tech-postgres"}),
        (redis:Technology {id: "tech-redis"})

      CREATE
        (sarah)-[:KNOWS]->(react),
        (sarah)-[:KNOWS]->(next),
        (sarah)-[:KNOWS]->(typescript),

        (alex)-[:KNOWS]->(react),
        (alex)-[:KNOWS]->(node),
        (alex)-[:KNOWS]->(postgres),

        (david)-[:KNOWS]->(node),
        (david)-[:KNOWS]->(postgres),
        (david)-[:KNOWS]->(redis),

        (emma)-[:KNOWS]->(react),
        (emma)-[:KNOWS]->(typescript)
    `);

    console.log("Creating project relationships...");

    await session.run(`
      MATCH
        (finledger:Project {id: "project-finledger"}),
        (shopsphere:Project {id: "project-shopsphere"}),

        (fintech:Domain {id: "domain-fintech"}),
        (ecommerce:Domain {id: "domain-ecommerce"}),

        (react:Technology {id: "tech-react"}),
        (next:Technology {id: "tech-next"}),
        (typescript:Technology {id: "tech-typescript"}),
        (node:Technology {id: "tech-node"}),
        (postgres:Technology {id: "tech-postgres"})

      CREATE
        (finledger)-[:IN_DOMAIN]->(fintech),

        (next)-[:USED_IN]->(finledger),
        (typescript)-[:USED_IN]->(finledger),
        (node)-[:USED_IN]->(finledger),
        (postgres)-[:USED_IN]->(finledger),

        (shopsphere)-[:IN_DOMAIN]->(ecommerce),

        (react)-[:USED_IN]->(shopsphere),
        (typescript)-[:USED_IN]->(shopsphere),
        (node)-[:USED_IN]->(shopsphere)
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