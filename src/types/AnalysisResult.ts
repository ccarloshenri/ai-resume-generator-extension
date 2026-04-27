export type Recommendation = "apply" | "improve" | "not_a_fit";

export interface AnalysisResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  recommendation: Recommendation;
  summary: string;
}

export interface GeneratedResume {
  content: string;
  jobTitle: string;
  generatedAt: string;
}
