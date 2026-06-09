#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const toolsFile = path.join(root, "src/lib/tools.ts");
const runtimeFile = path.join(root, "src/components/tool-runtime.tsx");
const routeFile = path.join(root, "src/app/api/tool-ai-lite/route.ts");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function extractMatches(text, regex, group = 1) {
  return [...text.matchAll(regex)].map((match) => match[group]);
}

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

const toolsText = read(toolsFile);
const runtimeText = read(runtimeFile);
const routeText = read(routeFile);

const toolSlugs = extractMatches(toolsText, /slug:\s*"([^"]+)"/g);
const runtimeSlugs = extractMatches(runtimeText, /case\s+"([^"]+)":/g);
const liveDataSlugs = extractMatches(toolsText, /const liveDataZeroTokenSlugs = \[(.*?)\] as const;/gs, 1)
  .flatMap((block) => extractMatches(block, /"([^"]+)"/g));
const uploadSlugs = extractMatches(toolsText, /const uploadOrPasteRuntimeSlugs = \[(.*?)\] as const;/gs, 1)
  .flatMap((block) => extractMatches(block, /"([^"]+)"/g));
const lowTokenSlugs = extractMatches(toolsText, /const lowTokenOptionalSlugs = \[(.*?)\] as const;/gs, 1)
  .flatMap((block) => extractMatches(block, /"([^"]+)"/g));

const lowTokenPanelMatches = [
  ...runtimeText.matchAll(
    /<LowTokenAssistPanel[\s\S]*?toolSlug=(?:\"([^\"]+)\"|\{premiumRequested \? "amazon-enhanced-brand-content" : "amazon-a-plus-content"\})[\s\S]*?context=\{\{([\s\S]*?)\}\}[\s\S]*?\/>/g,
  ),
].flatMap((match) => {
  if (match[1]) {
    return [{ slug: match[1], contextBlock: match[2] }];
  }

  return [
    { slug: "amazon-a-plus-content", contextBlock: match[2] },
    { slug: "amazon-enhanced-brand-content", contextBlock: match[2] },
  ];
});

const profileBlocks = [
  ...toolsText.matchAll(/"([^"]+)":\s*\{[\s\S]*?targetInputTokens:\s*(\d+),[\s\S]*?targetOutputTokens:\s*(\d+),[\s\S]*?hardCapTokens:\s*(\d+),[\s\S]*?rationale:\s*[\s\S]*?\}/g),
].map((match) => ({
  slug: match[1],
  input: Number(match[2]),
  output: Number(match[3]),
  hardCap: Number(match[4]),
}));

const runtimeSet = new Set(runtimeSlugs);
const toolSet = new Set(toolSlugs);
const lowTokenSet = new Set(lowTokenSlugs);
const liveDataSet = new Set(liveDataSlugs);
const uploadSet = new Set(uploadSlugs);
const profileMap = new Map(profileBlocks.map((item) => [item.slug, item]));
const contextMap = new Map(lowTokenPanelMatches.map((item) => [item.slug, item.contextBlock]));

if (toolSlugs.length !== 56) {
  fail(`expected 56 tool definitions, found ${toolSlugs.length}`);
}

if (new Set(toolSlugs).size !== toolSlugs.length) {
  fail("tool definitions contain duplicate slugs");
}

if (runtimeSlugs.length !== 56) {
  fail(`expected 56 runtime mappings, found ${runtimeSlugs.length}`);
}

for (const slug of toolSlugs) {
  if (!runtimeSet.has(slug)) {
    fail(`missing runtime mapping for ${slug}`);
  }
}

for (const slug of runtimeSlugs) {
  if (!toolSet.has(slug)) {
    fail(`runtime mapping exists for unknown slug ${slug}`);
  }
}

for (const slug of lowTokenSlugs) {
  if (!toolSet.has(slug)) {
    fail(`low-token allowlist references unknown slug ${slug}`);
    continue;
  }

  const profile = profileMap.get(slug);
  if (!profile) {
    fail(`low-token tool ${slug} is missing a token profile`);
    continue;
  }

  if (profile.input > 260) {
    fail(`low-token tool ${slug} input target exceeds cap (${profile.input})`);
  }
  if (profile.output > 160) {
    fail(`low-token tool ${slug} output target exceeds cap (${profile.output})`);
  }
  if (profile.hardCap > 520) {
    fail(`low-token tool ${slug} hard cap exceeds limit (${profile.hardCap})`);
  }

  if (!contextMap.has(slug)) {
    fail(`low-token tool ${slug} is missing a LowTokenAssistPanel context block`);
  }
}

for (const slug of profileMap.keys()) {
  if (!lowTokenSet.has(slug)) {
    fail(`token profile exists for ${slug} but slug is not in the low-token allowlist`);
  }
}

for (const slug of liveDataSlugs) {
  if (!toolSet.has(slug)) {
    fail(`live-data list references unknown slug ${slug}`);
  }
}

for (const slug of uploadSlugs) {
  if (!toolSet.has(slug)) {
    fail(`paste/upload list references unknown slug ${slug}`);
  }
}

const forbiddenContextTerms = [
  "marketplace",
  "asinOrUrl",
  "brandRegistered",
  "storefrontReady",
  "submissionReady",
  "seasonalReady",
  "brandStoryReady",
];

for (const [slug, block] of contextMap.entries()) {
  for (const term of forbiddenContextTerms) {
    if (block.includes(term)) {
      fail(`low-token context for ${slug} still includes forbidden high-noise field ${term}`);
    }
  }
}

const expectedContextSnippets = {
  "amazon-review-analyzer": ["parsedReviewCount", "averageRating", "complaintThemes"],
  "amazon-listing-optimization": ["targetKeywords", "ownTitle", "competitorAsins"],
  "amazon-a-plus-content": ["benefitAngles", "buyerObjections", "plannedModules: plannedModules.slice"],
  "amazon-enhanced-brand-content": ["benefitAngles", "buyerObjections", "plannedModules: plannedModules.slice"],
  "amazon-ppc-campaign": ["campaignMode", "targetAcos", "campaignEfficiencyMap"],
  "amazon-advertising-strategy": ["goal", "monthlyBudget", "allocationRows: summarizeDistributionRows"],
  "amazon-product-photography": ["useCases", "featurePriorities", "shotRows: summarizeDistributionRows"],
  "amazon-storefront-design": ["catalogCount", "audienceSegments", "structureRows: summarizeDistributionRows"],
  "amazon-international-listings": ["sourceLocale", "targetLocale", "liveTitle"],
  "amazon-suspension-appeal": ["issueType", "rootCauses", "correctiveActions"],
  "amazon-brand-analytics": ["ownAsin", "parsedRows", "priorityQueries: summarizeDistributionRows"],
};

for (const [slug, snippets] of Object.entries(expectedContextSnippets)) {
  const block = contextMap.get(slug);
  if (!block) {
    continue;
  }

  for (const snippet of snippets) {
    if (!block.includes(snippet)) {
      fail(`low-token context for ${slug} is missing expected compact field ${snippet}`);
    }
  }
}

const requiredRouteSnippets = [
  "Protected assist is not configured.",
  "Do not mention any engine, provider, vendor, or implementation detail.",
  "sanitizeAssistText",
  "GUARDED_ASSIST_API_KEY",
  "GUARDED_ASSIST_BASE_URL",
  "GUARDED_ASSIST_ENGINE",
  "const maxContextStringLength = 80;",
  "const maxContextArrayItems = 4;",
  "const maxContextObjectEntries = 6;",
  "const maxPayloadCharacters = 1400;",
  "const maxCompletionSlackTokens = 32;",
  "Math.min(",
];

for (const snippet of requiredRouteSnippets) {
  if (!routeText.includes(snippet)) {
    fail(`guarded assist route is missing required safeguard: ${snippet}`);
  }
}

const forbiddenRouteSnippets = [
  "deterministic-fallback",
  "OPENAI_API_KEY",
  "OPENAI_LOW_TOKEN_MODEL",
  "OpenAI request failed",
  "max_tokens: execution.hardCapTokens",
];

for (const snippet of forbiddenRouteSnippets) {
  if (routeText.includes(snippet)) {
    fail(`guarded assist route still contains forbidden legacy marker: ${snippet}`);
  }
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log(
  JSON.stringify(
    {
      tools: toolSlugs.length,
      runtimeMappings: runtimeSlugs.length,
      lowTokenTools: lowTokenSlugs.length,
      liveDataTools: liveDataSlugs.length,
      uploadTools: uploadSlugs.length,
      status: "ok",
    },
    null,
    2,
  ),
);
