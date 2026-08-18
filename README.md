# DevGraph

DevGraph is a small web application backed by **CognoDB** that demonstrates how graph relationships can be used to connect software projects, technologies, developers, and business domains.

The application allows a user to browse software projects, inspect the technologies used by each project, and discover developers whose technology skills match the selected project's stack.

## Tech Stack

* Next.js
* React
* TypeScript
* CognoDB
* Neo4j JavaScript Driver
* Cypher

## Use Case

Software projects depend on different technologies, while developers have experience with different technologies.

DevGraph models these connections directly as a graph.

For example:

```text
Developer
    |
    | KNOWS
    v
Technology
    |
    | USED_IN
    v
Project
```

When a user opens a project, DevGraph traverses these relationships to identify developers who know technologies used by that project.

Developers are then ranked by the number of technologies they match.

## Why a Graph Database?

The useful information in DevGraph is primarily about **relationships** rather than isolated records.

The application needs to answer questions such as:

* Which technologies are used by a project?
* Which developers know those technologies?
* Which developers have the strongest overlap with a project's technology stack?
* Which domain does a project belong to?
* Which developers have previously contributed to particular projects?

A relational database could represent this information using developers, projects, technologies, and multiple join tables.

However, the main DevGraph query naturally follows a relationship path:

```text
Developer → Technology → Project
```

In a graph database, these relationships are stored directly and can be traversed naturally using Cypher.

This makes a graph model a good fit for the relationship-focused queries used by the application.

## Graph Data Model

DevGraph uses four node labels:

```text
┌───────────────┐
│   Developer   │
└───────┬───────┘
        │
        │ KNOWS
        ▼
┌───────────────┐
│  Technology   │
└───────┬───────┘
        │
        │ USED_IN
        ▼
┌───────────────┐
│    Project    │
└───────┬───────┘
        │
        │ IN_DOMAIN
        ▼
┌───────────────┐
│    Domain     │
└───────────────┘

Developer ── CONTRIBUTED_TO ──> Project
```

### Developer

Properties:

```text
id
name
role
experienceYears
```

Example:

```text
Sarah Chen
Senior Frontend Engineer
8 years experience
```

### Technology

Properties:

```text
id
name
category
```

Examples:

```text
React
Next.js
TypeScript
Node.js
PostgreSQL
Redis
```

### Project

Properties:

```text
id
name
description
```

Examples:

```text
FinLedger
ShopSphere
```

### Domain

Properties:

```text
id
name
```

Examples:

```text
Fintech
E-commerce
```

## Relationships

The graph uses the following typed relationships:

```text
Developer -[:KNOWS]-> Technology

Developer -[:CONTRIBUTED_TO]-> Project

Technology -[:USED_IN]-> Project

Project -[:IN_DOMAIN]-> Domain
```

### `KNOWS`

Represents a technology a developer has experience with.

```text
Sarah Chen -[:KNOWS]-> React
```

### `USED_IN`

Represents a technology used by a software project.

```text
Next.js -[:USED_IN]-> FinLedger
```

### `CONTRIBUTED_TO`

Represents a developer who has previously contributed to a project.

```text
Sarah Chen -[:CONTRIBUTED_TO]-> FinLedger
```

### `IN_DOMAIN`

Connects a project to its business domain.

```text
FinLedger -[:IN_DOMAIN]-> Fintech
```

## Main Graph Query

The most important query in DevGraph finds developers whose technology knowledge overlaps with the technology stack of a selected project.

The relevant graph traversal is:

```text
Developer
    |
    | KNOWS
    v
Technology
    |
    | USED_IN
    v
Project
```

This is a multi-hop traversal across two relationships.

A simplified version of the query is:

```cypher
MATCH (p:Project {id: $id})

MATCH
  (developer:Developer)
  -[:KNOWS]->
  (technology:Technology)
  -[:USED_IN]->
  (p)

WITH
  developer,
  count(DISTINCT technology) AS matchedTechnologies

RETURN
  properties(developer) AS developer,
  matchedTechnologies

ORDER BY matchedTechnologies DESC
```

For example, if a project uses:

```text
Next.js
TypeScript
Node.js
PostgreSQL
```

and a developer knows:

```text
Node.js
PostgreSQL
Redis
```

that developer receives a match count of:

```text
2 matching technologies
```

The query therefore uses the structure of the graph to rank developers based on their connections to the technologies used by the project.

## Parameterized Queries

Queries are executed using the official Neo4j JavaScript driver.

User or route values are passed as parameters rather than being concatenated into Cypher strings.

For example:

```cypher
MATCH (p:Project {id: $id})
RETURN p
```

The parameter is supplied separately:

```ts
runQuery(query, {
  id,
});
```

This keeps query construction separate from input values.

## Application Flow

The application intentionally has a small user flow.

### 1. Browse Projects

The homepage displays available software projects.

Each project displays:

* project name
* description
* business domain
* link to view the project

### 2. View Project

Selecting a project opens its detail page.

The page displays:

* project name
* description
* domain
* technology stack

### 3. View Developer Matches

The project page also displays developers ranked by how many technologies they know that are used by the project.

This matching result comes directly from the multi-hop CognoDB traversal.

## Project Structure

```text
devgraph/
├── app/
│   ├── project/
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── error.tsx
│   ├── loading.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── lib/
│   ├── queries/
│   │   └── projects.ts
│   └── cognodb.ts
│
├── scripts/
│   └── seed.ts
│
├── types/
│   └── graph.ts
│
├── public/
│   └── screenshots/
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## CognoDB Connection

CognoDB communicates using openCypher over the Bolt protocol and can be accessed using the official Neo4j driver.

The application keeps the database connection logic in:

```text
lib/cognodb.ts
```

The rest of the application uses a small helper:

```ts
runQuery(query, params)
```

This keeps database connectivity separate from application pages and Cypher queries.

## Environment Variables

Database credentials are never stored directly in the source code.

Create a `.env.local` file in the root of the project:

```env
COGNODB_URI=bolt+s://<instance-id>.databases.cognodb.cloud
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=<your-password>
```

An `.env.example` file is included without real credentials:

```env
COGNODB_URI=
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=
```

`.env.local` must not be committed to Git.

## CognoDB Cloud Setup

1. Create an account in CognoDB Cloud.
2. Create a free `c0` database instance.
3. Select a region.
4. Wait for the database instance to finish provisioning.
5. Save the generated connection URI.
6. Save the generated password for the `cognodb` user.
7. Add the connection details to `.env.local`.

The generated password should be stored securely because it is used by both the application and the seed script.

## Local Setup

Clone the repository:

```bash
git clone <repository-url>
```

Enter the project:

```bash
cd devgraph
```

Install dependencies:

```bash
npm install
```

Create:

```text
.env.local
```

Add your CognoDB connection details:

```env
COGNODB_URI=bolt+s://<instance-id>.databases.cognodb.cloud
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=<your-password>
```

## Seed the Database

The repository includes a seed script containing realistic example developers, technologies, projects, domains, and relationships.

Run:

```bash
npm run seed
```

A successful seed should finish with:

```text
Seed completed successfully.
```

The seed script creates the graph structure required by the application.

## Run the Application

Start the Next.js development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Error Handling

The application includes basic error handling for database failures.

If CognoDB cannot be reached, the application displays an error state rather than failing silently.

The application also includes:

* loading state during navigation
* empty state when no projects are available
* empty technology state
* empty developer-match state

## UI and UX

The interface is intentionally simple so a non-technical user can understand the application without knowing anything about graph databases.

The UI focuses on:

* clear project cards
* readable typography
* simple navigation
* technology labels
* understandable developer match results
* loading states
* empty states
* database error handling

## Screenshots

### Project List

![DevGraph project list](./public/screenshots/projects.png)

### Project Details and Developer Matches

![DevGraph project details](./public/screenshots/project-details.png)

## Hosted Demo

**Demo:** `<add-hosted-demo-url>`

## Screen Recording

**Screen recording:** `<add-screen-recording-url>`

## Running a Production Build

Create a production build:

```bash
npm run build
```

Run the production server:

```bash
npm start
```

## Repository Contents

The repository includes:

* complete Next.js application source code
* CognoDB connection layer
* parameterized Cypher queries
* database seed script
* graph data model
* loading, empty, and error states
* setup instructions
* UI screenshots
* hosted demo link
* screen recording link

## Summary

DevGraph demonstrates a small but practical use of a graph database.

Rather than using CognoDB simply as a replacement for a relational database, the application uses relationships as part of its core functionality.

The central query traverses:

```text
Developer → Technology → Project
```

to find and rank developers whose skills overlap with a project's technology stack.

This keeps the application small while demonstrating graph data modeling, multi-hop traversal, parameterized Cypher queries, application architecture, and a complete user-facing workflow.
