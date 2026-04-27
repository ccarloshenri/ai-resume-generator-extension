# AI Resume Generator — Chrome Extension

A Chrome Extension (Manifest V3) that analyzes job postings and generates tailored resumes using AI, based on your actual resume and LinkedIn profile.

## Features

- **Analyze Match** — Compare any job posting against your profile and get a scored breakdown of matched skills, missing skills, and actionable suggestions.
- **Generate Tailored Resume** — Produce an ATS-optimized resume customized for a specific job, rewriting your summary and highlighting relevant experience.
- **Multi-provider AI** — Works with OpenAI (GPT-4o Mini), Google Gemini (1.5 Flash), and Anthropic Claude (see CORS note below).
- **Language selector** — All outputs can be in English or Portuguese (BR), regardless of input language.
- **No backend** — All requests go directly from your browser to the AI provider using your own API key.
- **Private** — Your resume, LinkedIn profile, and API key are stored only in your local browser storage (`chrome.storage.local`).

## Tech Stack

- Chrome Extension Manifest V3
- React 18 + TypeScript
- Vite 6
- TailwindCSS 3
- Clean architecture with separated services, types, and UI

## Project Structure

```
src/
  popup/
    App.tsx                  # Root component + state-based router
    index.tsx                # React entry point
    index.css                # Tailwind base styles
    context/
      AppContext.tsx          # Global state (settings, profile, results)
    components/
      BottomNav.tsx
      ErrorBanner.tsx
      LoadingSpinner.tsx
      MatchScoreBar.tsx
    pages/
      SettingsPage.tsx        # API key, provider, language
      ProfilePage.tsx         # Resume + LinkedIn profile input
      AnalyzePage.tsx         # Job scan + AI actions
      ResultPage.tsx          # Analysis results + generated resume
  content/
    jobScanner.ts             # Content script — detects job postings
  services/
    ai/
      AIProvider.ts           # Interface
      OpenAIProvider.ts
      GeminiProvider.ts
      ClaudeProvider.ts
      AIProviderFactory.ts
    resume/
      promptBuilder.ts        # Builds honest AI prompts
      atsAnalyzer.ts          # Parses analysis JSON from AI
      resumeGenerator.ts
  storage/
    chromeStorage.ts          # Typed chrome.storage wrappers
  types/
    Resume.ts
    LinkedInProfile.ts
    JobPosting.ts
    AnalysisResult.ts
    enums.ts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- A Chromium-based browser (Chrome, Edge, Brave, etc.)

### Install dependencies

```bash
npm install
```

### Build the extension

```bash
npm run build
```

This produces a `dist/` folder with the compiled extension.

### Load in Chrome

1. Open `chrome://extensions` in your browser.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked**.
4. Select the `dist/` folder.

The extension icon will appear in the toolbar.

### Development (watch mode)

```bash
npm run dev
```

Vite will rebuild on every file change. Reload the extension in `chrome://extensions` after each rebuild (click the refresh icon on the extension card).

### Type check

```bash
npm run type-check
```

## Configuration

### Settings tab

1. Select your **AI Provider** (OpenAI recommended for best browser compatibility).
2. Paste your **API key**.
3. Choose the **output language** (English or Portuguese).
4. Click **Save Settings**.

### Profile tab

1. Paste your full **resume text**.
2. Paste your **LinkedIn profile** text (About section + experience).
3. Click **Save Profile**.

### Analyze tab

Open a job posting page (LinkedIn Jobs, Indeed, Glassdoor, Greenhouse, Lever, etc.) then open the extension popup. The content script will automatically detect the job. If auto-detection fails, paste the job description manually.

- Click **Analyze Match** to get a scored breakdown.
- Click **Generate Tailored Resume** to produce an optimized resume.

### Result tab

- **Analysis**: Match score (0–100), matched skills, missing skills, suggestions, recommendation.
- **Resume**: Scrollable resume output with **Copy** and **Download .txt** buttons.

## AI Provider Notes

### OpenAI

Recommended. GPT-4o Mini provides excellent quality at low cost. Get a key at <https://platform.openai.com/api-keys>.

### Google Gemini

Gemini 1.5 Flash is fast and cost-effective. Get a key at <https://aistudio.google.com/app/apikey>.

### Anthropic Claude

Claude requires the `anthropic-dangerous-direct-browser-access: true` header for any direct browser call. Even with this header, CORS may still block the request from an extension popup. If you encounter a network error, switch to OpenAI or Gemini.

## Honesty Guarantee

The AI prompts contain strict rules that prevent the model from inventing information. The extension:

- Never adds skills, companies, certifications, or achievements not present in your source data.
- Never inflates metrics or numbers.
- Highlights gaps instead of fabricating experience.
- Only rephrases and reorganizes real content.

## License

MIT
