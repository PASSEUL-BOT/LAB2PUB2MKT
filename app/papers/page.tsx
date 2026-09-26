import { getStore } from "@/lib/mock-data";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

const statusTone = {
  drafting: "neutral",
  internal_review: "warning",
  submitted: "active",
  in_revision: "warning",
  accepted: "complete",
  published: "complete",
} as const;

export default function PapersPage() {
  const store = getStore();
  const papers = Object.values(store.papers);

  return (
    <>
      <Header title="Papers" description="Manuscripts moving from draft to publication." />

      {papers.length === 0 ? (
        <EmptyState title="No papers yet" description="Papers appear here once a project starts drafting a manuscript." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {papers.map((paper) => (
            <Card key={paper.id}>
              <CardHeader>
                <CardTitle>{paper.title.value}</CardTitle>
                <Badge tone={statusTone[paper.status]}>{paper.status.replace("_", " ")}</Badge>
              </CardHeader>
              <p className="text-sm text-slate">
                {paper.authors.map((a) => a.name).join(", ")}
              </p>
              <p className="mt-2 text-sm text-slate">Target venue: {paper.targetVenue ?? "Not yet set"}</p>
              {paper.title.origin === "ai" && (
                <p className="mt-2 text-xs text-amber">AI-drafted — not yet reviewed</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
