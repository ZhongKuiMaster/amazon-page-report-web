#!/usr/bin/env node

const baseUrl = (process.env.TOOL_PAGE_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://dealingnow.com").replace(
  /\/$/,
  "",
);

const removedToolSlugs = [
  "amazon-repricing-strategy",
  "amazon-brand-registry",
  "amazon-variation-relationship-checker",
  "amazon-global-selling",
  "amazon-private-label",
  "amazon-wholesale-sourcing",
  "amazon-suspension-appeal",
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

async function fetchPage(path, expectedStatus = 200) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { Accept: "text/html,application/xhtml+xml" },
  });

  if (response.status !== expectedStatus) {
    throw new Error(`${path} returned ${response.status}, expected ${expectedStatus}`);
  }

  const html = await response.text();
  return {
    status: response.status,
    html,
    normalizedHtml: normalizeHtml(html),
    normalizedText: normalizeText(html),
  };
}

async function fetchText(path, expectedStatus = 200) {
  const response = await fetch(`${baseUrl}${path}`);
  if (response.status !== expectedStatus) {
    throw new Error(`${path} returned ${response.status}, expected ${expectedStatus}`);
  }
  return response.text();
}

function assertIncludes(haystack, items, label) {
  const missing = items.filter((item) => !haystack.includes(item));
  if (missing.length) {
    throw new Error(`${label} is missing markers: ${missing.join(", ")}`);
  }
}

async function verifyCorePages() {
  const checks = [
    {
      path: "/",
      markers: ["Commerce Tool System", "Amazon", "TikTok Shop", "Shopify"],
    },
    {
      path: "/zh",
      markers: ["电商工具系统", "Amazon", "TikTok Shop", "Shopify"],
    },
    {
      path: "/amazon",
      markers: ["Tool directory", "Amazon", "Amazon FBA Calculator", "Amazon Product Compliance Checker"],
    },
    {
      path: "/amazon/zh",
      markers: ["工具列表", "Amazon", "亚马逊 FBA 费用计算器", "亚马逊产品合规检查器"],
    },
  ];

  const results = [];
  for (const check of checks) {
    const page = await fetchPage(check.path);
    assertIncludes(page.normalizedText, check.markers, check.path);
    results.push({ path: check.path, status: "ok" });
  }
  return results;
}

async function verifySpotTools() {
  const checks = [
    { path: "/amazon/amazon-profit-analyzer", locale: "en" },
    { path: "/amazon/amazon-profit-analyzer/zh", locale: "zh" },
    { path: "/amazon/amazon-product-compliance", locale: "en" },
    { path: "/amazon/amazon-product-compliance/zh", locale: "zh" },
    { path: "/amazon/amazon-image-compliance-checker", locale: "en" },
    { path: "/amazon/amazon-image-compliance-checker/zh", locale: "zh" },
    { path: "/amazon/amazon-rank-tracker", locale: "en" },
    { path: "/amazon/amazon-rank-tracker/zh", locale: "zh" },
    { path: "/amazon/amazon-a-plus-content", locale: "en" },
    { path: "/amazon/amazon-a-plus-content/zh", locale: "zh" },
  ];

  const results = [];

  for (const check of checks) {
    const page = await fetchPage(check.path);
    const required = check.locale === "zh"
      ? ["如何使用", "输入 → 确认 → 结果", "结果输出区"]
      : ["How to use", "Input → Confirm → Result", "Result output"];
    assertIncludes(page.normalizedText, required, check.path);
    results.push({ path: check.path, status: "ok" });
  }

  return results;
}

async function verifyImageStudioRoutes() {
  const checks = [
    { path: "/amazon/amazon-image-compliance-checker", href: 'href="/amazon/image-studio"' },
    { path: "/amazon/amazon-image-compliance-checker/zh", href: 'href="/amazon/image-studio/zh"' },
    { path: "/amazon/amazon-storefront-design", href: 'href="/amazon/image-studio"' },
    { path: "/amazon/amazon-storefront-design/zh", href: 'href="/amazon/image-studio/zh"' },
    {
      path: "/amazon/image-studio",
      markers: ["Create Amazon visuals", "Browse Amazon image tools", "next build step"],
    },
    {
      path: "/amazon/image-studio/zh",
      markers: ["创建 Amazon 视觉内容", "浏览 Amazon 图片工具", "下一阶段接入"],
    },
  ];

  const results = [];
  for (const check of checks) {
    const page = await fetchPage(check.path);
    if (check.href && !page.normalizedHtml.includes(check.href)) {
      throw new Error(`${check.path} is missing required href ${check.href}`);
    }
    if (check.markers) {
      assertIncludes(page.normalizedText, check.markers, check.path);
    }
    results.push({ path: check.path, status: "ok" });
  }
  return results;
}

async function verifyRemovedTools() {
  const results = [];

  const platformPages = [
    await fetchPage("/amazon"),
    await fetchPage("/amazon/zh"),
  ];

  for (const slug of removedToolSlugs) {
    for (const page of platformPages) {
      if (page.normalizedText.includes(slug)) {
        throw new Error(`removed tool ${slug} leaked onto platform page`);
      }
    }

    await fetchPage(`/tools/${slug}`, 404);
    await fetchPage(`/amazon/${slug}`, 404);
    await fetchPage(`/amazon/${slug}/zh`, 404);
    results.push({ slug, status: "ok" });
  }

  return results;
}

async function verifySeoEndpoints() {
  const robots = await fetchText("/robots.txt");
  const sitemap = await fetchText("/sitemap.xml");
  const amazonPage = await fetchPage("/amazon");
  const tiktokPage = await fetchPage("/tiktok-shop");
  const shopifyPage = await fetchPage("/shopify");

  assertIncludes(robots, ["User-Agent", "Sitemap:"], "/robots.txt");
  assertIncludes(
    sitemap,
    [
      `${siteUrl}/amazon`,
      `${siteUrl}/amazon/amazon-fba-calculator`,
      `${siteUrl}/amazon/image-studio`,
      `${siteUrl}/privacy`,
    ],
    "/sitemap.xml",
  );
  const excludedFromSitemap = [
    `${siteUrl}/tiktok-shop`,
    `${siteUrl}/shopify`,
    `${siteUrl}/tiktok-shop/tiktok-shop-seller-intake`,
    `${siteUrl}/shopify/shopify-product-page-audit`,
  ];
  const leaked = excludedFromSitemap.filter((url) => sitemap.includes(url));
  if (leaked.length) {
    throw new Error(`/sitemap.xml should not expose non-Amazon SEO targets: ${leaked.join(", ")}`);
  }
  assertIncludes(
    amazonPage.normalizedHtml,
    [
      `<link rel="canonical" href="${siteUrl}/amazon"`,
      'hrefLang="en"',
      'hrefLang="zh"',
    ],
    "/amazon metadata",
  );
  assertIncludes(
    tiktokPage.normalizedHtml,
    ['<meta name="robots" content="noindex, follow"'],
    "/tiktok-shop metadata",
  );
  assertIncludes(
    shopifyPage.normalizedHtml,
    ['<meta name="robots" content="noindex, follow"'],
    "/shopify metadata",
  );

  return [
    { path: "/robots.txt", status: "ok" },
    { path: "/sitemap.xml", status: "ok" },
    { path: "/amazon", status: "ok" },
    { path: "/tiktok-shop", status: "ok" },
    { path: "/shopify", status: "ok" },
  ];
}

async function main() {
  const corePages = await verifyCorePages();
  const spotTools = await verifySpotTools();
  const imageStudio = await verifyImageStudioRoutes();
  const removed = await verifyRemovedTools();
  const seo = await verifySeoEndpoints();

  process.stdout.write(
    `${JSON.stringify(
      {
        baseUrl,
        siteUrl,
        corePages,
        spotTools,
        imageStudio,
        removed,
        seo,
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
