import { AIProvider } from "@/services/ai/AIProvider";
import { buildAnalysisPrompt } from "./promptBuilder";
import { AnalysisResult } from "@/types/AnalysisResult";
import { JobPosting } from "@/types/JobPosting";
import { Language } from "@/types/enums";

function parseAnalysisResponse(rawResponse: string): AnalysisResult {
  // Strip markdown code fences if the model wrapped its JSON response.
  const cleaned = rawResponse
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      `AI returned an invalid JSON response. Raw response: ${rawResponse.slice(0, 200)}`
    );
  }

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("AI returned a non-object JSON response");
  }

  const obj = parsed as Record<string, unknown>;

  const matchScore = Number(obj.matchScore);
  if (isNaN(matchScore) || matchScore < 0 || matchScore > 100) {
    throw new Error("AI returned an invalid matchScore");
  }

  return {
    matchScore: Math.round(matchScore),
    matchedSkills: Array.isArray(obj.matchedSkills)
      ? (obj.matchedSkills as string[])
      : [],
    missingSkills: Array.isArray(obj.missingSkills)
      ? (obj.missingSkills as string[])
      : [],
    suggestions: Array.isArray(obj.suggestions)
      ? (obj.suggestions as string[])
      : [],
    recommendation:
      obj.recommendation === "apply" ||
      obj.recommendation === "improve" ||
      obj.recommendation === "not_a_fit"
        ? obj.recommendation
        : "improve",
    summary: typeof obj.summary === "string" ? obj.summary : "",
  };
}

export async function analyzeJobMatch(
  aiProvider: AIProvider,
  jobPosting: JobPosting,
  resume: string,
  linkedinProfile: string,
  language: Language
): Promise<AnalysisResult> {
  const prompt = buildAnalysisPrompt(jobPosting, resume, linkedinProfile, language);
  const rawResponse = await aiProvider.analyze(prompt);
  return parseAnalysisResponse(rawResponse);
}
