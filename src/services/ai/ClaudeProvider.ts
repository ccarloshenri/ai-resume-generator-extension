import { AIProvider } from "./AIProvider";

// IMPORTANT — CORS NOTE:
// The Anthropic API (api.anthropic.com) does NOT allow direct browser requests
// because it does not include CORS headers permitting cross-origin calls from
// extension popups or web pages.  As of 2024 this is a known limitation.
//
// Two viable workarounds:
// 1. Use the Anthropic SDK in a service worker background script (MV3 allows
//    fetch from service workers without CORS restrictions).
// 2. Route through a lightweight proxy you control that forwards the request
//    and adds the necessary CORS headers.
//
// The implementation below is provided as-is. It will work if Anthropic ever
// enables CORS for extensions, or if it is moved into a background service
// worker.  When the popup tries to use it directly it will receive a network
// error, at which point the error is surfaced to the user with a helpful
// message.

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-3-haiku-20240307";
const ANTHROPIC_VERSION = "2023-06-01";

interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

interface ClaudeResponse {
  content?: Array<{ type: string; text: string }>;
  error?: {
    type: string;
    message: string;
  };
}

export class ClaudeProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model: string = DEFAULT_MODEL) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async analyze(prompt: string): Promise<string> {
    const messages: ClaudeMessage[] = [{ role: "user", content: prompt }];

    let response: Response;

    try {
      response = await fetch(CLAUDE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": ANTHROPIC_VERSION,
          // anthropic-dangerous-direct-browser-access is required for direct
          // browser usage, but this header alone does not resolve CORS.
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 4096,
          temperature: 0.3,
          messages,
        }),
      });
    } catch (networkError) {
      throw new Error(
        "Claude API request failed — this is likely a CORS issue. " +
          "Claude does not currently support direct browser calls. " +
          "Please switch to OpenAI or Gemini in Settings. " +
          `(Original error: ${networkError instanceof Error ? networkError.message : String(networkError)})`
      );
    }

    const data: ClaudeResponse = await response.json();

    if (!response.ok) {
      const errorMessage = data.error?.message ?? `HTTP ${response.status}`;
      throw new Error(`Claude API error: ${errorMessage}`);
    }

    const text = data.content?.find((block) => block.type === "text")?.text;
    if (!text) {
      throw new Error("Claude returned an empty response");
    }

    return text;
  }

  validateApiKey(apiKey: string): boolean {
    return apiKey.startsWith("sk-ant-") && apiKey.length > 20;
  }
}
