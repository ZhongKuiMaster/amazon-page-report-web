#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const nextAppDir = path.resolve(__dirname, "..", ".next", "server", "app");

const pages = [
  {
    slug: "shopify-product-page-audit",
    checks: [
      "Step 01",
      "PDP audit",
      "This tool belongs to the Shopify workflow foundation",
      "The output below is not generic advice. It is the page, offer, and execution brief the team should use before moving into the next Shopify workflow step.",
      "Next workflow tools",
    ],
  },
  {
    slug: "shopify-review-mining",
    checks: [
      "Step 02",
      "Review mining",
      "This tool belongs to the Shopify workflow foundation",
      "The output below is not generic advice. It is the page, offer, and execution brief the team should use before moving into the next Shopify workflow step.",
      "Next workflow tools",
    ],
  },
  {
    slug: "shopify-offer-positioning",
    checks: [
      "Step 03",
      "Offer positioning",
      "This tool belongs to the Shopify workflow foundation",
      "The output below is not generic advice. It is the page, offer, and execution brief the team should use before moving into the next Shopify workflow step.",
      "Next workflow tools",
    ],
  },
  {
    slug: "shopify-email-flow-planner",
    checks: [
      "Step 04",
      "Email flow planner",
      "This tool belongs to the Shopify workflow foundation",
      "The output below is not generic advice. It is the page, offer, and execution brief the team should use before moving into the next Shopify workflow step.",
      "Next workflow tools",
    ],
  },
  {
    slug: "shopify-landing-page-angle-builder",
    checks: [
      "Layer 2",
      "Landing page angle",
      "Landing-page approval board",
      "This tool belongs to the Shopify second-layer amplifier set",
      "The output below is not generic advice. It is an amplifier board meant to sharpen, route, or scale the call coming out of the foundation workflow.",
      "Next amplifier tools",
      "Approval gate",
      "Owner handoff",
      "Meeting readout",
    ],
  },
  {
    slug: "shopify-bundle-offer-designer",
    checks: [
      "Layer 2",
      "Bundle offer",
      "Bundle approval board",
      "This tool belongs to the Shopify second-layer amplifier set",
      "The output below is not generic advice. It is an amplifier board meant to sharpen, route, or scale the call coming out of the foundation workflow.",
      "Next amplifier tools",
      "Approval gate",
      "Owner handoff",
      "Meeting readout",
    ],
  },
  {
    slug: "shopify-subscription-planner",
    checks: [
      "Layer 2",
      "Subscription fit",
      "Subscription approval board",
      "This tool belongs to the Shopify second-layer amplifier set",
      "The output below is not generic advice. It is an amplifier board meant to sharpen, route, or scale the call coming out of the foundation workflow.",
      "Next amplifier tools",
      "Approval gate",
      "Owner handoff",
      "Meeting readout",
    ],
  },
  {
    slug: "shopify-collection-page-audit",
    checks: [
      "Layer 2",
      "Collection audit",
      "Collection approval board",
      "This tool belongs to the Shopify second-layer amplifier set",
      "The output below is not generic advice. It is an amplifier board meant to sharpen, route, or scale the call coming out of the foundation workflow.",
      "Next amplifier tools",
      "Approval gate",
      "Owner handoff",
      "Meeting readout",
    ],
  },
];

function normalizeHtml(html) {
  return html.replace(/<!-- -->/g, "").replace(/\s+/g, " ").trim();
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

  for (const page of pages) {
    const htmlPath = findBuiltHtml(page.slug);
    if (!htmlPath) {
      throw new Error(`${page.slug} is missing built HTML under ${nextAppDir}`);
    }

    const html = fs.readFileSync(htmlPath, "utf8");
    const normalized = normalizeHtml(html);
    const missing = page.checks.filter((item) => !normalized.includes(item));

    if (missing.length) {
      throw new Error(`${page.slug} is missing second-batch paid-ux markers: ${missing.join(", ")}`);
    }

    results.push({
      slug: page.slug,
      status: "ok",
      checks: page.checks.length,
    });
  }

  process.stdout.write(`${JSON.stringify({ nextAppDir, pages: results }, null, 2)}\n`);
}

main().catch((error) => {
  console.error(`FAIL: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
