#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");

const baseUrl = process.env.TOOL_PAGE_BASE_URL || "http://127.0.0.1:3040";
const chromeBin =
  process.env.CHROME_BIN ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const outputRoot = path.resolve(__dirname, "../../reports/runtime-human-ux-evidence");
const repoRoot = path.resolve(__dirname, "../..");

const targets = [
  {
    slug: "amazon-price-tracker",
    path: "/amazon/amazon-price-tracker/zh",
    actionLabel: "加载对比并生成结果",
  },
  {
    slug: "amazon-competitor-monitoring",
    path: "/amazon/amazon-competitor-monitoring/zh",
    actionLabel: "加载竞品并生成结果",
  },
  {
    slug: "amazon-keyword-tracker",
    path: "/amazon/amazon-keyword-tracker/zh",
    actionLabel: "加载关键词并生成结果",
  },
  {
    slug: "amazon-listing-optimization",
    path: "/amazon/amazon-listing-optimization/zh",
    actionLabel: "加载商品并生成结果",
  },
  {
    slug: "amazon-product-compliance",
    path: "/amazon/amazon-product-compliance/zh",
    actionLabel: "加载商品并生成合规结果",
  },
  {
    slug: "amazon-category-ungating",
    path: "/amazon/amazon-category-ungating/zh",
    actionLabel: "加载商品并生成解封结果",
  },
  {
    slug: "amazon-image-compliance-checker",
    path: "/amazon/amazon-image-compliance-checker/zh",
    actionLabel: "加载图片并生成结果",
  },
  {
    slug: "amazon-search-optimization",
    path: "/amazon/amazon-search-optimization/zh",
    actionLabel: "加载商品并生成搜索结果",
  },
  {
    slug: "amazon-rank-tracker",
    path: "/amazon/amazon-rank-tracker/zh",
    actionLabel: "加载排名并生成结果",
  },
  {
    slug: "amazon-competitor-analysis",
    path: "/amazon/amazon-competitor-analysis/zh",
    actionLabel: "加载对比并生成结果",
  },
];

const requiredMarkers = [
  { key: "hint", text: "加载后，结果会显示在下方。" },
  { key: "currentResult", text: "当前结果" },
  { key: "actionPlan", text: "行动建议" },
];

function ensureCleanDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
  fs.mkdirSync(dirPath, { recursive: true });
}

function extractSnippet(text, marker) {
  const index = text.indexOf(marker);
  if (index === -1) {
    return "";
  }

  const start = Math.max(0, index - 80);
  const end = Math.min(text.length, index + marker.length + 80);
  return text.slice(start, end).trim();
}

function toRepoRelative(filePath) {
  return path.relative(repoRoot, filePath);
}

function buildMarkdown(records) {
  const lines = [
    "# Runtime Human UX Verification",
    "",
    `Base URL: \`${baseUrl}\``,
    "",
    "| Slug | 主动作按钮 | 结果提示 | 当前结果 | 行动建议 | Screenshot | DOM |",
    "| --- | --- | --- | --- | --- | --- | --- |",
  ];

  for (const record of records) {
    lines.push(
      `| ${record.slug} | ${record.actionLabel} | ${record.markers.hint ? "ok" : "missing"} | ${record.markers.currentResult ? "ok" : "missing"} | ${record.markers.actionPlan ? "ok" : "missing"} | \`${toRepoRelative(record.screenshotPath)}\` | \`${toRepoRelative(record.domPath)}\` |`,
    );
  }

  lines.push("", "## Marker snippets", "");

  for (const record of records) {
    lines.push(`### ${record.slug}`);
    lines.push("");
    lines.push(`- 主动作按钮：${record.actionSnippet || "missing"}`);
    lines.push(`- 结果提示：${record.markerSnippets.hint || "missing"}`);
    lines.push(`- 当前结果：${record.markerSnippets.currentResult || "missing"}`);
    lines.push(`- 行动建议：${record.markerSnippets.actionPlan || "missing"}`);
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

async function main() {
  if (!fs.existsSync(chromeBin)) {
    throw new Error(`Chrome binary not found at ${chromeBin}`);
  }

  ensureCleanDir(outputRoot);

  const browser = await chromium.launch({
    executablePath: chromeBin,
    headless: true,
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 2200 },
    locale: "zh-CN",
  });

  const records = [];

  for (const target of targets) {
    const url = `${baseUrl}${target.path}`;
    const screenshotPath = path.join(outputRoot, `${target.slug}-zh.png`);
    const domPath = path.join(outputRoot, `${target.slug}-zh.dom.html`);

    const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    if (!response || !response.ok()) {
      throw new Error(`${target.slug} returned ${response ? response.status() : "no response"}`);
    }

    await page.screenshot({ path: screenshotPath, fullPage: true });
    const html = await page.content();
    fs.writeFileSync(domPath, html);

    const text = await page.locator("body").innerText();
    const hasActionLabel = text.includes(target.actionLabel);
    if (!hasActionLabel) {
      throw new Error(`${target.slug} is missing action label: ${target.actionLabel}`);
    }

    const markers = Object.fromEntries(
      requiredMarkers.map((marker) => [marker.key, text.includes(marker.text)]),
    );

    const missingMarkers = requiredMarkers
      .filter((marker) => !markers[marker.key])
      .map((marker) => marker.text);

    if (missingMarkers.length) {
      throw new Error(`${target.slug} is missing markers: ${missingMarkers.join(", ")}`);
    }

    records.push({
      slug: target.slug,
      url,
      actionLabel: target.actionLabel,
      actionSnippet: extractSnippet(text, target.actionLabel),
      markers,
      markerSnippets: Object.fromEntries(
        requiredMarkers.map((marker) => [marker.key, extractSnippet(text, marker.text)]),
      ),
      screenshotPath,
      domPath,
    });
  }

  fs.writeFileSync(
    path.join(outputRoot, "verification-summary.json"),
    `${JSON.stringify({ baseUrl, generatedAt: new Date().toISOString(), records }, null, 2)}\n`,
  );
  fs.writeFileSync(path.join(outputRoot, "verification-summary.md"), buildMarkdown(records));

  await Promise.race([
    (async () => {
      await page.close();
      await browser.close();
    })(),
    new Promise((resolve) => setTimeout(resolve, 2000)),
  ]);

  console.log(
    JSON.stringify(
      {
        ok: true,
        baseUrl,
        outputRoot: toRepoRelative(outputRoot),
        checked: records.map((record) => record.slug),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
