import Link from "next/link";
import { getStore } from "@/lib/mock-data";
import { Header } from "@/components/layout/Header";
import { Table, Thead, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

const statusTone = { active: "active", on_hold: "warning", archived: "neutral" } as const;

export default function ProjectsPage() {
  const store = getStore();
  const projects = Object.values(store.projects);

  return (
    <>
      <Header title="Projects" description="Every research project tracked from first experiment to publication." />

      {projects.length === 0 ? (
        <EmptyState title="No projects yet" description="Create a project to start tracking experiments and papers." />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Project</Th>
              <Th>Status</Th>
              <Th>Lead</Th>
              <Th>Experiments</Th>
              <Th>Papers</Th>
            </tr>
          </Thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <Td>
                  <Link href={`/projects/${project.id}`} className="font-medium text-ink hover:text-teal">
                    {project.title}
                  </Link>
                </Td>
                <Td>
                  <Badge tone={statusTone[project.status]}>{project.status.replace("_", " ")}</Badge>
                </Td>
                <Td>{store.authors[project.leadAuthorId]?.name ?? "—"}</Td>
                <Td>{project.experimentIds.length}</Td>
                <Td>{project.paperIds.length}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
