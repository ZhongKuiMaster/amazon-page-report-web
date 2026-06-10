import { allTools, getToolBySlug, type ToolDefinition } from "@/lib/tools";

export const visibleToolSlugs = [
  "amazon-fba-calculator",
  "tariff-calculator-amazon",
  "amazon-shipping-calculator",
  "amazon-profit-analyzer",
  "amazon-rank-tracker",
  "amazon-competitor-analysis",
  "amazon-product-compliance",
  "amazon-listing-title-checker",
  "tiktok-shop-product-research",
  "tiktok-shop-short-video-brief",
  "shopify-product-page-audit",
  "shopify-review-mining",
  "shopify-competitor-teardown",
  "shopify-offer-positioning",
  "shopify-email-flow-planner",
] as const;

const platformToolMatrix: Partial<
  Record<ToolDefinition["platform"], { featured: readonly string[]; secondary: readonly string[] }>
> = {
  amazon: {
    featured: [
      "amazon-fba-calculator",
      "tariff-calculator-amazon",
      "amazon-shipping-calculator",
      "amazon-profit-analyzer",
      "amazon-product-compliance",
      "amazon-listing-title-checker",
    ],
    secondary: [
      "amazon-rank-tracker",
      "amazon-competitor-analysis",
    ],
  },
  "tiktok-shop": {
    featured: [
      "tiktok-shop-product-research",
      "tiktok-shop-short-video-brief",
    ],
    secondary: [],
  },
  shopify: {
    featured: [
      "shopify-product-page-audit",
      "shopify-review-mining",
      "shopify-competitor-teardown",
      "shopify-offer-positioning",
      "shopify-email-flow-planner",
    ],
    secondary: [],
  },
} as const;

const amazonPlatformToolMatrix = platformToolMatrix["amazon"] as {
  featured: readonly string[];
  secondary: readonly string[];
};

export const betaFeaturedToolSlugs = amazonPlatformToolMatrix.featured;
export const betaSecondaryToolSlugs = amazonPlatformToolMatrix.secondary;
export const betaFirstWaveFeaturedToolSlugs = [
  "amazon-profit-analyzer",
  "amazon-fba-calculator",
  "tariff-calculator-amazon",
  "amazon-shipping-calculator",
  "amazon-product-compliance",
  "amazon-listing-title-checker",
  "amazon-rank-tracker",
  "amazon-competitor-analysis",
] as const;
export const betaDeferredFeaturedToolSlugs = [] as const;
export const betaSeoSupportToolSlugs = visibleToolSlugs.filter(
  (slug) =>
    !betaFeaturedToolSlugs.includes(
      slug as (typeof betaFeaturedToolSlugs)[number],
    ) &&
    !betaSecondaryToolSlugs.includes(
      slug as (typeof betaSecondaryToolSlugs)[number],
    ),
);

export const imageStudioToolSlugs = new Set<string>([
  "amazon-a-plus-content",
  "amazon-enhanced-brand-content",
  "amazon-listing-images",
  "amazon-storefront-design",
  "amazon-image-compliance-checker",
]);

const visibleToolSlugSet = new Set<string>(visibleToolSlugs);

function resolveVisibleTools(slugs: readonly string[]) {
  return slugs
    .filter((slug) => visibleToolSlugSet.has(slug))
    .map((slug) => getToolBySlug(slug))
    .filter((tool): tool is ToolDefinition => Boolean(tool));
}

export type CommercialToolLane = "core" | "control" | "risk" | "support";
export type HomepagePriority = "hero" | "high" | "normal";
export type ToolPageRole = "primary-decision" | "workflow-anchor" | "specialized-entry";

export type CommercialToolMatrix = {
  core: ToolDefinition[];
  control: ToolDefinition[];
  risk: ToolDefinition[];
  support: ToolDefinition[];
  anchors: ToolDefinition[];
};

const commercialLaneWeight: Record<CommercialToolLane, number> = {
  core: 40,
  control: 28,
  risk: 20,
  support: 12,
};

const homepagePriorityWeight: Record<HomepagePriority, number> = {
  hero: 24,
  high: 14,
  normal: 0,
};

const toolPageRoleWeight: Record<ToolPageRole, number> = {
  "primary-decision": 16,
  "workflow-anchor": 10,
  "specialized-entry": 0,
};

const commercialToolSlugMatrix: Partial<
  Record<
    ToolDefinition["platform"],
    {
      lanes: Record<CommercialToolLane, readonly string[]>;
      anchors: readonly string[];
    }
  >
> = {
  amazon: {
    lanes: {
      core: [
        "amazon-profit-analyzer",
        "amazon-fba-calculator",
        "tariff-calculator-amazon",
        "amazon-shipping-calculator",
        "amazon-sales-estimator",
      ],
      control: [
        "amazon-price-tracker",
        "amazon-buy-box",
        "amazon-competitor-monitoring",
        "amazon-keyword-tracker",
        "amazon-listing-optimization",
      ],
      risk: [
        "amazon-product-compliance",
        "amazon-image-compliance-checker",
        "amazon-listing-title-checker",
        "amazon-category-ungating",
        "amazon-browse-search-keyword-checker",
      ],
      support: [
        "amazon-rank-tracker",
        "amazon-competitor-analysis",
        "amazon-review-analyzer",
      ],
    },
    anchors: [
      "amazon-profit-analyzer",
      "amazon-product-compliance",
      "amazon-listing-optimization",
      "amazon-price-tracker",
    ],
  },
  "tiktok-shop": {
    lanes: {
      core: [
        "tiktok-shop-seller-intake",
        "tiktok-shop-product-research",
        "tiktok-shop-hook-writing",
        "tiktok-shop-short-video-brief",
      ],
      control: [
        "tiktok-shop-product-performance",
        "tiktok-shop-kill-rules",
      ],
      risk: [
        "tiktok-shop-creator-research",
        "tiktok-shop-content-strategy",
      ],
      support: [],
    },
    anchors: [
      "tiktok-shop-seller-intake",
      "tiktok-shop-product-research",
    ],
  },
  shopify: {
    lanes: {
      core: [
        "shopify-product-page-audit",
        "shopify-competitor-teardown",
        "shopify-offer-positioning",
        "shopify-email-flow-planner",
        "shopify-landing-page-angle-builder",
      ],
      control: [
        "shopify-pricing-test-planner",
        "shopify-pdp-copy-assembler",
        "shopify-post-purchase-flow-planner",
        "shopify-launch-readiness-scorecard",
      ],
      risk: [
        "shopify-returns-friction-audit",
        "shopify-faq-objection-builder",
        "shopify-channel-landing-router",
      ],
      support: [
        "shopify-reorder-reminder-planner",
        "shopify-promo-calendar-planner",
        "shopify-merchandising-priority-mapper",
      ],
    },
    anchors: [
      "shopify-product-page-audit",
      "shopify-pricing-test-planner",
      "shopify-launch-readiness-scorecard",
    ],
  },
} as const;

const homepagePriorityMap: Partial<
  Record<ToolDefinition["platform"], Record<HomepagePriority, readonly string[]>>
> = {
  amazon: {
    hero: [
      "amazon-profit-analyzer",
      "amazon-fba-calculator",
      "amazon-product-compliance",
    ],
    high: [
      "tariff-calculator-amazon",
      "amazon-price-tracker",
      "amazon-listing-optimization",
    ],
    normal: [],
  },
  "tiktok-shop": {
    hero: ["tiktok-shop-seller-intake", "tiktok-shop-product-research"],
    high: ["tiktok-shop-hook-writing", "tiktok-shop-short-video-brief"],
    normal: [],
  },
  shopify: {
    hero: ["shopify-product-page-audit", "shopify-pricing-test-planner"],
    high: ["shopify-offer-positioning", "shopify-launch-readiness-scorecard"],
    normal: ["shopify-competitor-teardown", "shopify-email-flow-planner"],
  },
} as const;

const primaryDecisionToolSlugs = new Set<string>([
  "amazon-profit-analyzer",
  "amazon-fba-calculator",
  "tariff-calculator-amazon",
  "amazon-product-compliance",
  "amazon-sales-estimator",
  "tiktok-shop-seller-intake",
  "tiktok-shop-product-research",
  "shopify-product-page-audit",
  "shopify-competitor-teardown",
  "shopify-pricing-test-planner",
  "shopify-launch-readiness-scorecard",
]);

const workflowAnchorToolSlugs = new Set<string>([
  "amazon-listing-optimization",
  "amazon-price-tracker",
  "amazon-buy-box",
  "amazon-keyword-tracker",
  "amazon-competitor-monitoring",
  "tiktok-shop-hook-writing",
  "tiktok-shop-short-video-brief",
  "shopify-offer-positioning",
  "shopify-pdp-copy-assembler",
  "shopify-post-purchase-flow-planner",
]);

export function isVisibleToolSlug(slug: string) {
  return visibleToolSlugSet.has(slug);
}

export function getVisibleTools() {
  return allTools.filter((tool) => visibleToolSlugSet.has(tool.slug));
}

export function getVisibleToolBySlug(slug: string): ToolDefinition | undefined {
  if (!visibleToolSlugSet.has(slug)) {
    return undefined;
  }

  return getToolBySlug(slug);
}

export function filterVisibleToolSlugs(slugs: string[]) {
  return slugs.filter((slug) => visibleToolSlugSet.has(slug));
}

export function getPlatformToolMatrix(platform: ToolDefinition["platform"]) {
  const config = platformToolMatrix[platform];
  if (!config) {
    return {
      featured: [],
      secondary: [],
      seoSupport: getVisibleTools().filter((tool) => tool.platform === platform),
    };
  }

  const featured = resolveVisibleTools(config.featured);
  const secondary = resolveVisibleTools(config.secondary);
  const featuredSet = new Set<string>(config.featured);
  const secondarySet = new Set<string>(config.secondary);
  const seoSupport = getVisibleTools().filter(
    (tool) =>
      tool.platform === platform &&
      !featuredSet.has(tool.slug) &&
      !secondarySet.has(tool.slug),
  );

  return { featured, secondary, seoSupport };
}

export function getCommercialToolMatrix(
  platform: ToolDefinition["platform"],
): CommercialToolMatrix {
  const config = commercialToolSlugMatrix[platform];
  if (!config) {
    return {
      core: [],
      control: [],
      risk: [],
      support: [],
      anchors: [],
    };
  }

  return {
    core: resolveVisibleTools(config.lanes.core),
    control: resolveVisibleTools(config.lanes.control),
    risk: resolveVisibleTools(config.lanes.risk),
    support: resolveVisibleTools(config.lanes.support),
    anchors: resolveVisibleTools(config.anchors),
  };
}

export function getCommercialLane(
  tool: ToolDefinition,
): CommercialToolLane | undefined {
  const config = commercialToolSlugMatrix[tool.platform];
  if (!config) {
    return undefined;
  }

  if (config.lanes.core.includes(tool.slug)) {
    return "core";
  }

  if (config.lanes.control.includes(tool.slug)) {
    return "control";
  }

  if (config.lanes.risk.includes(tool.slug)) {
    return "risk";
  }

  if (config.lanes.support.includes(tool.slug)) {
    return "support";
  }

  return undefined;
}

export function getHomepagePriority(tool: ToolDefinition): HomepagePriority {
  const config = homepagePriorityMap[tool.platform];
  if (!config) {
    return "normal";
  }

  if (config.hero.includes(tool.slug)) {
    return "hero";
  }

  if (config.high.includes(tool.slug)) {
    return "high";
  }

  return "normal";
}

export function getToolPageRole(tool: ToolDefinition): ToolPageRole {
  if (primaryDecisionToolSlugs.has(tool.slug)) {
    return "primary-decision";
  }

  if (workflowAnchorToolSlugs.has(tool.slug)) {
    return "workflow-anchor";
  }

  return "specialized-entry";
}

export function getToolDistributionScore(tool: ToolDefinition) {
  const lane = getCommercialLane(tool);
  const homepagePriority = getHomepagePriority(tool);
  const pageRole = getToolPageRole(tool);

  return (
    (lane ? commercialLaneWeight[lane] : 0) +
    homepagePriorityWeight[homepagePriority] +
    toolPageRoleWeight[pageRole]
  );
}

export function sortToolsByDistributionPriority<T extends ToolDefinition>(tools: T[]) {
  return [...tools].sort((left, right) => {
    const scoreDelta = getToolDistributionScore(right) - getToolDistributionScore(left);
    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return left.name.localeCompare(right.name);
  });
}

export function getToolSitemapPriority(tool: ToolDefinition, locale: "en" | "zh") {
  const base = 0.5;
  const score = getToolDistributionScore(tool);
  const priority = Math.min(0.9, base + score / 100);

  return locale === "zh" ? priority - 0.1 : priority;
}
