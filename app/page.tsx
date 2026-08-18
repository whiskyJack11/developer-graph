import Link from "next/link";
import { runQuery } from "@/lib/cognodb";
import { getAllProjectsQuery } from "@/lib/queries/projects";
import type { Domain, Project } from "@/types/graph";

interface ProjectListItem {
  project: Project;
  domain: Domain | null;
}

export default async function HomePage() {
  const projects = await runQuery<ProjectListItem>(
    getAllProjectsQuery
  );

  return (
    <main>
      <h1>DevGraph</h1>

      <p>
        Explore software projects and discover developers
        whose skills match each project&apos;s technology stack.
      </p>

      <section>
        <h2>Projects</h2>

        {projects.length === 0 ? (
          <p>No projects found.</p>
        ) : (
          <div className="project-grid">
            {projects.map(({ project, domain }) => (
              <article className="card" key={project.id}>
                <h3>{project.name}</h3>

                <p>{project.description}</p>

                {domain && <p>Domain: {domain.name}</p>}

                <Link
                  className="card-link"
                  href={`/project/${project.id}`}
                >
                  View project →
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}