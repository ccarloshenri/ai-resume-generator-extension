import { useState, useEffect } from "react";
import { useAppContext } from "@/popup/context/AppContext";
import { LoadingSpinner } from "@/popup/components/LoadingSpinner";
import { ErrorBanner } from "@/popup/components/ErrorBanner";
import { Page, MessageType } from "@/types/enums";
import { JobPosting } from "@/types/JobPosting";
import { createAIProvider } from "@/services/ai/AIProviderFactory";
import { analyzeJobMatch } from "@/services/resume/atsAnalyzer";
import { generateTailoredResume } from "@/services/resume/resumeGenerator";

type ScanStatus = "scanning" | "found" | "manual";

export function AnalyzePage() {
  const {
    apiKey,
    aiProvider,
    language,
    resume,
    linkedinProfile,
    currentJob,
    setCurrentJob,
    setAnalysisResult,
    setGeneratedResume,
    navigateTo,
  } = useAppContext();

  const [scanStatus, setScanStatus] = useState<ScanStatus>("scanning");
  const [manualJobText, setManualJobText] = useState("");
  const [manualJobTitle, setManualJobTitle] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    scanActiveTab();
  }, []);

  async function scanActiveTab() {
    setScanStatus("scanning");

    try {
      const [activeTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!activeTab.id) {
        setScanStatus("manual");
        return;
      }

      const response = await chrome.tabs.sendMessage(activeTab.id, {
        type: MessageType.ScanJob,
      });

      if (response?.type === MessageType.JobScanResult && response.payload) {
        setCurrentJob(response.payload as JobPosting);
        setScanStatus("found");
      } else {
        setScanStatus("manual");
      }
    } catch {
      // The content script may not be loaded on the current tab (e.g. a new tab
      // page or chrome:// URL).  Fall through to manual entry.
      setScanStatus("manual");
    }
  }

  function buildJobFromManualInput(): JobPosting | null {
    const description = manualJobText.trim();
    const title = manualJobTitle.trim() || "Job Posting";

    if (!description) return null;

    return { title, description };
  }

  function resolveActiveJob(): JobPosting | null {
    if (scanStatus === "found" && currentJob) return currentJob;
    return buildJobFromManualInput();
  }

  function validateInputsBeforeCall(): string | null {
    if (!apiKey) {
      return "API key not configured. Go to Settings and add your API key.";
    }

    if (!resume.trim() && !linkedinProfile.trim()) {
      return "No profile data found. Go to Profile and add your resume or LinkedIn profile.";
    }

    const job = resolveActiveJob();
    if (!job) {
      return "Please enter a job description to analyze.";
    }

    return null;
  }

  async function handleAnalyzeMatch() {
    const validationError = validateInputsBeforeCall();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const job = resolveActiveJob()!;
    setErrorMessage(null);
    setIsAnalyzing(true);

    try {
      const provider = createAIProvider(aiProvider, apiKey);
      const result = await analyzeJobMatch(
        provider,
        job,
        resume,
        linkedinProfile,
        language
      );

      setAnalysisResult(result);
      setCurrentJob(job);
      navigateTo(Page.Result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Analysis failed. Please check your API key and try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleGenerateResume() {
    const validationError = validateInputsBeforeCall();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const job = resolveActiveJob()!;
    setErrorMessage(null);
    setIsGenerating(true);

    try {
      const provider = createAIProvider(aiProvider, apiKey);
      const generated = await generateTailoredResume(
        provider,
        job,
        resume,
        linkedinProfile,
        language
      );

      setGeneratedResume(generated);
      setCurrentJob(job);
      navigateTo(Page.Result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Resume generation failed. Please check your API key and try again."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  const isLoading = isAnalyzing || isGenerating;

  if (isLoading) {
    return (
      <div className="p-4">
        <LoadingSpinner
          message={
            isAnalyzing
              ? "Analyzing job match... This may take a moment."
              : "Generating tailored resume... This may take a moment."
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-lg font-semibold text-white">Analyze Job</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Match your profile against a job posting.
        </p>
      </div>

      {errorMessage && (
        <ErrorBanner
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      {/* Job source section */}
      {scanStatus === "scanning" && (
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-3">
          <p className="text-sm text-gray-400">
            Scanning current page for job posting...
          </p>
        </div>
      )}

      {scanStatus === "found" && currentJob && (
        <div className="rounded-lg border border-green-700 bg-green-950 p-3 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-green-400 uppercase tracking-wide">
              Job detected
            </p>
            <button
              onClick={() => setScanStatus("manual")}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Enter manually
            </button>
          </div>
          <p className="text-sm font-medium text-white">{currentJob.title}</p>
          {currentJob.company && (
            <p className="text-xs text-gray-400">{currentJob.company}</p>
          )}
          <p className="text-xs text-gray-500 line-clamp-2">
            {currentJob.description.slice(0, 120)}...
          </p>
        </div>
      )}

      {scanStatus === "manual" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-300">
              Paste job description
            </p>
            <button
              onClick={scanActiveTab}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Retry scan
            </button>
          </div>

          <input
            type="text"
            value={manualJobTitle}
            onChange={(e) => setManualJobTitle(e.target.value)}
            placeholder="Job title (optional)"
            className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <textarea
            value={manualJobText}
            onChange={(e) => setManualJobText(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={7}
            className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-2.5">
        <button
          onClick={handleAnalyzeMatch}
          disabled={isLoading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Analyze Match
        </button>

        <button
          onClick={handleGenerateResume}
          disabled={isLoading}
          className="w-full rounded-lg border border-blue-600 bg-transparent px-4 py-2.5 text-sm font-semibold text-blue-400 hover:bg-blue-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Generate Tailored Resume
        </button>
      </div>

      {/* Info hints */}
      {!apiKey && (
        <p className="text-xs text-yellow-400 text-center">
          No API key found — configure one in Settings before analyzing.
        </p>
      )}
      {!resume.trim() && !linkedinProfile.trim() && (
        <p className="text-xs text-yellow-400 text-center">
          No profile data — add your resume in the Profile tab.
        </p>
      )}
    </div>
  );
}
