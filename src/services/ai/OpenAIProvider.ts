import { AIProvider } from "./AIProvider";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-4o-mini";

interface OpenAIChoice {
  message: {
    role: string;
    content: string;
  };
}

interface OpenAIResponse {
  choices: OpenAIChoice[];
  error?: {
    message: string;
    type: string;
    code: string;
  };
}

export class OpenAIProvider implements AIProvider {
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model: string = DEFAULT_MODEL) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async analyze(prompt: string): Promise<string> {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });

    const data: OpenAIResponse = await response.json();

    if (!response.ok) {
      const errorMessage = data.error?.message ?? `HTTP ${response.status}`;
      throw new Error(`OpenAI API error: ${errorMessage}`);
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI returned an empty response");
    }

    return content;
  }

  validateApiKey(apiKey: string): boolean {
    return apiKey.startsWith("sk-") && apiKey.length > 20;
  }
}
