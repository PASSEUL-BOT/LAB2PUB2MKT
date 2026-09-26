import { getStore } from "@/lib/mock-data";
import { Header } from "@/components/layout/Header";
import { PipelineStage } from "@/lib/types";

const stages: { key: PipelineStage; label: string; description: string }[] = [
  { key: "experiment", label: "Experiment", description: "A defined piece of lab work with a status and owner." },
  { key: "data", label: "Data", description: "Raw or processed data captured from the experiment." },
  { key: "analysis", label: "Analysis", description: "Statistical or qualitative analysis run on the data." },
  { key: "finding", label: "Finding", description: "A stated result derived from analysis." },
  { key: "figure", label: "Figure / Table", description: "A visual or tabular representation of a finding." },
  { key: "manuscript_section", label: "Manuscript Section", description: "Findings and figures written into prose." },
  { key: "publication", label: "Publication", description: "The finished, submitted, or published paper." },
];

export default function PipelinePage() {
  const store = getStore();
  const experimentCount = Object.keys(store.experiments).length;
  const paperCount = Object.keys(store.papers).length;

  const counts: Partial<Record<PipelineStage, number>> = {
    experiment: experimentCount,
    publication: paperCount,
  };

  return (
    <>
      <Header
        title="Pipeline"
        description="The path every finding travels: from raw experiment to published paper. Later phases will let items move stage to stage; today this shows the model and where mock data currently sits."
      />

      <ol className="flex flex-col divide-y divide-line rounded-lg border border-line bg-white">
        {stages.map((stage, i) => (
          <li key={stage.key} className="flex items-center gap-4 px-5 py-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-light font-serif text-sm font-semibold text-teal-dark">
              {i + 1}
            </span>
            <div className="flex-1">
              <p className="font-medium text-ink">{stage.label}</p>
              <p className="text-sm text-slate">{stage.description}</p>
            </div>
            {counts[stage.key] !== undefined && (
              <span className="text-sm text-slate">{counts[stage.key]} recorded</span>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}
