#!/usr/bin/env node

const { execFileSync } = require("node:child_process");

const baseUrl = process.env.TOOL_PAGE_BASE_URL || "http://127.0.0.1:3000";

const pages = [
  {
    slug: "amazon-listing-optimization",
    checks: [
      "Decision board",
      "Executive readout",
      "Action boundary",
      "Do now",
      "Do not cross",
      "Decision owner",
      "Approved next move",
      "Do not rewrite the PDP before loading the live listing",
    ],
  },
  {
    slug: "amazon-price-tracker",
    checks: [
      "This watch",
      "First move",
      "Response brief",
      "Execution owner",
      "Do this now",
      "Do not cross",
      "Then do",
      "Watch",
      "Do not react to price before loading your own offer baseline",
    ],
  },
  {
    slug: "amazon-profit-analyzer",
    checks: [
      "This profit call",
      "First move",
      "Execution owner",
      "Do this now",
      "Go / no-go line",
      "Do not cross",
      "Do not build a margin story from placeholders",
    ],
  },
  {
    slug: "amazon-fba-calculator",
    checks: [
      "This FBA call",
      "First move",
      "Execution owner",
      "Do this now",
      "Do not cross",
      "Then do",
      "Watch",
      "Do not trust fee math built on catalog dimensions",
    ],
  },
];

async function main() {
  const results = [];

  for (const page of pages) {
    const html = execFileSync(
      "curl",
      ["-sS", "--max-time", "20", `${baseUrl}/amazon/${page.slug}`],
      { encoding: "utf8" },
    );
    const normalized = html.replace(/<!-- -->/g, "").replace(/\s+/g, " ").trim();
    const missing = page.checks.filter((item) => !normalized.includes(item));

    if (missing.length) {
      throw new Error(`${page.slug} is missing first-tier markers: ${missing.join(", ")}`);
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
