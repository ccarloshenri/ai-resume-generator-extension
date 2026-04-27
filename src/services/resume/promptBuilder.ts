import { Language } from "@/types/enums";
import { JobPosting } from "@/types/JobPosting";

const LANGUAGE_NAMES: Record<Language, string> = {
  [Language.English]: "English",
  [Language.Portuguese]: "Brazilian Portuguese",
};

// Shared preamble enforcing honesty rules, injected into every prompt.
function buildHonestyRules(language: Language): string {
  const lang = LANGUAGE_NAMES[language];
  return `
STRICT HONESTY RULES — YOU MUST FOLLOW THESE WITHOUT EXCEPTION:
1. NEVER invent, fabricate, or assume any information not explicitly present in the user's resume or LinkedIn profile.
2. NEVER add fake skills, technologies, certifications, metrics, companies, titles, or achievements.
3. NEVER inflate numbers or percentages that are not in the source material.
4. You MAY rewrite, reorder, translate, and rephrase existing content to sound more professional.
5. You MAY use keywords from the job description ONLY if they genuinely match something in the user's real experience.
6. If a required skill is missing, clearly note it as a gap — do not pretend it exists.
7. ALL output MUST be written entirely in ${lang}. This is mandatory regardless of the input language.
`.trim();
}

export function buildAnalysisPrompt(
  jobPosting: JobPosting,
  resume: string,
  linkedinProfile: string,
  language: Language
): string {
  return `
${buildHonestyRules(language)}

---

You are an expert ATS (Applicant Tracking System) analyst and career coach.

Analyze how well the candidate's profile matches the following job posting and return a structured JSON response.

JOB POSTING:
Title: ${jobPosting.title}
${jobPosting.company ? `Company: ${jobPosting.company}` : ""}
${jobPosting.location ? `Location: ${jobPosting.location}` : ""}

Description:
${jobPosting.description}

---

CANDIDATE RESUME:
${resume || "(No resume provided)"}

---

CANDIDATE LINKEDIN PROFILE:
${linkedinProfile || "(No LinkedIn profile provided)"}

---

Return ONLY a valid JSON object (no markdown, no explanation outside the JSON) with this exact structure:
{
  "matchScore": <integer 0-100>,
  "matchedSkills": [<array of skill strings found in both job and candidate profile>],
  "missingSkills": [<array of skill strings required by job but NOT in candidate profile>],
  "suggestions": [<array of 3-5 actionable suggestion strings in ${LANGUAGE_NAMES[language]}>],
  "recommendation": <"apply" | "improve" | "not_a_fit">,
  "summary": "<2-3 sentence summary of the match in ${LANGUAGE_NAMES[language]}>"
}

Rules for recommendation:
- "apply" if matchScore >= 70
- "improve" if matchScore >= 40 and < 70
- "not_a_fit" if matchScore < 40
`.trim();
}

export function buildResumeGenerationPrompt(
  jobPosting: JobPosting,
  resume: string,
  linkedinProfile: string,
  language: Language
): string {
  return `
${buildHonestyRules(language)}

---

You are an expert resume writer and career coach.

Generate a tailored, ATS-optimized resume for the candidate applying to the job below.
Use ONLY the information from the candidate's resume and LinkedIn profile.

JOB POSTING:
Title: ${jobPosting.title}
${jobPosting.company ? `Company: ${jobPosting.company}` : ""}
${jobPosting.location ? `Location: ${jobPosting.location}` : ""}

Description:
${jobPosting.description}

---

CANDIDATE RESUME:
${resume || "(No resume provided)"}

---

CANDIDATE LINKEDIN PROFILE:
${linkedinProfile || "(No LinkedIn profile provided)"}

---

Generate a complete, professional resume in ${LANGUAGE_NAMES[language]} following these guidelines:

1. CONTACT INFORMATION: Include name, email, phone, LinkedIn URL if present in source data.
2. PROFESSIONAL SUMMARY: Rewrite the summary to highlight relevance to this specific role (2-4 sentences). Use job keywords only where they genuinely apply.
3. SKILLS SECTION: List skills from the candidate's profile that are relevant to this job. Do NOT add skills not mentioned in the source.
4. WORK EXPERIENCE: For each position, highlight responsibilities and achievements that align with the job requirements. Rephrase for clarity and impact. Keep all companies, dates, and titles exactly as in the source.
5. EDUCATION: List as-is from the source.
6. CERTIFICATIONS: List as-is if present.
7. Do NOT include a section if there is no data for it.

Format the resume as plain text with clear section headers (use ALL CAPS for headers).
Use bullet points (•) for experience items.
Do NOT use markdown.
Output ONLY the resume text — no preamble, no explanation, no notes.
`.trim();
}
