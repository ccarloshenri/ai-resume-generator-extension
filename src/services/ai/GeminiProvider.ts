import { AIProvider } from "./AIProvider";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

interface GeminiPart {
  text: string;
}

interface GeminiContent {
  parts: GeminiPart[];
}

interface GeminiCandidate {
  content: GeminiContent;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  error?: {
    message: string;
    code: number;
  };
}

export class GeminiProvider implements AIProvider {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async analyze(prompt: string): Promise<string> {
    const url = `${GEMINI_API_URL}?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
        },
      }),
    });

    const data: GeminiResponse = await response.json();

    if (!response.ok) {
      const errorMessage = data.error?.message ?? `HTTP ${response.status}`;
      throw new Error(`Gemini API error: ${errorMessage}`);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Gemini returned an empty response");
    }

    return text;
  }

  validateApiKey(apiKey: string): boolean {
    // Gemini API keys are 39-character alphanumeric strings starting with "AI"
    return apiKey.length > 10;
  }
}
