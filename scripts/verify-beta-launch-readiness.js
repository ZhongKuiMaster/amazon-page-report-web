#!/usr/bin/env node

const baseUrl = process.env.TOOL_PAGE_BASE_URL || "http://127.0.0.1:3000";

const featuredToolSlugs = [
  "amazon-fba-calculator",
  "tariff-calculator-amazon",
  "amazon-shipping-calculator",
  "amazon-profit-analyzer",
  "amazon-sales-estimator",
  "amazon-price-tracker",
  "amazon-product-compliance",
  "amazon-image-compliance-checker",
  "amazon-category-ungating",
  "amazon-listing-optimization",
  "amazon-competitor-monitoring",
  "amazon-keyword-tracker",
];

const imageToolSlugs = [
  "amazon-image-compliance-checker",
  "amazon-a-plus-content",
  "amazon-enhanced-brand-content",
  "amazon-listing-images",
  "amazon-storefront-design",
];

const firstWaveFeaturedOrder = [
  "amazon-profit-analyzer",
  "amazon-fba-calculator",
  "tariff-calculator-amazon",
  "amazon-product-compliance",
  "amazon-image-compliance-checker",
  "amazon-category-ungating",
  "amazon-price-tracker",
  "amazon-listing-optimization",
];

const deferredFeaturedOrder = [
  "amazon-competitor-monitoring",
  "amazon-keyword-tracker",
  "amazon-sales-estimator",
  "amazon-shipping-calculator",
];

const featuredDefaultStateChecks = [
  {
    path: "/amazon/amazon-fba-calculator",
    forbidden: [
      "Selling price",
      "Product cost",
      "Inbound shipping per unit",
      "Storage months",
    ],
  },
  {
    path: "/amazon/amazon-price-tracker",
    forbidden: [
      "Response objective",
      "Market posture",
      "Decision urgency",
      "Alert delta",
    ],
  },
  {
    path: "/amazon/amazon-sales-estimator",
    forbidden: ["Decision use", "Confidence need"],
  },
  {
    path: "/amazon/amazon-category-ungating",
    forbidden: ["Supply path", "Packet stage", "Brand relationship"],
  },
  {
    path: "/amazon/amazon-competitor-monitoring",
    forbidden: ["Watch objective"],
  },
  {
    path: "/amazon/amazon-keyword-tracker",
    forbidden: ["Watch objective", "Response mode", "Execution window"],
  },
  {
    path: "/amazon/amazon-product-compliance",
    forbidden: ["Material profile", "Claims profile", "Evidence on hand", "现有资料"],
  },
];

const demoLeakageChecks = [
  {
    path: "/amazon/amazon-profit-analyzer",
    forbidden: [
      "B0GYRT3FNL",
      "B0G6K4VXK7",
      "B0FX2PRMFR",
      "B0CLNLL9RZ",
      "ABS plastic with lithium battery",
      "Wireless and rechargeable",
    ],
  },
  {
    path: "/amazon/amazon-fba-calculator",
    forbidden: [
      "B0GYRT3FNL",
      "ABS plastic with lithium battery",
      "Wireless and rechargeable",
    ],
  },
  {
    path: "/amazon/amazon-price-tracker",
    forbidden: [
      "B0GYRT3FNL",
      "B0G6K4VXK7",
      "B0FX2PRMFR",
      "B0CLNLL9RZ",
    ],
  },
  {
    path: "/amazon/amazon-listing-optimization",
    forbidden: [
      "B0GYRT3FNL",
      "B0G6K4VXK7",
      "B0FX2PRMFR",
      "B0CLNLL9RZ",
      "home__root-home-kitchen-tth",
    ],
  },
];

function normalizeHtml(value) {
  return value.replace(/<!-- -->/g, "").replace(/\s+/g, " ").trim();
}

function normalizeText(value) {
  return normalizeHtml(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSection(normalizedHtml, startMarker, endMarker) {
  const startIndex = normalizedHtml.indexOf(startMarker);
  if (startIndex === -1) {
    throw new Error(`missing section start marker: ${startMarker}`);
  }

  const endIndex = endMarker
    ? normalizedHtml.indexOf(endMarker, startIndex + startMarker.length)
    : -1;

  return endIndex === -1
    ? normalizedHtml.slice(startIndex)
    : normalizedHtml.slice(startIndex, endIndex);
}

async function fetchPage(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { Accept: "text/html" },
  });

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }

  const html = await response.text();
  return {
    html,
    normalizedHtml: normalizeHtml(html),
    normalizedText: normalizeText(html),
  };
}

async function verifyFeaturedPages() {
  const requiredMarkers = [
    "Current result",
    "Operator stance",
    "Review status",
    "First move",
    "Execution call",
    "Live tool",
  ];

  const results = [];

  for (const slug of featuredToolSlugs) {
    const page = await fetchPage(`/amazon/${slug}`);
    const missing = requiredMarkers.filter((marker) => !page.normalizedText.includes(marker));

    if (missing.length) {
      throw new Error(`/amazon/${slug} is missing markers: ${missing.join(", ")}`);
    }

    results.push({ slug, status: "ok", checks: requiredMarkers.length });
  }

  return results;
}

async function verifyImageStudioFlow() {
  const enButtonMarkers = ["Open image studio", "Create Amazon visuals"];
  const zhButtonMarkers = ["打开图片工作台", "创建 Amazon 视觉内容"];
  const results = [];

  for (const slug of imageToolSlugs) {
    const enPage = await fetchPage(`/amazon/${slug}`);
    const zhPage = await fetchPage(`/amazon/${slug}/zh`);

    if (!enPage.normalizedHtml.includes('href="/amazon/image-studio"')) {
      throw new Error(`/amazon/${slug} is missing the image studio link`);
    }
    if (!zhPage.normalizedHtml.includes('href="/amazon/image-studio/zh"')) {
      throw new Error(`/amazon/${slug}/zh is missing the localized image studio link`);
    }

    const missingEn = enButtonMarkers.filter((marker) => !enPage.normalizedText.includes(marker));
    const missingZh = zhButtonMarkers.filter((marker) => !zhPage.normalizedText.includes(marker));

    if (missingEn.length === enButtonMarkers.length) {
      throw new Error(`/amazon/${slug} is missing image studio CTA copy`);
    }
    if (missingZh.length === zhButtonMarkers.length) {
      throw new Error(`/amazon/${slug}/zh is missing localized image studio CTA copy`);
    }

    results.push({ slug, status: "ok", locales: ["en", "zh"] });
  }

  const studioPages = [
    {
      path: "/amazon/image-studio",
      markers: ["Create Amazon visuals", "Browse Amazon image tools", "next build step"],
    },
    {
      path: "/amazon/image-studio/zh",
      markers: ["创建 Amazon 视觉内容", "浏览 Amazon 图片工具", "下一阶段接入"],
    },
  ];

  for (const studioPage of studioPages) {
    const page = await fetchPage(studioPage.path);
    const missingStudioMarkers = studioPage.markers.filter(
      (marker) => !page.normalizedText.includes(marker),
    );
    if (missingStudioMarkers.length) {
      throw new Error(
        `${studioPage.path} is missing studio markers: ${missingStudioMarkers.join(", ")}`,
      );
    }
    results.push({ slug: studioPage.path, status: "ok", locales: ["self"] });
  }

  return results;
}

async function verifyFeaturedTierSplit() {
  const checks = [
    {
      path: "/amazon",
      markers: [
        "Featured tools",
        "Deferred featured",
        "Featured tools to promote later",
      ],
    },
    {
      path: "/amazon/zh",
      markers: [
        "主推工具",
        "延后主推",
        "后续推进的 featured 工具",
      ],
    },
  ];

  const results = [];

  for (const check of checks) {
    const page = await fetchPage(check.path);
    const missing = check.markers.filter((marker) => !page.normalizedText.includes(marker));

    if (missing.length) {
      throw new Error(`${check.path} is missing featured-tier markers: ${missing.join(", ")}`);
    }

    results.push({ path: check.path, status: "ok", checks: check.markers.length });
  }

  return results;
}

async function verifyFeaturedTierOrder() {
  const checks = [
    {
      path: "/amazon",
      firstWaveStart: "Featured tools</h2>",
      firstWaveEnd: "Deferred featured",
      deferredStart: "Deferred featured",
      deferredEnd: "More to explore",
      firstWaveMarkers: firstWaveFeaturedOrder.map((slug) => `href="/amazon/${slug}"`),
      deferredMarkers: deferredFeaturedOrder.map((slug) => `href="/amazon/${slug}"`),
    },
    {
      path: "/amazon/zh",
      firstWaveStart: "主推工具</h2>",
      firstWaveEnd: "延后主推",
      deferredStart: "延后主推",
      deferredEnd: "更多推荐工具",
      firstWaveMarkers: firstWaveFeaturedOrder.map((slug) => `href="/amazon/${slug}/zh"`),
      deferredMarkers: deferredFeaturedOrder.map((slug) => `href="/amazon/${slug}/zh"`),
    },
  ];

  const results = [];

  for (const check of checks) {
    const page = await fetchPage(check.path);
    const firstWaveSection = extractSection(
      page.normalizedHtml,
      check.firstWaveStart,
      check.firstWaveEnd,
    );
    const deferredSection = extractSection(
      page.normalizedHtml,
      check.deferredStart,
      check.deferredEnd,
    );
    const firstWaveIndexes = check.firstWaveMarkers.map((marker) =>
      firstWaveSection.indexOf(marker),
    );
    const deferredIndexes = check.deferredMarkers.map((marker) =>
      deferredSection.indexOf(marker),
    );

    if (firstWaveIndexes.some((index) => index === -1)) {
      throw new Error(`${check.path} is missing one or more first-wave featured links`);
    }
    if (deferredIndexes.some((index) => index === -1)) {
      throw new Error(`${check.path} is missing one or more deferred featured links`);
    }

    for (let index = 1; index < firstWaveIndexes.length; index += 1) {
      if (firstWaveIndexes[index] <= firstWaveIndexes[index - 1]) {
        throw new Error(`${check.path} first-wave featured order drifted`);
      }
    }
    for (let index = 1; index < deferredIndexes.length; index += 1) {
      if (deferredIndexes[index] <= deferredIndexes[index - 1]) {
        throw new Error(`${check.path} deferred featured order drifted`);
      }
    }

    results.push({
      path: check.path,
      status: "ok",
      firstWaveChecks: check.firstWaveMarkers.length,
      deferredChecks: check.deferredMarkers.length,
    });
  }

  return results;
}

async function verifyFeaturedDefaultState() {
  const results = [];

  for (const check of featuredDefaultStateChecks) {
    const page = await fetchPage(check.path);
    const leaked = check.forbidden.filter((marker) => page.normalizedText.includes(marker));

    if (leaked.length) {
      throw new Error(`${check.path} leaked default-state markers: ${leaked.join(", ")}`);
    }

    results.push({
      path: check.path,
      status: "ok",
      forbiddenChecks: check.forbidden.length,
    });
  }

  return results;
}

async function verifyDemoLeakage() {
  const results = [];

  for (const check of demoLeakageChecks) {
    const page = await fetchPage(check.path);
    const leaked = check.forbidden.filter(
      (marker) =>
        page.normalizedText.includes(marker) || page.normalizedHtml.includes(marker),
    );

    if (leaked.length) {
      throw new Error(`${check.path} leaked demo markers: ${leaked.join(", ")}`);
    }

    results.push({
      path: check.path,
      status: "ok",
      forbiddenChecks: check.forbidden.length,
    });
  }

  return results;
}

async function main() {
  const featured = await verifyFeaturedPages();
  const featuredTierSplit = await verifyFeaturedTierSplit();
  const featuredTierOrder = await verifyFeaturedTierOrder();
  const featuredDefaultState = await verifyFeaturedDefaultState();
  const demoLeakage = await verifyDemoLeakage();
  const imageStudio = await verifyImageStudioFlow();

  process.stdout.write(
    `${JSON.stringify(
      {
        baseUrl,
        featured,
        featuredTierSplit,
        featuredTierOrder,
        featuredDefaultState,
        demoLeakage,
        imageStudio,
        status: "ok",
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
