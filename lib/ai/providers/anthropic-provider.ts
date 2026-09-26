import { AICapability, AIProvider, AIRequest, AIResponse } from "../types";

// Stub. Wire up with the Anthropic SDK server-side (never call the API
// directly from client components — route requests through a server action
// or API route so the key stays server-only).
export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";
  readonly supportedCapabilities: AICapability[] = [
    "literature_summarization",
    "experimental_interpretation",
    "manuscript_drafting",
    "citation_assistance",
    "writing_refinement",
    "hypothesis_generation",
  ];

  async run(_request: AIRequest): Promise<AIResponse> {
    throw new Error(
      "AnthropicProvider is not yet wired up. Add ANTHROPIC_API_KEY and implement run() using the Anthropic SDK from a server context."
    );
  }
}
