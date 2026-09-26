import { AIProvider, AIRequest, AIResponse } from "./types";
import { MockAIProvider } from "./providers/mock-provider";

// Single entry point the rest of the app calls. Swap getActiveProvider()'s
// return value (or make it env-driven) once a real provider is wired up —
// no other file needs to change.
const providers: Record<string, AIProvider> = {
  mock: new MockAIProvider(),
};

export function getActiveProvider(): AIProvider {
  return providers.mock!;
}

export async function runAI(request: AIRequest): Promise<AIResponse> {
  return getActiveProvider().run(request);
}

export type { AIProvider, AIRequest, AIResponse } from "./types";
