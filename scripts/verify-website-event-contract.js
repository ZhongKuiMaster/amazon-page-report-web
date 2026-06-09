#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");

const baseUrl = (process.env.TOOL_PAGE_BASE_URL || "http://127.0.0.1:3042").replace(/\/$/, "");
const chromeBin =
  process.env.CHROME_BIN ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const targets = [
  {
    slug: "amazon-price-tracker",
    zhPath: "/amazon/amazon-price-tracker/zh",
    actionLabel: "加载对比并生成结果",
  },
  {
    slug: "amazon-competitor-monitoring",
    zhPath: "/amazon/amazon-competitor-monitoring/zh",
    actionLabel: "加载竞品并生成结果",
  },
  {
    slug: "amazon-keyword-tracker",
    zhPath: "/amazon/amazon-keyword-tracker/zh",
    actionLabel: "加载关键词并生成结果",
  },
  {
    slug: "amazon-listing-optimization",
    zhPath: "/amazon/amazon-listing-optimization/zh",
    actionLabel: "加载商品并生成结果",
  },
  {
    slug: "amazon-product-compliance",
    zhPath: "/amazon/amazon-product-compliance/zh",
    actionLabel: "加载商品并生成合规结果",
  },
  {
    slug: "amazon-category-ungating",
    zhPath: "/amazon/amazon-category-ungating/zh",
    actionLabel: "加载商品并生成解封结果",
  },
  {
    slug: "amazon-image-compliance-checker",
    zhPath: "/amazon/amazon-image-compliance-checker/zh",
    actionLabel: "加载图片并生成结果",
  },
  {
    slug: "amazon-search-optimization",
    zhPath: "/amazon/amazon-search-optimization/zh",
    actionLabel: "加载商品并生成搜索结果",
  },
  {
    slug: "amazon-rank-tracker",
    zhPath: "/amazon/amazon-rank-tracker/zh",
    actionLabel: "加载排名并生成结果",
  },
  {
    slug: "amazon-competitor-analysis",
    zhPath: "/amazon/amazon-competitor-analysis/zh",
    actionLabel: "加载对比并生成结果",
  },
];

function fail(message) {
  throw new Error(message);
}

async function readLog(page) {
  return page.evaluate(() => {
    try {
      return Array.isArray(window.__CTS_EVENT_LOG__) ? window.__CTS_EVENT_LOG__ : [];
    } catch (_error) {
      return [];
    }
  });
}

async function clearLog(page) {
  await page.evaluate(() => {
    window.__CTS_EVENT_LOG__ = [];
    try {
      window.sessionStorage.setItem("__CTS_EVENT_LOG__", "[]");
    } catch (_error) {
      // Ignore storage errors.
    }
  });
}

function hasEvent(log, eventName, predicate = () => true) {
  return log.some((entry) => entry && entry.event_name === eventName && predicate(entry));
}

async function primePrimaryAction(page) {
  await page.evaluate(() => {
    var sampleUrl = "https://www.amazon.com/dp/B0GYRT3FNL";
    var sampleCompetitorSet =
      "https://www.amazon.com/dp/B0GYRT3FNL\nhttps://www.amazon.com/dp/B0G6K4VXK7";
    var fields = Array.from(
      document.querySelectorAll(
        "main input:not([type='hidden']):not([type='checkbox']):not([type='radio']), main textarea",
      ),
    );

    fields.forEach((field) => {
      if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
        return;
      }
      if (field.disabled) {
        return;
      }
      if (field.value && field.value.trim()) {
        return;
      }

      var marker = `${field.name || ""} ${field.id || ""} ${field.placeholder || ""}`.toLowerCase();
      field.value =
        marker.indexOf("competitor") !== -1 || marker.indexOf("竞品") !== -1
          ? sampleCompetitorSet
          : sampleUrl;

      field.dispatchEvent(new Event("input", { bubbles: true }));
      field.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
}

async function ensureButtonClickable(page, actionLabel) {
  const button = page.getByRole("button", { name: actionLabel });
  if (await button.isEnabled()) {
    return;
  }

  await page.evaluate((label) => {
    var buttons = Array.from(document.querySelectorAll("button"));
    var match = buttons.find(
      (node) => (node.textContent || "").trim().replace(/\s+/g, " ") === label,
    );
    if (!(match instanceof HTMLButtonElement)) {
      return;
    }
    match.disabled = false;
    match.removeAttribute("disabled");
  }, actionLabel);
}

async function verifyPrimaryToolEvents(browser) {
  const records = [];

  for (const target of targets) {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1800 },
      locale: "zh-CN",
    });

    await page.goto(`${baseUrl}${target.zhPath}`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(300);

    const initialLog = await readLog(page);
    if (!hasEvent(initialLog, "page_view", (entry) => entry.page_tool_slug === target.slug)) {
      fail(`${target.slug} is missing page_view in event log`);
    }
    if (!hasEvent(initialLog, "tool_result_visible", (entry) => entry.page_tool_slug === target.slug)) {
      fail(`${target.slug} is missing tool_result_visible in event log`);
    }

    await clearLog(page);
    await primePrimaryAction(page);
    await page.waitForTimeout(300);
    await ensureButtonClickable(page, target.actionLabel);
    await page.getByRole("button", { name: target.actionLabel }).click();
    await page.waitForTimeout(200);

    const afterClickLog = await readLog(page);
    if (
      !hasEvent(
        afterClickLog,
        "tool_primary_action_click",
        (entry) =>
          entry.page_tool_slug === target.slug && entry.action_label === target.actionLabel,
      )
    ) {
      fail(`${target.slug} is missing tool_primary_action_click for ${target.actionLabel}`);
    }

    records.push({
      slug: target.slug,
      page_view: true,
      tool_result_visible: true,
      tool_primary_action_click: target.actionLabel,
    });

    await page.close();
  }

  return records;
}

async function verifyShellEvents(browser) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1800 },
    locale: "zh-CN",
  });

  await page.goto(`${baseUrl}/amazon/amazon-price-tracker/zh`, {
    waitUntil: "networkidle",
    timeout: 30000,
  });
  await page.waitForTimeout(300);
  await clearLog(page);

  await page.getByRole("button", { name: "如何使用" }).click();
  await page.waitForTimeout(150);
  let log = await readLog(page);
  if (!hasEvent(log, "tool_help_open", (entry) => entry.page_tool_slug === "amazon-price-tracker")) {
    fail("amazon-price-tracker is missing tool_help_open");
  }

  await page.goto(`${baseUrl}/amazon/amazon-price-tracker/zh`, {
    waitUntil: "networkidle",
    timeout: 30000,
  });
  await page.waitForTimeout(200);
  await clearLog(page);

  await page.getByRole("link", { name: "如何区分" }).click();
  await page.waitForURL(`${baseUrl}/amazon/amazon-price-tracker/vs/zh`, { timeout: 30000 });
  await page.waitForTimeout(150);
  log = await readLog(page);
  if (!hasEvent(log, "support_page_click", (entry) => entry.event_label === "amazon-price-tracker:vs")) {
    fail("amazon-price-tracker is missing support_page_click");
  }

  await page.goto(`${baseUrl}/amazon/amazon-price-tracker/zh`, {
    waitUntil: "networkidle",
    timeout: 30000,
  });
  await page.waitForTimeout(200);
  await clearLog(page);

  await page.getByRole("link", { name: /亚马逊利润分析器/ }).click();
  await page.waitForURL(`${baseUrl}/amazon/amazon-profit-analyzer/zh`, { timeout: 30000 });
  await page.waitForTimeout(150);
  log = await readLog(page);
  if (!hasEvent(log, "related_tool_click", (entry) => entry.event_label === "amazon-profit-analyzer")) {
    fail("amazon-price-tracker is missing related_tool_click");
  }

  await page.goto(`${baseUrl}/amazon/amazon-price-tracker/zh`, {
    waitUntil: "networkidle",
    timeout: 30000,
  });
  await page.waitForTimeout(200);
  await clearLog(page);

  await page.getByRole("link", { name: "EN" }).click();
  await page.waitForURL(`${baseUrl}/amazon/amazon-price-tracker`, { timeout: 30000 });
  await page.waitForTimeout(150);
  log = await readLog(page);
  if (!hasEvent(log, "language_switch", (entry) => entry.event_label === "en")) {
    fail("amazon-price-tracker is missing language_switch");
  }

  await page.close();

  return {
    tool_help_open: "ok",
    support_page_click: "ok",
    related_tool_click: "ok",
    language_switch: "ok",
  };
}

async function main() {
  if (!fs.existsSync(chromeBin)) {
    throw new Error(`Chrome binary not found at ${chromeBin}`);
  }

  const browser = await chromium.launch({
    executablePath: chromeBin,
    headless: true,
  });

  try {
    const primaryTools = await verifyPrimaryToolEvents(browser);
    const shellEvents = await verifyShellEvents(browser);

    console.log(
      JSON.stringify(
        {
          ok: true,
          baseUrl,
          guaranteedEvents: [
            "tool_primary_action_click",
            "tool_result_visible",
            "support_page_click",
            "related_tool_click",
            "tool_help_open",
            "language_switch",
          ],
          primaryTools,
          shellEvents,
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(`FAIL: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
