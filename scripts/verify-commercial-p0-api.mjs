const baseUrl = process.env.TOOL_PAGE_BASE_URL || "http://127.0.0.1:3188";
const redeemCode = process.env.COMMERCIAL_REDEEM_CODE || "WECHAT-DEMO-0001";
const email = process.env.COMMERCIAL_TEST_EMAIL || `commercial-smoke-${Date.now()}@dealingnow.test`;

const expectedTools = ["ads-workbench", "alexa-listing-builder", "growth-profit-planner"];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function requestJson(label, path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const json = await response.json().catch(async () => ({ raw: await response.text() }));

  if (!response.ok) {
    throw new Error(`${label} returned HTTP ${response.status}`);
  }

  if (!json.ok) {
    throw new Error(`${label} failed: ${json.message || "unknown productized error"}`);
  }

  return json;
}

function balancesByTool(snapshot) {
  return Object.fromEntries((snapshot?.balances || []).map((item) => [item.toolId, item.remainingCredits]));
}

function assertCredits(snapshot, expectedCredits, label) {
  const balances = balancesByTool(snapshot);
  for (const toolId of expectedTools) {
    assert(
      balances[toolId] === expectedCredits,
      `${label}: expected ${toolId} to have ${expectedCredits} credits, got ${balances[toolId]}`,
    );
  }
}

async function main() {
  console.log(`Commercial P0 API smoke against ${baseUrl}`);
  console.log(`Test email: ${email}`);
  console.log(`Redeem code: ${redeemCode}`);

  const register = await requestJson("register", "/api/commercial/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, wechatId: "commercial-smoke" }),
  });
  assert(register.snapshot?.configured === true, "register: commercial backend is not configured");
  assertCredits(register.snapshot, 1, "after register");

  const entitlements = await requestJson("entitlements", `/api/commercial/entitlements?email=${encodeURIComponent(email)}`);
  assertCredits(entitlements.snapshot, 1, "after entitlements");

  const redeem = await requestJson("redeem", "/api/commercial/redeem", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, code: redeemCode }),
  });
  assertCredits(redeem.snapshot, 4, "after redeem");

  const usage = await requestJson("usage", "/api/commercial/usage", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, toolId: "ads-workbench" }),
  });
  assert(usage.usage?.configured === true, "usage: commercial backend is not configured");
  assert(usage.usage?.ok === true, `usage: expected credit consumption to pass, got ${usage.usage?.message}`);
  assert(usage.usage?.remainingCredits === 3, `usage: expected ads-workbench remaining credits to be 3, got ${usage.usage?.remainingCredits}`);

  console.log("Commercial P0 API smoke passed.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
