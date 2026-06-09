#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const baseUrl = (process.env.TOOL_PAGE_BASE_URL || "http://127.0.0.1:3042").replace(/\/$/, "");
const repoRoot = path.resolve(__dirname, "..");

const pagePath = path.join(repoRoot, "src", "app", "layout.tsx");
const analyticsConfigPath = path.join(repoRoot, "src", "lib", "analytics-config.ts");
const analyticsScriptsPath = path.join(repoRoot, "src", "components", "analytics-scripts.tsx");
const envExamplePath = path.join(repoRoot, ".env.example");
const analyticsAssetPath = path.join(repoRoot, "public", "analytics-runtime.js");

async function fetchText(route) {
  const response = await fetch(`${baseUrl}${route}`);
  if (!response.ok) {
    throw new Error(`${route} returned ${response.status}`);
  }
  return response.text();
}

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function includesOrFail(haystack, marker, label) {
  if (!haystack.includes(marker)) {
    throw new Error(`${label} is missing marker: ${marker}`);
  }
}

async function main() {
  const homeHtml = await fetchText("/");
  const tiktokHtml = await fetchText("/tiktok-shop");
  const analyticsAsset = await fetchText("/analytics-runtime.js");

  const layoutSource = readFile(pagePath);
  const analyticsConfigSource = readFile(analyticsConfigPath);
  const analyticsScriptsSource = readFile(analyticsScriptsPath);
  const envExampleSource = readFile(envExamplePath);
  const analyticsAssetSource = readFile(analyticsAssetPath);

  includesOrFail(homeHtml, "/analytics-runtime.js", "home html");
  includesOrFail(tiktokHtml, 'content="noindex, follow"', "/tiktok-shop html");

  includesOrFail(analyticsAsset, "tool_primary_action_click", "/analytics-runtime.js");
  includesOrFail(analyticsAsset, "tool_result_visible", "/analytics-runtime.js");

  includesOrFail(layoutSource, "google-site-verification", "layout.tsx");
  includesOrFail(layoutSource, "msvalidate.01", "layout.tsx");

  includesOrFail(analyticsConfigSource, "NEXT_PUBLIC_GA4_ID", "analytics-config.ts");
  includesOrFail(analyticsConfigSource, "NEXT_PUBLIC_GSC_VERIFICATION", "analytics-config.ts");
  includesOrFail(analyticsConfigSource, "NEXT_PUBLIC_BING_VERIFICATION", "analytics-config.ts");
  includesOrFail(analyticsConfigSource, "NEXT_PUBLIC_CLARITY_PROJECT_ID", "analytics-config.ts");
  includesOrFail(analyticsConfigSource, "NEXT_PUBLIC_CLOUDFLARE_BEACON_TOKEN", "analytics-config.ts");

  includesOrFail(analyticsScriptsSource, "googletagmanager.com/gtag/js", "analytics-scripts.tsx");
  includesOrFail(analyticsScriptsSource, "clarity.ms/tag", "analytics-scripts.tsx");
  includesOrFail(analyticsScriptsSource, "static.cloudflareinsights.com/beacon.min.js", "analytics-scripts.tsx");
  includesOrFail(analyticsScriptsSource, 'src="/analytics-runtime.js"', "analytics-scripts.tsx");

  includesOrFail(envExampleSource, "NEXT_PUBLIC_GA4_ID=", ".env.example");
  includesOrFail(envExampleSource, "NEXT_PUBLIC_GSC_VERIFICATION=", ".env.example");
  includesOrFail(envExampleSource, "NEXT_PUBLIC_BING_VERIFICATION=", ".env.example");
  includesOrFail(envExampleSource, "NEXT_PUBLIC_CLARITY_PROJECT_ID=", ".env.example");
  includesOrFail(envExampleSource, "NEXT_PUBLIC_CLOUDFLARE_BEACON_TOKEN=", ".env.example");

  includesOrFail(analyticsAssetSource, "window.__CTS_EVENT_LOG__", "public analytics asset");
  includesOrFail(analyticsAssetSource, "tool_result_visible", "public analytics asset");
  includesOrFail(analyticsAssetSource, "tool_primary_action_click", "public analytics asset");

  const results = {
    ok: true,
    baseUrl,
    monitoringSlots: {
      gscVerificationSlotReady: true,
      bingVerificationSlotReady: true,
      ga4SlotReady: true,
      claritySlotReady: true,
      cloudflareSlotReady: true,
    },
    pageBoundaryChecks: {
      analyticsRuntimeAssetExposed: true,
      tiktokNoindex: true,
    },
    sourceBackstops: {
      layout: path.relative(repoRoot, pagePath),
      analyticsConfig: path.relative(repoRoot, analyticsConfigPath),
      analyticsScripts: path.relative(repoRoot, analyticsScriptsPath),
      envExample: path.relative(repoRoot, envExamplePath),
      analyticsAsset: path.relative(repoRoot, analyticsAssetPath),
    },
  };

  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(`FAIL: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
