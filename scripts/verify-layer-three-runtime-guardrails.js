#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const simplifierFile = path.resolve(
  __dirname,
  "..",
  "src",
  "components",
  "tool-runtime-simplifier.tsx",
);

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

const text = fs.readFileSync(simplifierFile, "utf8");

const requiredSnippets = [
  "const hiddenContentFragments = [",
  "const hiddenCardFragments = [",
  "const hiddenLinePrefixes = [",
  "const noiseSignalFragments = [",
  "const keepCardFragments = [",
  "function shouldHideNoiseLine",
  "function getNoiseSignalScore",
  "root.querySelectorAll<HTMLElement>(\"p, button, a, summary\")",
  "\"div[class*='rounded'], details, a, button, aside, section, article\"",
  "noiseSignalScore >= 4",
  "hiddenContentFragments.some((fragment) => text.includes(fragment))",
];

for (const snippet of requiredSnippets) {
  if (!text.includes(snippet)) {
    fail(`runtime simplifier is missing guardrail snippet: ${snippet}`);
  }
}

const requiredSignals = [
  "Commercial summary",
  "Meeting-ready summary",
  "Operator handoff",
  "Meeting readout",
  "本轮禁止动作：",
  "Only use manual overrides",
  "Team call:",
  "Board order:",
  "Priority order:",
  "Response order:",
  "Execution owner",
  "Do not cross",
  "Then do",
  "Watch",
  "Why now",
  "Status",
  "Approval gate:",
  "Stop-loss rule:",
  "Win rule:",
  "Execution call:",
  "Scenario call:",
  "Review call:",
];

for (const signal of requiredSignals) {
  if (!text.includes(signal)) {
    fail(`runtime simplifier is missing expected noise signal: ${signal}`);
  }
}

process.stdout.write(
  `${JSON.stringify({ file: path.basename(simplifierFile), status: "ok" }, null, 2)}\n`,
);
