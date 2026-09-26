// LAB2PUB v2 — Core Semantic Model
// This file defines the content architecture described in the build spec:
// Projects, Papers, Authors, Experiments, Research Topics, Methods, Results,
// References, AI-generated content, and User-generated content.
//
// These types are the single source of truth for shape of data across the
// app. UI components should never hard-code content structure — they should
// consume these types (or view-models derived from them).

export type ID = string;

export type ContentOrigin = "user" | "ai" | "imported";

/** Wrapper that tags any piece of content with who/what produced it and its
 *  review status. Used for anything AI can draft (summaries, captions,
 *  manuscript sections) so the UI can always show provenance. */
export interface Authored<T> {
  value: T;
  origin: ContentOrigin;
  aiProvider?: string; // set when origin === "ai"
  createdAt: string; // ISO timestamp
  editedAt?: string;
  reviewedByUser: boolean;
}

export type PipelineStage =
  | "experiment"
  | "data"
  | "analysis"
  | "finding"
  | "figure"
  | "manuscript_section"
  | "publication";

export interface Author {
  id: ID;
  name: string;
  affiliation?: string;
  orcid?: string;
  email?: string;
  isCorresponding?: boolean;
}

export type ResearchTopic = {
  id: ID;
  label: string;
  description?: string;
  parentTopicId?: ID; // supports a topic hierarchy
};

export interface Method {
  id: ID;
  name: string;
  description: Authored<string>;
  citedReferenceIds?: ID[];
}

export interface Result {
  id: ID;
  summary: Authored<string>;
  experimentId: ID;
  figureIds?: ID[];
  statisticalNotes?: string;
}

export interface FigureOrTable {
  id: ID;
  kind: "figure" | "table";
  title: string;
  caption: Authored<string>;
  sourceUrl?: string; // placeholder for uploaded asset
  resultIds: ID[];
}

export interface Reference {
  id: ID;
  title: string;
  authors: string[];
  year: number;
  venue?: string;
  doi?: string;
  url?: string;
}

export type ExperimentStatus = "planned" | "in_progress" | "complete" | "blocked";

export interface Experiment {
  id: ID;
  projectId: ID;
  title: string;
  status: ExperimentStatus;
  methodIds: ID[];
  resultIds: ID[];
  topicIds: ID[];
  startedAt?: string;
  completedAt?: string;
  notes?: Authored<string>;
}

export type ManuscriptSectionType =
  | "abstract"
  | "introduction"
  | "methods"
  | "results"
  | "discussion"
  | "conclusion";

export interface ManuscriptSection {
  id: ID;
  type: ManuscriptSectionType;
  content: Authored<string>;
  referenceIds: ID[];
}

export type PublicationStatus =
  | "drafting"
  | "internal_review"
  | "submitted"
  | "in_revision"
  | "accepted"
  | "published";

export interface Paper {
  id: ID;
  projectId: ID;
  title: Authored<string>;
  authors: Author[];
  topicIds: ID[];
  experimentIds: ID[];
  sections: ManuscriptSection[];
  figureIds: ID[];
  referenceIds: ID[];
  status: PublicationStatus;
  targetVenue?: string;
  submittedAt?: string;
  publishedAt?: string;
  doi?: string;
}

export type ProjectStatus = "active" | "on_hold" | "archived";

export interface Project {
  id: ID;
  title: string;
  description: string;
  status: ProjectStatus;
  leadAuthorId: ID;
  topicIds: ID[];
  experimentIds: ID[];
  paperIds: ID[];
  createdAt: string;
  updatedAt: string;
}

/** A single normalized "database" shape the mock service layer (and, later,
 *  a real API layer) resolves into. Keeps entities decoupled and lets pages
 *  request only the ids/relations they need. */
export interface DataStore {
  projects: Record<ID, Project>;
  papers: Record<ID, Paper>;
  authors: Record<ID, Author>;
  experiments: Record<ID, Experiment>;
  topics: Record<ID, ResearchTopic>;
  methods: Record<ID, Method>;
  results: Record<ID, Result>;
  figures: Record<ID, FigureOrTable>;
  references: Record<ID, Reference>;
}
