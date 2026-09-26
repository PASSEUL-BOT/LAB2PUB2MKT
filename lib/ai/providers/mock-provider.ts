import { AICapability, AIProvider, AIRequest, AIResponse } from "../types";

// Default provider until real model wiring lands. Returns a clearly-labeled
// placeholder so no page can accidentally present this as real AI output.
export class MockAIProvider implements AIProvider {
  readonly name = "mock";
  readonly supportedCapabilities: AICapability[] = [
    "literature_summarization",
    "experimental_interpretation",
    "figure_interpretation",
    "manuscript_drafting",
    "citation_assistance",
    "writing_refinement",
    "hypothesis_generation",
    "knowledge_retrieval",
  ];

  async run(request: AIRequest): Promise<AIResponse> {
    return {
      output: `[Placeholder ${request.capability} output — connect a real provider in lib/ai/index.ts]`,
      provider: this.name,
      capability: request.capability,
      isPlaceholder: true,
    };
  }
}
