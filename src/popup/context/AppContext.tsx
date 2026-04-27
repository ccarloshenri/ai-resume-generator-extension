import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Page, AIProviderName, Language } from "@/types/enums";
import { AnalysisResult, GeneratedResume } from "@/types/AnalysisResult";
import { JobPosting } from "@/types/JobPosting";
import { loadSettings, loadProfile } from "@/storage/chromeStorage";

interface AppState {
  currentPage: Page;
  apiKey: string;
  aiProvider: AIProviderName;
  language: Language;
  resume: string;
  linkedinProfile: string;
  currentJob: JobPosting | null;
  analysisResult: AnalysisResult | null;
  generatedResume: GeneratedResume | null;
}

interface AppContextValue extends AppState {
  navigateTo: (page: Page) => void;
  setApiKey: (key: string) => void;
  setAiProvider: (provider: AIProviderName) => void;
  setLanguage: (lang: Language) => void;
  setResume: (text: string) => void;
  setLinkedinProfile: (text: string) => void;
  setCurrentJob: (job: JobPosting | null) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setGeneratedResume: (resume: GeneratedResume | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentPage: Page.Analyze,
    apiKey: "",
    aiProvider: AIProviderName.OpenAI,
    language: Language.English,
    resume: "",
    linkedinProfile: "",
    currentJob: null,
    analysisResult: null,
    generatedResume: null,
  });

  // Load persisted settings and profile on mount.
  useEffect(() => {
    async function hydrate() {
      const [settings, profile] = await Promise.all([
        loadSettings(),
        loadProfile(),
      ]);

      setState((previous) => ({
        ...previous,
        apiKey: settings.apiKey,
        aiProvider: settings.aiProvider,
        language: settings.language,
        resume: profile.resume,
        linkedinProfile: profile.linkedinProfile,
      }));
    }

    hydrate().catch(console.error);
  }, []);

  function navigateTo(page: Page) {
    setState((previous) => ({ ...previous, currentPage: page }));
  }

  function setApiKey(key: string) {
    setState((previous) => ({ ...previous, apiKey: key }));
  }

  function setAiProvider(provider: AIProviderName) {
    setState((previous) => ({ ...previous, aiProvider: provider }));
  }

  function setLanguage(lang: Language) {
    setState((previous) => ({ ...previous, language: lang }));
  }

  function setResume(text: string) {
    setState((previous) => ({ ...previous, resume: text }));
  }

  function setLinkedinProfile(text: string) {
    setState((previous) => ({ ...previous, linkedinProfile: text }));
  }

  function setCurrentJob(job: JobPosting | null) {
    setState((previous) => ({ ...previous, currentJob: job }));
  }

  function setAnalysisResult(result: AnalysisResult | null) {
    setState((previous) => ({ ...previous, analysisResult: result }));
  }

  function setGeneratedResume(resume: GeneratedResume | null) {
    setState((previous) => ({ ...previous, generatedResume: resume }));
  }

  const contextValue: AppContextValue = {
    ...state,
    navigateTo,
    setApiKey,
    setAiProvider,
    setLanguage,
    setResume,
    setLinkedinProfile,
    setCurrentJob,
    setAnalysisResult,
    setGeneratedResume,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
