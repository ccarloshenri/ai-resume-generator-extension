import { useState } from "react";
import { useAppContext } from "@/popup/context/AppContext";
import { saveProfile } from "@/storage/chromeStorage";
import { ErrorBanner } from "@/popup/components/ErrorBanner";

const RESUME_PLACEHOLDER = `Paste your full resume text here.

Example:
John Doe
john.doe@email.com | +1 555 0100

SUMMARY
Senior software engineer with 8 years of experience in full-stack development...

SKILLS
JavaScript, TypeScript, React, Node.js, PostgreSQL...

EXPERIENCE
Senior Engineer — Acme Corp (2020–Present)
• Built scalable REST APIs serving 2M+ requests/day
• Led migration from monolith to microservices...`;

const LINKEDIN_PLACEHOLDER = `Paste your LinkedIn profile text here (copy from your About section and experience).

Include:
- Headline
- About/Summary
- Experience entries
- Skills
- Certifications`;

export function ProfilePage() {
  const { resume, linkedinProfile, setResume, setLinkedinProfile } =
    useAppContext();

  const [localResume, setLocalResume] = useState(resume);
  const [localLinkedin, setLocalLinkedin] = useState(linkedinProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSave() {
    setErrorMessage(null);
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      await saveProfile({
        resume: localResume,
        linkedinProfile: localLinkedin,
      });

      setResume(localResume);
      setLinkedinProfile(localLinkedin);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to save profile."
      );
    } finally {
      setIsSaving(false);
    }
  }

  const resumeWordCount = localResume.trim()
    ? localResume.trim().split(/\s+/).length
    : 0;
  const linkedinWordCount = localLinkedin.trim()
    ? localLinkedin.trim().split(/\s+/).length
    : 0;

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-lg font-semibold text-white">Your Profile</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Paste your resume and LinkedIn profile. This data stays on your device.
        </p>
      </div>

      {errorMessage && (
        <ErrorBanner
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      {saveSuccess && (
        <div className="rounded-lg border border-green-700 bg-green-950 p-3 text-sm text-green-300">
          Profile saved successfully.
        </div>
      )}

      {/* Resume textarea */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="resume"
            className="block text-sm font-medium text-gray-300"
          >
            Resume
          </label>
          {resumeWordCount > 0 && (
            <span className="text-xs text-gray-500">
              {resumeWordCount} words
            </span>
          )}
        </div>
        <textarea
          id="resume"
          value={localResume}
          onChange={(e) => setLocalResume(e.target.value)}
          placeholder={RESUME_PLACEHOLDER}
          rows={8}
          className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed"
        />
      </div>

      {/* LinkedIn textarea */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="linkedin"
            className="block text-sm font-medium text-gray-300"
          >
            LinkedIn Profile
          </label>
          {linkedinWordCount > 0 && (
            <span className="text-xs text-gray-500">
              {linkedinWordCount} words
            </span>
          )}
        </div>
        <textarea
          id="linkedin"
          value={localLinkedin}
          onChange={(e) => setLocalLinkedin(e.target.value)}
          placeholder={LINKEDIN_PLACEHOLDER}
          rows={6}
          className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSaving ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}
