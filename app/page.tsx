import Link from "next/link";
import { getStore } from "@/lib/mock-data";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Header } from "@/components/layout/Header";

const statusTone = { active: "active", on_hold: "warning", archived: "neutral" } as const;

export default function DashboardPage() {
  const store = getStore();
  const projects = Object.values(store.projects);
  const experiments = Object.values(store.experiments);
  const papers = Object.values(store.papers);

  return (
    <>
      <Header
        title="Dashboard"
        description="A working overview of active projects, running experiments, and papers in flight."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-slate">Active projects</p>
          <p className="mt-1 font-serif text-3xl font-semibold text-ink">
            {projects.filter((p) => p.status === "active").length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate">Experiments in progress</p>
          <p className="mt-1 font-serif text-3xl font-semibold text-ink">
            {experiments.filter((e) => e.status === "in_progress").length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-slate">Papers drafting</p>
          <p className="mt-1 font-serif text-3xl font-semibold text-ink">
            {papers.filter((p) => p.status === "drafting").length}
          </p>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 font-serif text-lg font-semibold text-ink">Projects</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="h-full transition-colors hover:border-teal">
                <CardHeader>
                  <CardTitle>{project.title}</CardTitle>
                  <Badge tone={statusTone[project.status]}>{project.status.replace("_", " ")}</Badge>
                </CardHeader>
                <p className="text-sm text-slate">{project.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
