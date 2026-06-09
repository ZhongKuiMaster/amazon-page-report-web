#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const path = require("node:path");

const root = __dirname;
const baseUrl = process.env.TOOL_PAGE_BASE_URL || "http://127.0.0.1:3000";

const checks = [
  {
    label: "first-tier operator value",
    script: "verify-first-tier-operator-value.js",
  },
  {
    label: "first-tier paid ux",
    script: "verify-first-tier-paid-ux.js",
  },
  {
    label: "first-tier deterministic value",
    script: "verify-first-tier-deterministic-value.js",
  },
  {
    label: "live listing flows",
    script: "verify-live-listing-flows.js",
  },
  {
    label: "first-tier live value",
    script: "verify-first-tier-live-value.js",
  },
];

const results = [];

for (const check of checks) {
  const scriptPath = path.join(root, check.script);
  const run = spawnSync(process.execPath, [scriptPath], {
    env: {
      ...process.env,
      TOOL_PAGE_BASE_URL: baseUrl,
    },
    encoding: "utf8",
  });

  if (run.status !== 0) {
    const detail = (run.stderr || run.stdout || "").trim();
    console.error(`FAIL: ${check.label} failed${detail ? `\n${detail}` : ""}`);
    process.exit(1);
  }

  let parsed = null;
  try {
    parsed = JSON.parse(run.stdout);
  } catch {
    parsed = { raw: run.stdout.trim() };
  }

  results.push({
    label: check.label,
    status: "ok",
    summary:
      Array.isArray(parsed?.pages)
        ? `${parsed.pages.length} page checks`
        : Array.isArray(parsed?.results)
          ? `${parsed.results.length} live flow checks`
          : "passed",
  });
}

process.stdout.write(
  `${JSON.stringify({ baseUrl, status: "ok", checks: results }, null, 2)}\n`,
);
