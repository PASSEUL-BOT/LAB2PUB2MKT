import { getStore } from "@/lib/mock-data";
import { Header } from "@/components/layout/Header";
import { Table, Thead, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

const statusTone = { planned: "neutral", in_progress: "active", complete: "complete", blocked: "warning" } as const;

export default function ExperimentsPage() {
  const store = getStore();
  const experiments = Object.values(store.experiments);

  return (
    <>
      <Header title="Experiments" description="Every experiment, across all projects, with its current status." />
      <Table>
        <Thead>
          <tr>
            <Th>Experiment</Th>
            <Th>Project</Th>
            <Th>Status</Th>
            <Th>Topics</Th>
          </tr>
        </Thead>
        <tbody>
          {experiments.map((exp) => (
            <tr key={exp.id}>
              <Td className="font-medium text-ink">{exp.title}</Td>
              <Td>{store.projects[exp.projectId]?.title ?? "—"}</Td>
              <Td>
                <Badge tone={statusTone[exp.status]}>{exp.status.replace("_", " ")}</Badge>
              </Td>
              <Td>{exp.topicIds.map((id) => store.topics[id]?.label).filter(Boolean).join(", ") || "—"}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
