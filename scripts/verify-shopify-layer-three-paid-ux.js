#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const nextAppDir = path.resolve(__dirname, "..", ".next", "server", "app");

const pages = [
  "shopify-pricing-test-planner",
  "shopify-pdp-copy-assembler",
  "shopify-post-purchase-flow-planner",
  "shopify-returns-friction-audit",
  "shopify-faq-objection-builder",
  "shopify-reorder-reminder-planner",
  "shopify-launch-readiness-scorecard",
  "shopify-channel-landing-router",
];

const requiredMarkers = [
  "text-[14px] leading-6 text-slate-700",
  "text-[13px] leading-5 text-slate-500",
  "text-[12px] leading-5 text-slate-400",
  "Related tools",
  "Open tool",
];

const forbiddenFragments = [
  "Priority 0",
  "decision board",
  "operator board",
  "owner handoff",
  "meeting readout",
  "approval gate",
  "This tool belongs to the Shopify priority commercial layer",
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
      throw new Error(`${slug} is missing simplified paid-ux markers: ${missing.join(", ")}`);
    }

    const leaked = forbiddenFragments.filter((item) =>
      normalized.toLowerCase().includes(item.toLowerCase()),
    );
    if (leaked.length) {
      throw new Error(`${slug} still leaks deprecated paid-ux copy: ${leaked.join(", ")}`);
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
