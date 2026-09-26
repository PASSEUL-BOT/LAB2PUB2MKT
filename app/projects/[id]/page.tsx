import { notFound } from "next/navigation";
import Link from "next/link";
import { getStore } from "@/lib/mock-data";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const expStatusTone = { planned: "neutral", in_progress: "active", complete: "complete", blocked: "warning" } as const;

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const store = getStore();
  const project = store.projects[params.id];
  if (!project) notFound();

  const experiments = project.experimentIds.map((id) => store.experiments[id]).filter(Boolean);
  const papers = project.paperIds.map((id) => store.papers[id]).filter(Boolean);

  return (
    <>
      <Header title={project.title} description={project.description} />

      <section className="mb-10">
        <h2 className="mb-4 font-serif text-lg font-semibold text-ink">Experiments</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {experiments.map((exp) => (
            <Card key={exp!.id}>
              <CardHeader>
                <CardTitle>{exp!.title}</CardTitle>
                <Badge tone={expStatusTone[exp!.status]}>{exp!.status.replace("_", " ")}</Badge>
              </CardHeader>
              {exp!.notes && <p className="text-sm text-slate">{exp!.notes.value}</p>}
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-serif text-lg font-semibold text-ink">Papers</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {papers.map((paper) => (
            <Link key={paper!.id} href={`/papers`}>
              <Card className="hover:border-teal">
                <CardTitle>{paper!.title.value}</CardTitle>
                <p className="mt-2 text-sm text-slate">Target: {paper!.targetVenue ?? "Not yet set"}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
