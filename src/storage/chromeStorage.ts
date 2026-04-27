import { AIProviderName, Language } from "@/types/enums";

export interface StoredSettings {
  apiKey: string;
  aiProvider: AIProviderName;
  language: Language;
}

export interface StoredProfile {
  resume: string;
  linkedinProfile: string;
}

// Keys used in chrome.storage.local — centralized to avoid typos.
const STORAGE_KEYS = {
  API_KEY: "apiKey",
  AI_PROVIDER: "aiProvider",
  LANGUAGE: "language",
  RESUME: "resume",
  LINKEDIN_PROFILE: "linkedinProfile",
} as const;

function getFromStorage<T>(keys: string[]): Promise<Record<string, T>> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (items) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(items as Record<string, T>);
      }
    });
  });
}

function setInStorage(items: Record<string, unknown>): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(items, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

export async function loadSettings(): Promise<StoredSettings> {
  const items = await getFromStorage<string>([
    STORAGE_KEYS.API_KEY,
    STORAGE_KEYS.AI_PROVIDER,
    STORAGE_KEYS.LANGUAGE,
  ]);

  return {
    apiKey: (items[STORAGE_KEYS.API_KEY] as string) ?? "",
    aiProvider:
      (items[STORAGE_KEYS.AI_PROVIDER] as AIProviderName) ??
      AIProviderName.OpenAI,
    language: (items[STORAGE_KEYS.LANGUAGE] as Language) ?? Language.English,
  };
}

export async function saveSettings(settings: StoredSettings): Promise<void> {
  await setInStorage({
    [STORAGE_KEYS.API_KEY]: settings.apiKey,
    [STORAGE_KEYS.AI_PROVIDER]: settings.aiProvider,
    [STORAGE_KEYS.LANGUAGE]: settings.language,
  });
}

export async function loadProfile(): Promise<StoredProfile> {
  const items = await getFromStorage<string>([
    STORAGE_KEYS.RESUME,
    STORAGE_KEYS.LINKEDIN_PROFILE,
  ]);

  return {
    resume: (items[STORAGE_KEYS.RESUME] as string) ?? "",
    linkedinProfile: (items[STORAGE_KEYS.LINKEDIN_PROFILE] as string) ?? "",
  };
}

export async function saveProfile(profile: StoredProfile): Promise<void> {
  await setInStorage({
    [STORAGE_KEYS.RESUME]: profile.resume,
    [STORAGE_KEYS.LINKEDIN_PROFILE]: profile.linkedinProfile,
  });
}

export async function loadApiKey(): Promise<string> {
  const items = await getFromStorage<string>([STORAGE_KEYS.API_KEY]);
  return (items[STORAGE_KEYS.API_KEY] as string) ?? "";
}

export async function loadLanguage(): Promise<Language> {
  const items = await getFromStorage<string>([STORAGE_KEYS.LANGUAGE]);
  return (items[STORAGE_KEYS.LANGUAGE] as Language) ?? Language.English;
}
