#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const nextAppDir = path.resolve(__dirname, "..", ".next", "server", "app");

const pages = [
  "shopify-pricing-test-planner",
  "shopify-pdp-copy-assembler",
  "shopify-launch-readiness-scorecard",
  "shopify-post-purchase-flow-planner",
  "shopify-returns-friction-audit",
  "shopify-channel-landing-router",
  "shopify-faq-objection-builder",
  "shopify-reorder-reminder-planner",
  "shopify-promo-calendar-planner",
  "shopify-merchandising-priority-mapper",
];

const requiredMarkers = [
  "The tool is organizing the inputs and preparing the result.",
  "rounded-[24px] border border-black/8 bg-white px-5 py-5",
  "text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700",
];

const forbiddenFragments = [
  "What this page should deliver by default",
  "The default board should already",
  "Execution call:",
  "First move:",
  "Meeting readout:",
  "Owner call:",
  "Board order:",
  "Team call:",
  "Operator call:",
  "Risk call:",
  "Repair order:",
  "Approval gate:",
  "Stop-loss rule:",
  "Discipline call:",
];

function normalizeHtml(html) {
  return html
    .replace(/<!-- -->/g, "")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function findBuiltHtml(slug) {
  const direct = path.join(nextAppDir, "shopify", `${slug}.html`);
  if (fs.existsSync(direct)) {
    return direct;
  }

  const stack = [nextAppDir];
  while (stack.length) {
    const current = stack.pop();
    if (!current || !fs.existsSync(current)) continue;
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }
      if (entry.isFile() && entry.name === `${slug}.html`) {
        return fullPath;
      }
    }
  }

  return null;
}

async function main() {
  const results = [];

  for (const slug of pages) {
    const htmlPath = findBuiltHtml(slug);
    if (!htmlPath) {
      throw new Error(`${slug} is missing built HTML under ${nextAppDir}`);
    }

    const html = fs.readFileSync(htmlPath, "utf8");
    const normalized = normalizeHtml(html);

    const missing = requiredMarkers.filter((item) => !normalized.includes(item));
    if (missing.length) {
      throw new Error(`${slug} is missing simplified runtime-preview markers: ${missing.join(", ")}`);
    }

    const leaked = forbiddenFragments.filter((item) => normalized.includes(item));
    if (leaked.length) {
      throw new Error(`${slug} still leaks deprecated runtime-preview copy: ${leaked.join(", ")}`);
    }

    results.push({
      slug,
      status: "ok",
      checks: requiredMarkers.length + forbiddenFragments.length,
    });
  }

  process.stdout.write(`${JSON.stringify({ nextAppDir, pages: results }, null, 2)}\n`);
}

main().catch((error) => {
  console.error(`FAIL: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
