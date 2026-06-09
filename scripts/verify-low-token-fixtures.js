#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const toolsFile = path.join(root, "src/lib/tools.ts");

const maxContextStringLength = 80;
const maxContextArrayItems = 4;
const maxContextObjectEntries = 6;
const maxMetricDetailLength = 48;
const maxSummaryLength = 140;
const maxHeadlineLength = 72;
const maxPayloadCharacters = 1400;
const maxCompletionSlackTokens = 32;

const contextKeyWhitelist = {
  "amazon-listing-optimization": [
    "targetKeywords",
    "ownTitle",
    "ownBullets",
    "competitorAsins",
  ],
  "amazon-a-plus-content": [
    "benefitAngles",
    "buyerObjections",
    "brandStory",
    "plannedModules",
    "assetChecklist",
    "liveTitle",
  ],
  "amazon-enhanced-brand-content": [
    "benefitAngles",
    "buyerObjections",
    "brandStory",
    "plannedModules",
    "assetChecklist",
    "liveTitle",
  ],
  "amazon-ppc-campaign": [
    "campaignMode",
    "targetAcos",
    "parsedCampaignRows",
    "campaignEfficiencyMap",
  ],
  "amazon-advertising-strategy": [
    "goal",
    "monthlyBudget",
    "heroAsinCount",
    "parsedCampaignRows",
    "allocationRows",
  ],
  "amazon-review-analyzer": [
    "parsedReviewCount",
    "averageRating",
    "complaintThemes",
    "praiseThemes",
    "opportunityThemes",
  ],
  "amazon-brand-analytics": [
    "parsedRows",
    "repeatedWinnerAsins",
    "priorityQueries",
    "ownAsin",
  ],
  "amazon-suspension-appeal": [
    "issueType",
    "noticeText",
    "rootCauses",
    "evidencePack",
    "correctiveActions",
    "preventionSteps",
  ],
  "amazon-product-photography": [
    "useCases",
    "featurePriorities",
    "selectedProps",
    "retouchNeeds",
    "shotRows",
  ],
  "amazon-storefront-design": [
    "catalogCount",
    "collectionCount",
    "navDepth",
    "audienceSegments",
    "trafficSources",
    "structureRows",
  ],
  "amazon-international-listings": [
    "sourceLocale",
    "targetLocale",
    "keywordGoals",
    "complianceCaveats",
    "localizationDepth",
    "pricingReady",
    "liveTitle",
  ],
};

function truncateText(value, limit) {
  return value.length <= limit ? value : `${value.slice(0, limit - 1)}…`;
}

function compactValue(value) {
  if (typeof value === "string") return truncateText(value, maxContextStringLength);
  if (typeof value === "number" || typeof value === "boolean" || value == null) return value;
  if (Array.isArray(value)) return value.slice(0, maxContextArrayItems).map(compactValue);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, maxContextObjectEntries)
        .map(([key, item]) => [key, compactValue(item)]),
    );
  }
  return String(value);
}

function slimContext(toolSlug, context) {
  const allowedKeys = contextKeyWhitelist[toolSlug] ?? [];
  return Object.fromEntries(
    allowedKeys
      .filter((key) => key in context)
      .map((key) => [key, compactValue(context[key])]),
  );
}

function compactDeterministicResult(result) {
  return {
    headline: truncateText(result.headline ?? "", maxHeadlineLength),
    summary: truncateText(result.summary ?? "", maxSummaryLength),
    metrics: (result.metrics ?? []).slice(0, 4).map((metric) => ({
      label: truncateText(metric.label, 24),
      value: truncateText(metric.value, 24),
      detail: metric.detail ? truncateText(metric.detail, maxMetricDetailLength) : undefined,
    })),
    risks: (result.riskItems ?? []).slice(0, 2).map((item) => truncateText(item, 72)),
    next_steps: (result.nextSteps?.length ? result.nextSteps : result.recommendations ?? [])
      .slice(0, 3)
      .map((item) => truncateText(item, 72)),
    missing: (result.missingItems ?? []).slice(0, 2).map((item) => truncateText(item, 60)),
  };
}

function trimPayloadSize(payload) {
  const serialized = JSON.stringify(payload);
  if (serialized.length <= maxPayloadCharacters) return payload;

  const compactPayload = {
    tool: payload.tool,
    deterministic_result: {
      headline: payload.deterministic_result?.headline ?? "",
      summary: payload.deterministic_result?.summary ?? "",
      next_steps: payload.deterministic_result?.next_steps ?? [],
    },
    compact_context: payload.compact_context,
    output_rules: payload.output_rules,
  };
  if (JSON.stringify(compactPayload).length <= maxPayloadCharacters) return compactPayload;

  return {
    tool: payload.tool,
    deterministic_result: {
      headline: payload.deterministic_result?.headline ?? "",
      summary: payload.deterministic_result?.summary ?? "",
      next_steps: payload.deterministic_result?.next_steps ?? [],
    },
    compact_context: {},
    output_rules: payload.output_rules,
  };
}

function getProfiles() {
  const text = fs.readFileSync(toolsFile, "utf8");
  const matches = [
    ...text.matchAll(
      /"([^"]+)":\s*\{[\s\S]*?targetInputTokens:\s*(\d+),[\s\S]*?targetOutputTokens:\s*(\d+),[\s\S]*?hardCapTokens:\s*(\d+),/g,
    ),
  ];
  return new Map(
    matches.map((match) => [
      match[1],
      {
        targetInputTokens: Number(match[2]),
        targetOutputTokens: Number(match[3]),
        hardCapTokens: Number(match[4]),
      },
    ]),
  );
}

const baseResult = {
  headline: "Deterministic result is ready for operator review with clear next actions.",
  summary:
    "This result comes from rule-based scoring and should only need a very short enhancement layer for operator-facing wording.",
  recommendations: [
    "Fix the highest-risk item first.",
    "Keep the top winning element stable.",
    "Re-run after input changes.",
  ],
  riskItems: [
    "A small sample can make the read directional rather than final.",
    "The operator should verify the first blocking item before scaling.",
  ],
  missingItems: ["Some optional inputs are still missing."],
  nextSteps: [
    "Resolve the first blocking issue.",
    "Protect the strongest signal.",
    "Re-check after the update.",
  ],
  metrics: [
    { label: "Signal one", value: "Strong", detail: "Primary score remains above the working threshold." },
    { label: "Signal two", value: "Mixed", detail: "A secondary check still needs attention." },
    { label: "Signal three", value: "Ready", detail: "The operator can act immediately." },
    { label: "Signal four", value: "Watch", detail: "This one should be revisited after edits." },
    { label: "Signal five", value: "Extra", detail: "Should be trimmed by compaction." },
  ],
};

const fixtures = {
  "amazon-review-analyzer": {
    context: {
      parsedReviewCount: 148,
      averageRating: 4.1,
      complaintThemes: ["packaging: 19", "clarity: 12", "assembly: 7", "quality: 4", "extra: 2"],
      praiseThemes: ["design: 31", "value: 18", "quality: 15", "size: 10"],
      opportunityThemes: ["feature-gap: 8", "clarity: 5", "assembly: 3"],
    },
  },
  "amazon-listing-optimization": {
    context: {
      targetKeywords: "arched mirror, full length mirror, black mirror, bedroom mirror, floor mirror",
      ownTitle:
        "Arched Full Length Mirror 64x21 Black Standing Floor Mirror for Bedroom Dressing Room Entryway",
      ownBullets: [
        "HD shatter-resistant glass with stable aluminum frame.",
        "Leans or free-stands in bedroom and entryway layouts.",
        "Modern arched silhouette for home decor lift.",
        "Works in apartments, dressing rooms, and closets.",
        "Extra long bullet that should be trimmed if needed for payload control.",
      ],
      competitorAsins: ["B0GYRT3FNL", "B0G6K4VXK7", "B0FX2PRMFR", "B0CLNLL9RZ", "B0EXTRA123"],
    },
  },
  "amazon-a-plus-content": {
    context: {
      benefitAngles: ["safer glass", "easy placement", "decor uplift", "stability", "overflow"],
      buyerObjections: ["Will it tip?", "Is the reflection clear?", "Does it fit corners?", "extra objection"],
      brandStory: "Design-led home mirror line focused on compact-space placement and premium finish.",
      plannedModules: ["hero", "comparison", "lifestyle", "dimensions", "extra module"],
      assetChecklist: ["hero", "close-up", "lifestyle", "dimensions", "extra asset"],
      liveTitle: "Arched Full Length Mirror",
    },
  },
  "amazon-enhanced-brand-content": {
    context: {
      benefitAngles: ["safer glass", "easy placement", "decor uplift", "stability", "overflow"],
      buyerObjections: ["Will it tip?", "Is the reflection clear?", "Does it fit corners?", "extra objection"],
      brandStory: "Design-led home mirror line focused on compact-space placement and premium finish.",
      plannedModules: ["hero", "comparison", "lifestyle", "dimensions", "extra module"],
      assetChecklist: ["hero", "close-up", "lifestyle", "dimensions", "extra asset"],
      liveTitle: "Arched Full Length Mirror",
    },
  },
  "amazon-ppc-campaign": {
    context: {
      campaignMode: "audit",
      targetAcos: 0.28,
      parsedCampaignRows: 12,
      campaignEfficiencyMap: ["SP Exact: 15%", "SP Auto: 39%", "SB Video: 16%", "SD View: 44%", "extra"],
    },
  },
  "amazon-advertising-strategy": {
    context: {
      goal: "profit",
      monthlyBudget: 2500,
      heroAsinCount: 2,
      parsedCampaignRows: 9,
      allocationRows: ["Sponsored Products: 55%", "Sponsored Brands: 25%", "Sponsored Display: 20%", "Extra: 3%"],
    },
  },
  "amazon-brand-analytics": {
    context: {
      ownAsin: "B0GYRT3FNL",
      parsedRows: 84,
      repeatedWinnerAsins: ["B0GYRT3FNL: 12", "B0G6K4VXK7: 10", "B0FX2PRMFR: 8", "B0CLNLL9RZ: 5"],
      priorityQueries: [
        "arched full length mirror: 1420",
        "full length mirror black: 2280",
        "bedroom floor mirror: 3050",
        "entryway mirror: 4100",
      ],
    },
  },
  "amazon-suspension-appeal": {
    context: {
      issueType: "used_sold_as_new",
      noticeText:
        "Your listing was removed because customer complaints indicate condition and packaging mismatch at delivery.",
      rootCauses: [
        "Warehouse relabeling process was inconsistent.",
        "Supplier inspection photos were not attached to every lot.",
        "Returns were not isolated fast enough.",
      ],
      evidencePack: [
        "Inbound inspection photos.",
        "Updated SOP with signoff checkpoints.",
        "Supplier corrective action record.",
        "Carrier packaging test record.",
      ],
      correctiveActions: [
        "Add lot-level photo verification.",
        "Block relabeling without supervisor signoff.",
        "Audit return segregation daily.",
      ],
      preventionSteps: [
        "Weekly SOP audit.",
        "Supplier defect review cadence.",
        "Quarterly packaging stress test.",
      ],
    },
  },
  "amazon-product-photography": {
    context: {
      useCases: ["bedroom", "entryway", "closet", "apartment"],
      featurePriorities: ["arched shape", "stable stand", "clear reflection", "black frame"],
      selectedProps: ["chair", "rug", "lamp", "plant", "extra prop"],
      retouchNeeds: ["remove dust", "brighten glass", "straighten frame", "crop"],
      shotRows: ["Hero: front angle", "Lifestyle: bedroom", "Close-up: frame", "Dimensions: overlay", "Extra"],
    },
  },
  "amazon-storefront-design": {
    context: {
      catalogCount: 18,
      collectionCount: 4,
      navDepth: 2,
      audienceSegments: ["new visitors", "repeat buyers", "bundle shoppers", "deal seekers", "extra"],
      trafficSources: ["Sponsored Brands", "Brand Story", "Posts", "External social", "extra"],
      structureRows: ["Hero: decor lift", "Collection 1: bedroom", "Collection 2: entryway", "Bundle page: sets", "extra"],
    },
  },
  "amazon-international-listings": {
    context: {
      sourceLocale: "en-US",
      targetLocale: "de-DE",
      keywordGoals: ["arched mirror", "bedroom mirror", "floor mirror", "entryway mirror", "extra"],
      complianceCaveats: ["dimensions format", "safety wording", "material claims", "packaging marks", "extra"],
      localizationDepth: 62,
      pricingReady: true,
      liveTitle: "Arched Full Length Mirror with Black Frame",
    },
  },
};

const profiles = getProfiles();
let failed = false;
const results = [];

for (const [tool, fixture] of Object.entries(fixtures)) {
  const profile = profiles.get(tool);
  if (!profile) {
    console.error(`FAIL: missing profile for ${tool}`);
    failed = true;
    continue;
  }

  const payload = trimPayloadSize({
    tool,
    deterministic_result: compactDeterministicResult(baseResult),
    compact_context: slimContext(tool, fixture.context),
    output_rules: {
      language: "en-US",
      sections: ["Decision", "Act first", "Watch-outs"],
      body_limit: "Each body under 120 characters",
    },
  });

  const payloadChars = JSON.stringify(payload).length;
  const requestedMaxTokens = Math.min(
    profile.hardCapTokens,
    profile.targetOutputTokens + maxCompletionSlackTokens,
  );

  if (payloadChars > maxPayloadCharacters) {
    console.error(`FAIL: ${tool} payload too large (${payloadChars})`);
    failed = true;
  }
  if (requestedMaxTokens > profile.hardCapTokens) {
    console.error(`FAIL: ${tool} requested max tokens exceeds hard cap`);
    failed = true;
  }
  if (requestedMaxTokens > profile.targetOutputTokens + maxCompletionSlackTokens) {
    console.error(`FAIL: ${tool} requested max tokens exceeds slack budget`);
    failed = true;
  }

  results.push({
    tool,
    payloadChars,
    requestedMaxTokens,
    compactContextKeys: Object.keys(payload.compact_context).length,
  });
}

if (failed) {
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      maxPayloadCharacters,
      maxRequestedTokens: Math.max(...results.map((item) => item.requestedMaxTokens)),
      maxObservedPayloadChars: Math.max(...results.map((item) => item.payloadChars)),
      tools: results,
    },
    null,
    2,
  ),
);
