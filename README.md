# DevGraph

DevGraph is a small web application backed by CognoDB that helps explore software projects and find developers whose technology skills match each project's stack.

## Tech Stack

- Next.js
- TypeScript
- CognoDB
- Neo4j JavaScript Driver

## Use Case

Each software project uses a set of technologies.

Developers know different technologies.

DevGraph uses these relationships to find developers whose existing skills overlap with the technologies used by a selected project.

## Why a Graph Database?

The important part of this use case is the relationships between developers, technologies, and projects.

The main matching query traverses:

Developer → Technology → Project

A relational database could represent this data using join tables, but relationship-heavy queries become increasingly dependent on joins as more connections are explored.

With a graph database, these relationships are represented directly and can be traversed naturally using Cypher.

## Graph Data Model

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
   |
   | IN_DOMAIN
   v
Domain

Developer ── CONTRIBUTED_TO ──> Project