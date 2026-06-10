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

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function bodyText(page) {
  return page.locator("body").innerText();
}

async function assertNoBannedText(page, stage) {
  const text = await bodyText(page);
  for (const token of bannedText) {
    assert(!text.includes(token), `${stage}: banned text visible: ${token}`);
  }
}

async function assertText(page, text, stage) {
  const deadline = Date.now() + 5000;
  let current = "";
  while (Date.now() < deadline) {
    current = await bodyText(page);
    if (current.includes(text)) return;
    await page.waitForTimeout(100);
  }
  assert(current.includes(text), `${stage}: missing text: ${text}`);
}

async function fillByLabel(page, label, value) {
  await page.getByLabel(label, { exact: true }).fill(String(value));
}

async function selectByLabelText(page, label, value) {
  await page.locator("label").filter({ hasText: label }).locator("select").selectOption(value);
}

async function clearAlexa(page) {
  await page.goto(`${baseUrl}/amazon/alexa-for-shopping-listing-builder/zh`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /提交生成|Generate/ }).waitFor({ state: "visible", timeout: 5000 });
  await assertNoBannedText(page, "alexa initial");
}

async function generateAlexa(page) {
  await page.getByRole("button", { name: /提交生成|Generate/ }).click();
}

async function assertAlexaInfoText(page, text, stage) {
  await page.getByRole("button", { name: "功能说明" }).click();
  await assertText(page, text, stage);
  await page.getByRole("button", { name: "关闭" }).click();
}

const alexaBase = {
  category: "Home & Kitchen > Coffee Accessories",
  title: "Compact Milk Frother for Espresso Drinks, Stainless Whisk, USB Rechargeable, Countertop Drink Mixer",
  bullets: [
    "Creates foam for espresso drinks in under one minute.",
    "Compact body stores beside a coffee machine.",
    "Includes stainless whisk and charging cable.",
  ].join("\n"),
  buyer: "espresso drinkers in small kitchens who make one drink at a time",
  useCases: [
    "Foaming milk before a morning espresso.",
    "Mixing powdered drinks at a small counter.",
    "Storing the frother beside a compact coffee setup.",
  ].join("\n"),
  keywords: "milk frother, compact frother, espresso drink mixer, stainless whisk frother, rechargeable milk mixer",
  questions: [
    "Who is this frother best for?",
    "What drinks can it help prepare?",
    "What is included in the box?",
  ].join("\n"),
  description: "Current A+ repeats the bullets.",
  reviews: "Buyers ask for clearer use cases.",
  facts: "Stainless whisk included. USB rechargeable. Not designed for commercial use.",
};

async function fillAlexa(page, values = {}) {
  const data = { ...alexaBase, ...values };
  await fillByLabel(page, "产品类目", data.category);
  await fillByLabel(page, "当前标题", data.title);
  await fillByLabel(page, "当前五点", data.bullets);
  await fillByLabel(page, "目标买家", data.buyer);
  await fillByLabel(page, "3 个核心使用场景", data.useCases);
  await fillByLabel(page, "5-10 个目标关键词", data.keywords);
  await fillByLabel(page, "3-5 个买家/Alexa 问句", data.questions);
  await fillByLabel(page, "可选：当前描述或 A+ 摘要", data.description);
  await fillByLabel(page, "可选：Review / Q&A 摘要", data.reviews);
  await fillByLabel(page, "可选：产品事实、限制、兼容性", data.facts);
}

async function verifyAlexa(page) {
  const checks = [];

  await clearAlexa(page);
  await generateAlexa(page);
  await assertText(page, "missing-core", "alexa missing-core");
  await assertText(page, "Listing 草稿已阻断", "alexa missing-core");
  assert(!(await bodyText(page)).includes("Suggested Title"), "alexa missing-core must hide suggested title");
  checks.push("alexa missing-core blocks draft");

  await clearAlexa(page);
  await fillAlexa(page, {
    buyer: "everyone",
    useCases: ["daily use", "home", "gift"].join("\n"),
    questions: ["Who can use it?", "Why is it useful?", "When should people buy it?"].join("\n"),
  });
  await generateAlexa(page);
  await assertText(page, "keyword-only", "alexa keyword-only");
  await assertAlexaInfoText(page, "不要把所有关键词塞进标题", "alexa keyword-only");
  checks.push("alexa keyword-only");

  await clearAlexa(page);
  await fillAlexa(page, {
    bullets: ["Fast one-button use.", "Compact counter storage.", "Includes the mixer body."].join("\n"),
    questions: [
      "Will a travel mug fit under it?",
      "Is it easy to clean after foam?",
      "Is setup hard for first-time users?",
    ].join("\n"),
    reviews: "Buyers ask about fit, cleaning, and setup.",
  });
  await generateAlexa(page);
  await assertText(page, "objection-gap", "alexa objection-gap");
  await assertAlexaInfoText(page, "不要隐藏限制条件", "alexa objection-gap");
  checks.push("alexa objection-gap");

  await clearAlexa(page);
  await fillAlexa(page, {
    title: "Best Guaranteed 100% Waterproof Compact Milk Frother for Espresso Drinks",
    facts: "No certification proof supplied.",
  });
  await generateAlexa(page);
  await assertText(page, "proof-gap", "alexa proof-gap");
  await assertAlexaInfoText(page, "把绝对化表达改成事实描述", "alexa proof-gap");
  checks.push("alexa proof-gap");

  await clearAlexa(page);
  await fillAlexa(page, {
    title: "Compact Milk Frother for Espresso Drinks",
    facts: "Medical support claim: helps treat wrist fatigue during daily mixing. No certification supplied.",
  });
  await generateAlexa(page);
  await assertText(page, "compliance-risk", "alexa compliance-risk");
  await assertAlexaInfoText(page, "不要承诺治疗", "alexa compliance-risk");
  checks.push("alexa compliance-risk");

  await clearAlexa(page);
  await fillAlexa(page);
  await generateAlexa(page);
  await assertText(page, "answer-ready", "alexa answer-ready");
  await assertAlexaInfoText(page, "不要承诺 Alexa 会推荐或引用", "alexa answer-ready");
  await assertText(page, "标题打法：品类 + 场景 + 风险控制 + 人群", "alexa answer-ready");
  checks.push("alexa answer-ready");

  return checks;
}

async function clearGrowth(page) {
  await page.goto(`${baseUrl}/amazon/amazon-growth-profit-planner`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Generate plan" }).waitFor({ state: "visible", timeout: 5000 });
  await assertNoBannedText(page, "growth initial");
}

async function generateGrowth(page) {
  const button = page.getByRole("button", { name: "Generate plan" });
  await button.waitFor({ state: "visible", timeout: 5000 });
  await button.click();
  await page.getByTestId("growth-result-branch").waitFor({ state: "visible", timeout: 10000 });
}

async function assertGrowthBranch(page, branch, stage) {
  const deadline = Date.now() + 5000;
  let current = "";
  while (Date.now() < deadline) {
    current = (await page.getByTestId("growth-result-branch").innerText()).toLowerCase();
    if (current.includes(branch)) return;
    await page.waitForTimeout(100);
  }
  assert(current.includes(branch), `${stage}: expected branch ${branch}, got ${current}`);
}

async function fillGrowth(page, values = {}) {
  const data = {
    sku: "B0PLAN123 | Compact Milk Frother",
    price: "29.99",
    landedCost: "8.00",
    referralFeeRate: "15",
    fbaFee: "4.00",
    inventoryUnits: "1000",
    avgDailySales: "20",
    sessions: "2500",
    orders: "300",
    cvr: "",
    adSpend: "400",
    adSales: "5000",
    acos: "",
    goal: "scale",
    targetNetMargin: "12",
    targetTacos: "10",
    returnRate: "2",
    ...values,
  };
  await fillByLabel(page, "ASIN", data.sku);
  await fillByLabel(page, "Price", data.price);
  await fillByLabel(page, "Landed cost per unit (purchase + inbound freight)", data.landedCost);
  await selectByLabelText(page, "Referral fee mode", "rate");
  await fillByLabel(page, "Amazon referral fee rate %", data.referralFeeRate);
  await fillByLabel(page, "FBA / fulfillment fee", data.fbaFee);
  await fillByLabel(page, "Inventory units", data.inventoryUnits);
  await fillByLabel(page, "Average daily sales", data.avgDailySales);
  await selectByLabelText(page, "Traffic metric", "sessions");
  await fillByLabel(page, "Sessions / Page views", data.sessions);
  await fillByLabel(page, "Orders", data.orders);
  await fillByLabel(page, "CVR %", data.cvr);
  await fillByLabel(page, "Ad spend", data.adSpend);
  await fillByLabel(page, "Ad sales", data.adSales);
  await fillByLabel(page, "ACOS %", data.acos);
  await selectByLabelText(page, "Current goal", data.goal);
  await fillByLabel(page, "Target net margin %", data.targetNetMargin);
  await fillByLabel(page, "Target TACOS %", data.targetTacos);
  await fillByLabel(page, "Return rate %", data.returnRate);
}

async function verifyGrowth(page) {
  const checks = [];

  await clearGrowth(page);
  await fillGrowth(page, { price: "" });
  await generateGrowth(page);
  await assertGrowthBranch(page, "missing-profit-core", "growth missing-profit-core");
  await assertText(page, "Stop-line", "growth missing-profit-core");
  checks.push("growth missing-profit-core blocks growth actions");

  await clearGrowth(page);
  await fillGrowth(page, { sessions: "", orders: "", cvr: "", adSpend: "", adSales: "", acos: "" });
  await generateGrowth(page);
  await assertGrowthBranch(page, "missing-traffic-core", "growth missing-traffic-core");
  await assertText(page, "Stop-line", "growth missing-traffic-core");
  checks.push("growth missing-traffic-core blocks traffic calls");

  await clearGrowth(page);
  await fillGrowth(page, { inventoryUnits: "160", avgDailySales: "20" });
  await generateGrowth(page);
  await assertGrowthBranch(page, "inventory-risk", "growth inventory-risk");
  await assertText(page, "Stop-line", "growth inventory-risk");
  checks.push("growth inventory-risk");

  await clearGrowth(page);
  await fillGrowth(page, { sessions: "4200", orders: "308", adSpend: "1836", adSales: "5400", inventoryUnits: "840", avgDailySales: "22" });
  await generateGrowth(page);
  await assertGrowthBranch(page, "profit-floor-risk", "growth profit-floor-risk");
  await assertText(page, "Stop-line", "growth profit-floor-risk");
  checks.push("growth profit-floor-risk");

  await clearGrowth(page);
  await fillGrowth(page, { sessions: "650", orders: "78", adSpend: "70", adSales: "1800" });
  await generateGrowth(page);
  await assertGrowthBranch(page, "traffic-gap", "growth traffic-gap");
  await assertText(page, "Stop-line", "growth traffic-gap");
  checks.push("growth traffic-gap");

  await clearGrowth(page);
  await fillGrowth(page, { sessions: "2400", orders: "120", adSpend: "100", adSales: "2200" });
  await generateGrowth(page);
  await assertGrowthBranch(page, "conversion-gap", "growth conversion-gap");
  await assertText(page, "Stop-line", "growth conversion-gap");
  checks.push("growth conversion-gap");

  await clearGrowth(page);
  await fillGrowth(page);
  await generateGrowth(page);
  await assertGrowthBranch(page, "scale-ready", "growth scale-ready");
  await assertText(page, "Stop-line", "growth scale-ready");
  checks.push("growth scale-ready");

  await clearGrowth(page);
  await fillGrowth(page, { goal: "clear-inventory", inventoryUnits: "3000", avgDailySales: "20" });
  await generateGrowth(page);
  await assertGrowthBranch(page, "clearance-needed", "growth clearance-needed");
  await assertText(page, "Stop-line", "growth clearance-needed");
  checks.push("growth clearance-needed");

  return checks;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (text.includes("Failed to load resource: net::ERR_CONNECTION_CLOSED")) return;
    if (text.includes("Failed to load resource: net::ERR_ABORTED")) return;
    consoleErrors.push(text);
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const checks = [...(await verifyAlexa(page)), ...(await verifyGrowth(page))];

  assert(consoleErrors.length === 0, `console errors:\n${consoleErrors.join("\n")}`);
  assert(pageErrors.length === 0, `page errors:\n${pageErrors.join("\n")}`);

  await browser.close();
  console.log(JSON.stringify({ ok: true, checks }, null, 2));
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
