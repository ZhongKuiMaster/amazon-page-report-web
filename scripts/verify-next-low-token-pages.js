#!/usr/bin/env node

const baseUrl = process.env.TOOL_PAGE_BASE_URL || "http://127.0.0.1:3000";

function normalizeText(value) {
  return value
    .replace(/<!-- -->/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const pages = [
  {
    slug: "amazon-a-plus-content",
    checks: [
      "Current result",
      "Planned A+ modules",
      "First build step</p><p class=\"mt-1 text-lg font-semibold\">Lock the module order around the strongest benefits first.",
      "Protected assist",
    ],
  },
  {
    slug: "amazon-enhanced-brand-content",
    checks: [
      "Current result",
      "Planned A+ modules",
      "First build step</p><p class=\"mt-1 text-lg font-semibold\">Lock the module order around the strongest benefits first.",
      "Protected assist",
    ],
  },
  {
    slug: "amazon-suspension-appeal",
    checks: [
      "Current result",
      "POA structure",
      "First repair step</p><p class=\"mt-1 text-lg font-semibold\">Lock root causes and evidence before rewriting the packet.",
      "Protected assist",
    ],
  },
  {
    slug: "amazon-product-photography",
    checks: [
      "Current result",
      "Shot list",
      "First shoot step</p><p class=\"mt-1 text-lg font-semibold\">Lock the shot order before styling details.",
      "Protected assist",
    ],
  },
  {
    slug: "amazon-storefront-design",
    checks: [
      "Current result",
      "Store structure",
      "First store step</p><p class=\"mt-1 text-lg font-semibold\">Set up a test path before large storefront changes.",
      "Protected assist",
    ],
  },
  {
    slug: "amazon-subscribe-save",
    checks: [
      "Current result",
      "Enrollment ladder",
      "First retention step</p><p class=\"mt-1 text-lg font-semibold\">Validate replenishment cadence first.",
    ],
  },
  {
    slug: "amazon-private-label",
    checks: [
      "Current result",
      "Launch sequence",
      "First launch step</p><p class=\"mt-1 text-lg font-semibold\">Lock differentiation before scale assumptions.",
    ],
  },
  {
    slug: "amazon-wholesale-sourcing",
    checks: [
      "Current result",
      "Deal screen",
      "First deal step</p><p class=\"mt-1 text-lg font-semibold\">Confirm authorized supply first.",
    ],
  },
  {
    slug: "amazon-brand-tailored-promotions",
    checks: [
      "Current result",
      "Segment offer plan",
      "First promo step</p><p class=\"mt-1 text-lg font-semibold\">Define segments before offers.",
    ],
  },
  {
    slug: "amazon-backend-keywords",
    checks: [
      "Current result",
      "Packed backend string",
      "First backend step</p><p class=\"mt-1 text-lg font-semibold\">Add more commercially relevant modifiers before finalizing the field.",
    ],
  },
  {
    slug: "amazon-listing-images",
    checks: [
      "Current result",
      "Image sequence brief",
      "First image step</p><p class=\"mt-1 text-lg font-semibold\">Expand the image stack before fine-tuning sequence.",
    ],
  },
  {
    slug: "amazon-return-reduction",
    checks: [
      "Current result",
      "Return-cause clusters",
      "First return step</p><p class=\"mt-1 text-lg font-semibold\">Strengthen packaging protection and transit testing first.",
    ],
  },
  {
    slug: "amazon-coupon-strategy",
    checks: [
      "Current result",
      "First coupon step</p><p class=\"mt-1 text-lg font-semibold\">Protect post-coupon margin before increasing depth.",
    ],
  },
  {
    slug: "amazon-deal-finder",
    checks: [
      "Current result",
      "Promo format comparison",
      "First deal action</p><p class=\"mt-1 text-lg font-semibold\">Lock promo type and window together.",
    ],
  },
];

async function main() {
  const results = [];

  for (const page of pages) {
    const response = await fetch(`${baseUrl}/amazon/${page.slug}`, {
      headers: { Accept: "text/html" },
    });

    if (!response.ok) {
      throw new Error(`${page.slug} returned ${response.status}`);
    }

    const text = normalizeText(await response.text());
    const missing = page.checks.filter((check) => !text.includes(normalizeText(check)));

    if (missing.length) {
      throw new Error(`${page.slug} is missing expected markers: ${missing.join(", ")}`);
    }

    results.push({
      slug: page.slug,
      status: "ok",
      checks: page.checks.length,
    });
  }

  process.stdout.write(`${JSON.stringify({ baseUrl, pages: results }, null, 2)}\n`);
}

main().catch((error) => {
  console.error(`FAIL: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
