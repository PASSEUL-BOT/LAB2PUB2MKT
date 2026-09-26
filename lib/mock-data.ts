import { Author, DataStore, Experiment, Paper, Project, ResearchTopic } from "./types";

// This module is the Phase 2 stand-in for a real data/service layer.
// Every page reads from getStore() rather than importing arrays directly,
// so swapping this for a real API client later touches one file.

const authors: Author[] = [
  { id: "au-1", name: "Wei-Chen Lin", affiliation: "Dept. of Cardiology", isCorresponding: true, email: "wclin@example.edu" },
  { id: "au-2", name: "Hsin-Yi Chang", affiliation: "Dept. of Cardiology" },
  { id: "au-3", name: "Marcus Reyes", affiliation: "Biostatistics Core" },
];

const topics: ResearchTopic[] = [
  { id: "top-1", label: "Catheter Ablation" },
  { id: "top-2", label: "Atrial Fibrillation", parentTopicId: "top-1" },
  { id: "top-3", label: "Procedural Training" },
];

const experiments: Experiment[] = [
  {
    id: "exp-1",
    projectId: "proj-1",
    title: "Ablation lesion depth vs. catheter contact force",
    status: "in_progress",
    methodIds: ["meth-1"],
    resultIds: ["res-1"],
    topicIds: ["top-1", "top-2"],
    startedAt: "2026-06-01",
    notes: {
      value: "Contact-force sensor recalibrated after batch 3; see device log.",
      origin: "user",
      createdAt: "2026-06-14T09:00:00Z",
      reviewedByUser: true,
    },
  },
  {
    id: "exp-2",
    projectId: "proj-1",
    title: "Trainee proficiency curve on simulated PVI",
    status: "complete",
    methodIds: [],
    resultIds: [],
    topicIds: ["top-3"],
    startedAt: "2026-03-10",
    completedAt: "2026-05-20",
  },
];

const projects: Project[] = [
  {
    id: "proj-1",
    title: "Contact-Force Guided Ablation Outcomes",
    description:
      "Evaluating whether real-time contact-force feedback improves lesion durability and shortens procedure time in AF ablation.",
    status: "active",
    leadAuthorId: "au-1",
    topicIds: ["top-1", "top-2"],
    experimentIds: ["exp-1", "exp-2"],
    paperIds: ["pap-1"],
    createdAt: "2026-02-01T00:00:00Z",
    updatedAt: "2026-09-10T00:00:00Z",
  },
  {
    id: "proj-2",
    title: "Simulation-Based Ablation Training Curriculum",
    description: "Structured curriculum and assessment for early-career operators learning PVI on simulators before live cases.",
    status: "on_hold",
    leadAuthorId: "au-2",
    topicIds: ["top-3"],
    experimentIds: [],
    paperIds: [],
    createdAt: "2026-04-15T00:00:00Z",
    updatedAt: "2026-07-01T00:00:00Z",
  },
];

const papers: Paper[] = [
  {
    id: "pap-1",
    projectId: "proj-1",
    title: {
      value: "Contact-Force Feedback and Lesion Durability in Atrial Fibrillation Ablation",
      origin: "user",
      createdAt: "2026-06-20T00:00:00Z",
      reviewedByUser: true,
    },
    authors: [authors[0]!, authors[1]!, authors[2]!],
    topicIds: ["top-1", "top-2"],
    experimentIds: ["exp-1"],
    sections: [
      {
        id: "sec-1",
        type: "abstract",
        referenceIds: [],
        content: {
          value: "Draft pending — abstract will summarize contact-force findings once exp-1 concludes.",
          origin: "ai",
          aiProvider: "placeholder",
          createdAt: "2026-09-01T00:00:00Z",
          reviewedByUser: false,
        },
      },
    ],
    figureIds: [],
    referenceIds: [],
    status: "drafting",
    targetVenue: "Journal of Cardiovascular Electrophysiology",
  },
];

export function getStore(): DataStore {
  return {
    projects: Object.fromEntries(projects.map((p) => [p.id, p])),
    papers: Object.fromEntries(papers.map((p) => [p.id, p])),
    authors: Object.fromEntries(authors.map((a) => [a.id, a])),
    experiments: Object.fromEntries(experiments.map((e) => [e.id, e])),
    topics: Object.fromEntries(topics.map((t) => [t.id, t])),
    methods: {},
    results: {},
    figures: {},
    references: {},
  };
}
