#!/usr/bin/env node

const baseUrl = process.env.TOOL_PAGE_BASE_URL || "http://127.0.0.1:3000";

function normalizeText(value) {
  return value
    .replace(/<!-- -->/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const cases = [
  {
    slug: "amazon-review-analyzer",
    checks: [
      "Parsed 5 reviews. Pick one complaint to fix first.",
      "Current result",
      "Review status",
      "Protected assist",
    ],
  },
  {
    slug: "amazon-profit-analyzer",
    checks: [
      "Visible sell price",
      "Cost basis",
      "Fulfillment basis",
      "Do not cross",
    ],
  },
  {
    slug: "amazon-sales-estimator",
    checks: [
      "Live rank signal",
      "Detected category",
      "Execution call",
      "Do not cross",
    ],
  },
  {
    slug: "amazon-listing-title-checker",
    checks: [
      "Live PDP",
      "First blocker",
      "Decision owner",
      "Title length",
      "Do not cross",
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

  for (const item of cases) {
    const response = await fetch(`${baseUrl}/amazon/${item.slug}`, {
      headers: { Accept: "text/html" },
    });
    if (!response.ok) {
      throw new Error(`${item.slug} returned ${response.status}`);
    }

    const text = normalizeText(await response.text());
    const missing = item.checks.filter((check) => !text.includes(normalizeText(check)));
    if (missing.length) {
      throw new Error(`${item.slug} is missing deterministic markers: ${missing.join(", ")}`);
    }

    results.push({
      slug: item.slug,
      status: "ok",
      checks: item.checks.length,
    });
  }

  process.stdout.write(`${JSON.stringify({ baseUrl, results }, null, 2)}\n`);
}

main().catch((error) => {
  console.error(`FAIL: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
