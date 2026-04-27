import { AIProvider } from "@/services/ai/AIProvider";
import { buildResumeGenerationPrompt } from "./promptBuilder";
import { GeneratedResume } from "@/types/AnalysisResult";
import { JobPosting } from "@/types/JobPosting";
import { Language } from "@/types/enums";

export async function generateTailoredResume(
  aiProvider: AIProvider,
  jobPosting: JobPosting,
  resume: string,
  linkedinProfile: string,
  language: Language
): Promise<GeneratedResume> {
  const prompt = buildResumeGenerationPrompt(
    jobPosting,
    resume,
    linkedinProfile,
    language
  );

  const content = await aiProvider.analyze(prompt);

  return {
    content: content.trim(),
    jobTitle: jobPosting.title,
    generatedAt: new Date().toISOString(),
  };
}
