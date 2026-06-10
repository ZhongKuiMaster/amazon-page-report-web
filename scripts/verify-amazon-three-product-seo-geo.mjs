#!/usr/bin/env node

import { chromium } from "playwright-core";

const baseUrl = (process.env.TOOL_PAGE_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

const bannedText = [
  "Command failed",
  "Traceback",
  "HTTP Error",
  "/Users/",
  "Current result",
  "Execution call",
  "Generated recommendations",
  "undefined",
  "NaN",
];

const pages = [
  {
    route: "/amazon/amazon-ads-audit-workbench",
    h1: "Amazon Ads Audit Workbench",
    title: "Amazon Ads Audit Workbench",
    meta: "Upload Amazon ads and business reports",
    required: [
      "PPC waste",
      "TACOS",
      "Expert review is only shown after",
      "does not guarantee lower ACOS",
      "What reports should I prepare for Amazon Ads Audit Workbench?",
    ],
  },
  {
    route: "/amazon/alexa-for-shopping-listing-builder",
    h1: "Alexa for Shopping Listing Builder",
    title: "Alexa for Shopping Listing Builder",
    meta: "No ranking or recommendation guarantee",
    required: [
      "AI-assisted shopping",
      "Alexa for Shopping",
      "No. It helps make listing language easier to understand",
      "What is Alexa for Shopping Listing Builder?",
    ],
  },
  {
    route: "/amazon/amazon-growth-profit-planner",
    h1: "Amazon Growth & Profit Planner",
    title: "Amazon Growth & Profit Planner",
    meta: "traffic gap",
    required: [
      "profit floor",
      "inventory risk",
      "does not guarantee growth",
      "It does not read Seller Central live data",
      "Is Amazon Growth & Profit Planner a profit calculator?",
    ],
  },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function metaDescription(page) {
  return page.locator('meta[name="description"]').getAttribute("content");
}

async function jsonLdTypes(page) {
  return page.locator('script[type="application/ld+json"]').evaluateAll((nodes) =>
    nodes
      .map((node) => {
        try {
          return JSON.parse(node.textContent || "{}")["@type"];
        } catch {
          return null;
        }
      })
      .filter(Boolean),
  );
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  const results = [];

  for (const item of pages) {
    await page.goto(`${baseUrl}${item.route}`, { waitUntil: "domcontentloaded" });
    const title = await page.title();
    const meta = (await metaDescription(page)) || "";
    const body = await page.locator("body").innerText();
    const h1 = await page.locator("h1").first().innerText();
    const jsonTypes = await jsonLdTypes(page);

    assert(title.includes(item.title), `${item.route}: title mismatch: ${title}`);
    assert(meta.includes(item.meta), `${item.route}: meta description mismatch: ${meta}`);
    assert(h1 === item.h1, `${item.route}: H1 mismatch: ${h1}`);
    assert(jsonTypes.includes("FAQPage"), `${item.route}: FAQPage JSON-LD missing`);
    assert(jsonTypes.includes("WebPage"), `${item.route}: WebPage JSON-LD missing`);

    for (const text of item.required) {
      assert(body.includes(text), `${item.route}: missing SEO/GEO text: ${text}`);
    }
    for (const text of bannedText) {
      assert(!body.includes(text), `${item.route}: banned text visible: ${text}`);
    }

    results.push({
      route: item.route,
      title,
      h1,
      meta,
      jsonTypes,
    });
  }

  await browser.close();
  console.log(JSON.stringify({ ok: true, pages: results }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
