import { useState } from "react";
import { useAppContext } from "@/popup/context/AppContext";
import { saveSettings } from "@/storage/chromeStorage";
import { AIProviderName, Language } from "@/types/enums";
import { validateApiKey } from "@/services/ai/AIProviderFactory";
import { ErrorBanner } from "@/popup/components/ErrorBanner";

const AI_PROVIDER_OPTIONS: { value: AIProviderName; label: string }[] = [
  { value: AIProviderName.OpenAI, label: "OpenAI (GPT-4o Mini)" },
  { value: AIProviderName.Gemini, label: "Google Gemini 1.5 Flash" },
  { value: AIProviderName.Claude, label: "Anthropic Claude (⚠ CORS limited)" },
];

const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: Language.English, label: "English" },
  { value: Language.Portuguese, label: "Português (BR)" },
];

export function SettingsPage() {
  const {
    apiKey,
    aiProvider,
    language,
    setApiKey,
    setAiProvider,
    setLanguage,
  } = useAppContext();

  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [localProvider, setLocalProvider] = useState(aiProvider);
  const [localLanguage, setLocalLanguage] = useState(language);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  async function handleSave() {
    setErrorMessage(null);
    setSaveSuccess(false);

    if (!localApiKey.trim()) {
      setErrorMessage("API key cannot be empty.");
      return;
    }

    if (!validateApiKey(localProvider, localApiKey.trim())) {
      setErrorMessage(
        `The API key format looks incorrect for ${localProvider}. Please double-check it.`
      );
      return;
    }

    setIsSaving(true);

    try {
      await saveSettings({
        apiKey: localApiKey.trim(),
        aiProvider: localProvider,
        language: localLanguage,
      });

      setApiKey(localApiKey.trim());
      setAiProvider(localProvider);
      setLanguage(localLanguage);
      setSaveSuccess(true);

      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to save settings."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-5 p-4">
      <div>
        <h1 className="text-lg font-semibold text-white">Settings</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Configure your AI provider and preferences.
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
          Settings saved successfully.
        </div>
      )}

      <div className="space-y-4">
        {/* AI Provider */}
        <div className="space-y-1.5">
          <label
            htmlFor="ai-provider"
            className="block text-sm font-medium text-gray-300"
          >
            AI Provider
          </label>
          <select
            id="ai-provider"
            value={localProvider}
            onChange={(e) => setLocalProvider(e.target.value as AIProviderName)}
            className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {AI_PROVIDER_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {localProvider === AIProviderName.Claude && (
            <p className="text-xs text-yellow-400">
              Claude may not work from the browser popup due to CORS
              restrictions. Use OpenAI or Gemini for best results.
            </p>
          )}
        </div>

        {/* API Key */}
        <div className="space-y-1.5">
          <label
            htmlFor="api-key"
            className="block text-sm font-medium text-gray-300"
          >
            API Key
          </label>
          <div className="relative">
            <input
              id="api-key"
              type={showApiKey ? "text" : "password"}
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              placeholder="Paste your API key here"
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 pr-10 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowApiKey((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors text-xs"
              aria-label={showApiKey ? "Hide API key" : "Show API key"}
            >
              {showApiKey ? "Hide" : "Show"}
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Your key is stored only in local browser storage and never sent to
            any server other than the AI provider.
          </p>
        </div>

        {/* Language */}
        <div className="space-y-1.5">
          <label
            htmlFor="language"
            className="block text-sm font-medium text-gray-300"
          >
            Output Language
          </label>
          <select
            id="language"
            value={localLanguage}
            onChange={(e) => setLocalLanguage(e.target.value as Language)}
            className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {LANGUAGE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            All AI outputs (analysis, suggestions, resume) will be in this
            language regardless of input language.
          </p>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSaving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
