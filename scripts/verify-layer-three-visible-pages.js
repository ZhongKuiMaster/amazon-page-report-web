#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const nextAppDir = path.resolve(__dirname, "..", ".next", "server", "app");
const visibleToolsFile = path.resolve(__dirname, "..", "src", "lib", "page-visible-tools.ts");

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function normalizeHtml(html) {
  return html
    .replace(/<!-- -->/g, "")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extractVisibleSlugs() {
  const source = fs.readFileSync(visibleToolsFile, "utf8");
  const blockMatch = source.match(/export const visibleToolSlugs = \[([\s\S]*?)\] as const;/);
  if (!blockMatch) {
    fail("could not extract visibleToolSlugs from page-visible-tools.ts");
  }

  return [...blockMatch[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

function inferPlatform(slug) {
  if (slug.startsWith("amazon-") || slug === "tariff-calculator-amazon") {
    return "amazon";
  }
  if (slug.startsWith("tiktok-shop-")) {
    return "tiktok-shop";
  }
  if (slug.startsWith("shopify-")) {
    return "shopify";
  }
  fail(`could not infer platform for slug ${slug}`);
}

function builtHtmlPath({ platform, slug, locale }) {
  return locale === "zh"
    ? path.join(nextAppDir, platform, slug, "zh.html")
    : path.join(nextAppDir, platform, `${slug}.html`);
}

const requiredMarkers = [
  "text-[14px] leading-6 text-slate-700",
  "text-[13px] leading-5 text-slate-500",
  "text-[12px] leading-5 text-slate-400",
  "tool-runtime-shell",
  "Related tools",
];

const requiredZhMarkers = [
  "text-[14px] leading-6 text-slate-700",
  "text-[13px] leading-5 text-slate-500",
  "text-[12px] leading-5 text-slate-400",
  "tool-runtime-shell",
  "相关工具",
];

const forbiddenFragments = [
  "Action queue",
  "下一步操盘页",
  "First-screen operator call",
  "This estimate call",
  "Live estimate inputs",
  "Manual overrides",
  "手动覆盖",
  "Official guide evidence",
  "官方风格证据",
  "decision board",
  "operator worksheet",
  "meeting readout",
  "paid handoff artifact",
  "Ready-to-use handoff",
  "Copy handoff",
  "Execution call:",
  "First move:",
  "Review status:",
  "Current result:",
  "ShopifyShopify ",
  "AmazonAmazon ",
  "TikTok ShopTikTok Shop",
];

const allPages = extractVisibleSlugs().flatMap((slug) => {
  const platform = inferPlatform(slug);
  return [
    { platform, slug, locale: "en" },
    { platform, slug, locale: "zh" },
  ];
});

const results = [];

for (const page of allPages) {
  const htmlPath = builtHtmlPath(page);
  if (!fs.existsSync(htmlPath)) {
    fail(`missing built HTML for ${page.platform}/${page.slug}${page.locale === "zh" ? "/zh" : ""}`);
  }

  const normalized = normalizeHtml(fs.readFileSync(htmlPath, "utf8"));
  const required = page.locale === "zh" ? requiredZhMarkers : requiredMarkers;
  const missing = required.filter((marker) => !normalized.includes(marker));
  if (missing.length) {
    fail(`${page.platform}/${page.slug}${page.locale === "zh" ? "/zh" : ""} missing markers: ${missing.join(", ")}`);
  }

  const leaked = forbiddenFragments.filter((fragment) => normalized.includes(fragment));
  if (leaked.length) {
    fail(`${page.platform}/${page.slug}${page.locale === "zh" ? "/zh" : ""} leaked fragments: ${leaked.join(", ")}`);
  }

  results.push({
    platform: page.platform,
    slug: page.slug,
    locale: page.locale,
    status: "ok",
  });
}

process.stdout.write(
  `${JSON.stringify(
    {
      acceptance: "layer-three-visible-pages",
      checked: results.length,
      pages: results,
    },
    null,
    2,
  )}\n`,
);
