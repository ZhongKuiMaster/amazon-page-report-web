#!/usr/bin/env node

const baseUrl = process.env.TOOL_PAGE_BASE_URL || "http://127.0.0.1:3000";

function normalizeText(value) {
  return value
    .replace(/<!-- -->/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const cases = [
  {
    slug: "amazon-a-plus-content",
    checks: [
      "5 planned modules at 100% readiness",
      "Benefit angles</p><p class=\"mt-1 text-lg font-semibold\">4",
      "First build step</p><p class=\"mt-1 text-lg font-semibold\">Lock the module order around the strongest benefits first.",
    ],
  },
  {
    slug: "amazon-enhanced-brand-content",
    checks: [
      "5 planned modules at 100% readiness",
      "Benefit angles</p><p class=\"mt-1 text-lg font-semibold\">4",
      "First build step</p><p class=\"mt-1 text-lg font-semibold\">Lock the module order around the strongest benefits first.",
    ],
  },
  {
    slug: "amazon-product-photography",
    checks: [
      "7 planned shots at 100% production readiness",
      "Shot count</p><p class=\"mt-1 text-lg font-semibold\">7",
      "First shoot step</p><p class=\"mt-1 text-lg font-semibold\">Lock the shot order before styling details.",
    ],
  },
  {
    slug: "amazon-storefront-design",
    checks: [
      "4 collections mapped at 92% storefront readiness",
      "Catalog</p><p class=\"mt-1 text-lg font-semibold\">18",
      "First store step</p><p class=\"mt-1 text-lg font-semibold\">Set up a test path before large storefront changes.",
    ],
  },
  {
    slug: "amazon-suspension-appeal",
    checks: [
      "90% POA readiness for a 66% severity case",
      "Root causes</p><p class=\"mt-1 text-lg font-semibold\">2",
      "First repair step</p><p class=\"mt-1 text-lg font-semibold\">Lock root causes and evidence before rewriting the packet.",
    ],
  },
  {
    slug: "amazon-subscribe-save",
    checks: [
      "100% Subscribe and Save readiness at 18% repeat rate",
      "Repeat interval</p><p class=\"mt-1 text-lg font-semibold\">30d",
      "First retention step</p><p class=\"mt-1 text-lg font-semibold\">Validate replenishment cadence first.",
    ],
  },
  {
    slug: "amazon-private-label",
    checks: [
      "100% private-label launch readiness",
      "Demand</p><p class=\"mt-1 text-lg font-semibold\">72%",
      "First launch step</p><p class=\"mt-1 text-lg font-semibold\">Lock differentiation before scale assumptions.",
    ],
  },
  {
    slug: "amazon-wholesale-sourcing",
    checks: [
      "100% wholesale deal readiness across 5 suppliers",
      "Supplier pool</p><p class=\"mt-1 text-lg font-semibold\">5",
      "First deal step</p><p class=\"mt-1 text-lg font-semibold\">Confirm authorized supply first.",
    ],
  },
  {
    slug: "amazon-brand-tailored-promotions",
    checks: [
      "3 audience segments mapped at 100% promo readiness",
      "Segments</p><p class=\"mt-1 text-lg font-semibold\">3",
      "First promo step</p><p class=\"mt-1 text-lg font-semibold\">Define segments before offers.",
    ],
  },
  {
    slug: "amazon-backend-keywords",
    checks: [
      "15 backend terms packed into 121/249 bytes",
      "Used bytes</p><p class=\"mt-1 text-lg font-semibold\">121/249",
      "First backend step</p><p class=\"mt-1 text-lg font-semibold\">Add more commercially relevant modifiers before finalizing the field.",
    ],
  },
  {
    slug: "amazon-listing-images",
    checks: [
      "5 images mapped at 84% brief readiness",
      "Existing images</p><p class=\"mt-1 text-lg font-semibold\">5",
      "First image step</p><p class=\"mt-1 text-lg font-semibold\">Expand the image stack before fine-tuning sequence.",
    ],
  },
  {
    slug: "amazon-return-reduction",
    checks: [
      "4 return-cause clusters found with 5 complaint themes",
      "Packaging signals</p><p class=\"mt-1 text-lg font-semibold\">8",
      "First return step</p><p class=\"mt-1 text-lg font-semibold\">Strengthen packaging protection and transit testing first.",
    ],
  },
  {
    slug: "amazon-coupon-strategy",
    checks: [
      "8% coupon plan at 10% post-coupon margin",
      "Coupon depth</p><p class=\"mt-1 text-lg font-semibold\">8%",
      "First coupon step</p><p class=\"mt-1 text-lg font-semibold\">Protect post-coupon margin before increasing depth.",
    ],
  },
  {
    slug: "amazon-deal-finder",
    checks: [
      "Coupon is the best-fit promo format",
      "Recommended format</p><p class=\"mt-1 text-lg font-semibold\">Coupon",
      "First deal action</p><p class=\"mt-1 text-lg font-semibold\">Lock promo type and window together.",
    ],
  },
];

async function main() {
  const results = [];

  for (const item of cases) {
    const response = await fetch(`${baseUrl}/amazon/${item.slug}`, {
      headers: { Accept: "text/html" },
    });
    if (!response.ok) {
      throw new Error(`${item.slug} returned ${response.status}`);
    }

    const text = normalizeText(await response.text());
    const missing = item.checks.filter((check) => !text.includes(normalizeText(check)));

    if (missing.length) {
      throw new Error(`${item.slug} is missing deterministic markers: ${missing.join(", ")}`);
    }

    results.push({
      slug: item.slug,
      status: "ok",
      checks: item.checks.length,
    });
  }

  process.stdout.write(`${JSON.stringify({ baseUrl, results }, null, 2)}\n`);
}

main().catch((error) => {
  console.error(`FAIL: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
