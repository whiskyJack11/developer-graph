import Link from "next/link";
import { runQuery } from "@/lib/cognodb";
import { getProjectDetailsQuery } from "@/lib/queries/projects";
import type {
  Developer,
  Domain,
  Project,
  Technology,
} from "@/types/graph";

interface DeveloperMatch {
  developer: Developer;
  matchedTechnologies: number;
}

interface ProjectDetails {
  project: Project;
  domain: Domain | null;
  technologies: Technology[];
  developerMatches: DeveloperMatch[];
}

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectPage({
  params,
}: ProjectPageProps) {
  const { id } = await params;

  const result = await runQuery<ProjectDetails>(
    getProjectDetailsQuery,
    { id }
  );

  if (result.length === 0) {
    return (
      <main>
        <Link href="/">← Back to projects</Link>
        <p>Project not found.</p>
      </main>
    );
  }

  const {
    project,
    domain,
    technologies,
    developerMatches,
  } = result[0];

  const validDeveloperMatches =
    developerMatches.filter(
      (match): match is DeveloperMatch =>
        match !== null &&
        match.developer !== null
    );

  return (
    <main>
      <Link className="back-link" href="/">← Back to projects</Link>

      <header>
        <h1>{project.name}</h1>
        <p>{project.description}</p>

        {domain && (
          <p>
            Domain: {domain.name}
          </p>
        )}
      </header>

      <section>
        <h2>Technology Stack</h2>

        {technologies.length === 0 ? (
          <p>No technologies found.</p>
        ) : (
          <ul>
            {technologies.map((technology) => (
              <li key={technology.id}>
                {technology.name} — {technology.category}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Developer Matches</h2>

        {validDeveloperMatches.length === 0 ? (
          <p>No matching developers found.</p>
        ) : (
          <ul>
            {validDeveloperMatches.map(
              ({ developer, matchedTechnologies }) => (
                <li key={developer.id}>
                  <strong>{developer.name}</strong>
                  {" — "}
                  {developer.role}
                  {" — "}
                  {matchedTechnologies} matching technologies
                </li>
              )
            )}
          </ul>
        )}
      </section>
    </main>
  );
}