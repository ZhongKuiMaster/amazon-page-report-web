#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright-core";

const baseUrl = (process.env.TOOL_PAGE_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const url = `${baseUrl}/amazon/amazon-ads-audit-workbench`;
const downloadDir = "/tmp/ads-workbench-commercial-gate-downloads";
const spCsvPath = "/tmp/ads-workbench-commercial-gate-sp.csv";

const bannedText = [
  "Command failed",
  "Traceback",
  "HTTP Error",
  "/Users/",
  "Current result",
  "Execution call",
  "Generated recommendations",
  "partial demo state",
  "TACOS 0% is above target missing",
  "undefined",
  "NaN",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function pageText(page) {
  return page.locator("body").innerText();
}

async function assertNoBannedText(page, stage) {
  const text = await pageText(page);
  for (const token of bannedText) {
    assert(!text.includes(token), `${stage}: banned text visible: ${token}`);
  }
}

async function expertReviewLinkCount(page) {
  return page.locator('a[href="https://www.lemons7.com/workbench"]').count();
}

async function main() {
  mkdirSync(downloadDir, { recursive: true });
  writeFileSync(
    spCsvPath,
    [
      "Campaign Name,Customer Search Term,Spend,Sales,Orders,Clicks",
      "Discovery Broad,free garlic press,120,0,0,31",
      "Exact Profit,garlic press stainless,80,500,9,55",
      "Phrase Expansion,garlic press coupon,95,120,2,28",
    ].join("\n"),
  );

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 1200 } });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    const location = message.location().url || "";
    if (text.includes("Failed to load resource") && !location.includes("/amazon/amazon-ads-audit-workbench")) return;
    consoleErrors.push(location ? `${text} @ ${location}` : text);
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(url, { waitUntil: "domcontentloaded" });
  await assertNoBannedText(page, "default");

  let text = await pageText(page);
  assert(text.includes("Amazon Ads Audit Workbench"), "workbench title missing");
  assert(text.includes("Current diagnosis is blocked"), "default diagnosis should be blocked");
  assert(text.includes("Not ready for paid expert review yet"), "default expert review should be blocked");
  assert(text.includes("Complete inputs first"), "default page should ask user to complete inputs first");
  assert((await expertReviewLinkCount(page)) === 0, "default page must not expose expert review link");

  await page.getByRole("button", { name: "Ad waste" }).click();
  text = await pageText(page);
  assert(text.includes("Ad waste is the first blocker"), "ad waste preset did not reach expected branch");
  assert(text.includes("Self-serve first, then expert review if the branch stays unclear"), "preset should stay self-serve without uploaded evidence");
  assert(text.includes("Complete inputs first"), "preset without uploaded evidence should still ask for inputs");
  assert((await expertReviewLinkCount(page)) === 0, "preset/demo state must not expose expert review link");

  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.getByLabel("Main ASIN or SKU").fill("B0TEST1234");
  await page.getByRole("spinbutton", { name: "Target ACOS" }).fill("22");
  await page.getByRole("spinbutton", { name: "Break-even ACOS" }).fill("32");
  await page.locator('input[type="file"]').first().setInputFiles(spCsvPath);
  await page.getByText("Parsed 3 rows from ads-workbench-commercial-gate-sp.csv", { exact: false }).waitFor({
    state: "visible",
    timeout: 5000,
  });
  await assertNoBannedText(page, "real upload");

  text = await pageText(page);
  assert(text.includes("Good fit for semi-automated expert review"), "real upload should be fit for expert review");
  assert(text.includes("reviewable"), "real upload should show reviewable badge");
  assert(text.includes("free garlic press"), "real upload should surface row-level waste evidence");
  assert(text.includes("do not negate ordered terms"), "real upload should show ordered-term guardrail");
  assert((await expertReviewLinkCount(page)) === 1, "real upload should expose exactly one expert review link");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download audit summary" }).click();
  const download = await downloadPromise;
  const target = join(downloadDir, download.suggestedFilename());
  await download.saveAs(target);
  const exported = readFileSync(target, "utf8");
  assert(!exported.includes("TACOS 0% is above target missing"), "download includes fake TACOS precision");

  for (const snippet of [
    "## Delivery snapshot",
    "First operator move:",
    "Delivery mode: semi-automated diagnostic brief for human review before campaign changes.",
    "## Goal readiness",
    "## Manual review queue",
    "Confirm the first action against the uploaded rows before changing campaigns.",
    "## Unsupported claims",
    "does not prove Amazon Ads caused total sales movement without Business Report and before/after context",
    "## Expert review fit",
    "Good fit for semi-automated expert review",
    "Boundary: this export uses only uploaded and typed inputs",
    "does not guarantee ACOS reduction, sales growth, or automatic campaign management",
  ]) {
    assert(exported.includes(snippet), `download missing: ${snippet}`);
  }

  assert(consoleErrors.length === 0, `console errors: ${consoleErrors.join("\n")}`);
  assert(pageErrors.length === 0, `page errors: ${pageErrors.join("\n")}`);

  await browser.close();

  console.log(
    JSON.stringify(
      {
        ok: true,
        checks: [
          "default blocks expert review",
          "demo preset blocks expert review",
          "real upload opens expert review",
          "export preserves expert-review boundary",
          "no technical leakage",
        ],
        download: target,
      },
      null,
      2,
    ),
  );
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
