// Content script: runs in the context of every web page.
// Listens for a SCAN_JOB message from the popup and responds with
// a structured JobPosting extracted from the current page.

interface ScannedJob {
  title: string;
  company?: string;
  location?: string;
  description: string;
  source: string;
}

interface ScanSuccessMessage {
  type: "JOB_SCAN_RESULT";
  payload: ScannedJob;
}

interface ScanErrorMessage {
  type: "SCAN_ERROR";
  payload: { message: string };
}

type ScanResponseMessage = ScanSuccessMessage | ScanErrorMessage;

// ─── Selector strategies per job board ─────────────────────────────────────

function extractFromLinkedIn(): ScannedJob | null {
  const titleEl =
    document.querySelector(".job-details-jobs-unified-top-card__job-title") ??
    document.querySelector("h1.t-24");
  const companyEl = document.querySelector(
    ".job-details-jobs-unified-top-card__company-name"
  );
  const locationEl = document.querySelector(
    ".job-details-jobs-unified-top-card__primary-description-container"
  );
  const descriptionEl =
    document.querySelector(".jobs-description__content") ??
    document.querySelector(".jobs-box__html-content");

  if (!titleEl || !descriptionEl) return null;

  return {
    title: titleEl.textContent?.trim() ?? "",
    company: companyEl?.textContent?.trim(),
    location: locationEl?.textContent?.trim(),
    description: descriptionEl.textContent?.trim() ?? "",
    source: "linkedin",
  };
}

function extractFromIndeed(): ScannedJob | null {
  const titleEl =
    document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]') ??
    document.querySelector("h1.jobsearch-JobInfoHeader-title");
  const companyEl = document.querySelector(
    '[data-testid="inlineHeader-companyName"]'
  );
  const locationEl = document.querySelector(
    '[data-testid="job-location"]'
  );
  const descriptionEl = document.querySelector("#jobDescriptionText");

  if (!titleEl || !descriptionEl) return null;

  return {
    title: titleEl.textContent?.trim() ?? "",
    company: companyEl?.textContent?.trim(),
    location: locationEl?.textContent?.trim(),
    description: descriptionEl.textContent?.trim() ?? "",
    source: "indeed",
  };
}

function extractFromGlassdoor(): ScannedJob | null {
  const titleEl = document.querySelector(
    '[data-test="job-title"], .job-title, h1[class*="title"]'
  );
  const companyEl = document.querySelector(
    '[data-test="employer-name"], .employer-name'
  );
  const descriptionEl = document.querySelector(
    '[class*="JobDetails_jobDescription"], [data-test="description"]'
  );

  if (!titleEl || !descriptionEl) return null;

  return {
    title: titleEl.textContent?.trim() ?? "",
    company: companyEl?.textContent?.trim(),
    description: descriptionEl.textContent?.trim() ?? "",
    source: "glassdoor",
  };
}

function extractFromGreenhouseOrLever(): ScannedJob | null {
  // Greenhouse and Lever share similar structures
  const titleEl =
    document.querySelector(".app-title") ??
    document.querySelector(".posting-headline h2") ??
    document.querySelector('[class*="posting"] h2');
  const companyEl =
    document.querySelector(".company-name") ??
    document.querySelector('[class*="company"]');
  const descriptionEl =
    document.querySelector("#content") ??
    document.querySelector(".posting-description") ??
    document.querySelector('[class*="description"]');

  if (!titleEl || !descriptionEl) return null;

  return {
    title: titleEl.textContent?.trim() ?? "",
    company: companyEl?.textContent?.trim(),
    description: descriptionEl.textContent?.trim() ?? "",
    source: "greenhouse_lever",
  };
}

// ─── Generic fallback ───────────────────────────────────────────────────────

function extractGenericFallback(): ScannedJob {
  // Use the page title as the job title and the full visible text as description.
  const title = document.title || "Job Posting";

  // Collect all visible text from the body, excluding scripts and styles.
  const bodyText = Array.from(document.body.querySelectorAll("*"))
    .filter(
      (el) =>
        el.tagName !== "SCRIPT" &&
        el.tagName !== "STYLE" &&
        el.tagName !== "NOSCRIPT" &&
        el.childElementCount === 0 &&
        el.textContent?.trim()
    )
    .map((el) => el.textContent?.trim())
    .filter(Boolean)
    .join("\n");

  return {
    title,
    description:
      bodyText.slice(0, 8000) ||
      "Could not extract job description from this page.",
    source: "generic",
  };
}

// ─── Main extraction orchestrator ──────────────────────────────────────────

function scanCurrentPage(): ScannedJob {
  const hostname = window.location.hostname;

  if (hostname.includes("linkedin.com")) {
    const result = extractFromLinkedIn();
    if (result) return result;
  }

  if (hostname.includes("indeed.com")) {
    const result = extractFromIndeed();
    if (result) return result;
  }

  if (hostname.includes("glassdoor.com")) {
    const result = extractFromGlassdoor();
    if (result) return result;
  }

  if (
    hostname.includes("greenhouse.io") ||
    hostname.includes("lever.co") ||
    hostname.includes("jobs.lever.co")
  ) {
    const result = extractFromGreenhouseOrLever();
    if (result) return result;
  }

  // None of the specific extractors matched — use the generic fallback.
  return extractGenericFallback();
}

// ─── Message listener ───────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener(
  (
    message: { type: string },
    _sender,
    sendResponse: (response: ScanResponseMessage) => void
  ) => {
    if (message.type !== "SCAN_JOB") return false;

    try {
      const job = scanCurrentPage();
      sendResponse({ type: "JOB_SCAN_RESULT", payload: job });
    } catch (error) {
      sendResponse({
        type: "SCAN_ERROR",
        payload: {
          message:
            error instanceof Error ? error.message : "Unknown scan error",
        },
      });
    }

    // Return true to signal that sendResponse will be called asynchronously
    // (even though here it's synchronous, some browsers require this when
    // returning a value from the listener).
    return true;
  }
);
