#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright-core");

const baseUrl = (process.env.TOOL_PAGE_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const chromeBin =
  process.env.CHROME_BIN ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const route = "/amazon/amazon-growth-profit-planner";
const zhRoute = "/amazon/amazon-growth-profit-planner/zh";

const baseInput = {
  ASIN: "B0BRANCHTEST",
  Price: "29.99",
  "Landed cost per unit (purchase + inbound freight)": "8.40",
  "Amazon referral fee rate %": "15",
  "FBA / fulfillment fee": "4.65",
  "Inventory units": "840",
  "Average daily sales": "22",
  "Sessions / Page views": "4200",
  Orders: "420",
  "CVR %": "",
  "Ad spend": "900",
  "Ad sales": "5400",
  "ACOS %": "",
  Rating: "4.4",
  "Review count": "86",
  "Target net margin %": "12",
  "Target TACOS %": "12",
  "Return rate %": "0",
  "Return cost per unit": "",
};

const cases = [
  {
    name: "missing-profit-core",
    fields: { "Landed cost per unit (purchase + inbound freight)": "" },
    goal: "Scale",
    expectedBranch: "missing-profit-core",
    mustInclude: ["Do not recommend ads, Deal, Coupon, discounting, rank push, or scaling", "Stop strong recommendations until inputs are complete"],
    mustNotInclude: ["scale-ready"],
  },
  {
    name: "missing-traffic-core",
    fields: {
      "Sessions / Page views": "",
      Orders: "",
      "CVR %": "",
      "Ad spend": "",
      "Ad sales": "",
      "ACOS %": "",
    },
    goal: "Budget reallocation",
    expectedBranch: "missing-traffic-core",
    mustInclude: ["Do not call a traffic gap, conversion gap, or scale-ready state without those inputs", "Stop strong recommendations until inputs are complete"],
  },
  {
    name: "inventory-risk",
    fields: { "Inventory units": "60", "Average daily sales": "10" },
    goal: "Scale",
    expectedBranch: "inventory-risk",
    mustInclude: ["Do not increase budget, run a rank push, expand Deal, or expand Coupon", "Stop promotions and scaling when inventory cover is below 14 days"],
  },
  {
    name: "profit-floor-risk",
    fields: { "Ad spend": "1836", "Ad sales": "5400", Orders: "308", "Return rate %": "4" },
    goal: "Scale",
    expectedBranch: "profit-floor-risk",
    mustInclude: ["Pause broad scaling and reduce or hold campaigns above the ad tolerance line", "Do not add budget, Coupon, Deal, or discount pressure", "Stop if ACOS stays above tolerance for 3 days"],
    mustNotInclude: ["Profit, inventory, and baseline efficiency allow controlled scaling"],
  },
  {
    name: "traffic-gap",
    fields: { "Sessions / Page views": "600", Orders: "72", "Ad spend": "650", "Ad sales": "5400" },
    goal: "Scale",
    expectedBranch: "traffic-gap",
    mustInclude: ["traffic is the current gap", "Do not perform Ads Workbench-style search term or placement diagnosis", "Stop if ACOS exceeds tolerance"],
  },
  {
    name: "conversion-gap",
    fields: { "Sessions / Page views": "4200", Orders: "210", "Ad spend": "650", "Ad sales": "5400" },
    goal: "Scale",
    expectedBranch: "conversion-gap",
    mustInclude: ["conversion is weak", "Do not generate title, bullets, description, or Search Terms", "Stop if CVR keeps falling or ACOS exceeds tolerance"],
  },
  {
    name: "scale-ready",
    fields: { "Sessions / Page views": "4200", Orders: "420", "Ad spend": "650", "Ad sales": "5400" },
    goal: "Scale",
    expectedBranch: "scale-ready",
    mustInclude: ["allow controlled scaling", "Do not promise guaranteed growth, lower ACOS, higher profit, or ranking improvement", "Stop or downgrade if ACOS exceeds tolerance"],
  },
  {
    name: "clearance-needed",
    fields: { "Inventory units": "3000", "Average daily sales": "20", "Ad spend": "650", "Ad sales": "5400" },
    goal: "Clear inventory",
    expectedBranch: "clearance-needed",
    mustInclude: ["Clearance needed", "profit-safe sell-through plan", "Stop or downgrade when inventory cover returns"],
  },
];

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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function verifyCompactPayloadBoundary() {
  const componentPath = path.join(__dirname, "../src/components/amazon-growth-profit-planner.tsx");
  const source = fs.readFileSync(componentPath, "utf8");
  const payloadStart = source.indexOf("function buildCompactAiPayload");
  assert(payloadStart >= 0, "missing buildCompactAiPayload token boundary helper");
  const payloadEnd = source.indexOf("\nfunction", payloadStart + 1);
  const payloadSource = source.slice(payloadStart, payloadEnd > payloadStart ? payloadEnd : source.length);

  assert(source.includes("function normalizeSubmittedInput"), "missing normalizeSubmittedInput submit snapshot helper");
  assert(source.includes("setSubmittedSnapshot"), "submit should store a normalized snapshot, not regenerate from live input");
  assert(payloadSource.includes("stripNullish"), "compact AI payload must strip empty optional fields");
  assert(payloadSource.includes("noLiveSellerCentralData"), "compact AI payload must carry no-live-data guardrail");
  assert(payloadSource.includes("deterministicBranchOnly"), "compact AI payload must preserve deterministic branch guardrail");
  assert(payloadSource.includes("excludesUiCopy"), "compact AI payload must mark UI copy exclusion");
  for (const forbidden of ["decision", "evidence", "actions", "doNotDo", "reviewRules", "operatingPlan"]) {
    assert(!payloadSource.includes(forbidden), `compact AI payload must not include UI/report copy field: ${forbidden}`);
  }
}

async function fillField(page, label, value) {
  await page.getByLabel(label, { exact: true }).fill(value);
}

async function selectGoal(page, label) {
  await page.getByLabel("Current goal").selectOption({ label });
}

async function resetForm(page) {
  for (const [label, value] of Object.entries(baseInput)) {
    await fillField(page, label, value);
  }
  await page.getByLabel("Referral fee mode").selectOption({ label: "Rate %" });
  await page.getByLabel("Traffic metric").selectOption({ label: "Sessions" });
  await page.getByLabel("Coupon status").selectOption({ label: "Eligible" });
  await page.getByLabel("Deal / PED status").selectOption({ label: "Unknown" });
  await selectGoal(page, "Scale");
}

async function generate(page) {
  await page.getByRole("button", { name: "Generate plan" }).click();
  await page.getByTestId("growth-result-branch").waitFor({ state: "visible", timeout: 5000 });
}

async function main() {
  verifyCompactPayloadBoundary();

  const browser = await chromium.launch({
    executablePath: chromeBin,
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1600 }, locale: "zh-CN" });
  const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle", timeout: 30000 });
  assert(response && response.ok(), `route returned ${response ? response.status() : "no response"}`);

  let initialText = await page.locator("body").innerText();
  assert(initialText.includes("Ready to generate"), "English route should wait for submit before showing result");
  assert(!initialText.includes("profit-floor-risk"), "English route must not render final branch before submit");

  const results = [];

  for (const testCase of cases) {
    await resetForm(page);
    for (const [label, value] of Object.entries(testCase.fields)) {
      await fillField(page, label, value);
    }
    await selectGoal(page, testCase.goal);
    let dirtyText = await page.locator("body").innerText();
    assert(dirtyText.includes("Inputs changed. Generate again to refresh the brief."), `${testCase.name}: dirty state missing before submit`);
    await generate(page);

    const branch = await page.getByTestId("growth-result-branch").innerText();
    const text = await page.locator("body").innerText();

    assert(
      branch.toLowerCase().includes(testCase.expectedBranch),
      `${testCase.name}: expected branch ${testCase.expectedBranch}, got ${branch}`,
    );
    for (const snippet of testCase.mustNotInclude || []) {
      assert(!text.includes(snippet), `${testCase.name}: forbidden text visible: ${snippet}`);
    }
    for (const token of bannedText) {
      assert(!text.includes(token), `${testCase.name}: banned text visible: ${token}`);
    }
    assert(text.toLowerCase().includes("current judgment"), `${testCase.name}: missing current judgment`);
    assert(!text.includes("关键证据"), `${testCase.name}: six-module evidence should not be visible in main English result`);
    assert(!text.includes("冻结 broad scale"), `${testCase.name}: mixed-language old copy visible`);
    assert(text.includes("Stop-line"), `${testCase.name}: missing stop-line`);

    await page.getByRole("button", { name: "How it works" }).first().click();
    const modalText = await page.locator("body").innerText();
    const combinedText = `${text}\n${modalText}`;
    for (const snippet of testCase.mustInclude) {
      assert(combinedText.includes(snippet), `${testCase.name}: missing required text: ${snippet}`);
    }
    assert(modalText.includes("Key Evidence"), `${testCase.name}: modal missing key evidence`);
    assert(modalText.includes("Priority Actions"), `${testCase.name}: modal missing priority actions`);
    assert(modalText.includes("Do Not Do"), `${testCase.name}: modal missing do-not-do`);
    assert(modalText.includes("Review Rules"), `${testCase.name}: modal missing review rules`);
    assert(modalText.includes("Missing Data"), `${testCase.name}: modal missing missing data`);
    await page.getByRole("button", { name: "Close" }).click();

    results.push({ name: testCase.name, branch });
  }

  const zhPage = await browser.newPage({ viewport: { width: 1440, height: 1600 }, locale: "zh-CN" });
  const zhResponse = await zhPage.goto(`${baseUrl}${zhRoute}`, { waitUntil: "networkidle", timeout: 30000 });
  assert(zhResponse && zhResponse.ok(), `zh route returned ${zhResponse ? zhResponse.status() : "no response"}`);
  await zhPage.getByRole("button", { name: "提交生成" }).click();
  await zhPage.getByTestId("growth-result-branch").waitFor({ state: "visible", timeout: 5000 });
  const zhText = await zhPage.locator("body").innerText();
  assert(zhText.includes("利润底线风险"), "Chinese route should render Chinese branch copy");
  assert(zhText.includes("暂停宽泛放量，削减或冻结超过广告承受线的投放。"), "Chinese route missing clean profit-floor action");
  assert(!zhText.includes("Pause broad scaling"), "Chinese route should not render English sentence copy");
  assert(!zhText.includes("冻结 broad scale"), "Chinese route should not render mixed-language old copy");
  await zhPage.getByRole("button", { name: "功能说明" }).first().click();
  const zhModalText = await zhPage.locator("body").innerText();
  assert(zhModalText.includes("关键证据"), "Chinese modal missing key evidence");
  await zhPage.getByRole("button", { name: "关闭" }).click();
  await zhPage.close();

  await browser.close();
  console.log(JSON.stringify({ ok: true, route: `${baseUrl}${route}`, checked: results }, null, 2));
}

main().catch(async (error) => {
  console.error(error.message);
  process.exit(1);
});
