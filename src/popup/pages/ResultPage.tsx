import { useState } from "react";
import { useAppContext } from "@/popup/context/AppContext";
import { MatchScoreBar } from "@/popup/components/MatchScoreBar";
import { Page } from "@/types/enums";
import { Recommendation } from "@/types/AnalysisResult";

const RECOMMENDATION_CONFIG: Record<
  Recommendation,
  { label: string; colorClass: string }
> = {
  apply: {
    label: "Strong Match — Apply Now",
    colorClass: "border-green-600 bg-green-950 text-green-300",
  },
  improve: {
    label: "Partial Match — Improve First",
    colorClass: "border-yellow-600 bg-yellow-950 text-yellow-300",
  },
  not_a_fit: {
    label: "Not a Fit",
    colorClass: "border-red-700 bg-red-950 text-red-300",
  },
};

type ActiveTab = "analysis" | "resume";

export function ResultPage() {
  const { analysisResult, generatedResume, navigateTo } = useAppContext();
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    analysisResult ? "analysis" : "resume"
  );

  if (!analysisResult && !generatedResume) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-gray-400 text-sm">
          No results yet. Go to the Analyze tab to run an analysis or generate a
          resume.
        </p>
        <button
          onClick={() => navigateTo(Page.Analyze)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
        >
          Go to Analyze
        </button>
      </div>
    );
  }

  async function handleCopyResume() {
    if (!generatedResume) return;
    await navigator.clipboard.writeText(generatedResume.content);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }

  function handleDownloadResume() {
    if (!generatedResume) return;

    const fileName = `resume-${generatedResume.jobTitle
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")}-${Date.now()}.txt`;

    const blob = new Blob([generatedResume.content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const tabs = [
    analysisResult && { id: "analysis" as ActiveTab, label: "Analysis" },
    generatedResume && { id: "resume" as ActiveTab, label: "Resume" },
  ].filter(Boolean) as { id: ActiveTab; label: string }[];

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">Results</h1>
        <button
          onClick={() => navigateTo(Page.Analyze)}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Tab switcher */}
      {tabs.length > 1 && (
        <div className="flex gap-1 rounded-lg bg-gray-800 p-1">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors
                ${activeTab === id ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-200"}
              `}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Analysis tab */}
      {activeTab === "analysis" && analysisResult && (
        <div className="space-y-4">
          {/* Score */}
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
            <MatchScoreBar score={analysisResult.matchScore} />
          </div>

          {/* Recommendation */}
          {(() => {
            const config =
              RECOMMENDATION_CONFIG[analysisResult.recommendation];
            return (
              <div
                className={`rounded-lg border p-3 text-sm font-medium ${config.colorClass}`}
              >
                {config.label}
              </div>
            );
          })()}

          {/* Summary */}
          {analysisResult.summary && (
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                Summary
              </p>
              <p className="text-sm text-gray-200 leading-relaxed">
                {analysisResult.summary}
              </p>
            </div>
          )}

          {/* Matched skills */}
          {analysisResult.matchedSkills.length > 0 && (
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-3 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Matched Skills ({analysisResult.matchedSkills.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {analysisResult.matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-green-900 px-2.5 py-0.5 text-xs text-green-300 border border-green-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing skills */}
          {analysisResult.missingSkills.length > 0 && (
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-3 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Gaps / Missing Skills ({analysisResult.missingSkills.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {analysisResult.missingSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-red-950 px-2.5 py-0.5 text-xs text-red-300 border border-red-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {analysisResult.suggestions.length > 0 && (
            <div className="rounded-lg border border-gray-700 bg-gray-800 p-3 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Suggestions
              </p>
              <ul className="space-y-1.5">
                {analysisResult.suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-300"
                  >
                    <span className="text-blue-400 shrink-0 mt-0.5">
                      {index + 1}.
                    </span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Resume tab */}
      {activeTab === "resume" && generatedResume && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Tailored for:{" "}
              <span className="text-gray-200">{generatedResume.jobTitle}</span>
            </p>
            <p className="text-xs text-gray-500">
              {new Date(generatedResume.generatedAt).toLocaleString()}
            </p>
          </div>

          <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 max-h-72 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-xs text-gray-200 font-mono leading-relaxed">
              {generatedResume.content}
            </pre>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopyResume}
              className="flex-1 rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
            >
              {copySuccess ? "Copied!" : "Copy to Clipboard"}
            </button>
            <button
              onClick={handleDownloadResume}
              className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
            >
              Download .txt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
