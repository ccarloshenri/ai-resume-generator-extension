import { AIProvider } from "./AIProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import { GeminiProvider } from "./GeminiProvider";
import { ClaudeProvider } from "./ClaudeProvider";
import { AIProviderName } from "@/types/enums";

export function createAIProvider(
  providerName: AIProviderName,
  apiKey: string
): AIProvider {
  switch (providerName) {
    case AIProviderName.OpenAI:
      return new OpenAIProvider(apiKey);
    case AIProviderName.Gemini:
      return new GeminiProvider(apiKey);
    case AIProviderName.Claude:
      return new ClaudeProvider(apiKey);
    default: {
      const exhaustive: never = providerName;
      throw new Error(`Unknown AI provider: ${exhaustive}`);
    }
  }
}

export function validateApiKey(
  providerName: AIProviderName,
  apiKey: string
): boolean {
  const provider = createAIProvider(providerName, apiKey);
  return provider.validateApiKey(apiKey);
}
