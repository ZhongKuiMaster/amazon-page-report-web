#!/usr/bin/env node

const baseUrl = process.env.TOOL_PAGE_BASE_URL || "http://127.0.0.1:3000";

const pages = [
  {
    slug: "amazon-review-analyzer",
    checks: [
      "Current result",
      "Parsed 5 reviews",
      "Protected assist",
      "Review status",
      "Complaint themes",
    ],
  },
  {
    slug: "amazon-profit-analyzer",
    checks: [
      "Current result",
      "First-screen operator call",
      "Biggest pressure",
      "Break-even room",
      "First-screen verdict",
    ],
  },
  {
    slug: "amazon-sales-estimator",
    checks: [
      "Current result",
      "Live rank signal",
      "Detected category",
      "Do not cross",
      "Then do",
    ],
  },
  {
    slug: "amazon-listing-title-checker",
    checks: [
      "First-screen operator call",
      "Current result",
      "First blocker",
      "Decision owner",
      "First-screen verdict",
    ],
  },
  {
    slug: "amazon-image-compliance-checker",
    checks: [
      "Live PDP",
      "Detected category",
      "Gallery baseline",
      "Decision owner",
      "Do not cross",
    ],
  },
];

async function main() {
  const results = [];

  for (const page of pages) {
    const response = await fetch(`${baseUrl}/amazon/${page.slug}`, {
      headers: {
        Accept: "text/html",
      },
    });

    if (!response.ok) {
      throw new Error(`${page.slug} returned ${response.status}`);
    }

    const html = await response.text();
    const normalized = html
      .replace(/<!-- -->/g, "")
      .replace(/\s+/g, " ")
      .trim();
    const missing = page.checks.filter((item) => !normalized.includes(item));

    if (missing.length) {
      throw new Error(`${page.slug} is missing expected markers: ${missing.join(", ")}`);
    }

    results.push({
      slug: page.slug,
      status: "ok",
      checks: page.checks.length,
    });
  }

  process.stdout.write(`${JSON.stringify({ baseUrl, pages: results }, null, 2)}\n`);
}

main().catch((error) => {
  console.error(`FAIL: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
