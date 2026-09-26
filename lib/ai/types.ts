// AI service layer — provider-agnostic contract.
// Nothing outside lib/ai/ should import a specific vendor SDK. Pages and
// components depend only on AIProvider, so swapping/adding a vendor never
// touches UI code.

export type AICapability =
  | "literature_summarization"
  | "experimental_interpretation"
  | "figure_interpretation"
  | "manuscript_drafting"
  | "citation_assistance"
  | "writing_refinement"
  | "hypothesis_generation"
  | "knowledge_retrieval";

export interface AIRequest {
  capability: AICapability;
  input: string;
  context?: Record<string, unknown>;
}

export interface AIResponse {
  output: string;
  provider: string;
  model?: string;
  capability: AICapability;
  /** true while no real model is wired up — lets the UI label drafts clearly */
  isPlaceholder: boolean;
}

export interface AIProvider {
  readonly name: string;
  readonly supportedCapabilities: AICapability[];
  run(request: AIRequest): Promise<AIResponse>;
}
