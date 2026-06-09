#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const nextAppDir = path.resolve(__dirname, "..", ".next", "server", "app");
const visibleToolsFile = path.resolve(__dirname, "..", "src", "lib", "page-visible-tools.ts");

function normalizeHtml(html) {
  return html
    .replace(/<!-- -->/g, "")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function builtHtmlPath({ platform, slug, locale }) {
  return locale === "zh"
    ? path.join(nextAppDir, platform, slug, "zh.html")
    : path.join(nextAppDir, platform, `${slug}.html`);
}

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
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

const allPages = extractVisibleSlugs().flatMap((slug) => {
  const platform = inferPlatform(slug);
  return [
    { platform, slug, locale: "en" },
    { platform, slug, locale: "zh" },
  ];
});

for (const page of allPages) {
  const htmlPath = builtHtmlPath(page);
  if (!fs.existsSync(htmlPath)) {
    fail(`missing built HTML for ${page.platform}/${page.slug}${page.locale === "zh" ? "/zh" : ""}`);
  }

  const normalized = normalizeHtml(fs.readFileSync(htmlPath, "utf8"));

  if (!normalized.includes("text-[14px] leading-6 text-slate-700")) {
    fail(`${page.platform}/${page.slug} is missing the compact primary intro line`);
  }

  if (!normalized.includes("text-[13px] leading-5 text-slate-500")) {
    fail(`${page.platform}/${page.slug} is missing the result-promise line`);
  }

  if (!normalized.includes("text-[12px] leading-5 text-slate-400")) {
    fail(`${page.platform}/${page.slug} is missing the compact load-hint line`);
  }

  if (
    normalized.includes("tool-page-brief-goal-inline") ||
    normalized.includes("tool-page-brief-support") ||
    normalized.includes("tool-page-brief-label")
  ) {
    fail(`${page.platform}/${page.slug} still renders the old brief block structure`);
  }

  if (!normalized.includes(page.locale === "zh" ? "相关工具" : "Related tools")) {
    fail(`${page.platform}/${page.slug} is missing the reduced related-tools heading`);
  }

  if (
    normalized.includes(page.locale === "zh" ? "其他工具" : "Other tools") ||
    normalized.includes(page.locale === "zh" ? "继续查看" : "Keep going")
  ) {
    fail(`${page.platform}/${page.slug} still uses the old related-tools heading`);
  }
}

process.stdout.write(
  `${JSON.stringify({ checked: allPages.length, status: "ok" }, null, 2)}\n`,
);
