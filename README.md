# AI Resume Generator

A Chrome extension that reads a job posting, compares it against your resume and LinkedIn profile, and uses AI to give you a match score and a tailored resume — all from your browser, with no backend or account required.

---

## Getting started

### Prerequisites

- Node.js 18+
- npm 9+
- Chrome, Edge, Brave, or any other Chromium-based browser

### 1. Install dependencies

```bash
npm install
```

### 2. Build the extension

```bash
npm run build
```

This produces a `dist/` folder with the compiled extension.

### 3. Load in Chrome

1. Open `chrome://extensions` in your browser.
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked**.
4. Select the `dist/` folder.

The extension icon will appear in your toolbar. Click it to open the popup.

---

## How to use

The extension has four tabs. Work through them in order the first time.

### Settings

This is where you connect your AI provider.

1. Choose a **provider** — OpenAI is recommended (see AI provider notes below).
2. Paste your **API key**.
3. Choose the **output language** — English or Portuguese (BR).
4. Click **Save Settings**.

You only need to do this once. Your key is stored locally in your browser and never sent anywhere except directly to the AI provider you selected.

### Profile

This is the data the AI uses to write your resume and assess your fit.

1. Paste your full **resume text** — the more complete, the better.
2. Paste your **LinkedIn profile** text — the About section and your work experience are the most useful parts.
3. Click **Save Profile**.

You can update this at any time. Changes take effect on the next analysis.

### Analyze

This is where you run the analysis.

1. Navigate to a job posting page (LinkedIn Jobs, Indeed, Glassdoor, Greenhouse, Lever, and most other job boards are supported).
2. Open the extension popup. It will automatically detect and extract the job description.
3. If the job was not detected automatically, paste the job description into the text field manually.
4. Choose what you want:
   - **Analyze Match** — scores your fit for the role and explains the gaps.
   - **Generate Tailored Resume** — rewrites your resume to highlight the experience most relevant to this job.

### Results

After running an analysis or generating a resume, the Results tab shows the output.

- **Match analysis**: a score from 0 to 100, a list of matched skills, a list of missing skills, specific suggestions for strengthening your application, and an overall recommendation.
- **Tailored resume**: a full resume text optimized for the job. Use the **Copy** button to paste it into a document, or **Download .txt** to save it as a file.

---

## AI provider notes

### OpenAI (recommended)

Uses GPT-4o Mini. Good quality, low cost, and works without any browser compatibility issues. Get a key at <https://platform.openai.com/api-keys>.

### Google Gemini

Uses Gemini 1.5 Flash. Fast and cost-effective. Get a key at <https://aistudio.google.com/app/apikey>.

### Anthropic Claude

Claude requires a special header (`anthropic-dangerous-direct-browser-access: true`) for direct browser calls, and even then CORS may block the request from an extension popup. If you get a network error with Claude, switch to OpenAI or Gemini.

---

## Honesty guarantee

The AI is explicitly instructed not to invent anything. It will not:

- Add skills, certifications, companies, or achievements that are not in your source data.
- Inflate numbers or metrics.
- Fill gaps with fabricated experience.

It only rephrases and reorganizes what you actually provided. Gaps are surfaced honestly, not hidden.

---

## Tips

- **If the job is not detected automatically**, the content script may not have run yet or the page structure may be unusual. Just copy the job description text and paste it manually into the Analyze tab — it works the same way.

- **For better results**, make sure your profile data is complete before running an analysis. A thin resume or a brief LinkedIn summary will produce generic output. The more specific your profile, the more specific the tailored resume.

- **The match score is a guide, not a gate.** A score of 60 with a clear gap list is more useful than a score of 90 with no suggestions. Use the missing skills and suggestions sections to decide what to address in your cover letter or interview prep.

- **Run the analysis fresh for each job.** The extension does not cache results between sessions. If you navigate to a different job posting, open the popup again and click Analyze — it will pick up the new job automatically.

---

## License

MIT
