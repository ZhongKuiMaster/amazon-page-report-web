#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const path = require("node:path");

const scriptDir = __dirname;

const checks = [
  {
    id: "paid-ux",
    script: path.join(scriptDir, "verify-shopify-layer-three-paid-ux.js"),
  },
  {
    id: "runtime-preview",
    script: path.join(scriptDir, "verify-shopify-layer-three-runtime-preview.js"),
  },
];

function runCheck(check) {
  const result = spawnSync(process.execPath, [check.script], {
    cwd: path.join(scriptDir, ".."),
    encoding: "utf8",
  });

  if (result.status !== 0) {
    const stderr = (result.stderr || "").trim();
    const stdout = (result.stdout || "").trim();
    const detail = stderr || stdout || `Check failed with exit code ${result.status}`;
    throw new Error(`${check.id} failed: ${detail}`);
  }

  const payload = JSON.parse(result.stdout);
  return {
    id: check.id,
    pages: payload.pages,
  };
}

async function main() {
  const outputs = checks.map(runCheck);
  const merged = new Map();

  for (const output of outputs) {
    for (const page of output.pages) {
      const current = merged.get(page.slug) || {
        slug: page.slug,
        status: "ok",
        checks: {},
      };
      current.checks[output.id] = page.checks;
      merged.set(page.slug, current);
    }
  }

  process.stdout.write(
    `${JSON.stringify(
      {
        acceptance: "shopify-layer-three",
        pages: Array.from(merged.values()),
      },
      null,
      2,
    )}\n`,
  );
}

main().catch((error) => {
  console.error(`FAIL: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
