#!/usr/bin/env node

const { execFileSync } = require("node:child_process");

const baseUrl = process.env.TOOL_PAGE_BASE_URL || "http://127.0.0.1:3000";

const pages = [
  {
    slug: "amazon-listing-title-checker",
    checks: [
      "Decision board",
      "Do now",
      "Do not cross",
      "First blocker",
      "Decision owner",
      "Execution call",
    ],
    forbidden: ["Operator stance", "Commercial call", "pending", "Unknown"],
  },
  {
    slug: "amazon-search-optimization",
    checks: [
      "Decision board",
      "Do now",
      "Do not cross",
      "First blocker",
      "Decision owner",
      "Execution call",
    ],
    forbidden: ["Operator stance", "Commercial call", "pending", "Unknown"],
  },
  {
    slug: "amazon-listing-optimization",
    checks: [
      "Decision board",
      "Do now",
      "Do not cross",
      "First blocker",
      "Decision owner",
      "Execution call",
    ],
    forbidden: ["Operator stance", "Commercial call", "This optimization call", "pending", "Unknown"],
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
    const forbidden = (page.forbidden ?? []).filter((item) => normalized.includes(item));

    if (missing.length) {
      throw new Error(`${page.slug} is missing first-tier operator markers: ${missing.join(", ")}`);
    }
    if (forbidden.length) {
      throw new Error(`${page.slug} still contains placeholder-grade output: ${forbidden.join(", ")}`);
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
