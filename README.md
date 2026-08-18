# DevGraph

DevGraph is a small web application backed by **CognoDB** that helps users explore software projects and find developers whose technology skills match each project's stack.

The application is intentionally simple and focuses on demonstrating graph data modeling, multi-hop traversal, parameterized Cypher queries, and a complete user-facing workflow.

## Tech Stack

* Next.js
* React
* TypeScript
* CognoDB
* Neo4j JavaScript Driver
* Cypher

## Use Case

Each software project uses a set of technologies.

Each developer knows a set of technologies.

DevGraph uses these relationships to find developers whose skills overlap with the technologies used by a selected project.

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

When a user opens a project, DevGraph traverses these relationships and ranks developers by the number of matching technologies.

## Why a Graph Database?

The important part of this use case is the relationships between developers, technologies, projects, and domains.

The application needs to answer questions such as:

* Which technologies are used by a project?
* Which developers know those technologies?
* Which developers have the strongest overlap with a project's technology stack?
* Which business domain does a project belong to?

A relational database could represent this information using multiple tables and join tables.

For example, matching developers to a project would typically require joining developers to developer-technologies, technologies to project-technologies, and then grouping the results.

In a graph database, these relationships are represented directly.

The main DevGraph traversal is:

```text
Developer → Technology → Project
```

This relationship-heavy query is therefore a natural fit for a graph database.

## Graph Data Model

DevGraph contains four node labels:

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
```

### Developer

Properties:

```text
id
name
role
experienceYears
```

### Technology

Properties:

```text
id
name
category
```

### Project

Properties:

```text
id
name
description
```

### Domain

Properties:

```text
id
name
```

## Relationships

The graph uses three relationship types:

```text
Developer -[:KNOWS]-> Technology

Technology -[:USED_IN]-> Project

Project -[:IN_DOMAIN]-> Domain
```

### `KNOWS`

Represents a technology a developer has experience with.

Example:

```text
Sarah Chen -[:KNOWS]-> TypeScript
```

### `USED_IN`

Represents a technology used by a project.

Example:

```text
TypeScript -[:USED_IN]-> FinLedger
```

### `IN_DOMAIN`

Connects a project to its business domain.

Example:

```text
FinLedger -[:IN_DOMAIN]-> Fintech
```

## Main Graph Query

The main feature of DevGraph finds developers whose skills overlap with the selected project's technology stack.

The graph traversal is:

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

This is a two-hop traversal.

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

The query ranks developers based on how many technologies they know that are used by the selected project.

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

the developer has:

```text
2 matching technologies
```

## Parameterized Queries

Queries use parameters rather than string-concatenated Cypher.

For example:

```cypher
MATCH (p:Project {id: $id})
RETURN p
```

The route value is passed separately:

```ts
runQuery(query, {
  id,
});
```

This keeps query input separate from query construction.

## Application Flow

The application has a simple two-page flow.

### 1. Project List

The homepage displays the available software projects.

Each project shows:

* project name
* description
* business domain
* link to view project details

### 2. Project Details

The project page displays:

* project name
* description
* business domain
* technology stack
* developers ranked by matching technologies

The developer ranking is calculated using the CognoDB multi-hop traversal.

## Project Structure

```text
devgraph/
├── app/
│   ├── project/
│   │   └── [id]/
│   │       └── page.tsx
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

CognoDB is accessed through the official Neo4j JavaScript driver.

The database connection is kept in:

```text
lib/cognodb.ts
```

The application uses a small helper function:

```ts
runQuery(query, params)
```

This keeps database connection logic separate from pages and Cypher queries.

## Environment Variables

Database credentials are stored in environment variables.

Create:

```text
.env.local
```

with:

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

1. Create a CognoDB Cloud account.
2. Create a free `c0` instance.
3. Select a region.
4. Wait for the instance to finish provisioning.
5. Copy the generated Bolt connection URI.
6. Save the generated password for the `cognodb` user.
7. Add the values to `.env.local`.

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

Create `.env.local` and add your CognoDB credentials.

## Seed the Database

The repository contains a seed script with realistic developers, technologies, projects, domains, and relationships.

Run:

```bash
npm run seed
```

A successful run should finish with:

```text
Seed completed successfully.
```

## Run the Application

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Error Handling

The application includes:

* loading state during navigation
* empty state when no projects are available
* empty state when a project has no technologies
* empty state when no developers match
* graceful database error state

## UI and UX

The interface is intentionally simple so a non-technical user can understand the application without knowing anything about graph databases.

The UI focuses on:

* readable typography
* clear project cards
* simple navigation
* technology labels
* understandable developer match results
* loading states
* empty states
* error handling

## Screenshots

### Project List

![DevGraph project list](./public/screenshots/projects.png)

### Project Details

![DevGraph project details](./public/screenshots/project-details.png)

## Hosted Demo

**Demo:** `https://developer-graph-mauve.vercel.app/`

## Screen Recording

**Screen recording:** `<add-screen-recording-url>`

## Production Build

Create a production build:

```bash
npm run build
```

Run the production server:

```bash
npm start
```

## Summary

DevGraph demonstrates a small, focused use of a graph database.

The central relationship path is:

```text
Developer → Technology → Project
```

The application uses this path to rank developers based on their technology overlap with a selected project.

The project demonstrates:

* graph data modeling
* labeled nodes
* typed relationships
* realistic seed data
* parameterized Cypher
* multi-hop graph traversal
* relationship-heavy querying
* environment-based configuration
* loading, empty, and error states
* a simple user-facing web application
