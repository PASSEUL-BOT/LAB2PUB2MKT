import { AICapability, AIProvider, AIRequest, AIResponse } from "../types";

// Stub — same shape as AnthropicProvider so the two are interchangeable.
export class OpenAIProvider implements AIProvider {
  readonly name = "openai";
  readonly supportedCapabilities: AICapability[] = [
    "literature_summarization",
    "manuscript_drafting",
    "writing_refinement",
    "figure_interpretation",
  ];

  async run(_request: AIRequest): Promise<AIResponse> {
    throw new Error(
      "OpenAIProvider is not yet wired up. Add OPENAI_API_KEY and implement run() using the OpenAI SDK from a server context."
    );
  }
}
