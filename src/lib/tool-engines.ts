import { getCategoryRuleProfile, getStyleGuideEvidence } from "@/lib/amazon-style-guides";
import {
  getAPlusPolicyEvidence,
  getAdvertisingPolicyEvidence,
  getBrandRegistryPolicyEvidence,
  getBrandTailoredPromotionPolicyEvidence,
  getCompliancePolicyEvidence,
  getCouponStrategyPolicyEvidence,
  getDealFinderPolicyEvidence,
  getGlobalSellingPolicyEvidence,
  getInventoryPlannerPolicyEvidence,
  getInternationalListingsPolicyEvidence,
  getPrivateLabelPolicyEvidence,
  getProductBundlingPolicyEvidence,
  getReviewStrategyPolicyEvidence,
  getStorefrontPolicyEvidence,
  getSubscribeSavePolicyEvidence,
  getSuspensionAppealPolicyEvidence,
  getUngatingPolicyEvidence,
  getVinePolicyEvidence,
  getWholesaleSourcingPolicyEvidence,
} from "@/lib/amazon-policy-rules";

export type ToolMetric = {
  label: string;
  value: string;
  detail?: string;
};

export type ToolStatusTone = "good" | "warning" | "critical";

export type ToolEvidence = {
  label: string;
  detail: string;
  source: string;
};

export type ToolEvaluation = {
  headline: string;
  summary: string;
  metrics: ToolMetric[];
  recommendations: string[];
  deliverable?: {
    title: string;
    body: string;
  };
  alerts?: string[];
  status: {
    label: string;
    tone: ToolStatusTone;
  };
  missingItems?: string[];
  riskItems?: string[];
  nextSteps?: string[];
  evidence?: ToolEvidence[];
  actionStance?: {
    label: string;
    tone: ToolStatusTone;
    detail: string;
  };
};

function getSelectedBucket(value: string) {
  return value.split("__")[0];
}

function normalizeCategoryBucket(value: string) {
  const bucket = getSelectedBucket(value);
  const mapping: Record<string, string> = {
    "arts-crafts": "home",
    automotive: "automotive",
    baby: "baby",
    beauty: "beauty",
    books: "books",
    electronics: "electronics",
    fashion: "apparel",
    garden: "home",
    general: "general",
    grocery: "grocery",
    health: "health",
    home: "home",
    industrial: "tools",
    jewelry: "jewelry",
    "musical-instruments": "home",
    office: "office",
    pet: "pet",
    software: "electronics",
    sports: "sports",
    tools: "tools",
    toys: "toys",
    "video-games": "electronics",
    watches: "watches",
  };

  return mapping[bucket] ?? bucket;
}

function normalizeTradeRegion(code: string) {
  if (["UK", "DE", "FR", "IT", "ES", "NL", "SE", "PL"].includes(code)) {
    return "EU";
  }

  return code;
}

function buildStatus(score: number, goodAt: number, warningAt: number, labels: {
  good: string;
  warning: string;
  critical: string;
}) {
  if (score >= goodAt) {
    return { label: labels.good, tone: "good" as const };
  }
  if (score >= warningAt) {
    return { label: labels.warning, tone: "warning" as const };
  }
  return { label: labels.critical, tone: "critical" as const };
}

function buildActionStance(score: number, thresholds: {
  goAt: number;
  cautionAt: number;
}, labels: {
  go: string;
  caution: string;
  stop: string;
}, details: {
  go: string;
  caution: string;
  stop: string;
}) {
  if (score >= thresholds.goAt) {
    return {
      label: labels.go,
      tone: "good" as const,
      detail: details.go,
    };
  }
  if (score >= thresholds.cautionAt) {
    return {
      label: labels.caution,
      tone: "warning" as const,
      detail: details.caution,
    };
  }
  return {
    label: labels.stop,
    tone: "critical" as const,
    detail: details.stop,
  };
}

const referralFeeRates: Record<string, number> = {
  apparel: 0.17,
  electronics: 0.08,
  beauty: 0.15,
  home: 0.15,
  toys: 0.15,
  kitchen: 0.15,
  books: 0.15,
  grocery: 0.08,
  automotive: 0.12,
  health: 0.15,
  office: 0.15,
  pet: 0.15,
  sports: 0.15,
  tools: 0.15,
  baby: 0.15,
  luggage: 0.15,
  shoes: 0.15,
  jewelry: 0.2,
  watches: 0.16,
  default: 0.15,
};

const routeDutyRates: Record<string, number> = {
  "CN-US-general": 0.12,
  "CN-US-electronics": 0.25,
  "CN-US-apparel": 0.18,
  "CN-US-home": 0.12,
  "CN-US-toys": 0.08,
  "CN-US-beauty": 0.1,
  "CN-EU-general": 0.06,
  "CN-EU-electronics": 0.08,
  "CN-EU-apparel": 0.12,
  "CN-EU-home": 0.06,
  "CN-EU-toys": 0.04,
  "CN-EU-beauty": 0.06,
  "CN-US-automotive": 0.1,
  "CN-US-grocery": 0.08,
  "CN-US-health": 0.1,
  "CN-US-medical": 0.11,
  "CN-US-shoes": 0.16,
  "CN-US-jewelry": 0.18,
  "CN-EU-automotive": 0.05,
  "CN-EU-grocery": 0.07,
  "CN-EU-health": 0.08,
  "CN-EU-medical": 0.09,
  "VN-US-general": 0.07,
  "IN-US-general": 0.09,
  "MX-US-general": 0.04,
  "TR-EU-general": 0.05,
  "US-EU-general": 0.03,
  "EU-US-general": 0.02,
};

const destinationVatRates: Record<string, number> = {
  US: 0,
  UK: 0.2,
  DE: 0.19,
  FR: 0.2,
  IT: 0.22,
  ES: 0.21,
  NL: 0.21,
  SE: 0.25,
  PL: 0.23,
  TR: 0.2,
  CA: 0.05,
  AU: 0.1,
  MX: 0.16,
  BR: 0.17,
  SG: 0.09,
  JP: 0.1,
  AE: 0.05,
  SA: 0.15,
  default: 0.2,
};

const monthlySalesCurve: Record<string, { base: number; exponent: number }> = {
  apparel: { base: 165000, exponent: 0.77 },
  automotive: { base: 95000, exponent: 0.73 },
  baby: { base: 125000, exponent: 0.75 },
  beauty: { base: 150000, exponent: 0.76 },
  books: { base: 65000, exponent: 0.68 },
  electronics: { base: 90000, exponent: 0.72 },
  grocery: { base: 175000, exponent: 0.81 },
  health: { base: 140000, exponent: 0.77 },
  home: { base: 155000, exponent: 0.79 },
  jewelry: { base: 70000, exponent: 0.71 },
  office: { base: 90000, exponent: 0.74 },
  pet: { base: 135000, exponent: 0.77 },
  sports: { base: 120000, exponent: 0.76 },
  tools: { base: 100000, exponent: 0.74 },
  toys: { base: 145000, exponent: 0.8 },
  watches: { base: 50000, exponent: 0.69 },
  default: { base: 105000, exponent: 0.75 },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function round(value: number, precision = 2) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function tokenizeWords(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter(Boolean);
}

function uniqueWords(words: string[]) {
  return Array.from(new Set(words));
}

function getRepeatedWords(words: string[]) {
  const counts = new Map<string, number>();

  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1]);
}

function toEvidence(category: string, limit = 3) {
  return getStyleGuideEvidence(category, limit).map((item) => ({
    label: item.label,
    detail: item.guidance,
    source: `${item.sourceFile} - ${item.section}`,
  }));
}

const keywordResearchEvidence: ToolEvidence[] = [
  {
    label: "Discoverability starts with relevance",
    detail:
      "Amazon frames discoverability around accurate customer-facing relevance signals, so recurring competitor wording is worth testing before buying more keyword data.",
    source: "Seller Help G10471 - Optimize your product discoverability",
  },
  {
    label: "Search terms should expand, not duplicate",
    detail:
      "Search term guidance is most useful when it extends coverage beyond visible copy instead of repeating the same wording across every field.",
    source: "Seller Help G23501 - Use search terms effectively",
  },
  {
    label: "Query performance should validate the shortlist",
    detail:
      "Search Query Performance is the downstream check for whether shortlisted terms actually generate clicks and orders after listing changes go live.",
    source: "Seller Help G8J4CB5ZBF3NX7TP - Search Query Performance dashboard",
  },
];

const rankTrackerEvidence: ToolEvidence[] = [
  {
    label: "BSR is only a baseline",
    detail:
      "Discoverability guidance makes clear that rank health depends on listing quality and relevance, not only on a single leaderboard number.",
    source: "Seller Help G10471 - Optimize your product discoverability",
  },
  {
    label: "Use search query dashboards for validation",
    detail:
      "Search Query Performance is the right validation layer after this low-cost BSR check flags a likely traffic or conversion problem.",
    source: "Seller Help G8J4CB5ZBF3NX7TP - Search Query Performance dashboard",
  },
  {
    label: "Catalog performance isolates content gaps",
    detail:
      "Search Catalog Performance helps confirm whether weak clicks, conversion, or content coverage is contributing to the observed rank pressure.",
    source: "Seller Help GSWQU4LQSP2JH75Z - Search Catalog Performance Dashboard",
  },
];

const listingReadinessEvidence: ToolEvidence[] = [
  {
    label: "Discoverability depends on complete listing signals",
    detail:
      "Amazon points sellers toward complete titles, images, and keyword relevance as prerequisites for stronger discoverability.",
    source: "Seller Help G10471 - Optimize your product discoverability",
  },
  {
    label: "Merchandising opportunities require listing readiness",
    detail:
      "Amazon ties more marketing opportunities to basic listing readiness, including image depth, keywords, and other conversion-supporting content.",
    source: "Seller Help GFJTFMCXPRQ5GHUK - Unlock marketing opportunities",
  },
  {
    label: "A+ expands trust and education space",
    detail:
      "A+ content gives additional room to explain benefits and reduce objections when the category or competitor set already expects richer merchandising.",
    source: "Seller Help G202102930 - A+ content",
  },
];

const searchOptimizationEvidence: ToolEvidence[] = [
  {
    label: "Relevance comes before ranking",
    detail:
      "Discoverability guidance treats complete relevance signals as the prerequisite for stronger organic performance, so missing target terms should be fixed before chasing more traffic.",
    source: "Seller Help G10471 - Optimize your product discoverability",
  },
  {
    label: "Backend terms should extend coverage",
    detail:
      "Search-term guidance is strongest when backend fields add new descriptors instead of duplicating visible copy.",
    source: "Seller Help G23501 - Use search terms effectively",
  },
  {
    label: "Query dashboards validate the rewrite",
    detail:
      "Search Query Performance should be the follow-up check after title, backend, or browse-path cleanup goes live.",
    source: "Seller Help G8J4CB5ZBF3NX7TP - Search Query Performance dashboard",
  },
];

const competitorMonitoringEvidence: ToolEvidence[] = [
  {
    label: "Use public signals as a first watch layer",
    detail:
      "Discoverability guidance supports watching the quality of competitor relevance and conversion support, even before deeper paid tooling is added.",
    source: "Seller Help G10471 - Optimize your product discoverability",
  },
  {
    label: "Query performance should confirm the threat",
    detail:
      "When a watched competitor starts moving on price, reviews, or badges, Search Query Performance is the next place to confirm whether click share is changing.",
    source: "Seller Help G8J4CB5ZBF3NX7TP - Search Query Performance dashboard",
  },
  {
    label: "Catalog dashboards isolate content vs demand",
    detail:
      "Search Catalog Performance helps separate stronger listings from mere temporary price shocks when the watchlist starts to move.",
    source: "Seller Help GSWQU4LQSP2JH75Z - Search Catalog Performance Dashboard",
  },
];

const keywordTrackerEvidence: ToolEvidence[] = [
  {
    label: "Track relevance gaps first",
    detail:
      "Discoverability improvements usually start with visible relevance and coverage gaps before they become a pure ranking problem.",
    source: "Seller Help G10471 - Optimize your product discoverability",
  },
  {
    label: "Validate tracked phrases with query data",
    detail:
      "Search Query Performance is the right follow-up check after the tracked phrase set is tightened and deployed in listing copy.",
    source: "Seller Help G8J4CB5ZBF3NX7TP - Search Query Performance dashboard",
  },
  {
    label: "Catalog metrics help defend the winners",
    detail:
      "Search Catalog Performance can confirm whether defended phrases are being supported by stronger click-through or conversion after a listing update.",
    source: "Seller Help GSWQU4LQSP2JH75Z - Search Catalog Performance Dashboard",
  },
];

const priceTrackerEvidence: ToolEvidence[] = [
  {
    label: "Price should be judged against conversion support",
    detail:
      "Discoverability and click share are influenced by the listing's overall market credibility, so price alone should not be read without proof context.",
    source: "Seller Help G10471 - Optimize your product discoverability",
  },
  {
    label: "Query dashboards confirm if price moves matter",
    detail:
      "Search Query Performance is the follow-up check after a price move to see whether clicks and orders actually changed.",
    source: "Seller Help G8J4CB5ZBF3NX7TP - Search Query Performance dashboard",
  },
  {
    label: "Catalog metrics separate price from content drag",
    detail:
      "Search Catalog Performance helps confirm whether the ASIN is losing because of price or because the page is still weaker than competing offers.",
    source: "Seller Help GSWQU4LQSP2JH75Z - Search Catalog Performance Dashboard",
  },
];

const competitorAnalysisEvidence: ToolEvidence[] = [
  {
    label: "Competitive gaps are multi-signal",
    detail:
      "Amazon's discoverability guidance implies that price, content completeness, and proof all work together, so competitor analysis should not stop at one gap type.",
    source: "Seller Help G10471 - Optimize your product discoverability",
  },
  {
    label: "Marketing readiness depends on listing depth",
    detail:
      "Amazon links more merchandising opportunities to stronger listing structure, which makes image depth and A+ competitive, not optional.",
    source: "Seller Help GFJTFMCXPRQ5GHUK - Unlock marketing opportunities",
  },
  {
    label: "A+ is part of mature competitor sets",
    detail:
      "A+ content creates more room for benefits, objections, and brand education when competitors are already using richer merchandising.",
    source: "Seller Help G202102930 - A+ content",
  },
];

const productResearchEvidence: ToolEvidence[] = [
  {
    label: "Demand still needs discoverability proof",
    detail:
      "Early product research is more trustworthy when rank, relevance, and listing maturity are read together instead of treating rank alone as the full answer.",
    source: "Seller Help G10471 - Optimize your product discoverability",
  },
  {
    label: "Opportunity quality depends on listing readiness",
    detail:
      "Amazon's marketing-opportunity guidance implies that product selection should account for how demanding the category's content baseline already is.",
    source: "Seller Help GFJTFMCXPRQ5GHUK - Unlock marketing opportunities",
  },
  {
    label: "Economics need fee awareness",
    detail:
      "Any product screen that estimates room to win should be grounded in fee-aware unit economics rather than sell price alone.",
    source: "Seller Help G200336920 - Selling on Amazon fee schedule",
  },
];

const profitAnalyzerEvidence: ToolEvidence[] = [
  {
    label: "Unit economics must include all Amazon fees",
    detail:
      "Seller fee guidance makes referral and fulfillment costs non-optional inputs, so headline gross margin is not enough for launch or scaling decisions.",
    source: "Seller Help G200336920 - Selling on Amazon fee schedule",
  },
  {
    label: "Promotions are a real cost line",
    detail:
      "Coupon programs change true unit economics, so promo planning should be evaluated as part of profitability rather than separated from it.",
    source: "Seller Help G202189370 - Coupons fees and charges",
  },
  {
    label: "Weak discoverability can raise cost to win",
    detail:
      "Discoverability pressure usually means more PPC or heavier merchandising support, so thin margin models should be treated cautiously even before ads scale.",
    source: "Seller Help G10471 - Optimize your product discoverability",
  },
];

const nicheFinderEvidence: ToolEvidence[] = [
  {
    label: "Niche quality starts with discoverability reality",
    detail:
      "Amazon's discoverability guidance implies that niche selection should consider whether the visible reference set already requires strong relevance and listing support.",
    source: "Seller Help G10471 - Optimize your product discoverability",
  },
  {
    label: "Mature niches demand stronger merchandising",
    detail:
      "Marketing-opportunity guidance suggests that categories with richer content baselines and higher A+ adoption raise the bar for new entrants.",
    source: "Seller Help GFJTFMCXPRQ5GHUK - Unlock marketing opportunities",
  },
  {
    label: "Price opportunity still needs fee-aware economics",
    detail:
      "A visible price band can look attractive but still fail commercially once Amazon fees and operating costs are included.",
    source: "Seller Help G200336920 - Selling on Amazon fee schedule",
  },
];

const trendingProductsEvidence: ToolEvidence[] = [
  {
    label: "Trend screens should validate visible market momentum",
    detail:
      "Discoverability guidance supports checking whether live listings are actually winning visibility and demand instead of relying on abstract trend claims.",
    source: "Seller Help G10471 - Optimize your product discoverability",
  },
  {
    label: "Momentum only matters if the listing can compete",
    detail:
      "Amazon's merchandising guidance implies that trend opportunities still depend on content maturity and category expectations, not only on timing.",
    source: "Seller Help GFJTFMCXPRQ5GHUK - Unlock marketing opportunities",
  },
  {
    label: "Trend potential still has to survive fee math",
    detail:
      "A fast-moving product cluster is not automatically attractive if margin room disappears once fees and operating costs are applied.",
    source: "Seller Help G200336920 - Selling on Amazon fee schedule",
  },
];

const salesEstimatorEvidence: ToolEvidence[] = [
  {
    label: "Demand estimates should stay tied to discoverability",
    detail:
      "Amazon's discoverability guidance supports using rank only as a commercial screen, then validating whether the listing can actually win relevant traffic and clicks.",
    source: "Seller Help G10471 - Optimize your product discoverability",
  },
  {
    label: "Query dashboards validate the estimate",
    detail:
      "Search Query Performance is the follow-up layer after a BSR-based estimate suggests there may be enough demand to matter.",
    source: "Seller Help G8J4CB5ZBF3NX7TP - Search Query Performance dashboard",
  },
  {
    label: "Catalog metrics separate traffic from conversion weakness",
    detail:
      "Search Catalog Performance helps confirm whether weak results come from low demand or from a listing that is underperforming at click-through or conversion.",
    source: "Seller Help GSWQU4LQSP2JH75Z - Search Catalog Performance Dashboard",
  },
];

const negativeKeywordsEvidence: ToolEvidence[] = [
  {
    label: "Ad efficiency depends on pruning waste",
    detail:
      "Amazon's growth and ad-support materials point sellers toward structured campaign optimization, which includes stopping irrelevant spend rather than only adding more keywords.",
    source: "Seller Help G43381 - Programs and features to help increase sales",
  },
  {
    label: "Growth tools work better with tighter term control",
    detail:
      "A clean search-term structure creates better downstream signal for campaigns, budget allocation, and conversion-focused testing.",
    source: "Seller Help GFG4VRQK7CQLGRTM - Programs and tools for growth",
  },
  {
    label: "Negatives are part of normal ad operations",
    detail:
      "Amazon Ads guidance treats campaign cleanup and support as an operational workflow, not as an edge-case intervention.",
    source: "Seller Help G200663330 - Get help with Amazon Ads",
  },
];

const reviewAnalyzerEvidence: ToolEvidence[] = [
  {
    label: "Review patterns affect discoverability and conversion together",
    detail:
      "Amazon's discoverability guidance implies that repeated buyer objections and weak proof can drag performance beyond ratings alone.",
    source: "Seller Help G10471 - Optimize your product discoverability",
  },
  {
    label: "A+ can answer repeated objections",
    detail:
      "A+ content gives sellers more room to address feature confusion, setup friction, and trust gaps surfaced by recurring review themes.",
    source: "Seller Help G202102930 - A+ content",
  },
  {
    label: "Review analysis must stay policy-safe",
    detail:
      "Customer review policies matter because the goal is to learn from review text and improve the offer, not manipulate the review system.",
    source: "Seller Help GYRKB5RU3FS5TURN - Customer product reviews policies",
  },
];

const sellerAnalyticsEvidence: ToolEvidence[] = [
  {
    label: "Portfolio reads should start from discoverability reality",
    detail:
      "Amazon's discoverability guidance supports evaluating assortment and listing completeness through the visible catalog, even without hidden seller-center data.",
    source: "Seller Help G10471 - Optimize your product discoverability",
  },
  {
    label: "Merchandising maturity is part of the pattern",
    detail:
      "Marketing-opportunity guidance implies that richer portfolios often rely on stronger content depth and merchandising support, not only on breadth.",
    source: "Seller Help GFJTFMCXPRQ5GHUK - Unlock marketing opportunities",
  },
  {
    label: "A+ coverage signals portfolio maturity",
    detail:
      "A+ presence is a useful proxy for how much educational and brand-supporting work the seller is doing across the catalog.",
    source: "Seller Help G202102930 - A+ content",
  },
];

const brandAnalyticsEvidence: ToolEvidence[] = [
  {
    label: "Query presence should be read as discoverability share",
    detail:
      "Amazon's discoverability framing makes query-level presence meaningful because traffic opportunity and competitor pressure sit inside the same search context.",
    source: "Seller Help G10471 - Optimize your product discoverability",
  },
  {
    label: "Search query dashboards help validate priorities",
    detail:
      "Search Query Performance is the right downstream check after a Brand Analytics sample identifies high-value terms or missing presence.",
    source: "Seller Help G8J4CB5ZBF3NX7TP - Search Query Performance dashboard",
  },
  {
    label: "Catalog metrics help explain the gap",
    detail:
      "Search Catalog Performance helps determine whether a weak query position is more likely caused by content quality or by broader demand pressure.",
    source: "Seller Help GSWQU4LQSP2JH75Z - Search Catalog Performance Dashboard",
  },
];

const seasonalPlanningEvidence: ToolEvidence[] = [
  {
    label: "Deals need timing discipline",
    detail:
      "Amazon deal guidance matters because seasonal planning is not only a calendar exercise; it needs real event windows and execution timing.",
    source: "Seller Help G202043110 - Amazon deals",
  },
  {
    label: "Inventory timing is part of the seasonal plan",
    detail:
      "FBA inventory guidance makes it clear that event planning without replenishment readiness creates execution risk rather than leverage.",
    source: "Seller Help GTMXYZN64UJL7TT6 - FBA Inventory overview",
  },
  {
    label: "Growth tools work best when the calendar is staged",
    detail:
      "Amazon's growth guidance supports coordinating ads, promos, and merchandising around event windows rather than launching every lever at once.",
    source: "Seller Help GFG4VRQK7CQLGRTM - Programs and tools for growth",
  },
];

const repricingStrategyEvidence: ToolEvidence[] = [
  {
    label: "Price moves should protect discoverability, not only margin math",
    detail:
      "Amazon's discoverability guidance implies that pricing strategy should be judged alongside conversion credibility rather than as a blind race to the bottom.",
    source: "Seller Help G10471 - Optimize your product discoverability",
  },
  {
    label: "Fee math sets the true floor",
    detail:
      "Amazon fee guidance matters because a repricing floor that ignores referral and fulfillment burden is not a real guardrail.",
    source: "Seller Help G200336920 - Selling on Amazon fee schedule",
  },
  {
    label: "Catalog performance helps validate price moves",
    detail:
      "Search Catalog Performance can help distinguish whether a price move solved the problem or whether the ASIN still has content or conversion drag.",
    source: "Seller Help GSWQU4LQSP2JH75Z - Search Catalog Performance Dashboard",
  },
];

const buyBoxEvidence: ToolEvidence[] = [
  {
    label: "Buy Box pressure is tied to visible offer quality",
    detail:
      "Amazon's discoverability framing supports judging price, fulfillment, and trust signals together instead of assuming Buy Box performance is purely price-driven.",
    source: "Seller Help G10471 - Optimize your product discoverability",
  },
  {
    label: "Inventory continuity is part of retention",
    detail:
      "FBA inventory guidance matters because weak stock continuity can break the commercial posture even when the offer looks competitive on paper.",
    source: "Seller Help GTMXYZN64UJL7TT6 - FBA Inventory overview",
  },
  {
    label: "Fee-aware offers can avoid false price wins",
    detail:
      "Seller fee math matters because an offer that chases the box while falling below safe economics is not actually defensible.",
    source: "Seller Help G200336920 - Selling on Amazon fee schedule",
  },
];

const ppcCampaignEvidence: ToolEvidence[] = [
  {
    label: "Campaign cleanup is part of sales growth",
    detail:
      "Amazon's growth materials support tightening campaign structure and waste control before adding more spend.",
    source: "Seller Help G43381 - Programs and features to help increase sales",
  },
  {
    label: "Funnel signal improves when structure is cleaner",
    detail:
      "Amazon's growth tools are more useful when campaign roles are clearer and inefficient spend is isolated rather than blended everywhere.",
    source: "Seller Help GFG4VRQK7CQLGRTM - Programs and tools for growth",
  },
  {
    label: "Ads operations should stay measurable",
    detail:
      "Amazon Ads support guidance treats campaign monitoring and adjustment as an operational loop, not a one-time setup.",
    source: "Seller Help G200663330 - Get help with Amazon Ads",
  },
];

const displayAdsEvidence: ToolEvidence[] = [
  {
    label: "Display should support incremental sales, not just follow traffic",
    detail:
      "Amazon's growth guidance supports using additional ad surfaces with a clear role, rather than treating every audience as interchangeable.",
    source: "Seller Help G43381 - Programs and features to help increase sales",
  },
  {
    label: "Audience mix should reflect a deliberate growth plan",
    detail:
      "Programs and tools for growth imply that audience structure and budget allocation should be staged around actual funnel goals.",
    source: "Seller Help GFG4VRQK7CQLGRTM - Programs and tools for growth",
  },
  {
    label: "Display operations still need active management",
    detail:
      "Amazon Ads support materials fit a workflow where audience expansion and budget splits are checked continuously rather than assumed to self-correct.",
    source: "Seller Help G200663330 - Get help with Amazon Ads",
  },
];

const daypartingEvidence: ToolEvidence[] = [
  {
    label: "Timing should follow measured sales efficiency",
    detail:
      "Amazon's growth guidance supports optimizing toward sales efficiency signals, which makes hourly budget timing a real lever when enough history exists.",
    source: "Seller Help G43381 - Programs and features to help increase sales",
  },
  {
    label: "Budget timing is part of the growth toolkit",
    detail:
      "Programs and tools for growth imply that when budget is limited, timing windows matter because not every hour deserves the same spend.",
    source: "Seller Help GFG4VRQK7CQLGRTM - Programs and tools for growth",
  },
  {
    label: "Hourly strategy still needs ongoing ad review",
    detail:
      "Amazon Ads support materials align with revisiting schedules as promotions, traffic mix, or conversion quality changes.",
    source: "Seller Help G200663330 - Get help with Amazon Ads",
  },
];

const backendKeywordsEvidence: ToolEvidence[] = [
  {
    label: "Backend fields should extend discoverability",
    detail:
      "Amazon's discoverability guidance implies that hidden search fields should contribute net-new relevance rather than duplicate visible copy.",
    source: "Seller Help G10471 - Optimize your product discoverability",
  },
  {
    label: "Search terms work best when they add coverage",
    detail:
      "Amazon's search-term guidance is strongest when backend content broadens indexing support instead of repeating title and bullet language.",
    source: "Seller Help G23501 - Use search terms effectively",
  },
  {
    label: "Query dashboards validate backend changes",
    detail:
      "Search Query Performance is the natural downstream check after backend terms are tightened and published.",
    source: "Seller Help G8J4CB5ZBF3NX7TP - Search Query Performance dashboard",
  },
];

const returnReductionEvidence: ToolEvidence[] = [
  {
    label: "Return pressure affects discoverability and conversion",
    detail:
      "Amazon's discoverability guidance supports treating repeated return causes as a performance problem, not only a support problem.",
    source: "Seller Help G10471 - Optimize your product discoverability",
  },
  {
    label: "A+ can reduce expectation mismatch",
    detail:
      "A+ content helps sellers explain product use, fit, and benefits more clearly when clarity issues are driving returns.",
    source: "Seller Help G202102930 - A+ content",
  },
  {
    label: "Review and return themes should be read carefully",
    detail:
      "Customer review policy context matters because the job is to learn from complaints and improve the offer, not influence customer feedback improperly.",
    source: "Seller Help GYRKB5RU3FS5TURN - Customer product reviews policies",
  },
];

const listingImagesEvidence: ToolEvidence[] = [
  {
    label: "Image plans should support discoverability and conversion",
    detail:
      "Amazon's discoverability guidance implies that images are not decorative extras; they help buyers understand and trust the offer faster.",
    source: "Seller Help G10471 - Optimize your product discoverability",
  },
  {
    label: "Richer visual education reduces friction",
    detail:
      "A+ guidance reinforces that visual modules should explain benefits and objections clearly, which also applies to the main image stack.",
    source: "Seller Help G202102930 - A+ content",
  },
  {
    label: "Style-guide image expectations set the baseline",
    detail:
      "Amazon's category style guidance matters because a usable image brief should meet baseline coverage and clarity before it tries to be clever.",
    source: "Seller Help STYLE-HOME - Official category style guides: ideal image set and white background",
  },
];

const productPhotographyEvidence: ToolEvidence[] = [
  {
    label: "Photography should serve discoverability and trust",
    detail:
      "Amazon's discoverability guidance supports using photography to reduce ambiguity quickly, not only to make the page look better.",
    source: "Seller Help G10471 - Optimize your product discoverability",
  },
  {
    label: "Production assets should answer real objections",
    detail:
      "A+ guidance supports building a shot plan around explanation and proof rather than purely aesthetic variety.",
    source: "Seller Help G202102930 - A+ content",
  },
  {
    label: "Category image rules still matter at shoot-planning time",
    detail:
      "Category style requirements should shape the production brief early so the team does not capture unusable shots.",
    source: "Seller Help STYLE-CLOTHING - Official category style guides: apparel image requirements",
  },
];

const fbaCalculatorEvidence: ToolEvidence[] = [
  {
    label: "Fee math should start with Amazon's category rules",
    detail:
      "Amazon's fee schedule matters because referral and fulfillment burden need to be reflected before a SKU is treated as scalable.",
    source: "Seller Help G200336920 - Selling on Amazon fee schedule",
  },
  {
    label: "Category fee context changes real margin",
    detail:
      "Fee category guidance reminds sellers that product-type assumptions can materially change the commercial picture.",
    source: "Seller Help GFD6HLGAEZC9VBGJ - Fee category guidelines for your products",
  },
  {
    label: "Discoverability only matters after unit economics work",
    detail:
      "Amazon's discoverability guidance is useful, but only after the unit can survive fees, storage, and launch pressure.",
    source: "Seller Help G10471 - Optimize your product discoverability",
  },
];

const tariffCalculatorEvidence: ToolEvidence[] = [
  {
    label: "Importer readiness is part of landed cost reality",
    detail:
      "Country-of-origin and importer-responsibility guidance matters because duty and document readiness can block inbound execution, not just reduce margin.",
    source: "Seller Help G200280280 - Country of origin and importer responsibilities",
  },
  {
    label: "Import costs must be folded into Amazon economics",
    detail:
      "Amazon's fee schedule is only part of the picture; landed cost needs to be combined with marketplace fees before a SKU is judged workable.",
    source: "Seller Help G200336920 - Selling on Amazon fee schedule",
  },
  {
    label: "FBA inbound planning assumes correct duty and shipping setup",
    detail:
      "Import routing choices matter because operational readiness can be the blocker before marketplace performance ever starts.",
    source: "Seller Help G200140860 - FBA product restrictions",
  },
];

const shippingCalculatorEvidence: ToolEvidence[] = [
  {
    label: "Shipping burden should be evaluated before traffic scaling",
    detail:
      "Amazon's product-restriction and inbound guidance support treating dimensional and routing cost as a real planning variable, not an afterthought.",
    source: "Seller Help G200140860 - FBA product restrictions",
  },
  {
    label: "Cross-border routing increases operational friction",
    detail:
      "Importer and inbound obligations matter because route complexity changes both cost and execution reliability.",
    source: "Seller Help G200280280 - Inbound shipping and country-of-origin obligations",
  },
  {
    label: "Fee-aware shipping math protects real margin",
    detail:
      "Shipping should be read together with marketplace fees so sellers do not overestimate the room available for ads or promotions.",
    source: "Seller Help G200336920 - Selling on Amazon fee schedule",
  },
];

function percentCovered(matches: number, total: number) {
  if (total <= 0) {
    return 100;
  }

  return Math.round((matches / total) * 100);
}

export function estimateMonthlyUnitsFromBsr(category: string, bsr: number) {
  if (bsr <= 0) {
    return 0;
  }

  const normalizedCategory = normalizeCategoryBucket(category);
  const curve =
    monthlySalesCurve[normalizedCategory] ?? monthlySalesCurve.default;

  return Math.max(
    1,
    Math.round(curve.base / Math.pow(Math.max(bsr, 1), curve.exponent)),
  );
}

function cubicInchesToCubicFeet(cubicInches: number) {
  return cubicInches / 1728;
}

function sizeTier(length: number, width: number, height: number, weight: number) {
  const dimensions = [length, width, height].sort((a, b) => b - a);
  const [longest, median, shortest] = dimensions;
  const girth = longest + (median + shortest) * 2;

  if (weight <= 1 && longest <= 15 && median <= 12 && shortest <= 0.75) {
    return { tier: "Small standard", fee: 3.22 };
  }

  if (weight <= 20 && longest <= 18 && median <= 14 && shortest <= 8) {
    return { tier: "Large standard", fee: 4.75 + Math.max(0, weight - 1) * 0.22 };
  }

  if (weight <= 70 && longest <= 60 && median <= 30) {
    return { tier: "Small oversize", fee: 9.61 + Math.max(0, weight - 2) * 0.38 };
  }

  if (weight <= 150 && girth <= 108) {
    return { tier: "Medium oversize", fee: 11.86 + Math.max(0, weight - 2) * 0.42 };
  }

  if (weight <= 150 && girth <= 165) {
    return { tier: "Large oversize", fee: 26.33 + Math.max(0, weight - 2) * 0.8 };
  }

  return { tier: "Special oversize", fee: 54.81 + Math.max(0, weight - 90) * 0.92 };
}

export function evaluateFbaCalculator(input: {
  marketplace: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  sellingPrice: number;
  productCost: number;
  inboundShipping: number;
  category: string;
  storageMonths: number;
}) {
  const tier = sizeTier(input.length, input.width, input.height, input.weight);
  const normalizedCategory = normalizeCategoryBucket(input.category);
  const referralRate =
    referralFeeRates[normalizedCategory] ?? referralFeeRates.default;
  const referralFee = input.sellingPrice * referralRate;
  const cubicFeet = cubicInchesToCubicFeet(
    input.length * input.width * input.height,
  );
  const monthlyStorage = cubicFeet * 0.87 * input.storageMonths;
  const totalFees = referralFee + tier.fee + monthlyStorage + input.inboundShipping;
  const netProfit = input.sellingPrice - input.productCost - totalFees;
  const marginRate =
    input.sellingPrice > 0 ? (netProfit / input.sellingPrice) * 100 : 0;
  const roi = input.productCost > 0 ? (netProfit / input.productCost) * 100 : 0;
  const feeLoadRate =
    (totalFees / Math.max(input.sellingPrice, 0.01)) * 100;
  const alerts: string[] = [];
  const oversizeRisk = tier.tier.includes("oversize");
  const storageHeavy = monthlyStorage > 1.5;
  const thinMargin = marginRate < 12;
  const weakRoi = roi < 25;
  const estimatedTakeHome = Math.max(0, input.sellingPrice - referralFee - tier.fee);
  const priceLiftNeededFor15Margin =
    round(Math.max(0, ((input.productCost + totalFees) / 0.85) - input.sellingPrice), 2);
  const cogsCutNeededFor20Roi =
    round(Math.max(0, input.productCost - (netProfit / 0.2)), 2);
  const storageCutNeededFor1DollarMonthly = round(
    Math.max(0, monthlyStorage - 1),
    2,
  );
  const primaryPressure =
    oversizeRisk
      ? "Packaging geometry"
      : thinMargin
        ? "Thin contribution margin"
        : storageHeavy
          ? "Storage drag"
          : weakRoi
            ? "Weak ROI"
            : "Balanced fee stack";
  const firstMove =
    oversizeRisk
      ? "Shrink the packaged footprint first"
      : thinMargin
        ? "Raise price or cut landed cost first"
        : storageHeavy
          ? "Tighten sell-through and storage window"
          : weakRoi
            ? "Lower COGS before scaling"
            : "Pressure-test launch scenarios";
  const singleFixReason =
    oversizeRisk
      ? `The SKU is currently sitting in ${tier.tier.toLowerCase()} economics, so even a modest packaging reduction can unlock a better fee lane.`
      : thinMargin
        ? `Only ${round(marginRate, 1)}% margin is left after fees and inbound cost, so the SKU has little room for ads, discounts, or launch error.`
        : storageHeavy
          ? `${formatCurrency(round(monthlyStorage))} in monthly storage is quietly taxing the unit before any ads or promo pressure.`
          : weakRoi
            ? `${round(roi, 1)}% ROI is too light for a SKU that still has launch volatility ahead.`
            : "No single fee line is dominating yet, so scenario testing is the next responsible move.";

  if (thinMargin) {
    alerts.push("Contribution margin is thin for paid acquisition or promo-heavy launches.");
  }
  if (oversizeRisk) {
    alerts.push("Packaging footprint is pushing the SKU into oversize economics.");
  }
  if (storageHeavy) {
    alerts.push("Storage burden is meaningful. Recheck packaging volume and sell-through assumptions.");
  }
  if (weakRoi) {
    alerts.push("ROI is light relative to the product cost base, so the SKU may struggle to absorb launch inefficiency.");
  }

  return {
    headline:
      oversizeRisk
        ? "Fix packaging geometry before trusting this FBA lane"
        : thinMargin
          ? "Repair the unit before giving this SKU more FBA exposure"
          : storageHeavy
            ? "Cut storage drag before this SKU earns more inventory"
            : weakRoi
              ? "Lower COGS before treating this FBA unit as scaleable"
              : "Pressure-test this FBA unit before approving wider scale",
    summary:
      "This FBA read should tell the team which commercial lever moves first, which guardrail stays closed, and what cost truth still decides the SKU.",
    metrics: [
      {
        label: "Commercial call",
        value: firstMove,
        detail: "Open only this lane first before more inventory, ad spend, or promo logic gets permission to move.",
      },
      {
        label: "Do now",
        value:
          oversizeRisk
            ? "Reduce packaged dimensions"
            : thinMargin
              ? priceLiftNeededFor15Margin > 0
                ? `Add about ${formatCurrency(priceLiftNeededFor15Margin)} price room or cut the same from landed cost`
                : "Cut landed cost before scaling"
              : storageHeavy
                ? "Reduce average storage months"
                : weakRoi
                  ? cogsCutNeededFor20Roi > 0
                    ? `Cut about ${formatCurrency(cogsCutNeededFor20Roi)} from COGS to reach healthier ROI`
                    : "Lower COGS before scaling"
                  : "Test launch sensitivity",
        detail: singleFixReason,
      },
      {
        label: "Do not cross",
        value:
          oversizeRisk
            ? `${tier.tier} fee tier`
            : thinMargin
              ? "12% contribution margin"
              : storageHeavy
                ? "$1 monthly storage per unit"
                : weakRoi
                  ? "25% ROI line"
                  : "Current fee stack baseline",
        detail:
          oversizeRisk
            ? "If the packaged unit stays in this tier, the SKU will keep carrying the current fee burden."
            : thinMargin
              ? "Below this line, the unit has too little room for ads, promo depth, or launch variance."
              : storageHeavy
                ? `Storage drag is already above the cleaner operating line by about ${formatCurrency(storageCutNeededFor1DollarMonthly)} per unit-month.`
                : weakRoi
                  ? "Below this ROI line, the SKU becomes fragile under normal launch volatility."
                  : "Keep future scenario testing anchored to this current cost stack.",
      },
      {
        label: "Decision owner",
        value:
          oversizeRisk
            ? "Ops / packaging owner"
            : thinMargin
              ? "Unit economics owner"
              : storageHeavy
                ? "Inventory / finance owner"
                : weakRoi
                  ? "Sourcing / finance owner"
                  : "FBA launch owner",
        detail: `${primaryPressure} is the only pressure lane that stays open until the next recheck.`,
      },
      {
        label: "Referral fee",
        value: formatCurrency(round(referralFee)),
        detail: `${Math.round(referralRate * 100)}% of selling price`,
      },
      {
        label: "Fulfillment fee",
        value: formatCurrency(round(tier.fee)),
        detail: tier.tier,
      },
      {
        label: "Monthly storage",
        value: formatCurrency(round(monthlyStorage)),
        detail: `${round(cubicFeet, 3)} cubic feet for ${input.storageMonths} months`,
      },
      {
        label: "Net profit",
        value: formatCurrency(round(netProfit)),
        detail: `${round(marginRate, 1)}% margin | about ${formatCurrency(round(estimatedTakeHome))} left after Amazon referral and fulfillment fees before COGS`,
      },
      {
        label: "ROI",
        value: `${round(roi, 1)}%`,
        detail: "Net profit divided by product cost",
      },
      {
        label: "Fee load",
        value: `${round(feeLoadRate, 1)}%`,
        detail: "Combined Amazon and inbound cost share of selling price",
      },
    ],
    recommendations: [
      thinMargin
        ? "Do not scale this SKU yet. Reduce landed cost or increase sell price before treating it as a scale candidate."
        : "Margin is usable, but still pressure-test launch discounting and ad spend.",
      oversizeRisk
        ? "Do not ignore packaging geometry. Review dimensions first because a small reduction can materially improve fee structure."
        : "Current dimensions stay inside a manageable fee tier.",
      monthlyStorage > 1
        ? "Keep reorder cycles tighter so storage does not quietly erode gross margin."
        : "Storage exposure is reasonable if sell-through stays on plan.",
      weakRoi
        ? "Assign one owner to cost-down work and one to price-floor discipline so weak ROI is not masked by optimistic launch assumptions."
        : "Freeze the current cost stack before testing launch scenarios so profitability changes can be traced to the real lever.",
    ],
    alerts,
    status: buildStatus(marginRate, 20, 12, {
      good: "Margin looks workable",
      warning: "Margin needs review",
      critical: "Margin is too thin",
    }),
    actionStance: buildActionStance(marginRate, {
      goAt: 20,
      cautionAt: 12,
    }, {
      go: "Use this SKU economics",
      caution: "Tighten fees or packaging first",
      stop: "Do not scale this SKU yet",
    }, {
      go: "The fee stack is strong enough to use this SKU as a viable launch or scale candidate.",
      caution: "The SKU may still work, but packaging, storage, or margin drag should tighten before bigger spend.",
      stop: "The current economics are too thin to justify scaling this SKU with confidence.",
    }),
    missingItems: [
      oversizeRisk ? "Packaging optimization review" : "",
      monthlyStorage > 1 ? "Storage assumption check" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      firstMove === "Shrink the packaged footprint first"
        ? "Measure the true shipped carton and test whether a packaging reduction can move the SKU out of the current fee tier."
        : firstMove === "Raise price or cut landed cost first"
          ? "Choose one lever first: test a higher price floor or bring a real landed-cost target back to sourcing."
          : firstMove === "Tighten sell-through and storage window"
            ? "Reduce the assumed storage window and recheck whether the SKU still works without long-tail inventory drag."
            : firstMove === "Lower COGS before scaling"
              ? "Take one concrete cost-down target back to sourcing before approving more spend."
              : "Validate ad-spend tolerance against net profit before treating the SKU as scale-ready.",
      oversizeRisk
        ? "Run one package-size scenario with the current carton and one with the tightest realistic packaging."
        : thinMargin
          ? "Re-run once with your price floor and once with your target landed cost so the team can see which lever actually saves the SKU."
          : storageHeavy
            ? "Compare a fast-turn replenishment plan versus the current storage window."
            : weakRoi
              ? "Bring sourcing back one concrete cost-down target, then re-run the model."
              : "Run one launch scenario with ads and one without ads before approving scale.",
      "Lock one packaging assumption and one price floor before changing the rest of the model.",
      "Re-run after any packaging or price change.",
      "Check landed cost and shipping next.",
    ],
    evidence: fbaCalculatorEvidence,
  } satisfies ToolEvaluation;
}

export function evaluateTariffCalculator(input: {
  origin: string;
  destination: string;
  productType: string;
  declaredValue: number;
  freightCost: number;
  quantity: number;
  importerOfRecordReady?: boolean;
  countryOfOriginConfirmed?: boolean;
  needsPgaReview?: boolean;
  shippingTerm?: string;
}) {
  const normalizedProductType = normalizeCategoryBucket(input.productType);
  const normalizedOrigin = normalizeTradeRegion(input.origin);
  const normalizedDestination = normalizeTradeRegion(input.destination);
  const routeKey = `${normalizedOrigin}-${normalizedDestination}-${normalizedProductType}`;
  const fallbackRouteKey = `${normalizedOrigin}-${normalizedDestination}-general`;
  const dutyRate =
    routeDutyRates[routeKey] ??
    routeDutyRates[fallbackRouteKey] ??
    routeDutyRates["CN-US-general"];
  const vatRate =
    destinationVatRates[input.destination] ?? destinationVatRates.default;
  const duty = input.declaredValue * dutyRate;
  const vatBase = input.declaredValue + duty + input.freightCost;
  const vat = vatBase * vatRate;
  const landedCost = input.declaredValue + input.freightCost + duty + vat;
  const unitLanded = input.quantity > 0 ? landedCost / input.quantity : landedCost;
  const alerts: string[] = [];
  const docs: string[] = [];

  if (dutyRate >= 0.2) {
    alerts.push("This route carries elevated duty exposure. Margin sensitivity is high.");
  }
  if (vatRate > 0.15) {
    alerts.push("Destination tax meaningfully changes cash requirements before sale.");
  }
  if (input.destination === "US" && input.origin !== "US" && !input.importerOfRecordReady) {
    alerts.push("US import shipments into FBA need a non-Amazon importer of record.");
  }
  if (!input.countryOfOriginConfirmed) {
    alerts.push("Country of origin must be the exact last substantial transformation country, not a region like EU.");
  }
  if (input.shippingTerm !== "ddp") {
    alerts.push("Amazon FBA import shipments are expected to arrive on Delivered Duty Paid terms.");
  }
  if (input.needsPgaReview) {
    alerts.push("This product may need partner government agency review or a US-based agent before inbound.");
  }
  if (unitLanded > input.declaredValue / Math.max(input.quantity, 1) * 1.4) {
    alerts.push("Import overhead is adding substantial landed-cost lift over declared unit value.");
  }

  if (input.destination === "US" && input.origin !== "US") docs.push("Importer of record details");
  if (input.needsPgaReview) docs.push("PGA or permit documentation");
  docs.push("Country of origin confirmation");
  if (input.shippingTerm !== "ddp") docs.push("DDP-aligned shipping terms");

  return {
    headline: `${input.origin} to ${input.destination} landed-cost estimate`,
    summary:
      "This result separates customs duty from VAT or GST so the seller can see both margin pressure and cash-flow impact.",
    metrics: [
      {
        label: "Duty burden",
        value: formatCurrency(round(duty)),
        detail: `${round(dutyRate * 100, 1)}% duty rate`,
      },
      {
        label: "VAT or GST",
        value: formatCurrency(round(vat)),
        detail: `${round(vatRate * 100, 1)}% tax rate`,
      },
      {
        label: "Freight",
        value: formatCurrency(round(input.freightCost)),
        detail: "User-provided freight estimate",
      },
      {
        label: "Landed cost",
        value: formatCurrency(round(landedCost)),
        detail: formatCurrency(round(unitLanded)) + " per unit",
      },
      {
        label: "Import readiness",
        value: `${Math.max(0, 100 - alerts.length * 18)}%`,
        detail: docs[0] ?? "No obvious import blocker flagged",
      },
      {
        label: "Cash-flow load",
        value: `${round(((duty + vat + input.freightCost) / Math.max(input.declaredValue, 0.01)) * 100, 1)}%`,
        detail: "Duty, tax, and freight relative to declared goods value",
      },
    ],
    recommendations: [
      dutyRate >= 0.2
        ? "Do not treat this landed cost as final yet. Compare alternate sourcing routes or HTS assumptions before committing."
        : "Customs exposure is manageable, but still validate broker assumptions before PO release.",
      input.destination === "US"
        ? "United States routing usually shifts focus from VAT to tariff classification and freight efficiency."
        : "For non-US markets, plan tax cash flow separately from margin math.",
      !input.importerOfRecordReady || !input.countryOfOriginConfirmed
        ? "Do not release the PO or shipment plan until importer-of-record and origin details are clean."
        : "Assign one owner to import paperwork and one to landed-cost modeling so compliance and margin do not drift apart.",
      "Save this landed-cost number and push it into FBA and shipping calculations next.",
    ],
    alerts,
    status: buildStatus(Math.max(0, 100 - alerts.length * 18), 80, 55, {
      good: "Import plan looks usable",
      warning: "Import plan needs cleanup",
      critical: "Import blockers are still open",
    }),
    actionStance: buildActionStance(Math.max(0, 100 - alerts.length * 18), {
      goAt: 80,
      cautionAt: 55,
    }, {
      go: "Use this landed-cost route",
      caution: "Tighten import readiness first",
      stop: "Do not release this route yet",
    }, {
      go: "The route and landed-cost assumptions are clean enough to carry into margin and PO planning.",
      caution: "The import path is workable, but paperwork or cash-flow details should tighten before release.",
      stop: "The current route still has enough import risk that releasing it now would be careless.",
    }),
    missingItems: docs,
    riskItems: alerts,
    nextSteps: [
      "Confirm broker assumptions and duty classification.",
      "Lock country-of-origin and shipping term details.",
      "Freeze the route, origin, and incoterm before updating the margin model so landed-cost movement stays explainable.",
      "Push landed cost into FBA margin review.",
    ],
    evidence: tariffCalculatorEvidence,
  } satisfies ToolEvaluation;
}

export function evaluateShippingCalculator(input: {
  fulfillmentMode: "FBA" | "FBM";
  length: number;
  width: number;
  height: number;
  weight: number;
  monthlyUnits: number;
  storageMonths: number;
  distanceZone: "domestic" | "regional" | "international";
  removalUnits: number;
}) {
  const dimWeight = (input.length * input.width * input.height) / 139;
  const billableWeight = Math.max(input.weight, dimWeight);
  const zoneMultiplier =
    input.distanceZone === "domestic"
      ? 1
      : input.distanceZone === "regional"
        ? 1.25
        : 1.6;
  const basePerUnit =
    input.fulfillmentMode === "FBA"
      ? 2.85 + billableWeight * 0.42
      : 3.45 + billableWeight * 0.55;
  const monthlyStorage =
    cubicInchesToCubicFeet(input.length * input.width * input.height) *
    0.87 *
    input.monthlyUnits *
    input.storageMonths;
  const shippingPerUnit = basePerUnit * zoneMultiplier;
  const removalCost = input.removalUnits * 0.62;
  const totalMonthlyBurden =
    shippingPerUnit * input.monthlyUnits + monthlyStorage + removalCost;
  const alerts: string[] = [];

  if (dimWeight > input.weight * 1.25) {
    alerts.push("Dimensional weight is materially above actual weight. Packaging optimization is likely worth it.");
  }
  if (input.fulfillmentMode === "FBM" && input.distanceZone === "international") {
    alerts.push("FBM plus international routing can make delivery promises and margin harder to protect.");
  }
  if (removalCost > 0 && input.removalUnits >= input.monthlyUnits * 0.15) {
    alerts.push("Removal volume is high enough to suggest stock planning or listing-demand issues.");
  }
  const shippingVerdict =
    dimWeight > input.weight * 1.25
      ? "Fix packaging geometry before scaling this shipping profile"
      : input.fulfillmentMode === "FBM" && input.distanceZone === "international"
        ? "Do not widen this FBM route until the promise is safer"
        : removalCost > 0 && input.removalUnits >= input.monthlyUnits * 0.15
          ? "Stop treating removals like noise and repair the stock loop now"
          : "Use this fulfillment profile as the operating baseline";
  const shippingOwner =
    dimWeight > input.weight * 1.25
      ? "Packaging / ops lead"
      : input.fulfillmentMode === "FBM" && input.distanceZone === "international"
        ? "Fulfillment strategy lead"
        : removalCost > 0 && input.removalUnits >= input.monthlyUnits * 0.15
          ? "Inventory cleanup lead"
          : "Fulfillment owner";
  const shippingMoveNow =
    dimWeight > input.weight * 1.25
      ? "Redesign the carton before changing route, promise, or carrier assumptions"
      : input.fulfillmentMode === "FBM" && input.distanceZone === "international"
        ? "Stress-test delivery promise and return handling before expanding this FBM route"
        : removalCost > 0 && input.removalUnits >= input.monthlyUnits * 0.15
          ? "Clean up the removal pattern before adding more units into the same loop"
          : "Carry this exact profile into landed-margin and capacity planning";
  const shippingDoNotCross =
    dimWeight > input.weight * 1.25
      ? "Do not scale a shipping profile where the box is driving the economics"
      : input.fulfillmentMode === "FBM" && input.distanceZone === "international"
        ? "Do not promise broad FBM international coverage before SLA and return handling are proven"
        : removalCost > 0 && input.removalUnits >= input.monthlyUnits * 0.15
          ? "Do not keep sending inventory into a loop that is already generating avoidable removals"
          : "Do not change packaging, route, and storage assumptions at the same time";
  const shippingRiskBrief =
    dimWeight > input.weight * 1.25
      ? `Dimensional weight at ${round(dimWeight, 2)} lb is materially above the actual ${round(input.weight, 2)} lb product weight.`
      : input.fulfillmentMode === "FBM" && input.distanceZone === "international"
        ? "International FBM adds more delivery and return failure paths than the current model is pricing explicitly."
        : removalCost > 0 && input.removalUnits >= input.monthlyUnits * 0.15
          ? `${input.removalUnits} removal units are already large enough to distort the real monthly burden.`
          : `${formatCurrency(round(totalMonthlyBurden))} total monthly burden is stable enough to use as the current operating baseline.`;
  const shippingRerunTrigger =
    dimWeight > input.weight * 1.25
      ? "Re-run after the packaging profile changes enough to alter billable weight"
      : input.fulfillmentMode === "FBM" && input.distanceZone === "international"
        ? "Re-run only after route promise, carrier, or return assumptions materially change"
        : "Re-run when removals, storage window, or the route profile changes enough to alter the operating call";
  const shippingScore = dimWeight > input.weight * 1.25 ? 50 : input.fulfillmentMode === "FBA" ? 82 : 68;

  return {
    headline:
      shippingVerdict === "Use this fulfillment profile as the operating baseline"
        ? `${shippingVerdict} - ${input.fulfillmentMode} at ${round(billableWeight, 2)} lb billable weight`
        : `${shippingVerdict} - ${input.fulfillmentMode} at ${round(billableWeight, 2)} lb billable weight`,
    summary:
      "Use this fulfillment read to decide which cost lane opens first, which shipping mistake is forbidden, and who owns the next move.",
    metrics: [
      {
        label: "Commercial call",
        value: shippingVerdict,
        detail: `${shippingMoveNow}. ${shippingOwner} owns the next fulfillment decision.`,
      },
      {
        label: "Open lane",
        value: shippingMoveNow,
        detail: shippingRiskBrief,
      },
      {
        label: "Billable weight",
        value: `${round(billableWeight, 2)} lb`,
        detail: `Actual ${round(input.weight, 2)} lb vs dimensional ${round(dimWeight, 2)} lb`,
      },
      {
        label: "Shipping per unit",
        value: formatCurrency(round(shippingPerUnit)),
        detail: `${input.fulfillmentMode} with ${input.distanceZone} routing`,
      },
      {
        label: "Storage burden",
        value: formatCurrency(round(monthlyStorage)),
        detail: `${input.storageMonths} months held`,
      },
      {
        label: "Monthly total",
        value: formatCurrency(round(totalMonthlyBurden)),
        detail: `${input.monthlyUnits} units plus ${input.removalUnits} removal units`,
      },
      {
        label: "Storage share",
        value: `${round((monthlyStorage / Math.max(totalMonthlyBurden, 0.01)) * 100, 1)}%`,
        detail: "Share of monthly burden caused by storage rather than outbound shipping",
      },
      {
        label: "Decision owner",
        value: shippingOwner,
        detail: shippingDoNotCross,
      },
      {
        label: "Wrong move",
        value: shippingDoNotCross,
        detail: "Keep one fulfillment lane open until the real cost driver changes.",
      },
      {
        label: "Re-run trigger",
        value: shippingRerunTrigger,
        detail: "Do not keep re-modeling while the operating profile is still the same.",
      },
    ],
    recommendations: [
      dimWeight > input.weight
        ? "Do not scale this fulfillment profile yet. Target box redesign before traffic scaling because packaging is driving cost more than product mass."
        : "Weight profile is efficient enough that freight negotiation matters more than box redesign.",
      input.fulfillmentMode === "FBA"
        ? "Keep an eye on slow storage exposure and removal timing."
        : "Model carrier SLA and return handling before committing to a broad FBM promise.",
      input.removalUnits >= input.monthlyUnits * 0.15 && input.monthlyUnits > 0
        ? "Do not treat removals as noise. Assign one owner to demand cleanup and one to inventory cleanup so avoidable removals stop recurring."
        : "Run this result against your FBA or tariff assumptions to get to a real landed margin view.",
      dimWeight > input.weight || input.fulfillmentMode === "FBM"
        ? "Freeze one fulfillment promise before editing packaging, carrier, and storage assumptions all at once."
        : "Keep fulfillment cost reviews tied to the same packaging profile so route changes are measurable.",
      `Re-run only when this same fulfillment lane changes state: ${shippingRerunTrigger.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(shippingScore, 80, 60, {
      good: "Fulfillment profile looks stable",
      warning: "Fulfillment costs need tuning",
      critical: "Fulfillment cost risk is elevated",
    }),
    actionStance: buildActionStance(shippingScore, {
      goAt: 80,
      cautionAt: 60,
    }, {
      go: "Use this fulfillment profile",
      caution: "Tighten packaging or routing first",
      stop: "Do not scale this shipping setup yet",
    }, {
      go: "The current fulfillment setup is efficient enough to use as the operating baseline.",
      caution: "The setup is workable, but packaging, route, or removal pressure should tighten before scale.",
      stop: "The current shipping setup is too exposed to cost or SLA risk to scale confidently.",
    }),
    missingItems: [
      dimWeight > input.weight ? "Packaging redesign check" : "",
      input.removalUnits > 0 ? "Removal-fee review" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      "Compare this with your FBA calculator output.",
      "Recheck packaging if dimensional weight stays high.",
      "Hold the packaging profile constant while testing route or carrier changes.",
      "Validate route promise and carrier SLA.",
    ],
    evidence: shippingCalculatorEvidence,
  } satisfies ToolEvaluation;
}

const complianceRules: Record<
  string,
  { docs: string[]; riskSignals: string[] }
> = {
  toys: {
    docs: ["CPC or market-equivalent safety file", "Age grading evidence", "Lab test report"],
    riskSignals: ["Child-directed product", "Battery or small-parts hazard"],
  },
  electronics: {
    docs: ["Electrical safety test report", "Labeling and plug conformity", "Battery compliance evidence"],
    riskSignals: ["Lithium battery", "Wireless functionality"],
  },
  beauty: {
    docs: ["Ingredient list", "Safety data and claims substantiation", "Packaging labeling proof"],
    riskSignals: ["Topical claim language", "Restricted ingredients"],
  },
  home: {
    docs: ["Material disclosure", "Warning label review", "Product specification sheet"],
    riskSignals: ["Food contact claim", "Heat or flame exposure"],
  },
  grocery: {
    docs: [
      "Ingredient list",
      "Lab test report",
      "Packaging labeling proof",
    ],
    riskSignals: ["Ingestible product", "Shelf-life and traceability"],
  },
  medical: {
    docs: [
      "Product specification sheet",
      "Lab test report",
      "Claims substantiation",
    ],
    riskSignals: ["Medical or therapeutic claim", "Account health escalation risk"],
  },
  automotive: {
    docs: [
      "Product specification sheet",
      "Warning label review",
      "Importer evidence",
    ],
    riskSignals: ["Fitment or emissions sensitivity", "Vehicle safety implications"],
  },
};

export function evaluateComplianceChecker(input: {
  category: string;
  marketplace: string;
  materialProfile: string;
  ageGroup: string;
  claimsProfile: string;
  documents: string[];
}) {
  const normalizedCategory = normalizeCategoryBucket(input.category);
  const rule = complianceRules[normalizedCategory] ?? {
    docs: ["Product specification sheet", "Packaging artwork", "Importer evidence"],
    riskSignals: ["Unclear category mapping"],
  };

  const requiredDocs = [...rule.docs];
  const flags = [...rule.riskSignals];
  const market = input.marketplace;
  const materialProfile = input.materialProfile.toLowerCase();
  const claimsProfile = input.claimsProfile.toLowerCase();

  if (["UK", "DE", "FR", "IT", "ES", "NL", "SE", "PL"].includes(market)) {
    requiredDocs.push("Declaration of conformity", "Responsible person details");
    flags.push("EU or UK listing usually needs marketplace-specific safety and responsible-person data.");
  }

  if (
    materialProfile.includes("battery") ||
    claimsProfile.includes("wireless")
  ) {
    requiredDocs.push("Battery compliance evidence");
    flags.push("Battery handling and transport review");
  }
  if (
    materialProfile.includes("chemical") ||
    materialProfile.includes("aerosol") ||
    materialProfile.includes("cleaner") ||
    materialProfile.includes("alcohol")
  ) {
    requiredDocs.push("Safety data sheet");
    flags.push("Hazmat review may be required before FBA inbound.");
  }
  if (input.ageGroup === "children") {
    requiredDocs.push("Age grading evidence");
    flags.push("Child-product scrutiny is higher than general merchandise.");
  }
  if (
    claimsProfile.includes("organic") ||
    claimsProfile.includes("medical") ||
    claimsProfile.includes("therapeutic") ||
    claimsProfile.includes("fda")
  ) {
    requiredDocs.push("Claims substantiation");
    flags.push("Marketing claims need substantiation evidence, not just packaging language.");
  }
  if (claimsProfile.includes("gpsr") || ["DE", "FR", "IT", "ES", "NL", "SE", "PL"].includes(market)) {
    requiredDocs.push("Warning and safety images");
  }

  const normalizedDocs = Array.from(new Set(requiredDocs));
  const missingDocs = normalizedDocs.filter((doc) => !input.documents.includes(doc));
  const readiness = Math.max(
    0,
    Math.round(((normalizedDocs.length - missingDocs.length) / normalizedDocs.length) * 100),
  );
  const complianceVerdict =
    missingDocs.length > 0
      ? "Do not publish or import this SKU yet"
      : flags.length >= 4
        ? "Use specialist review before this SKU goes live"
        : "Approve the compliant listing path from the current proof stack";
  const complianceOwner =
    missingDocs.length > 0
      ? "Compliance evidence owner"
      : ["children"].includes(input.ageGroup) || /battery|chemical|aerosol|medical|therapeutic|fda/.test(`${materialProfile} ${claimsProfile}`)
        ? "Compliance / claims lead"
        : "Listing compliance owner";
  const complianceMoveNow =
    missingDocs.length > 0
      ? `Collect ${missingDocs.slice(0, 3).join(", ")} before any more listing or inbound work`
      : flags.length >= 4
        ? "Route the SKU through specialist compliance review before approving listing or inbound"
        : "Freeze the approved claims and packaging set and move forward on the listing plan";
  const complianceDoNotCross =
    missingDocs.length > 0
      ? "Do not let copy, packaging, or freight execution get ahead of the proof stack"
      : flags.length >= 4
        ? "Do not rely on generic launch speed when the SKU carries elevated compliance signals"
        : "Do not expand claims beyond what the current proof stack actually supports";
  const complianceRiskBrief =
    missingDocs.length > 0
      ? `${missingDocs.length} required documents are still missing from the current proof stack.`
      : `${flags.length} live risk signals still need to stay tied to the approved claims and packaging set.`;
  const complianceRerunTrigger =
    missingDocs.length > 0
      ? "Re-run only after the missing evidence is added to the same SKU packet"
      : "Re-run when claims, marketplace, or product risk signals materially change";
  const evidence = getCompliancePolicyEvidence({
    category: input.category,
    marketplace: input.marketplace,
    materialProfile: input.materialProfile,
    claimsProfile: input.claimsProfile,
    ageGroup: input.ageGroup,
  });

  return {
    headline: `${complianceVerdict} - ${readiness}% documentation readiness for ${input.marketplace}`,
    summary:
      "Use this compliance read to decide whether the SKU can move, who owns the proof stack, and what launch work must stay closed.",
    metrics: [
      {
        label: "Commercial call",
        value: complianceVerdict,
        detail: `${complianceMoveNow}. ${complianceOwner} owns the next compliance decision.`,
      },
      {
        label: "Open lane",
        value: complianceMoveNow,
        detail: complianceRiskBrief,
      },
      {
        label: "Required documents",
        value: `${normalizedDocs.length}`,
        detail: "Baseline evidence set for this category",
      },
      {
        label: "Missing documents",
        value: `${missingDocs.length}`,
        detail: missingDocs[0] ?? "None selected as missing",
      },
      {
        label: "Risk signals",
        value: `${flags.length}`,
        detail: input.ageGroup === "children" ? "Child-safety review is active" : "General merchandise view",
      },
      {
        label: "Decision owner",
        value: complianceOwner,
        detail: complianceDoNotCross,
      },
      {
        label: "Wrong move",
        value: complianceDoNotCross,
        detail: "Keep the claims set and proof stack bound together until the SKU is really cleared.",
      },
      {
        label: "Re-run trigger",
        value: complianceRerunTrigger,
        detail: "Do not keep reopening this SKU unless the proof packet or risk state actually changed.",
      },
    ],
    recommendations: [
      missingDocs.length
        ? `Do not publish or import yet. Collect these first: ${missingDocs.slice(0, 3).join(", ")}.`
        : "Core evidence appears covered. Validate exact marketplace wording next.",
      "Keep claims and packaging artwork aligned with the documentation you can actually produce.",
      ["children"].includes(input.ageGroup) || /battery|chemical|aerosol|medical|therapeutic|fda/.test(`${materialProfile} ${claimsProfile}`)
        ? "Assign one owner to evidence collection and one to claims review so risky products do not drift into unsupported listing language."
        : "Use specialist review when the product is child-directed, electrical, ingestible, or medically adjacent.",
      missingDocs.length
        ? "Do not let copy, packaging, or freight execution get ahead of the proof stack. Missing documents turn launch work into rework."
        : "Freeze the approved claims set once documentation is matched so downstream packaging or listing edits do not create unsupported risk.",
      `Re-run only when this same compliance lane changes state: ${complianceRerunTrigger.toLowerCase()}.`,
    ],
    alerts: flags,
    status: buildStatus(readiness, 80, 55, {
      good: "Documentation set looks usable",
      warning: "Documentation is incomplete",
      critical: "Compliance evidence is too weak",
    }),
    actionStance: buildActionStance(readiness, {
      goAt: 80,
      cautionAt: 55,
    }, {
      go: "Proceed with the compliant listing plan",
      caution: "Close the evidence gaps first",
      stop: "Do not publish or import yet",
    }, {
      go: "The document stack is strong enough to support the current listing or import plan.",
      caution: "The product may still move forward, but the proof stack should tighten before launch or inbound.",
      stop: "The current evidence is too weak to justify publishing or importing this product safely.",
    }),
    missingItems: missingDocs,
    riskItems: flags,
    nextSteps: [
      `${complianceOwner} should own the first move: ${complianceMoveNow.toLowerCase()}.`,
      "Freeze claims and packaging copy until the required proof set is complete.",
      "Check product claims against available proof.",
      "Escalate electrical, child, ingestible, or medical-adjacent items.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

export function evaluateListingTitleChecker(input: {
  category: string;
  marketplace: string;
  brand: string;
  title: string;
  coreAttributes: string;
}) {
  const profile = getCategoryRuleProfile(input.category);
  const titleWords = tokenizeWords(input.title);
  const brandWords = tokenizeWords(input.brand);
  const brandText = input.brand.trim().toLowerCase();
  const repeatedWords = getRepeatedWords(titleWords).filter(
    ([word]) => word.length > 2 && !brandWords.includes(word),
  );
  const titleLength = input.title.trim().length;
  const bannedPhrases = [
    "best seller",
    "top rated",
    "free shipping",
    "hot sale",
    "100% guaranteed",
    "bonus",
    "exclusive",
    "lightweight",
    "stylish",
    "cheap",
  ].filter((phrase) => input.title.toLowerCase().includes(phrase));
  const attributeTerms = uniqueWords(
    input.coreAttributes
      .split(/[,\n/]+/)
      .flatMap((item) => tokenizeWords(item))
      .filter((word) => word.length > 2),
  );
  const coveredAttributes = attributeTerms.filter((term) =>
    titleWords.includes(term.toLowerCase()),
  );
  const brandStartsTitle =
    brandText.length > 0 ? input.title.trim().toLowerCase().startsWith(brandText) : false;
  const minTitleChars = profile?.titleMinChars ?? 60;
  const maxTitleChars = profile?.titleMaxChars ?? 180;
  const expectsBrandFirst = profile?.brandFirstExpected ?? true;
  const alerts: string[] = [];
  let score = 100;

  if (titleLength < minTitleChars) {
    alerts.push(`Title is short for this category. Aim to cover the product type and key differentiators within roughly ${minTitleChars}+ characters.`);
    score -= 14;
  }
  if (titleLength > maxTitleChars) {
    alerts.push(`Title is longer than the current category guide comfort zone of about ${maxTitleChars} characters.`);
    score -= 20;
  }
  if (bannedPhrases.length) {
    alerts.push(`Marketing-heavy phrasing detected: ${bannedPhrases.join(", ")}.`);
    score -= bannedPhrases.length * 10;
  }
  if (!brandStartsTitle && brandText && expectsBrandFirst) {
    alerts.push("Brand is not leading the title. Many category guides expect clean brand-first structure.");
    score -= 10;
  }
  if (repeatedWords.length) {
    alerts.push(
      `Repeated words suggest stuffing: ${repeatedWords
        .slice(0, 4)
        .map(([word, count]) => `${word} x${count}`)
        .join(", ")}.`,
    );
    score -= Math.min(18, repeatedWords.length * 6);
  }

  const attributeCoverage = percentCovered(coveredAttributes.length, attributeTerms.length);

  if (attributeCoverage < 60 && attributeTerms.length) {
    alerts.push("Core attribute coverage is thin. Important descriptors may be missing from the title.");
    score -= 16;
  }

  score = Math.max(0, score);
  const evidence = [...toEvidence(input.category, 2), ...searchOptimizationEvidence.slice(0, 1)];
  const titleVerdict =
    titleLength > maxTitleChars
      ? "Shorten and clean this title before it goes live"
      : bannedPhrases.length > 0 || repeatedWords.length > 0
        ? "Remove promotional noise before scaling this PDP"
        : !brandStartsTitle && brandText && expectsBrandFirst
          ? "Move the brand to the front before rewriting anything else"
          : attributeCoverage < 60 && attributeTerms.length
            ? "Add the missing buying descriptors before polishing"
            : "Approve one clean title rewrite and freeze it";
  const titleOwner =
    !brandStartsTitle && brandText && expectsBrandFirst
      ? "Catalog / brand owner"
      : repeatedWords.length || bannedPhrases.length > 0
        ? "Copy / merchandising owner"
        : attributeCoverage < 60 && attributeTerms.length
          ? "SEO / merchandising owner"
          : "PDP copy owner";
  const titleMoveNow =
    titleLength > maxTitleChars
      ? "Cut the title back to one clean brand-plus-product-type line before adding anything else"
      : !brandStartsTitle && brandText && expectsBrandFirst
        ? "Put the brand first, then rebuild the rest of the title once"
        : repeatedWords.length || bannedPhrases.length > 0
          ? "Strip repeated and promotional language before touching backend or browse terms"
          : attributeCoverage < 60 && attributeTerms.length
            ? `Add ${attributeTerms.filter((term) => !coveredAttributes.includes(term)).slice(0, 4).join(", ")} before polishing wording`
            : "Lock one rewrite and freeze the title for the next downstream checks";
  const titleDoNotCross =
    repeatedWords.length || bannedPhrases.length > 0
      ? "Do not send traffic into a noisy or stuffed title"
      : attributeCoverage < 60 && attributeTerms.length
        ? "Do not trim wording before the buying signal is complete"
        : "Do not reopen the title after the approved rewrite is locked";
  const titleRiskBrief =
    attributeCoverage < 60 && attributeTerms.length
      ? `${attributeTerms.filter((term) => !coveredAttributes.includes(term)).slice(0, 4).join(", ")} are still missing from the title signal.`
      : titleLength > maxTitleChars
        ? `The title is beyond the category comfort zone of about ${maxTitleChars} characters.`
        : bannedPhrases.length > 0
          ? `Promotional phrasing is still present: ${bannedPhrases.slice(0, 3).join(", ")}.`
          : "The title is close enough that one disciplined rewrite can finish the job.";
  const titleRerunTrigger =
    "Re-run only after the approved rewrite changes the live title structure enough to alter the first blocker";

  return {
    headline: `${titleVerdict}`,
    summary:
      "Use this title read to decide what gets fixed first, who owns it, and what title mistake must stay closed before the PDP goes live.",
    metrics: [
      {
        label: "Commercial call",
        value: titleVerdict,
        detail: `${titleMoveNow}. ${titleOwner} owns the next title decision.`,
      },
      {
        label: "Open lane",
        value: titleMoveNow,
        detail: titleRiskBrief,
      },
      {
        label: "First blocker",
        value:
          titleLength > maxTitleChars
            ? "Title control"
            : bannedPhrases.length
              ? "Promo language"
              : !brandStartsTitle && brandText && expectsBrandFirst
                ? "Brand placement"
                : repeatedWords.length
                  ? "Repetition"
                  : attributeCoverage < 60 && attributeTerms.length
                    ? "Missing descriptors"
                    : "Rewrite discipline",
        detail:
          titleLength > maxTitleChars
            ? `The title is beyond the category comfort zone of about ${maxTitleChars} chars.`
            : bannedPhrases.length
              ? `Remove: ${bannedPhrases.slice(0, 3).join(", ")}.`
              : !brandStartsTitle && brandText && expectsBrandFirst
                ? "Brand should lead before anything else gets rewritten."
                : repeatedWords.length
                  ? `${repeatedWords[0][0]} repeats ${repeatedWords[0][1]} times.`
                  : attributeCoverage < 60 && attributeTerms.length
                    ? "The title is still missing too much buying signal."
                    : "The title is close; keep the next pass narrow.",
      },
      {
        label: "Decision owner",
        value: titleOwner,
        detail: "One owner clears the first title blocker.",
      },
      {
        label: "Execution call",
        value:
          !brandStartsTitle && brandText && expectsBrandFirst
            ? "Move brand to the front"
            : repeatedWords.length
              ? "Strip repeated language"
              : attributeCoverage < 60 && attributeTerms.length
                ? "Add missing descriptors"
                : titleLength > maxTitleChars
                  ? "Shorten before polishing"
                  : "Lock one rewrite",
        detail: "Do one deliberate pass, not layered edits.",
      },
      {
        label: "Do not cross",
        value: titleDoNotCross,
        detail:
          repeatedWords.length || bannedPhrases.length
            ? "Clean the title before any further SEO or traffic work."
            : attributeCoverage < 60 && attributeTerms.length
              ? "Add the missing buying signal before you start polishing."
              : "Freeze the approved version so later tests stay readable.",
      },
      {
        label: "Re-run trigger",
        value: titleRerunTrigger,
        detail: "Do not keep tweaking the title while the same blocker is still unresolved.",
      },
    ],
    recommendations: [
      !brandStartsTitle && brandText && expectsBrandFirst
        ? "Move the brand to the front first, then rebuild the rest around product type and strongest differentiators."
        : repeatedWords.length
          ? "Strip repeated words before adding any new keyword coverage."
          : attributeCoverage < 60 && attributeTerms.length
            ? `Add these missing descriptors now: ${attributeTerms
                .filter((term) => !coveredAttributes.includes(term))
                .slice(0, 4)
                .join(", ")}.`
            : "Keep the rewrite narrow and product-specific.",
      "Approve one rewrite and freeze it.",
      "Do not reopen browse or backend terms until the title is locked.",
      `Re-run only when this same title lane changes state: ${titleRerunTrigger.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 82, 60, {
      good: "Title structure looks usable",
      warning: "Title needs cleanup",
      critical: "Title quality is too weak",
    }),
    actionStance: buildActionStance(score, {
      goAt: 82,
      cautionAt: 60,
    }, {
      go: "Ship the rewrite",
      caution: "Rewrite, then review once",
      stop: "Do not ship yet",
    }, {
      go: "The title is clean enough to lock and carry into browse, backend, or traffic validation.",
      caution: "The title is directionally usable, but one focused cleanup pass should happen before more testing or spend.",
      stop: "The title is still too messy or risky to trust as the live surface for SEO or conversion work.",
    }),
    missingItems: attributeTerms.filter((term) => !coveredAttributes.includes(term)),
    riskItems: alerts,
    nextSteps: [
      `${titleOwner} should own the first move: ${titleMoveNow.toLowerCase()}.`,
      "Keep the product type and strongest differentiators fixed while you test wording cleanup.",
      "Freeze the approved rewrite before touching bullets, backend terms, or ad copy.",
      "Check browse and backend keyword alignment next.",
      "Verify final wording against the category style guide before upload.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

export function evaluateImageComplianceChecker(input: {
  category: string;
  marketplace: string;
  imageCount: number;
  mainImageWhiteBackground: boolean;
  mainImageHasTextOverlay: boolean;
  lifestyleImages: number;
  detailImages: number;
  infographicImages: number;
  variationSwatchesConsistent: boolean;
}) {
  const profile = getCategoryRuleProfile(input.category);
  const recommendedImageCount = profile?.recommendedImageCount ?? 5;
  const minLifestyleImages = profile?.minLifestyleImages ?? 1;
  const minDetailImages = profile?.minDetailImages ?? 2;
  const minInfographicImages = profile?.minInfographicImages ?? 1;
  const overbuiltSet = input.imageCount >= 10;
  const alerts: string[] = [];
  let score = 100;
  const trimTarget = overbuiltSet ? Math.max(1, input.imageCount - Math.max(recommendedImageCount + 2, 8)) : 0;

  if (!input.mainImageWhiteBackground) {
    alerts.push("Main image is not on a declared white background.");
    score -= 28;
  }
  if (input.mainImageHasTextOverlay) {
    alerts.push("Main image text or badges are declared, which is a common compliance failure.");
    score -= 22;
  }
  if (input.imageCount < recommendedImageCount) {
    alerts.push("Image count is thin. The set likely lacks enough conversion-supporting coverage.");
    score -= 15;
  }
  if (input.lifestyleImages < minLifestyleImages) {
    alerts.push("No lifestyle image is declared.");
    score -= 10;
  }
  if (input.detailImages < minDetailImages) {
    alerts.push("Detail coverage is weak. Close-up or scale shots are likely missing.");
    score -= 12;
  }
  if (input.infographicImages < minInfographicImages) {
    alerts.push("Infographic or dimension coverage is below the category baseline.");
    score -= 8;
  }
  if (!input.variationSwatchesConsistent) {
    alerts.push("Variation image set looks inconsistent across child offers.");
    score -= 12;
  }

  score = Math.max(0, score);
  const supportCoverage = percentCovered(
    [
      input.lifestyleImages >= minLifestyleImages,
      input.detailImages >= minDetailImages,
      input.infographicImages >= minInfographicImages,
      input.imageCount >= recommendedImageCount,
    ].filter(Boolean).length,
    4,
  );
  const evidence = toEvidence(input.category);
  const imageVerdict =
    !input.mainImageWhiteBackground || input.mainImageHasTextOverlay
      ? "Fix the hero image before anything else"
      : !input.variationSwatchesConsistent
        ? "Repair variation image consistency before scaling the gallery"
        : input.imageCount < recommendedImageCount || input.detailImages < minDetailImages || input.lifestyleImages < minLifestyleImages
          ? "Fill the image-role gaps before launch"
          : overbuiltSet
            ? "Trim and reorder this gallery before adding more creative"
            : "Approve this gallery and freeze the hero frame";
  const imageOwner =
    !input.mainImageWhiteBackground || input.mainImageHasTextOverlay
      ? "Image compliance owner"
      : !input.variationSwatchesConsistent
        ? "Variation image owner"
        : "Creative planning lead";
  const imageMoveNow =
    !input.mainImageWhiteBackground || input.mainImageHasTextOverlay
      ? "Repair the main image so it is policy-safe before briefing any secondary optimization"
      : !input.variationSwatchesConsistent
        ? "Normalize child image logic before changing sequence or adding more frames"
        : overbuiltSet
          ? `Reorder the first 4-5 frames and cut about ${trimTarget} weak images`
          : "Fill the highest-priority image-role gaps and then freeze the sequence";
  const imageDoNotCross =
    !input.mainImageWhiteBackground || input.mainImageHasTextOverlay
      ? "Do not brief retouch, ads, or A/B tests until the hero image is policy-safe"
      : !input.variationSwatchesConsistent
        ? "Do not scale inconsistent child galleries across the family"
        : "Do not keep adding images when sequence and role coverage are the real problem";
  const imageRiskBrief =
    !input.mainImageWhiteBackground || input.mainImageHasTextOverlay
      ? "The hero frame is still a launch gate, not a polish problem."
      : `${input.lifestyleImages} lifestyle, ${input.detailImages} detail, and ${input.infographicImages} infographic frames currently support the gallery.`;
  const imageRerunTrigger =
    "Re-run only after the hero frame, gallery role coverage, or child-image consistency materially changes";

  return {
    headline: `${imageVerdict} - ${score}% image-set readiness for ${input.marketplace}`,
    summary:
      "Use this gallery read to decide whether the main image blocks launch, which image role is missing, and who owns the next gallery move.",
    metrics: [
      {
        label: "Commercial call",
        value: imageVerdict,
        detail: `${imageMoveNow}. ${imageOwner} owns the next gallery decision.`,
      },
      {
        label: "Open lane",
        value: imageMoveNow,
        detail: imageRiskBrief,
      },
      {
        label: "Main image rule",
        value: input.mainImageWhiteBackground && !input.mainImageHasTextOverlay ? "Pass" : "Needs review",
        detail: input.mainImageWhiteBackground ? "White background declared" : "Background rule not met",
      },
      {
        label: "Image count",
        value: `${input.imageCount}`,
        detail: `Category target is about ${recommendedImageCount} images`,
      },
      {
        label: "Support coverage",
        value: `${supportCoverage}%`,
        detail: `${input.lifestyleImages} lifestyle, ${input.detailImages} detail, ${input.infographicImages} infographic`,
      },
      {
        label: "Variation consistency",
        value: input.variationSwatchesConsistent ? "Consistent" : "At risk",
        detail: "Checks whether child image sets stay structurally aligned",
      },
      {
        label: "Decision owner",
        value: imageOwner,
        detail: imageDoNotCross,
      },
      {
        label: "Wrong move",
        value: imageDoNotCross,
        detail: "Keep the hero gate and gallery-role work separate enough that the next review is meaningful.",
      },
      {
        label: "Re-run trigger",
        value: imageRerunTrigger,
        detail: "Do not keep tweaking the gallery while the same gate is still open.",
      },
    ],
    recommendations: [
      input.mainImageWhiteBackground && !input.mainImageHasTextOverlay
        ? overbuiltSet
          ? `Main image input looks workable. The likely win is slot order and pruning about ${trimTarget} weaker secondary frames, not adding more images.`
          : "Main image input looks workable. Tighten the rest of the set around scale, detail, and context."
        : "Fix the main image first before spending time on secondary-image optimization.",
      input.detailImages < minDetailImages
        ? "Add close-up or in-use detail shots that clarify texture, size, fit, or included components."
        : overbuiltSet
          ? "Detail coverage is already present. Focus on whether the strongest detail shot appears early enough in the sequence."
          : "Detail coverage is usable for a first pass.",
      input.lifestyleImages < minLifestyleImages
        ? "Add at least one context image so the buyer can understand use and scale quickly."
        : overbuiltSet
          ? "Lifestyle coverage is present. Make sure it supports, rather than crowds out, the clearest product-proof frames."
          : "Lifestyle coverage is present; make sure it does not replace technical detail.",
      !input.variationSwatchesConsistent
        ? "Do not scale the gallery across children yet. Fix variation consistency first so shoppers do not get mixed signals."
        : "Assign one owner to compliance gates and one to sequence quality so the set is both safe and persuasive.",
      !input.mainImageWhiteBackground || input.mainImageHasTextOverlay
        ? "Do not brief retouch, ads, or A/B tests until the hero image is policy-safe. The main image is the gate, not a detail."
        : "Freeze the hero frame once approved so secondary-image experiments do not keep resetting the gallery baseline.",
      `Re-run only when this same gallery lane changes state: ${imageRerunTrigger.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "Image set looks usable",
      warning: "Image set needs cleanup",
      critical: "Image compliance risk is high",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Ship the gallery",
      caution: "Fix weak slots, then ship",
      stop: "Fix now before launch",
    }, {
      go: "The gallery is strong enough to freeze the hero and refine secondary slot order without blocking launch.",
      caution: "The gallery is close, but one or two role gaps or sequencing issues should be fixed before scaling traffic.",
      stop: "The current image set still has compliance or conversion gaps that make launch or testing premature.",
    }),
    missingItems: [
      input.mainImageWhiteBackground ? "" : "White-background main image",
      input.mainImageHasTextOverlay ? "Main image without text overlays" : "",
      input.lifestyleImages < minLifestyleImages ? "Lifestyle image" : "",
      input.detailImages < minDetailImages ? `At least ${minDetailImages} detail or scale images` : "",
      input.infographicImages < minInfographicImages ? "Infographic or dimension image" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${imageOwner} should own the first move: ${imageMoveNow.toLowerCase()}.`,
      overbuiltSet
        ? `Reorder the first 4-5 frames and remove roughly ${trimTarget} redundant weak images next.`
        : "Fill the highest-priority image-role gaps next.",
      "Freeze the main image and first three support frames before broader gallery edits.",
      overbuiltSet
        ? "Recheck the final image sequence against buyer objections, hero-frame clarity, and tail-frame duplication."
        : "Recheck title and variation structure after the image set is stable.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

export function evaluateVariationRelationshipChecker(input: {
  category: string;
  variationTheme: string;
  childCount: number;
  sameCoreProduct: boolean;
  sameBrand: boolean;
  differsOnlyByTheme: boolean;
  mixedBundleLogic: boolean;
  titlesAligned: boolean;
}) {
  const profile = getCategoryRuleProfile(input.category);
  const allowedVariationThemes = profile?.allowedVariationThemes ?? [];
  const standaloneLikely =
    input.childCount <= 1 &&
    input.sameCoreProduct &&
    input.sameBrand &&
    !input.mixedBundleLogic;
  const mergeProofReady =
    input.childCount >= 2 &&
    input.sameCoreProduct &&
    input.sameBrand &&
    input.differsOnlyByTheme &&
    !input.mixedBundleLogic;
  const alerts: string[] = [];
  let score = 100;

  if (!input.sameCoreProduct) {
    alerts.push("Child offers do not appear to represent the same core product.");
    score -= 28;
  }
  if (!input.sameBrand) {
    alerts.push("Brand mismatch inside one variation family is a strong rejection risk.");
    score -= 18;
  }
  if (!input.differsOnlyByTheme) {
    alerts.push("Children appear to differ by more than the selected variation theme.");
    score -= 22;
  }
  if (input.mixedBundleLogic) {
    alerts.push("Bundle or pack logic is being mixed into the variation family.");
    score -= 20;
  }
  if (!input.titlesAligned) {
    alerts.push("Child titles are not aligned, which often signals a broken parent-child structure.");
    score -= 10;
  }
  if (allowedVariationThemes.length && !allowedVariationThemes.includes(input.variationTheme)) {
    alerts.push(`The chosen variation theme is uncommon for this category. Preferred themes are ${allowedVariationThemes.join(", ")}.`);
    score -= 12;
  }
  if (input.childCount < 2) {
    alerts.push("Variation family needs at least two valid child offers to be meaningful.");
    score -= 12;
  }

  score = Math.max(0, score);
  const evidence = toEvidence(input.category);
  const relationshipVerdict =
    standaloneLikely
      ? "Keep this offer standalone until a real second child exists"
      : mergeProofReady
        ? "Approve this parent-child family structure"
        : "Split this family before any catalog upload";
  const relationshipOwner =
    standaloneLikely
      ? "Catalog structure owner"
      : mergeProofReady
        ? "Variation owner"
        : "Catalog cleanup lead";
  const relationshipMoveNow =
    standaloneLikely
      ? "Leave this ASIN standalone and stop forcing a family around it"
      : mergeProofReady
        ? "Lock the child-ASIN map and validate the final variation theme in the category template"
        : "Break apart unrelated children before attempting any parent-child update";
  const relationshipDoNotCross =
    standaloneLikely
      ? "Do not force a parent-child family when the second valid child does not exist"
      : mergeProofReady
        ? "Do not let titles, bundles, or extra attributes drift once the family logic is valid"
        : "Do not try to rescue a broken family with better copy or images";
  const relationshipRiskBrief =
    mergeProofReady
      ? `${input.childCount} child offers still fit one core product, one brand, and one valid theme.`
      : standaloneLikely
        ? "The current offer still behaves like a standalone PDP, not a real family."
        : `${alerts.length} structure flags are already telling you this family is forced or mixed.`;
  const relationshipRerunTrigger =
    mergeProofReady
      ? "Re-run only if the child map, variation theme, or core-product logic changes"
      : "Re-run after the family is materially re-mapped or a true second child is ready";

  return {
    headline: `${relationshipVerdict} - ${score}% variation-family readiness`,
    summary:
      "Use this variation check to decide whether the family should stay standalone, go live as a clean parent-child structure, or be split before upload.",
    metrics: [
      {
        label: "Commercial call",
        value: relationshipVerdict,
        detail: `${relationshipMoveNow}. ${relationshipOwner} owns the next catalog-structure move.`,
      },
      {
        label: "Open lane",
        value: relationshipMoveNow,
        detail: relationshipRiskBrief,
      },
      {
        label: "Variation theme",
        value: input.variationTheme,
        detail: allowedVariationThemes.length
          ? `Preferred in this category: ${allowedVariationThemes.slice(0, 4).join(", ")}`
          : `${input.childCount} child offers declared`,
      },
      {
        label: "Core-product match",
        value: input.sameCoreProduct ? "Aligned" : "Broken",
        detail: input.sameCoreProduct ? "Children appear to be the same item family" : "Different products are likely mixed together",
      },
      {
        label: "Theme purity",
        value: input.differsOnlyByTheme ? "Valid" : "Needs review",
        detail: input.differsOnlyByTheme ? "Children differ only by the selected theme" : "More than one change axis is present",
      },
      {
        label: "Title consistency",
        value: input.titlesAligned ? "Aligned" : "Off-pattern",
        detail: "Helps catch forced or duplicated child listing structures",
      },
      {
        label: "Decision owner",
        value: relationshipOwner,
        detail: relationshipDoNotCross,
      },
      {
        label: "Wrong move",
        value: relationshipDoNotCross,
        detail: "Keep the structure decision primary until the family itself is clean.",
      },
      {
        label: "Re-run trigger",
        value: relationshipRerunTrigger,
        detail: "Do not keep toggling family logic without a real catalog state change.",
      },
    ],
    recommendations: [
      standaloneLikely
        ? "Do not force this into a parent-child family unless you can prove a real child selector or a second valid child ASIN exists."
        : mergeProofReady
          ? "Core variation logic looks usable. Capture the child-ASIN map and confirm the final flat-file theme mapping before upload."
          : "Split unrelated children out of the family before attempting to upload or update the parent.",
      input.mixedBundleLogic
        ? "Move bundles, kits, or different pack structures into separate offers unless the category explicitly supports that theme."
        : standaloneLikely
          ? "Treat this as a standalone PDP first, then revisit variation only if merchandising or catalog data shows a true family."
          : mergeProofReady
            ? "Keep the family clean by changing only the true theme value between children."
            : "Keep bundle logic separate from color, size, or scent variation themes.",
      input.titlesAligned
        ? standaloneLikely
          ? "If you later build a family, keep titles aligned and change only the true theme value between children."
          : mergeProofReady
            ? "Titles are structurally aligned. Preserve that by changing only the true theme value between children."
            : "Titles are structurally aligned. Keep only the true theme value changing between children."
        : "Normalize child titles so only the variation-specific part changes.",
      mergeProofReady
        ? "Assign one owner to catalog structure and one to content cleanup. A valid family still breaks when title, image, and flat-file edits happen ad hoc."
        : "Freeze one child set and prove the family logic there before you try to merge everything at once.",
      `Re-run only when this same variation lane changes state: ${relationshipRerunTrigger.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 60, {
      good: "Variation logic looks usable",
      warning: "Variation setup needs cleanup",
      critical: "Variation family is likely invalid",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 60,
    }, {
      go: standaloneLikely ? "Keep standalone" : "Ship the family",
      caution: standaloneLikely ? "Validate before forcing a family" : "Clean the family, then ship",
      stop: "Hold the family change",
    }, {
      go: standaloneLikely
        ? "Current evidence suggests the ASIN should stay standalone unless a second valid child is ready."
        : "The family is coherent enough to proceed without turning catalog structure into the next avoidable risk.",
      caution: standaloneLikely
        ? "Do one proof pass before creating a parent-child structure that may not be needed."
        : "The family is close, but one structural issue should be cleaned up before merge or upload.",
      stop: "The parent-child logic is still too weak or too mixed to change live catalog structure safely.",
    }),
    missingItems: [
      input.sameCoreProduct ? "" : "One clear core product per family",
      input.sameBrand ? "" : "Single-brand family alignment",
      input.differsOnlyByTheme ? "" : "Children that differ only by the chosen theme",
      input.titlesAligned ? "" : "Aligned child title structure",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${relationshipOwner} should own the first move: ${relationshipMoveNow.toLowerCase()}.`,
      standaloneLikely
        ? "Validate whether the category even benefits from variation before doing catalog work."
        : "Validate the final theme attribute in the category template.",
      "Freeze titles, images, and theme values on one clean child set before broader family edits.",
      "Review titles and images after the family structure is clean.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

export function evaluateBrowseSearchKeywordChecker(input: {
  category: string;
  title: string;
  backendTerms: string;
  coreKeywords: string;
  itemType: string;
}) {
  const titleWords = uniqueWords(tokenizeWords(input.title).filter((word) => word.length > 2));
  const backendWords = uniqueWords(
    tokenizeWords(input.backendTerms).filter((word) => word.length > 2),
  );
  const coreWords = uniqueWords(
    tokenizeWords(input.coreKeywords).filter((word) => word.length > 2),
  );
  const itemTypeWords = uniqueWords(tokenizeWords(input.itemType).filter((word) => word.length > 2));
  const overlap = backendWords.filter((word) => titleWords.includes(word));
  const missingCore = coreWords.filter(
    (word) => !titleWords.includes(word) && !backendWords.includes(word),
  );
  const backendRepeated = getRepeatedWords(tokenizeWords(input.backendTerms)).filter(
    ([word]) => word.length > 2,
  );
  const profile = getCategoryRuleProfile(input.category);
  const categoryBucket = normalizeCategoryBucket(input.category);
  const titleMatchCount = itemTypeWords.filter((word) => titleWords.includes(word)).length;
  const categorySignal = itemTypeWords.length
    ? percentCovered(titleMatchCount, itemTypeWords.length)
    : categoryBucket !== "general"
      ? 70
      : 50;
  const browseSignalFloor = profile?.browseSignalFloor ?? 60;
  let score = 100;
  const alerts: string[] = [];

  if (missingCore.length) {
    alerts.push(`Core keyword coverage is incomplete: ${missingCore.slice(0, 4).join(", ")}.`);
    score -= Math.min(20, missingCore.length * 6);
  }
  if (overlap.length > Math.max(2, Math.floor(backendWords.length * 0.45))) {
    alerts.push("Backend search terms overlap too heavily with the title.");
    score -= 14;
  }
  if (backendRepeated.length) {
    alerts.push("Repeated backend terms suggest keyword stuffing rather than cleaner coverage.");
    score -= Math.min(14, backendRepeated.length * 5);
  }
  if (categorySignal < browseSignalFloor) {
    alerts.push("Title and item-type wording do not align strongly with the selected browse path.");
    score -= 16;
  }

  score = Math.max(0, score);
  const evidence = toEvidence(input.category);
  const browseVerdict =
    missingCore.length > 0
      ? "Do not publish this keyword map yet"
      : overlap.length > Math.max(2, Math.floor(backendWords.length * 0.45))
        ? "Clean backend waste before publishing"
        : categorySignal < browseSignalFloor
          ? "Repair browse-path wording before publishing"
          : "Approve this browse-search structure as the working baseline";
  const browseOwner =
    missingCore.length > 0
      ? "SEO / merchandising owner"
      : overlap.length > Math.max(2, Math.floor(backendWords.length * 0.45)) || backendRepeated.length > 0
        ? "Catalog owner"
        : "Discoverability owner";
  const browseMoveNow =
    missingCore.length > 0
      ? `Place ${missingCore.slice(0, 4).join(", ")} more cleanly before touching anything else`
      : overlap.length > Math.max(2, Math.floor(backendWords.length * 0.45)) || backendRepeated.length > 0
        ? "Rewrite backend terms once so hidden search space stops repeating title language"
        : categorySignal < browseSignalFloor
          ? "Repair item-type and browse wording alignment before publishing"
          : "Freeze this keyword map and use it as the discoverability baseline";
  const browseDoNotCross =
    missingCore.length > 0
      ? "Do not publish a browse-search structure with missing core descriptors"
      : overlap.length > Math.max(2, Math.floor(backendWords.length * 0.45)) || backendRepeated.length > 0
        ? "Do not waste backend bytes on repetition or title overlap"
        : "Do not change browse path and keyword distribution at the same time";
  const browseRiskBrief =
    missingCore.length > 0
      ? `${missingCore.slice(0, 4).join(", ")} are still missing from title and backend coverage.`
      : categorySignal < browseSignalFloor
        ? `Browse-path fit is only ${categorySignal}% against a floor near ${browseSignalFloor}%.`
        : "The current browse-search structure is clean enough to act as the discoverability baseline.";
  const browseRerunTrigger =
    "Re-run only after the keyword map, browse path, or item-type wording materially changes";

  return {
    headline: `${browseVerdict} - ${score}% browse-and-search fit`,
    summary:
      "Use this browse-search read to decide whether the keyword map can publish now, which discoverability blocker owns the next move, and what must stay closed.",
    metrics: [
      {
        label: "Commercial call",
        value: browseVerdict,
        detail: `${browseMoveNow}. ${browseOwner} owns the next discoverability decision.`,
      },
      {
        label: "Open lane",
        value: browseMoveNow,
        detail: browseRiskBrief,
      },
      {
        label: "Core keyword coverage",
        value: `${percentCovered(coreWords.length - missingCore.length, coreWords.length)}%`,
        detail: missingCore[0] ?? "No obvious missing core keyword",
      },
      {
        label: "Title-backend overlap",
        value: `${overlap.length}`,
        detail: overlap[0] ?? "Low duplication signal",
      },
      {
        label: "Browse-path fit",
        value: `${categorySignal}%`,
        detail: itemTypeWords[0] ? `${itemTypeWords[0]} | floor ~${browseSignalFloor}%` : `${categoryBucket} | floor ~${browseSignalFloor}%`,
      },
      {
        label: "Backend stuffing risk",
        value: `${backendRepeated.length}`,
        detail: backendRepeated[0] ? `${backendRepeated[0][0]} repeats ${backendRepeated[0][1]} times` : "No strong repetition signal",
      },
      {
        label: "Decision owner",
        value: browseOwner,
        detail: browseDoNotCross,
      },
      {
        label: "Wrong move",
        value: browseDoNotCross,
        detail: "Keep the discoverability map stable enough that the next ranking read means something.",
      },
      {
        label: "Re-run trigger",
        value: browseRerunTrigger,
        detail: "Do not keep rotating the keyword map while the same blocker is still live.",
      },
    ],
    recommendations: [
      missingCore.length
        ? `Do not publish this keyword structure yet. Place these missing descriptors more cleanly: ${missingCore.slice(0, 4).join(", ")}.`
        : "Core keyword coverage looks acceptable for a first pass.",
      overlap.length > 2
        ? "Trim duplicated title terms out of backend keywords and use the backend space for new descriptors."
        : "Backend terms are not overly duplicative. Focus next on cleaner browse and item-type alignment.",
      categorySignal < browseSignalFloor
        ? "Recheck the selected category path and item-type wording before publishing."
        : "Browse-path wording is directionally aligned with the selected category.",
      backendRepeated.length
        ? "Assign one owner to de-stuff backend terms and one to browse-path alignment so discoverability fixes stay disciplined."
        : "Freeze the item-type and category path while cleaning keyword distribution so you can isolate the real discoverability change.",
      overlap.length > 2 || backendRepeated.length > 0
        ? "Do not waste backend bytes on repetition. Hidden search space is too scarce to spend on words the title already owns."
        : "Keep this keyword map stable while you test rank or conversion changes, or you will not know whether discoverability really improved.",
      `Re-run only when this same browse-search lane changes state: ${browseRerunTrigger.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "Keyword structure looks usable",
      warning: "Keyword structure needs cleanup",
      critical: "Browse and search fit is weak",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Use this browse-search structure",
      caution: "Clean the keyword map first",
      stop: "Do not publish this structure yet",
    }, {
      go: "The browse and search structure is clean enough to publish as the working discoverability baseline.",
      caution: "The structure has a usable core, but overlap or missing terms should be cleaned before publishing.",
      stop: "The current browse-search setup is too weak or too wasteful to publish confidently.",
    }),
    missingItems: missingCore,
    riskItems: alerts,
    nextSteps: [
      `${browseOwner} should own the first move: ${browseMoveNow.toLowerCase()}.`,
      "Freeze browse path and item type while the keyword redistribution is tested.",
      "Recheck the title only after the keyword map is stable.",
      "Approve the final browse path and item type against the category template.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

export function evaluateSearchOptimization(input: {
  category: string;
  title: string;
  backendTerms: string;
  targetKeywords: string;
  itemType: string;
  currentRank: number;
  reviewCount: number;
  hasAPlus: boolean;
}) {
  const titleWords = uniqueWords(tokenizeWords(input.title).filter((word) => word.length > 2));
  const backendWords = uniqueWords(tokenizeWords(input.backendTerms).filter((word) => word.length > 2));
  const targetWords = uniqueWords(tokenizeWords(input.targetKeywords).filter((word) => word.length > 2));
  const itemTypeWords = uniqueWords(tokenizeWords(input.itemType).filter((word) => word.length > 2));
  const profile = getCategoryRuleProfile(input.category);
  const missingTargets = targetWords.filter(
    (word) => !titleWords.includes(word) && !backendWords.includes(word),
  );
  const overlap = backendWords.filter((word) => titleWords.includes(word));
  const itemTypeCoverage = itemTypeWords.length
    ? percentCovered(
        itemTypeWords.filter((word) => titleWords.includes(word)).length,
        itemTypeWords.length,
      )
    : 70;
  const titleLength = input.title.trim().length;
  const minTitleChars = profile?.titleMinChars ?? 45;
  const maxTitleChars = profile?.titleMaxChars ?? 180;
  let score = 100;
  const alerts: string[] = [];

  if (missingTargets.length) {
    alerts.push(`Target keyword coverage is incomplete: ${missingTargets.slice(0, 4).join(", ")}.`);
    score -= Math.min(24, missingTargets.length * 6);
  }
  if (overlap.length > Math.max(2, Math.floor(backendWords.length * 0.45))) {
    alerts.push("Backend search terms overlap too heavily with visible title copy.");
    score -= 14;
  }
  if (itemTypeCoverage < 60) {
    alerts.push("Item-type wording does not align strongly with the visible title.");
    score -= 14;
  }
  if (titleLength < minTitleChars) {
    alerts.push(`Visible title is short for the current category profile at roughly ${minTitleChars}+ recommended characters.`);
    score -= 10;
  }
  if (titleLength > maxTitleChars) {
    alerts.push(`Visible title is longer than the current category comfort zone of about ${maxTitleChars} characters.`);
    score -= 12;
  }
  if (!input.hasAPlus) {
    alerts.push("A+ is not visible, which weakens conversion support for organic ranking over time.");
    score -= 8;
  }
  if (input.reviewCount < 50) {
    alerts.push("Review proof is still thin, which can limit conversion-supported ranking gains.");
    score -= 8;
  }
  if (input.currentRank > 0 && input.currentRank > 30000) {
    alerts.push("Current BSR is weak enough that discoverability or conversion support may still be lagging.");
    score -= 10;
  }

  score = Math.max(0, score);
  const evidence = toEvidence(input.category);
  const executionCall =
    missingTargets.length > 0
      ? "Close missing target coverage first"
      : overlap.length > Math.max(2, Math.floor(backendWords.length * 0.45))
        ? "Strip backend duplication before any broader SEO work"
        : itemTypeCoverage < 60
          ? "Repair browse wording alignment first"
          : !input.hasAPlus || input.reviewCount < 50
            ? "Strengthen conversion proof before broader SEO work"
            : input.currentRank > 0 && input.currentRank > 30000
              ? "Open one relevance-plus-conversion recovery lane now"
              : "Run one controlled search-surface revision";
  const decisionOwner =
    missingTargets.length > 0
      ? "SEO / listing lead"
      : overlap.length > Math.max(2, Math.floor(backendWords.length * 0.45))
        ? "SEO lead"
        : itemTypeCoverage < 60
          ? "Catalog / SEO lead"
          : !input.hasAPlus || input.reviewCount < 50
            ? "Conversion / proof lead"
            : input.currentRank > 0 && input.currentRank > 30000
              ? "Search recovery lead"
              : "SEO lead";
  const firstMove =
    missingTargets.length > 0
      ? `Place the missing targets into the title, backend terms, or both before opening any other search work`
      : overlap.length > Math.max(2, Math.floor(backendWords.length * 0.45))
        ? "Trim duplicate visible words out of the backend field and keep the rest of the listing frozen"
        : itemTypeCoverage < 60
          ? "Repair browse wording first and keep title and backend churn closed"
          : !input.hasAPlus || input.reviewCount < 50
            ? "Repair conversion proof first before asking search edits to carry the lift"
            : input.currentRank > 0 && input.currentRank > 30000
              ? "Open one recovery lane that combines relevance cleanup with proof repair"
              : "Run one focused title-plus-backend revision and freeze every other search surface";
  const doNotCrossLine =
    missingTargets.length > 0
      ? "Do not buy rank before coverage is complete"
      : overlap.length > Math.max(2, Math.floor(backendWords.length * 0.45))
        ? "Do not waste backend bytes on duplicates"
        : itemTypeCoverage < 60
          ? "Do not chase rank before browse fit is clean"
          : !input.hasAPlus || input.reviewCount < 50
            ? "Do not buy traffic into a weak proof stack"
            : input.currentRank > 0 && input.currentRank > 30000
              ? "Do not treat a weak rank signal like a title-only problem"
              : "Do not turn one SEO pass into a full rewrite";
  const executionReason =
    missingTargets.length > 0
      ? "Visible keyword gaps still make later SEO polishing lower leverage."
      : overlap.length > Math.max(2, Math.floor(backendWords.length * 0.45))
        ? "Hidden search terms are wasting bytes on duplicate coverage."
        : itemTypeCoverage < 60
          ? "Browse wording is still not reinforcing the visible title strongly enough."
          : !input.hasAPlus || input.reviewCount < 50
            ? "Weak conversion proof can cap ranking gains even when relevance improves."
            : input.currentRank > 0 && input.currentRank > 30000
              ? "The rank signal is weak enough that small copy edits alone are unlikely to solve it."
              : "The listing is coherent enough now to test one focused search change at a time.";

  return {
    headline:
      missingTargets.length > 0
        ? "Close relevance gaps before pushing search any harder"
        : overlap.length > Math.max(2, Math.floor(backendWords.length * 0.45))
          ? "Clean backend waste before broader SEO work"
          : itemTypeCoverage < 60
            ? "Repair browse fit before broader search work"
            : score >= 84
              ? "Run one controlled search revision"
              : score >= 62
                ? "Fix the first search blocker before pushing ranking harder"
                : "Do not push ranking yet",
    summary:
      "This search call decides whether the first move belongs in keyword coverage, browse fit, backend cleanup, or proof repair before the team burns time reopening every search surface at once.",
    metrics: [
      {
        label: "Commercial call",
        value: executionCall,
        detail: `${firstMove}. ${decisionOwner} owns the first response lane.`,
      },
      {
        label: "Open lane",
        value: firstMove,
        detail: executionReason,
      },
      {
        label: "First blocker",
        value:
          missingTargets.length > 0
            ? "Missing target coverage"
            : overlap.length > Math.max(2, Math.floor(backendWords.length * 0.45))
              ? "Backend duplication"
              : itemTypeCoverage < 60
                ? "Browse wording"
                : !input.hasAPlus || input.reviewCount < 50
                  ? "Conversion proof"
                  : input.currentRank > 0 && input.currentRank > 30000
                    ? "Weak rank signal"
                    : "Controlled revision",
        detail:
          missingTargets.length > 0
            ? `Missing: ${missingTargets.slice(0, 3).join(", ")}.`
            : overlap.length > Math.max(2, Math.floor(backendWords.length * 0.45))
              ? "Backend terms are wasting bytes on duplicate visible words."
              : itemTypeCoverage < 60
                ? "Browse wording is not reinforcing the title strongly enough."
                : !input.hasAPlus || input.reviewCount < 50
                  ? "The page still needs more proof before broader ranking work."
                  : input.currentRank > 0 && input.currentRank > 30000
                    ? "Rank is weak enough that small polish is not the right story."
                    : "The listing is coherent enough for one contained test.",
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Execution call",
        value: executionCall,
        detail: "Change one search surface at a time.",
      },
      {
        label: "Do not cross",
        value: doNotCrossLine,
        detail: executionReason,
      },
    ],
    recommendations: [
      missingTargets.length
        ? `Place these missing targets first: ${missingTargets.slice(0, 4).join(", ")}.`
        : overlap.length > 2
          ? "Trim duplicate visible words out of the backend field next."
          : itemTypeCoverage < 60
            ? "Repair browse wording before broader SEO work."
            : !input.hasAPlus || input.reviewCount < 50
              ? "Strengthen proof before adding more ranking pressure."
              : "Keep the next SEO pass narrow.",
      "Freeze the first revision before opening any other search surface.",
      "Do not rerun until the active blocker changes on the live PDP.",
      `Re-run only when this same lane changes state: ${firstMove.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "Search response board looks usable",
      warning: "Search optimization needs cleanup",
      critical: "Search optimization is weak",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Run this SEO pass",
      caution: "Tighten relevance first",
      stop: "Do not push harder on ranking yet",
    }, {
      go: "The listing is relevant and supported enough to justify one focused search revision.",
      caution: "The search path is plausible, but relevance structure or conversion support should tighten first.",
      stop: "The current listing is too weak on relevance or conversion proof to justify pushing ranking harder yet.",
    }),
    missingItems: missingTargets,
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${firstMove.toLowerCase()}.`,
      "Redistribute target keywords between title and backend terms once.",
      "Freeze one item-type path while the next relevance rewrite is tested.",
      "Strengthen A+ and review proof before more ranking pressure if conversion support is thin.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

export function evaluateVariationStrategy(input: {
  category: string;
  variationTheme: string;
  childCount: number;
  sameCoreProduct: boolean;
  sameBrand: boolean;
  differsOnlyByTheme: boolean;
  mixedBundleLogic: boolean;
  titlesAligned: boolean;
  reviewBalanceHealthy: boolean;
}) {
  const profile = getCategoryRuleProfile(input.category);
  const allowedThemes = profile?.allowedVariationThemes ?? [];
  let score = 100;
  const alerts: string[] = [];

  if (!input.sameCoreProduct) {
    alerts.push("Children do not look like the same core product, which usually means the family should be split.");
    score -= 28;
  }
  if (!input.sameBrand) {
    alerts.push("Brand mismatch inside one family is a strong signal to separate the offers.");
    score -= 18;
  }
  if (!input.differsOnlyByTheme) {
    alerts.push("Children appear to differ by more than the declared variation theme.");
    score -= 22;
  }
  if (input.mixedBundleLogic) {
    alerts.push("Bundle or pack logic is mixed into the family and may deserve a separate parent.");
    score -= 18;
  }
  if (!input.titlesAligned) {
    alerts.push("Child titles are not structurally aligned, which makes the family look forced.");
    score -= 10;
  }
  if (!input.reviewBalanceHealthy) {
    alerts.push("Review concentration may be hiding different buyer expectations across children.");
    score -= 8;
  }
  if (input.childCount < 2) {
    alerts.push("A variation family with fewer than two meaningful children is not commercially useful.");
    score -= 12;
  }
  if (allowedThemes.length > 0 && !allowedThemes.includes(input.variationTheme)) {
    alerts.push(`The chosen variation theme is not typical for this category profile. Expected themes look closer to: ${allowedThemes.join(", ")}.`);
    score -= 18;
  }

  score = Math.max(0, score);
  const evidence = toEvidence(input.category);
  const strategy =
    input.sameCoreProduct &&
    input.sameBrand &&
    input.differsOnlyByTheme &&
    !input.mixedBundleLogic
      ? "Keep or merge under one parent"
      : "Split into separate offers or parents";
  const strategyVerdict =
    strategy.startsWith("Keep")
      ? "Approve this variation strategy"
      : "Split this variation strategy before launch";
  const strategyOwner =
    strategy.startsWith("Keep")
      ? "Variation strategy owner"
      : "Catalog strategy lead";
  const strategyMoveNow =
    strategy.startsWith("Keep")
      ? "Lock the parent-child structure and keep only the true theme value changing between children"
      : "Separate the offers or parents before any merchandising cleanup starts";
  const strategyDoNotCross =
    strategy.startsWith("Keep")
      ? "Do not reopen the family logic once the valid theme and core-product match are locked"
      : "Do not try to save a broken family with title, image, or pricing cleanup";
  const strategyRiskBrief =
    strategy.startsWith("Keep")
      ? `${input.childCount} children still appear to fit one brand, one core product, and one allowed theme.`
      : `${alerts.length} family-structure warnings are already telling you this merge is unreliable.`;
  const strategyRerunTrigger =
    strategy.startsWith("Keep")
      ? "Re-run only if the child map, allowed theme, or review balance changes materially"
      : "Re-run after the family is actually split or rebuilt around one valid theme";

  return {
    headline: `${strategyVerdict} - ${strategy} at ${score}% strategy confidence`,
    summary:
      "Use this strategy read to decide whether the family can stay merged, who owns the structure, and what merchandising work must stay closed until that decision is done.",
    metrics: [
      {
        label: "Commercial call",
        value: strategyVerdict,
        detail: `${strategyMoveNow}. ${strategyOwner} owns the next variation-strategy decision.`,
      },
      {
        label: "Open lane",
        value: strategyMoveNow,
        detail: strategyRiskBrief,
      },
      {
        label: "Recommended path",
        value: strategy,
        detail: `${input.childCount} child offers under theme ${input.variationTheme}`,
      },
      {
        label: "Core-product fit",
        value: input.sameCoreProduct ? "Aligned" : "Broken",
        detail: input.sameCoreProduct ? "Children look like one product family" : "Different products may be mixed together",
      },
      {
        label: "Theme purity",
        value: input.differsOnlyByTheme ? "Clean" : "Mixed",
        detail: input.differsOnlyByTheme ? "One main change axis" : "More than one change axis is present",
      },
      {
        label: "Bundle contamination",
        value: input.mixedBundleLogic ? "Present" : "Not visible",
        detail: "Whether pack, bundle, or kit logic is mixed into the family",
      },
      {
        label: "Review balance",
        value: input.reviewBalanceHealthy ? "Healthy" : "Needs review",
        detail: "Checks if one child type may be masking another's expectations",
      },
      {
        label: "Category theme fit",
        value:
          allowedThemes.length === 0
            ? "Unknown"
            : allowedThemes.includes(input.variationTheme)
              ? "Expected"
              : "Weak",
        detail: allowedThemes.length ? allowedThemes.join(", ") : "No category profile loaded",
      },
      {
        label: "Decision owner",
        value: strategyOwner,
        detail: strategyDoNotCross,
      },
      {
        label: "Wrong move",
        value: strategyDoNotCross,
        detail: "Keep the structure call ahead of copy, image, and price edits.",
      },
      {
        label: "Re-run trigger",
        value: strategyRerunTrigger,
        detail: "Do not keep debating the family while the same structure is still live.",
      },
    ],
    recommendations: [
      strategy.startsWith("Keep")
        ? "The family can likely stay merged, but confirm the final variation theme in the category template before upload."
        : "Break unrelated children out before editing the parent so the family stops fighting itself.",
      input.mixedBundleLogic
        ? "Move bundles or multi-packs into separate offers unless the category explicitly supports that theme."
        : "Keep bundle logic separate from color, size, or style variations.",
      input.titlesAligned
        ? "Titles are structurally aligned. Keep only the theme value changing between children."
        : "Normalize child titles so only the variation-specific part changes.",
      !input.reviewBalanceHealthy
        ? "Do not ignore review imbalance inside the family. Check whether one child is carrying a different buyer expectation before keeping the merge."
        : "Assign one owner to family logic and one to child-title hygiene so merge-vs-split work does not drift.",
      strategy.startsWith("Keep")
        ? "Freeze the current family map before you touch price, images, or ads so the structure decision stays testable."
        : "Do not try to rescue this family with better copy. Split logic comes before merchandising cleanup.",
      `Re-run only when this same family strategy changes state: ${strategyRerunTrigger.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 60, {
      good: "Variation strategy looks usable",
      warning: "Variation strategy needs cleanup",
      critical: "Variation strategy is likely wrong",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 60,
    }, {
      go: "Keep or merge the family",
      caution: "Clean the family before merging",
      stop: "Hold the structure change",
    }, {
      go: "The family logic is strong enough to lock the parent-child structure and move on to title, image, or price cleanup.",
      caution: "The family is directionally workable, but theme purity, child alignment, or review balance should be cleaned up before a merge goes live.",
      stop: "The current family structure is too conflicted to trust, so splitting or re-mapping should happen before any listing polish work.",
    }),
    missingItems: [
      input.sameCoreProduct ? "" : "One clear core product per family",
      input.differsOnlyByTheme ? "" : "Children that differ only by one true variation theme",
      input.titlesAligned ? "" : "Aligned child-title structure",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${strategyOwner} should own the first move: ${strategyMoveNow.toLowerCase()}.`,
      "Freeze the current child set before editing titles or images so the structure decision stays primary.",
      "Validate theme mapping in the category template.",
      "Recheck titles, images, and review distribution after the family is cleaned up.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

export function evaluatePriceTracker(input: {
  ownPrice: number;
  competitorCount: number;
  averageCompetitorPrice: number;
  lowestCompetitorPrice: number;
  highestCompetitorPrice: number;
  alertDelta: number;
  ownRating: number;
  averageCompetitorRating: number;
  ownReviewCount: number;
  averageCompetitorReviewCount: number;
  ownHasAPlus: boolean;
  aPlusCompetitorCount: number;
}) {
  const priceGap = input.ownPrice - input.averageCompetitorPrice;
  const belowFloor = input.ownPrice > 0 && input.lowestCompetitorPrice > 0
    ? input.ownPrice - input.lowestCompetitorPrice
    : 0;
  const reviewGap = input.ownReviewCount - input.averageCompetitorReviewCount;
  const alerts: string[] = [];

  if (input.competitorCount === 0) {
    alerts.push("No competitor prices are loaded yet, so the watch thresholds are still thin.");
  }
  if (belowFloor > input.alertDelta) {
    alerts.push("Own price sits materially above the lowest visible competitor.");
  }
  if (priceGap < -input.alertDelta) {
    alerts.push("Own price is materially below competitor average, which may be pressuring margin unnecessarily.");
  }
  if (input.ownRating < input.averageCompetitorRating && priceGap > 0) {
    alerts.push("The ASIN is priced above competitors while visible rating proof is weaker.");
  }
  if (input.averageCompetitorReviewCount > 0 && input.ownReviewCount > 0 && input.ownReviewCount < input.averageCompetitorReviewCount && priceGap > 0) {
    alerts.push("The ASIN is priced above competitor average while review proof is thinner.");
  }
  if (!input.ownHasAPlus && input.aPlusCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2))) {
    alerts.push("Most compared competitors already use A+, so price pressure is amplified by richer merchandising.");
  }

  const score = Math.max(
    0,
    100 -
      (belowFloor > input.alertDelta ? 18 : 0) -
      (priceGap < -input.alertDelta ? 12 : 0) -
      (input.ownRating < input.averageCompetitorRating && priceGap > 0 ? 14 : 0) -
      (input.averageCompetitorReviewCount > 0 && input.ownReviewCount > 0 && input.ownReviewCount < input.averageCompetitorReviewCount && priceGap > 0 ? 10 : 0) -
      (!input.ownHasAPlus && input.aPlusCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2)) ? 8 : 0) -
      (input.competitorCount === 0 ? 20 : 0),
  );
  const aboveFloorRisk = belowFloor > input.alertDelta;
  const underpricingRisk = priceGap < -input.alertDelta;
  const proofRisk =
    (input.ownRating < input.averageCompetitorRating && priceGap > 0) ||
    (input.averageCompetitorReviewCount > 0 &&
      input.ownReviewCount > 0 &&
      input.ownReviewCount < input.averageCompetitorReviewCount &&
      priceGap > 0) ||
    (!input.ownHasAPlus && input.aPlusCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2)));
  const commercialCall =
    aboveFloorRisk
      ? "Review the price band now"
      : underpricingRisk
        ? "Protect margin before reacting again"
        : proofRisk
          ? "Fix proof before cutting price"
          : "Keep the current price posture";
  const decisionOwner =
    aboveFloorRisk || proofRisk ? "Response owner" : "Competitive watch owner";
  const doNotCrossLine =
    aboveFloorRisk
      ? "Do not let the lowest visible price become the only rule"
      : underpricingRisk
        ? "Do not let price alerts outrun your margin floor"
        : proofRisk
          ? "Do not treat a proof deficit like a pure pricing problem"
          : "Do not open a visible price move without a real market trigger";
  const nextMove =
    aboveFloorRisk
      ? "Check whether price is really the first lever before approving a visible price move."
      : underpricingRisk
        ? "Review whether the current discount is buying enough conversion to justify the margin pressure."
        : proofRisk
          ? "Route the next response through proof and merchandising before you touch the visible price."
          : "Keep the watch live and intervene only when a real spread opens.";

  return {
    headline:
      aboveFloorRisk
        ? "Review this price band now before the market writes the story for you"
        : underpricingRisk
          ? "Protect contribution margin before you reward more discounting"
          : proofRisk
            ? "Fix proof before this team reaches for price"
            : "Hold the current price posture and keep the watch disciplined",
    summary:
      "This price watch should tell the team whether the next move is price, proof, or patience, who owns it, and which reaction is forbidden.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: "Do not let alerts become pricing reflexes. One response lane should own the next move.",
      },
      {
        label: "Do now",
        value: nextMove,
        detail:
          aboveFloorRisk
            ? "Do not approve a reactive cut until you know whether price is actually the first losing surface."
            : underpricingRisk
              ? "The current discount might already be more expensive than the lift it buys."
              : proofRisk
                ? "Some spreads belong to trust, reviews, or merchandising before they belong to pricing."
                : "No price-only emergency is visible in the current set.",
      },
      {
        label: "Do not cross",
        value: doNotCrossLine,
        detail: "Keep this boundary closed until the same watch set proves the next move should change.",
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: "One owner should route the next alert into price, proof, or patience instead of a multi-team scramble.",
      },
      {
        label: "Own price",
        value: formatCurrency(round(input.ownPrice)),
        detail: "Current visible price on the tracked ASIN",
      },
      {
        label: "Competitor average",
        value: formatCurrency(round(input.averageCompetitorPrice)),
        detail: `${input.competitorCount} competitor prices loaded`,
      },
    ],
    recommendations: [
      belowFloor > input.alertDelta
        ? "Set an urgent alert for undercutting risk because the ASIN is priced too far above the lowest competitor."
        : "Current price is inside a manageable band relative to the lowest visible competitor.",
      priceGap < -input.alertDelta
        ? "Do not assume underpricing is helping enough. Review whether the current discount is buying enough conversion to justify the margin pressure."
        : "No major underpricing signal is visible against the competitor average.",
      input.averageCompetitorReviewCount > 0 && input.ownReviewCount > 0 && input.ownReviewCount < input.averageCompetitorReviewCount && priceGap > 0
        ? "Do not read this as a pure pricing issue. The page may need stronger proof or merchandising to support the current price."
        : "Pair the price watch with review and asset checks so price changes are not interpreted in isolation.",
      input.competitorCount === 0
        ? "Do not rely on this watch yet. Add a real competitor baseline before creating alert rules."
        : "Use this page as the current-state check, then define daily or weekly watch cadences outside the app if needed.",
      belowFloor > input.alertDelta || priceGap < -input.alertDelta
        ? "Assign one owner to alert handling and one to proof-context review so every price move is checked against why the market is moving."
        : "Keep price alerts tied to proof context, not just visible lowest price, so the team does not overreact to every undercut.",
    ],
    alerts,
    status: buildStatus(score, 82, 60, {
      good: "Price response board looks usable",
      warning: "Price-watch rules need review",
      critical: "Price-watch risk is high",
    }),
    actionStance: buildActionStance(score, {
      goAt: 82,
      cautionAt: 60,
    }, {
      go: "Keep the current price posture",
      caution: "Review the price band now",
      stop: "Do not leave this unmonitored",
    }, {
      go: "The current price position is stable enough to hold while the team watches for proof or competitor movement.",
      caution: "The current band is still workable, but the next move should be reviewed before the market drifts further away from you.",
      stop: "The current watch picture shows enough pricing risk that waiting passively is no longer a safe operating choice.",
    }),
    missingItems: [
      input.competitorCount === 0 ? "Competitor ASINs with live price data" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      "Lock the alert delta that should trigger action.",
      "Pair price alerts with rating and review context, not only the lowest visible price.",
      "Define one response for overpricing risk and one response for unnecessary underpricing before the next watch cycle.",
      "Recheck the watch set after major promo or Buy Box changes.",
    ],
    evidence: priceTrackerEvidence,
  } satisfies ToolEvaluation;
}

export function evaluateRankTracker(input: {
  currentRank: number;
  competitorCount: number;
  averageCompetitorRank: number;
  bestCompetitorRank: number;
  targetKeywordCount: number;
  titleCoverageCount: number;
  alertThreshold: number;
  cheaperCompetitorCount: number;
  strongerReviewCompetitorCount: number;
  aPlusCompetitorCount: number;
  ownHasAPlus: boolean;
  ownReviewCount: number;
  averageCompetitorReviewCount: number;
  ownPrice: number;
  averageCompetitorPrice: number;
}) {
  const coverage = percentCovered(input.titleCoverageCount, input.targetKeywordCount);
  const rankGap = input.currentRank > 0 && input.averageCompetitorRank > 0
    ? input.currentRank - input.averageCompetitorRank
    : 0;
  const priceGapPercent =
    input.ownPrice > 0 && input.averageCompetitorPrice > 0
      ? Math.round(((input.ownPrice - input.averageCompetitorPrice) / input.averageCompetitorPrice) * 100)
      : 0;
  const alerts: string[] = [];

  if (input.currentRank === 0) {
    alerts.push("No live BSR was parsed, so the tracker is running without a current rank baseline.");
  }
  if (coverage < 70) {
    alerts.push("Target keywords are not well represented in the current title baseline.");
  }
  if (rankGap > input.alertThreshold && input.averageCompetitorRank > 0) {
    alerts.push("Current BSR is materially worse than the competitor average.");
  }
  if (input.bestCompetitorRank > 0 && input.currentRank > input.bestCompetitorRank + input.alertThreshold) {
    alerts.push("One competitor is outranking this ASIN by a wide margin.");
  }
  if (input.cheaperCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2))) {
    alerts.push("Most compared competitors are priced below this listing, which can drag click share and conversion support.");
  }
  if (
    input.averageCompetitorReviewCount > 0 &&
    input.ownReviewCount > 0 &&
    input.averageCompetitorReviewCount >= input.ownReviewCount * 1.25
  ) {
    alerts.push("Competitor review proof is materially stronger than the current ASIN baseline.");
  }
  if (!input.ownHasAPlus && input.aPlusCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2))) {
    alerts.push("Most compared competitors already show A+, so this listing is defending rank with thinner merchandising support.");
  }

  const score = Math.max(
    0,
    100 -
      (input.currentRank === 0 ? 18 : 0) -
      (coverage < 70 ? 16 : 0) -
      (rankGap > input.alertThreshold ? 18 : 0) -
      (input.bestCompetitorRank > 0 && input.currentRank > input.bestCompetitorRank + input.alertThreshold ? 12 : 0) -
      (input.cheaperCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2)) ? 10 : 0) -
      (input.averageCompetitorReviewCount > 0 &&
      input.ownReviewCount > 0 &&
      input.averageCompetitorReviewCount >= input.ownReviewCount * 1.25
        ? 10
        : 0) -
      (!input.ownHasAPlus && input.aPlusCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2)) ? 8 : 0),
  );

  const rankVerdict =
    input.currentRank === 0
      ? "Repair the rank baseline before making a response call"
      : coverage < 70
        ? "Repair keyword coverage before treating this as a market-pressure problem"
        : rankGap > input.alertThreshold && input.cheaperCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2))
          ? "Reset price posture before rank loss gets more expensive"
          : rankGap > input.alertThreshold &&
              (input.strongerReviewCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2)) ||
                (!input.ownHasAPlus &&
                  input.aPlusCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2))))
            ? "Repair trust proof before defending rank any harder"
            : rankGap > input.alertThreshold || (input.bestCompetitorRank > 0 && input.currentRank > input.bestCompetitorRank + input.alertThreshold)
              ? "Open one rank-recovery lane now"
              : "Keep the rank watch live without opening a broad response";
  const decisionOwner =
    input.currentRank === 0
      ? "Catalog lead"
      : coverage < 70
        ? "SEO / listing lead"
        : rankGap > input.alertThreshold && input.cheaperCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2))
          ? "Pricing lead"
          : rankGap > input.alertThreshold &&
              (input.strongerReviewCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2)) ||
                (!input.ownHasAPlus &&
                  input.aPlusCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2))))
            ? "CX / merchandising lead"
            : rankGap > input.alertThreshold || (input.bestCompetitorRank > 0 && input.currentRank > input.bestCompetitorRank + input.alertThreshold)
              ? "Search response lead"
              : "Rank watch owner";
  const firstMove =
    input.currentRank === 0
      ? "Reload the PDP until the live BSR baseline is real before escalating any rank response"
      : coverage < 70
        ? "Close title keyword gaps first and keep pricing and proof changes frozen"
        : rankGap > input.alertThreshold && input.cheaperCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2))
          ? "Make one explicit price-position call before opening more SEO or creative work"
          : rankGap > input.alertThreshold &&
              (input.strongerReviewCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2)) ||
                (!input.ownHasAPlus &&
                  input.aPlusCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2))))
            ? "Repair proof depth first and hold price and keyword churn closed"
            : rankGap > input.alertThreshold || (input.bestCompetitorRank > 0 && input.currentRank > input.bestCompetitorRank + input.alertThreshold)
              ? "Open one controlled recovery lane and keep every other response closed"
              : "Keep the same competitor set and alert band fixed until the next review cycle";
  const doNotCrossLine =
    input.currentRank === 0
      ? "Do not call a rank emergency without a live BSR baseline"
      : coverage < 70
        ? "Do not treat weak relevance coverage like a traffic or competitor-only problem"
        : rankGap > input.alertThreshold && input.cheaperCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2))
          ? "Do not keep defending rank while the market set is visibly cheaper"
          : rankGap > input.alertThreshold &&
              (input.strongerReviewCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2)) ||
                (!input.ownHasAPlus &&
                  input.aPlusCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2))))
            ? "Do not buy more traffic into a proof deficit"
            : rankGap > input.alertThreshold || (input.bestCompetitorRank > 0 && input.currentRank > input.bestCompetitorRank + input.alertThreshold)
              ? "Do not open pricing, SEO, and creative workstreams at the same time"
              : "Do not let normal rank noise trigger a broad response";
  const rankRiskBrief =
    input.currentRank === 0
      ? "The tool still lacks a trustworthy live BSR anchor."
      : rankGap > input.alertThreshold
        ? `Current #${input.currentRank.toLocaleString("en-US")} versus competitor average #${Math.round(input.averageCompetitorRank).toLocaleString("en-US")}.`
        : input.bestCompetitorRank > 0 && input.currentRank > input.bestCompetitorRank + input.alertThreshold
          ? `A best visible competitor at #${Math.round(input.bestCompetitorRank).toLocaleString("en-US")} is pulling away from the current baseline.`
          : "The current rank band is still inside the planned watch threshold.";

  return {
    headline:
      input.currentRank === 0
        ? "Repair the rank baseline before making a response call"
        : rankGap > input.alertThreshold
          ? `${rankVerdict} - current BSR is outside the planned watch band`
          : `${rankVerdict} - keep the current band under watch`,
    summary:
      "Use this rank read to decide whether the first move belongs in relevance, proof, pricing, or watch discipline before the team opens three response lanes and learns nothing.",
    metrics: [
      {
        label: "Commercial call",
        value: rankVerdict,
        detail: `${firstMove}. ${decisionOwner} owns the first response lane.`,
      },
      {
        label: "Open lane",
        value: firstMove,
        detail: rankRiskBrief,
      },
      {
        label: "Current BSR",
        value: input.currentRank > 0 ? `#${input.currentRank.toLocaleString("en-US")}` : "Not parsed",
        detail: "Live rank baseline from the current product page",
      },
      {
        label: "Competitor average",
        value:
          input.averageCompetitorRank > 0
            ? `#${Math.round(input.averageCompetitorRank).toLocaleString("en-US")}`
            : "Not set",
        detail: `${input.competitorCount} competitor ranks loaded`,
      },
      {
        label: "Best competitor",
        value:
          input.bestCompetitorRank > 0
            ? `#${Math.round(input.bestCompetitorRank).toLocaleString("en-US")}`
            : "Not set",
        detail: "Best visible competitor BSR in the current set",
      },
      {
        label: "Keyword coverage",
        value: `${coverage}%`,
        detail: `${input.titleCoverageCount}/${input.targetKeywordCount} target keywords reflected in title wording`,
      },
      {
        label: "Price position",
        value:
          input.ownPrice > 0 && input.averageCompetitorPrice > 0
            ? `${priceGapPercent > 0 ? "+" : ""}${priceGapPercent}%`
            : "Not set",
        detail:
          input.ownPrice > 0 && input.averageCompetitorPrice > 0
            ? `${formatCurrency(round(input.ownPrice))} vs ${formatCurrency(round(input.averageCompetitorPrice))} competitor average`
            : "Price comparison incomplete",
      },
      {
        label: "Proof pressure",
        value: `${input.strongerReviewCompetitorCount}/${input.aPlusCompetitorCount}`,
        detail: "Competitors with stronger reviews / visible A+",
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep the response in one lane until the same competitor set proves that lane wrong.",
      },
      {
        label: "Alert threshold",
        value: `${input.alertThreshold.toLocaleString("en-US")} ranks`,
        detail: "Gap size that should trigger a review",
      },
    ],
    recommendations: [
      coverage < 70
        ? "Fix keyword coverage first. If the title and keyword baseline are thin, do not treat rank weakness as a traffic-only problem."
        : "Keyword coverage is usable enough that the next decision should shift toward proof, pricing, or disciplined watch mode.",
      rankGap > input.alertThreshold
        ? "This is outside the watch band. Open one recovery lane now and keep every other lever closed."
        : "The rank band is still stable enough to monitor. Do not create work just because a dashboard moved.",
      input.cheaperCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2))
        ? "Price is a live suspect here. Review price positioning before spending the next cycle only on content or SEO changes."
        : "Price is not the first pressure signal in this set, so attention should stay on coverage, proof, and merchandising.",
      input.strongerReviewCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2)) || (!input.ownHasAPlus && input.aPlusCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2)))
        ? "Proof and merchandising are part of the rank problem now. Do not hide behind keyword edits."
        : "Use BSR as the low-cost baseline here, then validate only the biggest movers with deeper search performance reporting.",
      `Re-run only when the same market set changes state: ${firstMove.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 82, 60, {
      good: "Rank-watch logic looks usable",
      warning: "Rank-watch setup needs review",
      critical: "Rank-watch risk is high",
    }),
    actionStance: buildActionStance(score, {
      goAt: 82,
      cautionAt: 60,
    }, {
      go: "Keep the rank watch live",
      caution: "Open one recovery lane first",
      stop: "Do not treat this as watch-only",
    }, {
      go: "The current BSR posture is stable enough to monitor on the planned cadence without opening a broad response.",
      caution: "The rank picture is still recoverable, but one main gap should be fixed before the next review cycle.",
      stop: "The rank decline is already far enough outside the chosen band that passive watching is no longer enough.",
    }),
    missingItems: [
      input.currentRank === 0 ? "Current BSR baseline" : "",
      input.targetKeywordCount === 0 ? "Target keyword set" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      "Lock the commercial keyword set first, so future rank changes are judged against revenue terms rather than generic traffic terms.",
      `${decisionOwner} should own the first move: ${firstMove.toLowerCase()}.`,
      "Freeze the competitor set and alert band before the next rank review so signal changes do not come from a moving baseline.",
      "Re-run immediately after listing, pricing, or review-proof changes so you can attribute movement instead of guessing.",
    ],
    evidence: rankTrackerEvidence,
  } satisfies ToolEvaluation;
}

export function evaluateBrandRegistry(input: {
  trademarkStatus: "none" | "pending" | "registered";
  logoOnProduct: boolean;
  logoOnPackaging: boolean;
  listingsLive: number;
  sellerAgeMonths: number;
  targetMarketplace: string;
  exactBrandMatch: boolean;
  genericBrandRuleOk: boolean;
  brandName?: string;
  liveBrand?: string;
  hasLiveListing?: boolean;
}) {
  let score = 0;
  const missing: string[] = [];
  const alerts: string[] = [];
  const euLikeMarkets = ["UK", "DE", "FR", "IT", "ES", "NL", "SE", "PL"];

  if (input.trademarkStatus === "registered") score += 45;
  else if (input.trademarkStatus === "pending") score += 15;
  else missing.push("Active or near-final trademark path");

  if (input.logoOnProduct) score += 20;
  else missing.push("Permanent product branding");

  if (input.logoOnPackaging) score += 15;
  else missing.push("Branded packaging proof");

  if (input.exactBrandMatch) score += 10;
  else missing.push("Exact brand spelling and spacing match");

  if (input.genericBrandRuleOk) score += 5;
  else missing.push('Correct use of "generic" for unbranded products');

  if (input.listingsLive > 0) score += 10;
  else missing.push("At least one active listing or launch asset set");

  if (input.sellerAgeMonths >= 3) score += 5;
  else missing.push("Mature enough seller account history");

  if (euLikeMarkets.includes(input.targetMarketplace) && input.trademarkStatus !== "registered") {
    missing.push("For Europe-leaning markets, pending marks are usually weaker than a registered mark.");
  }
  if (input.hasLiveListing && !input.liveBrand) {
    alerts.push("The live listing does not expose a clear brand value yet, so Amazon-side brand proof still looks weak.");
  }
  if (input.brandName && input.liveBrand && !input.exactBrandMatch) {
    alerts.push("The declared brand name and live listing brand do not match exactly.");
  }
  if (!input.logoOnProduct && !input.logoOnPackaging) {
    alerts.push("Neither the product nor the packaging currently carries obvious brand proof.");
  }

  const status =
    score >= 80 ? "Ready to prepare application" : score >= 55 ? "Close, but still missing proof" : "Not ready yet";
  const registryVerdict =
    score >= 80
      ? "Prepare the Brand Registry filing now"
      : score >= 55
        ? "Tighten the proof stack before opening the filing"
        : "Do not file for Brand Registry yet";
  const registryOwner =
    input.trademarkStatus !== "registered"
      ? "Trademark owner"
      : !input.logoOnProduct || !input.logoOnPackaging || !input.exactBrandMatch
        ? "Brand proof owner"
        : "Brand registry owner";
  const registryMoveNow =
    score >= 80
      ? "Assemble the filing packet with the exact brand spelling, product proof, and packaging proof locked"
      : score >= 55
        ? "Close the missing proof stack before the filing opens"
        : "Advance trademark and brand-proof readiness before spending time on the submission packet";
  const registryDoNotCross =
    score >= 80
      ? "Do not let filing, packaging, and listing spelling drift apart now"
      : score >= 55
        ? "Do not open the filing while proof gaps are still visible"
        : "Do not treat a weak brand-proof stack like a filing-ready packet";
  const registryRiskBrief =
    missing.length > 0
      ? `${missing.length} proof gaps are still visible in the current registry packet.`
      : "The proof stack is aligned enough that avoidable rejection risk is now mainly about execution discipline.";
  const registryRerunTrigger =
    score >= 80
      ? "Re-run only if filing spelling, live brand proof, or packaging proof changes"
      : "Re-run when trademark status or brand-proof evidence changes enough to alter filing readiness";
  const evidence = getBrandRegistryPolicyEvidence({
    targetMarketplace: input.targetMarketplace,
    trademarkStatus: input.trademarkStatus,
    exactBrandMatch: input.exactBrandMatch,
    genericBrandRuleOk: input.genericBrandRuleOk,
  });

  return {
    headline: `${registryVerdict} - ${score}% readiness for Brand Registry`,
    summary:
      "Use this registry read to decide whether the filing opens now, which proof gap blocks it, and who owns the packet.",
    metrics: [
      {
        label: "Commercial call",
        value: registryVerdict,
        detail: `${registryMoveNow}. ${registryOwner} owns the next filing decision.`,
      },
      {
        label: "Open lane",
        value: registryMoveNow,
        detail: registryRiskBrief,
      },
      { label: "Readiness score", value: `${score}%`, detail: status },
      {
        label: "Trademark status",
        value: input.trademarkStatus,
        detail: `${input.targetMarketplace} target market`,
      },
      {
        label: "Live listing signal",
        value: input.hasLiveListing ? "Loaded" : "Not loaded",
        detail: input.liveBrand ? `Live brand: ${input.liveBrand}` : "No live brand signal yet",
      },
      {
        label: "Brand value hygiene",
        value: input.exactBrandMatch ? "Exact" : "Needs cleanup",
        detail: input.genericBrandRuleOk ? "Generic use looks defensible" : "Generic value logic is weak",
      },
      {
        label: "Listings live",
        value: `${input.listingsLive}`,
        detail: input.listingsLive > 0 ? "Enough to support brand proof" : "No active listing proof yet",
      },
      {
        label: "Decision owner",
        value: registryOwner,
        detail: registryDoNotCross,
      },
      {
        label: "Wrong move",
        value: registryDoNotCross,
        detail: "Keep the filing packet narrow and aligned instead of treating readiness as a broad brand project.",
      },
      {
        label: "Re-run trigger",
        value: registryRerunTrigger,
        detail: "Do not keep rechecking until the filing packet actually changes state.",
      },
    ],
    recommendations: [
      missing.length
        ? `Do not open the application yet. Fix these blockers first: ${missing.slice(0, 3).join(", ")}.`
        : "Core prerequisites are in place, so the next job is preparing a clean evidence pack rather than hunting for new prerequisites.",
      input.liveBrand && input.brandName && !input.exactBrandMatch
        ? "Align the live listing brand spelling with the filing and the packaging before you submit. A mismatch here is a real avoidable rejection risk."
        : "Keep the filed mark, live listing brand, and packaging spelling identical all the way through submission.",
      !input.logoOnProduct || !input.logoOnPackaging
        ? "Do not rely on the trademark alone. Product and packaging proof must look obviously branded before submission."
        : "Brand proof is strongest when product and packaging branding look visually consistent in the same evidence set.",
      input.trademarkStatus !== "registered" && euLikeMarkets.includes(input.targetMarketplace)
        ? "Do not assume a pending mark is enough for Europe-leaning expansion. Keep the trademark path ahead of launch work."
        : "Only after registry readiness is solid should you spend time on content expansion or brand-defense workflows.",
      `Re-run only when this same registry lane changes state: ${registryRerunTrigger.toLowerCase()}.`,
    ],
    alerts: [...alerts, ...missing],
    status: buildStatus(score, 80, 55, {
      good: "Registry package looks ready",
      warning: "Registry proof is incomplete",
      critical: "Registry prerequisites are missing",
    }),
    actionStance: buildActionStance(score, {
      goAt: 80,
      cautionAt: 55,
    }, {
      go: "Prepare the Brand Registry filing",
      caution: "Tighten the proof stack first",
      stop: "Do not file yet",
    }, {
      go: "The brand proof stack is strong enough to move into submission prep without obvious avoidable rejection risk.",
      caution: "The filing path is plausible, but proof gaps should be tightened before the submission packet is finalized.",
      stop: "The current evidence stack is too weak or inconsistent to justify opening the filing now.",
    }),
    missingItems: missing,
    riskItems: [...alerts, ...missing],
    nextSteps: [
      `${registryOwner} should own the first move: ${registryMoveNow.toLowerCase()}.`,
      "Keep the filed mark, packaging mark, and listing brand spelling identical all the way through submission.",
      "Assign one owner to trademark and brand-value hygiene, and one to proof capture, before the packet is assembled.",
      input.hasLiveListing ? "Compare the live listing brand against the filing and packaging before submission, and stop if any spelling differs." : "Load a live ASIN or draft listing proof before submitting so the filing is tied to a real branded surface.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

export function evaluateUngating(input: {
  category: string;
  marketplace: string;
  invoiceCount: number;
  invoiceUnits: number;
  brandAuthorization: boolean;
  sellerAgeMonths: number;
  priorRejection: boolean;
  invoiceRecent?: boolean;
  hasProductPhotos?: boolean;
  hasSafetyDocs?: boolean;
  restrictionLevel?: string;
  source?: "live" | "manual";
}) {
  let score = 0;
  const alerts: string[] = [];
  const normalizedCategory = normalizeCategoryBucket(input.category);
  const highControlCategories = new Set([
    "beauty",
    "grocery",
    "health",
    "jewelry",
    "watches",
  ]);
  const invoiceFloor = highControlCategories.has(normalizedCategory) ? 3 : 2;
  const unitsFloor = highControlCategories.has(normalizedCategory) ? 10 : 5;

  if (input.invoiceCount >= invoiceFloor) score += 35;
  else alerts.push("Most ungating workflows expect multiple clean supplier invoices.");

  if (input.invoiceUnits >= unitsFloor) score += 25;
  else alerts.push("Invoice quantity may be too low for some category reviews.");

  if (input.brandAuthorization) score += 20;
  else alerts.push("Brand authorization is missing, which can slow brand-level approvals.");

  if (input.sellerAgeMonths >= 3) score += 15;
  else alerts.push("New seller account history can weaken approval confidence.");

  if (!input.priorRejection) score += 5;
  else alerts.push("Prior rejection means the next attempt needs cleaner documentation.");
  if (input.invoiceRecent) score += 10;
  else alerts.push("Amazon approval guidance expects invoices dated within 180 days.");
  if (input.hasProductPhotos) score += 10;
  else alerts.push("Clear product photos are often required during restricted-category review.");
  if (input.hasSafetyDocs) score += 10;
  else if (highControlCategories.has(normalizedCategory)) alerts.push("This category can require safety or compliance certificates.");

  if (["DE", "FR", "IT", "ES", "UK"].includes(input.marketplace) && highControlCategories.has(normalizedCategory)) {
    alerts.push("This market-category mix often triggers extra compliance review beyond basic ungating.");
  }
  if (input.restrictionLevel === "brand") {
    alerts.push("Brand-level restriction means invoices alone may not be enough without authorization.");
  }
  if (input.restrictionLevel === "asin") {
    alerts.push("ASIN-level restriction can require checking the exact offer, not only the category.");
  }

  const outcome =
    score >= 85 ? "Likely ready to apply" : score >= 60 ? "Conditional readiness" : "Evidence gap is still too wide";
  const ungatingVerdict =
    score >= 85
      ? "Submit this ungating packet now"
      : score >= 60
        ? "Strengthen the packet before you apply"
        : "Do not apply for ungating yet";
  const ungatingOwner =
    !input.brandAuthorization && input.restrictionLevel === "brand"
      ? "Brand authorization owner"
      : highControlCategories.has(normalizedCategory)
        ? "Supplier proof + compliance lead"
        : "Ungating owner";
  const ungatingMoveNow =
    score >= 85
      ? "Freeze this exact supplier packet and submit against the current restriction path"
      : score >= 60
        ? "Close the invoice, authorization, or safety gaps before the next application"
        : "Rebuild the packet before spending another ungating attempt";
  const ungatingDoNotCross =
    score >= 85
      ? "Do not change supplier, invoices, and restriction path at the same time now"
      : score >= 60
        ? "Do not send a borderline packet and hope Amazon fills the gaps for you"
        : "Do not resend the same weak evidence stack";
  const ungatingRiskBrief =
    score >= 85
      ? "The current invoice, authorization, and maturity stack is strong enough to justify one controlled application."
      : `${alerts.length} packet issues are still visible in the current ungating case.`;
  const ungatingRerunTrigger =
    score >= 85
      ? "Re-run only if supplier proof, restriction level, or category target changes"
      : "Re-run when the evidence packet materially changes before the next attempt";
  const evidence = getUngatingPolicyEvidence({
    category: input.category,
    marketplace: input.marketplace,
    restrictionLevel: input.restrictionLevel,
    priorRejection: input.priorRejection,
  });

  return {
    headline: `${ungatingVerdict} - ${score}% ungating readiness for ${normalizedCategory}`,
    summary:
      "Use this ungating read to decide whether the packet submits now, who owns the weak point, and what evidence work must happen first.",
    metrics: [
      {
        label: "Commercial call",
        value: ungatingVerdict,
        detail: `${ungatingMoveNow}. ${ungatingOwner} owns the next ungating decision.`,
      },
      {
        label: "Open lane",
        value: ungatingMoveNow,
        detail: ungatingRiskBrief,
      },
      { label: "Readiness score", value: `${score}%`, detail: outcome },
      {
        label: "Invoice strength",
        value: `${input.invoiceCount} invoices`,
        detail: `${input.invoiceUnits} units across supplier proof`,
      },
      {
        label: "Seller maturity",
        value: `${input.sellerAgeMonths} months`,
        detail: input.priorRejection ? "Prior rejection on record" : "No prior rejection flagged",
      },
      {
        label: "Category source",
        value: input.source === "live" ? "Live listing" : "Manual selection",
        detail: input.restrictionLevel ? `${input.restrictionLevel} restriction review` : "Restriction level not specified",
      },
      {
        label: "Decision owner",
        value: ungatingOwner,
        detail: ungatingDoNotCross,
      },
      {
        label: "Wrong move",
        value: ungatingDoNotCross,
        detail: "Keep the exact supplier packet stable enough that the next result is interpretable.",
      },
      {
        label: "Re-run trigger",
        value: ungatingRerunTrigger,
        detail: "Do not keep reapplying without materially changing the evidence stack.",
      },
    ],
    recommendations: [
      input.invoiceCount < 3
        ? "Do not submit yet. Get more clean supplier invoices before treating the packet as strong."
        : "Invoice count is workable enough that document quality and authorization become the next gating checks.",
      input.brandAuthorization
        ? "Brand authorization is already helping, especially if the restriction leans brand-controlled."
        : "If the category or restriction is brand-sensitive, stop and obtain authorization before applying.",
      input.priorRejection
        ? "Do not resend the same packet. Change the evidence quality before the next submission."
        : "Resolve one evidence gap at a time instead of treating a borderline packet as good enough.",
      input.restrictionLevel === "asin"
        ? "Verify the exact target ASIN is worth unlocking before you spend more approval effort. ASIN-level ungating is not a category-wide win."
        : "Match the packet to the exact restriction type first so you do not build a strong packet for the wrong gate.",
      highControlCategories.has(normalizedCategory)
        ? "Assign one owner to supplier proof and one to compliance documents. High-control categories usually fail when one person tries to improvise both."
        : "Freeze the supplier, invoice set, and target category before the next submission so you can tell whether the approval outcome changed because of evidence quality or because you changed the whole case.",
      `Re-run only when this same ungating lane changes state: ${ungatingRerunTrigger.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 85, 60, {
      good: "Ungating packet looks strong",
      warning: "Ungating packet is borderline",
      critical: "Ungating packet is not ready",
    }),
    actionStance: buildActionStance(score, {
      goAt: 85,
      cautionAt: 60,
    }, {
      go: "Submit the ungating packet",
      caution: "Strengthen the packet first",
      stop: "Do not apply yet",
    }, {
      go: "The approval packet is strong enough to submit against the current restriction path.",
      caution: "The packet has a workable base, but one or two documentation gaps should be tightened before submission.",
      stop: "The current evidence stack is too weak to justify an application attempt right now.",
    }),
    missingItems: [
      !input.brandAuthorization ? "Brand authorization" : "",
      !input.invoiceRecent ? "Recent invoices within 180 days" : "",
      !input.hasProductPhotos ? "Clear product photos" : "",
      !input.hasSafetyDocs && highControlCategories.has(normalizedCategory)
        ? "Safety or compliance documents"
        : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${ungatingOwner} should own the first move: ${ungatingMoveNow.toLowerCase()}.`,
      "Freeze the exact supplier packet and target offer before the next submission.",
      "Match the restriction level with the exact offer you plan to list so you do not solve the wrong approval problem.",
      "If rejected before, change the packet materially before the next attempt instead of resending the same evidence stack.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

export function evaluateFbaPrep(input: {
  productType: string;
  packagingFormat: string;
  labelingMode: string;
  prepProvider: string;
  isFragile: boolean;
  isLiquid: boolean;
  hasBattery: boolean;
  hasSds?: boolean;
  hazmatUnknown?: boolean;
  hasExpiration?: boolean;
  shippingTerm?: string;
}) {
  const checklist = [
    "Confirm outer carton labeling matches inbound shipment plan.",
    "Apply scannable product identifiers to every sellable unit.",
  ];
  const alerts: string[] = [];
  let firstPrepMove = "Lock labeling and carton-match checks before booking the shipment.";
  let firstPrepReason = "Most inbound friction starts with mismatched identifiers or carton-level prep misses.";

  if (input.packagingFormat === "polybag") {
    checklist.push("Verify suffocation warning thresholds for polybag packaging.");
  }
  if (input.isFragile) {
    checklist.push("Add protective wrap and drop-risk handling markers.");
    alerts.push("Fragile handling increases FC rejection risk when packaging proof is weak.");
  }
  if (input.isLiquid) {
    checklist.push("Seal liquid units to prevent leakage during inbound handling.");
    alerts.push("Liquid containment and leakage controls should be validated before shipping.");
  }
  if (input.hasBattery) {
    checklist.push("Attach battery handling labels and transport documentation.");
    alerts.push("Battery SKUs require transport and labeling discipline beyond standard prep.");
  }
  if (input.hasExpiration) {
    checklist.push("Verify expiration-date labeling and shelf-life handling before inbound.");
  }
  if (input.hazmatUnknown) {
    checklist.push("Run dangerous goods classification before creating the FBA shipment.");
    alerts.push("Hazmat classification uncertainty can block FBA receipt or trigger disposal risk.");
  }
  if ((input.hasBattery || input.isLiquid) && !input.hasSds) {
    alerts.push("Battery or chemical-leaning products often need an SDS or exemption sheet ready.");
  }
  if (input.shippingTerm && input.shippingTerm !== "ddp") {
    alerts.push("Inbound imports to FBA should not arrive with collect duties or shipping charges.");
  }
  if (input.productType === "bundle") {
    checklist.push("Mark bundled units clearly so FC staff do not split the set.");
  }
  if (input.labelingMode === "manufacturer") {
    alerts.push("Manufacturer barcode mode can cause listing mismatch if the barcode map is not verified.");
  }
  if (input.hazmatUnknown) {
    firstPrepMove = "Do not create the shipment yet. Resolve dangerous-goods classification first.";
    firstPrepReason = "Hazmat uncertainty can block receiving, disposal, or listing availability before prep quality even matters.";
  } else if ((input.hasBattery || input.isLiquid) && !input.hasSds) {
    firstPrepMove = "Secure SDS or exemption paperwork before the shipment is finalized.";
    firstPrepReason = "Transport-sensitive SKUs fail late and expensively when paperwork trails packaging.";
  } else if (input.shippingTerm && input.shippingTerm !== "ddp") {
    firstPrepMove = "Fix inbound shipping terms before handing this to the forwarder.";
    firstPrepReason = "Duty-collect or charge-on-arrival terms can break FBA receiving even when unit prep is correct.";
  } else if (input.labelingMode === "manufacturer") {
    firstPrepMove = "Verify barcode ownership and catalog mapping before inbound.";
    firstPrepReason = "Manufacturer barcode mode is efficient only when the barcode-to-ASIN map is already clean.";
  } else if (input.isFragile || input.isLiquid || input.hasBattery) {
    firstPrepMove = "Stress-test the sensitive-unit prep before scaling the shipment.";
    firstPrepReason = "Sensitive SKUs need proof that the physical prep survives carrier and FC handling, not just a checklist.";
  }
  const prepScore = Math.max(0, 100 - alerts.length * 20);
  const prepVerdict =
    input.hazmatUnknown
      ? "Do not book this shipment yet"
      : (input.hasBattery || input.isLiquid) && !input.hasSds
        ? "Fix sensitive-SKU paperwork before booking inbound"
        : input.shippingTerm && input.shippingTerm !== "ddp"
          ? "Repair inbound shipping terms before this shipment moves"
          : "Approve this prep plan for shipment execution";
  const prepOwner =
    input.hazmatUnknown
      ? "Hazmat / compliance owner"
      : (input.hasBattery || input.isLiquid) && !input.hasSds
        ? "Paperwork lead"
        : input.shippingTerm && input.shippingTerm !== "ddp"
          ? "Inbound logistics lead"
          : "Prep execution owner";
  const prepDoNotCross =
    input.hazmatUnknown
      ? "Do not create the shipment while dangerous-goods status is still unknown"
      : (input.hasBattery || input.isLiquid) && !input.hasSds
        ? "Do not rely on physical prep alone for sensitive SKUs"
        : input.shippingTerm && input.shippingTerm !== "ddp"
          ? "Do not send FBA inbound on misaligned shipping terms"
          : "Do not split paperwork ownership from hands-on prep verification";
  const prepRiskBrief =
    alerts.length > 0
      ? `${alerts.length} prep blockers or handling risks are already visible in the inbound plan.`
      : `${checklist.length} prep checks are loaded and no major inbound blocker is currently open.`;
  const prepRerunTrigger =
    alerts.length > 0
      ? "Re-run only after the blocker paperwork or prep state materially changes"
      : "Re-run when the SKU handling profile or inbound terms change enough to alter the prep call";

  return {
    headline: `${prepVerdict} - ${checklist.length}-step prep checklist generated`,
    summary:
      "Use this FBA prep read to decide whether the shipment can book now, what blocker owns the next move, and what prep mistake must stay closed.",
    metrics: [
      {
        label: "Commercial call",
        value: prepVerdict,
        detail: `${firstPrepMove} ${prepOwner} owns the next inbound-prep decision.`,
      },
      {
        label: "Open lane",
        value: firstPrepMove,
        detail: prepRiskBrief,
      },
      {
        label: "Checklist items",
        value: `${checklist.length}`,
        detail: `${input.packagingFormat} packaging with ${input.prepProvider} prep`,
      },
      {
        label: "Risk flags",
        value: `${alerts.length}`,
        detail: alerts[0] ?? "No major prep flags",
      },
      {
        label: "Label mode",
        value: input.labelingMode,
        detail: input.productType,
      },
      {
        label: "First prep move",
        value: firstPrepMove,
        detail: firstPrepReason,
      },
      {
        label: "Decision owner",
        value: prepOwner,
        detail: prepDoNotCross,
      },
      {
        label: "Wrong move",
        value: prepDoNotCross,
        detail: "Keep one inbound blocker open until the shipment is really clear to move.",
      },
      {
        label: "Re-run trigger",
        value: prepRerunTrigger,
        detail: "Do not keep rechecking while the same blocker is still unresolved.",
      },
    ],
    recommendations: [
      input.hazmatUnknown
        ? "Do not hand this shipment off yet. Resolve dangerous-goods classification before you let prep execution continue."
        : "Prep can move forward only after the highest-risk inbound gate is cleared.",
      (input.hasBattery || input.isLiquid) && !input.hasSds
        ? "Do not rely on packaging alone for sensitive SKUs. Get SDS or exemption support into the shipment file first."
        : "Use packaging, labeling, and carton checks as one gate so the FC does not discover mismatches for you.",
      input.shippingTerm && input.shippingTerm !== "ddp"
        ? "Do not let inbound terms stay misaligned. Fix landed-delivery responsibility before the shipment is booked."
        : "Assign one owner to paperwork and one to physical prep so the inbound plan does not fail between teams.",
      `Re-run only when this same prep lane changes state: ${prepRerunTrigger.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(prepScore, 80, 60, {
      good: "Prep plan looks workable",
      warning: "Prep plan needs attention",
      critical: "Prep blockers are still open",
    }),
    actionStance: buildActionStance(prepScore, {
      goAt: 80,
      cautionAt: 60,
    }, {
      go: "Book the shipment prep",
      caution: "Clear the prep blockers first",
      stop: "Do not book this shipment yet",
    }, {
      go: "The prep plan is clear enough to move into shipment execution.",
      caution: "The inbound can probably work, but paperwork or handling risks should be closed first.",
      stop: "The current prep picture is too exposed to rejection or handling risk to book now.",
    }),
    missingItems: [
      input.hasBattery && !input.hasSds ? "SDS or exemption sheet" : "",
      input.hazmatUnknown ? "Hazmat classification" : "",
      input.shippingTerm !== "ddp" ? "DDP-aligned inbound terms" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${prepOwner} should own the first move: ${firstPrepMove.toLowerCase()}`,
      "Run the first three prep checks on a real unit before scaling the shipment.",
      "Assign one owner to compliance paperwork and one to hands-on prep verification before booking pickup.",
    ],
  } satisfies ToolEvaluation;
}

export function evaluateInventoryPlanner(input: {
  currentInventory: number;
  dailyVelocity: number;
  leadTimeDays: number;
  inboundUnits: number;
  safetyStockDays: number;
  seasonalityMultiplier: number;
  sellThroughRate: number;
  storageUtilizationWeeks: number;
  professionalSeller: boolean;
  hasStrandedInventory: boolean;
  newSellerWithin365Days: boolean;
  awdWaiverEligible: boolean;
}) {
  const adjustedVelocity = input.dailyVelocity * input.seasonalityMultiplier;
  const reorderPoint = adjustedVelocity * (input.leadTimeDays + input.safetyStockDays);
  const inventoryPosition = input.currentInventory + input.inboundUnits;
  const daysOfCover =
    adjustedVelocity > 0 ? inventoryPosition / adjustedVelocity : inventoryPosition;
  const stockoutRiskDays = daysOfCover - input.leadTimeDays;
  const lowInventoryFeeRisk = daysOfCover < 28;
  const excessInventoryRisk = daysOfCover > 90 || input.sellThroughRate < 1;
  const storageSurchargeRisk =
    input.professionalSeller &&
    input.storageUtilizationWeeks > 22 &&
    !input.newSellerWithin365Days &&
    !input.awdWaiverEligible;
  const alerts: string[] = [];
  let score = 100;

  if (inventoryPosition <= reorderPoint) {
    alerts.push("Current inventory position is already inside the reorder zone.");
    score -= 26;
  }
  if (stockoutRiskDays < input.safetyStockDays) {
    alerts.push("Safety stock coverage is weak relative to current lead-time risk.");
    score -= 16;
  }
  if (input.seasonalityMultiplier > 1.2) {
    alerts.push("Peak-demand multiplier is stretching days of cover faster than baseline sales would suggest.");
    score -= 10;
  }
  if (lowInventoryFeeRisk) {
    alerts.push("Days of cover are inside the low-inventory-fee danger zone.");
    score -= 14;
  }
  if (excessInventoryRisk) {
    alerts.push("Inventory is drifting toward excess or weak sell-through, which can hurt IPI and storage economics.");
    score -= 14;
  }
  if (input.hasStrandedInventory) {
    alerts.push("Stranded inventory can drag IPI because stock is incurring fees without being sellable.");
    score -= 10;
  }
  if (storageSurchargeRisk) {
    alerts.push("Storage utilization ratio is high enough to create storage-surcharge pressure.");
    score -= 12;
  }

  score = Math.max(0, score);
  const evidence = getInventoryPlannerPolicyEvidence({
    professionalSeller: input.professionalSeller,
    daysOfCover,
    sellThroughRate: input.sellThroughRate,
    hasStrandedInventory: input.hasStrandedInventory,
    storageUtilizationWeeks: input.storageUtilizationWeeks,
    newSellerWithin365Days: input.newSellerWithin365Days,
    awdWaiverEligible: input.awdWaiverEligible,
  });

  return {
    headline: `${round(daysOfCover, 1)} days of cover at adjusted demand`,
    summary:
      "Use this inventory read to decide whether this ASIN should be reordered, held, accelerated through, or cut back before fees and stockouts make the next move more expensive.",
    metrics: [
      {
        label: "Adjusted daily velocity",
        value: `${round(adjustedVelocity, 1)} units`,
        detail: `${round(input.seasonalityMultiplier, 2)}x seasonality factor`,
      },
      {
        label: "Reorder point",
        value: `${Math.ceil(reorderPoint)} units`,
        detail: `${input.leadTimeDays} lead-time days + ${input.safetyStockDays} safety days`,
      },
      {
        label: "Inventory position",
        value: `${inventoryPosition} units`,
        detail: `${input.currentInventory} on hand + ${input.inboundUnits} inbound`,
      },
      {
        label: "Days of cover",
        value: `${round(daysOfCover, 1)} days`,
        detail:
          inventoryPosition <= reorderPoint
            ? "Below preferred reorder threshold"
            : "Above preferred reorder threshold",
      },
      {
        label: "Sell-through",
        value: `${round(input.sellThroughRate, 2)}`,
        detail: excessInventoryRisk ? "Weak or excess-biased" : "Healthy enough for current stock posture",
      },
      {
        label: "Storage pressure",
        value: `${round(input.storageUtilizationWeeks, 1)} weeks`,
        detail: storageSurchargeRisk ? "Surcharge risk visible" : "No obvious surcharge pressure",
      },
    ],
    recommendations: [
      inventoryPosition <= reorderPoint
        ? "Place or accelerate a reorder now. Waiting is no longer a neutral choice because stockout risk is already inside the planning window."
        : "You still have room, but treat that room as temporary. Monitor velocity shifts weekly instead of monthly so you do not drift into a late reorder.",
      lowInventoryFeeRisk
        ? "Push inbound timing or replenish faster so FBA days of supply moves back above the 28-day fee threshold before Amazon turns low cover into a margin tax."
        : "Low-inventory fee pressure is not the main issue at the current cover level, so attention can stay on reorder timing or excess risk.",
      excessInventoryRisk
        ? "Do not send more stock into FBA until excess pressure is reduced through pricing, ads, removals, or slower buying."
        : "Excess inventory pressure is not yet the main constraint, so you do not need defensive liquidation behavior right now.",
      input.seasonalityMultiplier > 1.15
        ? "Increase monitoring frequency during event periods because baseline velocity is no longer a safe planning proxy."
        : "Current seasonality adjustment is manageable if lead times stay stable, so you can keep planning off this demand curve.",
      input.hasStrandedInventory || storageSurchargeRisk
        ? "Fix stranded or storage-pressure issues before approving a larger inbound move, or the next buy will compound the problem."
        : "Carry this stock view into shipping and storage planning before approving a larger buy, so replenishment and storage economics stay aligned.",
      inventoryPosition <= reorderPoint && excessInventoryRisk
        ? "Do not solve this with a blind reorder. Reset the demand assumption first, because you have both shortage and excess signals colliding."
        : "Assign one owner to reorder timing and one to sell-through health so replenishment does not ignore demand quality.",
    ],
    alerts,
    status: buildStatus(score, 82, 60, {
      good: "Inventory position looks healthy",
      warning: "Inventory plan needs adjustment",
      critical: "Inventory risk is elevated",
    }),
    actionStance: buildActionStance(score, {
      goAt: 82,
      cautionAt: 60,
    }, {
      go: "Hold the current inventory plan",
      caution: "Adjust the replenishment plan",
      stop: "Do not leave inventory on autopilot",
    }, {
      go: "The inventory position is stable enough to keep the current replenishment plan with normal monitoring.",
      caution: "The stock posture is workable, but reorder timing or fee pressure should be adjusted before it drifts into a bigger problem.",
      stop: "The inventory picture now carries enough stockout, fee, or excess risk that autopilot replenishment would be a mistake.",
    }),
    missingItems: [
      inventoryPosition <= reorderPoint ? "Reorder timing decision" : "",
      stockoutRiskDays < input.safetyStockDays ? "Safety stock reset" : "",
      input.hasStrandedInventory ? "Stranded inventory fix" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      "Decide reorder timing now instead of leaving the inventory position in an ambiguous middle state.",
      "Recheck seasonality, sell-through, and lead-time assumptions weekly so the next buy is based on live operating conditions.",
      "Separate reorder approval, stranded-inventory cleanup, and storage-fee response by owner before the next PO is placed.",
      "Carry this into storage-fee and IPI planning before the next inbound shipment is approved.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

export function evaluateProfitAnalyzer(input: {
  marketplace: string;
  category: string;
  sellingPrice: number;
  productCost: number;
  inboundShipping: number;
  fulfillmentFee: number;
  adCostPerOrder: number;
  returnRate: number;
  couponRate: number;
  storageCostPerUnit: number;
  overheadPerUnit: number;
}) {
  const normalizedCategory = normalizeCategoryBucket(input.category);
  const referralRate =
    referralFeeRates[normalizedCategory] ?? referralFeeRates.default;
  const hasCostBasis = input.productCost > 0;
  const hasFulfillmentBasis = input.fulfillmentFee > 0;
  const hasAdBasis = input.adCostPerOrder > 0;
  const completenessCount = [
    hasCostBasis,
    hasFulfillmentBasis,
    input.inboundShipping > 0,
    hasAdBasis,
  ].filter(Boolean).length;
  const assumptionQuality =
    completenessCount >= 4
      ? "Strong"
      : completenessCount >= 2
        ? "Partial"
        : "Thin";
  const couponCost = input.sellingPrice * input.couponRate;
  const referralFee = input.sellingPrice * referralRate;
  const preAdContribution =
    input.sellingPrice -
    couponCost -
    referralFee -
    input.productCost -
    input.inboundShipping -
    input.fulfillmentFee -
    input.storageCostPerUnit -
    input.overheadPerUnit;
  const expectedReturnReserve =
    input.returnRate *
    (input.productCost + input.inboundShipping + input.fulfillmentFee * 0.35);
  const netProfit =
    preAdContribution - input.adCostPerOrder - expectedReturnReserve;
  const marginRate =
    input.sellingPrice > 0 ? (netProfit / input.sellingPrice) * 100 : 0;
  const breakEvenAcos =
    input.sellingPrice - couponCost > 0
      ? (preAdContribution / (input.sellingPrice - couponCost)) * 100
      : 0;
  const leakShare =
    input.sellingPrice > 0
      ? ((input.adCostPerOrder + expectedReturnReserve + couponCost) /
          input.sellingPrice) *
        100
      : 0;
  const priceLiftFor15Margin = round(
    Math.max(0, (input.sellingPrice * 0.15 - netProfit) / 0.85),
    2,
  );
  const costReliefFor15Margin = round(
    Math.max(0, input.sellingPrice * 0.15 - netProfit),
    2,
  );
  const adCutFor25Acos = round(
    Math.max(0, input.adCostPerOrder - Math.max(0, preAdContribution - (input.sellingPrice - couponCost) * 0.25)),
    2,
  );
  const alerts: string[] = [];

  if (!hasCostBasis) {
    alerts.push("COGS is missing, so true profit is still incomplete.");
  }
  if (!hasFulfillmentBasis) {
    alerts.push("Fulfillment fee is missing, so the margin model is still optimistic.");
  }
  if (!hasAdBasis) {
    alerts.push("Ad cost per order is missing, so the model is not yet pressure-tested for paid traffic.");
  }
  if (marginRate < 10) {
    alerts.push("True net margin is thin once ads, couponing, and return reserve are included.");
  }
  if (preAdContribution <= 0) {
    alerts.push("Core unit economics are already underwater before PPC and return reserve are added.");
  }
  if (breakEvenAcos < 18) {
    alerts.push("Break-even ACoS is tight. PPC scaling room is limited.");
  }
  if (input.returnRate >= 0.08) {
    alerts.push("Return rate is materially eroding contribution margin.");
  }
  if (couponCost >= input.sellingPrice * 0.08) {
    alerts.push("Promotions are taking a meaningful share of unit economics.");
  }

  const commercialCall =
    !hasCostBasis || !hasFulfillmentBasis
      ? "Do not approve this SKU yet"
      : preAdContribution <= 0
        ? "Kill this unit before PPC discussion"
        : marginRate < 10
          ? "Stop scale and repair the margin stack now"
          : marginRate < 15
            ? "Tighten leaks before this SKU earns more growth"
            : "Approve measured scale from the current unit base";
  const decisionOwner =
    !hasCostBasis || !hasFulfillmentBasis
      ? "Finance / sourcing lead"
      : hasAdBasis && breakEvenAcos < 25
        ? "Performance + finance lead"
        : "Unit economics lead";
  const forbiddenMove =
    !hasCostBasis || !hasFulfillmentBasis
      ? "Do not build a margin story from placeholders"
      : preAdContribution <= 0
        ? "Do not let traffic or demand hide a broken unit"
        : marginRate < 10
          ? "Do not buy inventory or scale PPC into a thin unit"
          : "Do not let promo depth or ad spend silently trade away the approved margin floor";
  const rerunTrigger =
    !hasAdBasis
      ? "Re-run once ad cost per order is loaded"
      : "Re-run the same unit the moment price, fee, promo, or return assumptions move";

  return {
    headline:
      !hasCostBasis || !hasFulfillmentBasis
        ? "Do not approve this SKU yet - the unit model is still incomplete"
        : preAdContribution <= 0
          ? "Kill this unit before PPC and promo spend make the mistake more expensive"
          : marginRate < 10
            ? "Stop scale until this unit clears a healthier margin floor"
            : marginRate < 15
              ? "Repair leaks before this unit earns more inventory or spend"
              : "Approve measured scale from the current unit economics",
    summary:
      "Use this unit read to decide whether the SKU earns inventory, needs margin repair, or should be shut before ads and promos make the mistake more expensive.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${decisionOwner} should make the next economic call.`,
      },
      {
        label: "Assumption quality",
        value: assumptionQuality,
        detail: `${completenessCount}/4 major cost lines loaded`,
      },
      {
        label: "Referral fee",
        value: formatCurrency(round(referralFee)),
        detail: `${Math.round(referralRate * 100)}% marketplace referral rate`,
      },
      {
        label: "Pre-ad contribution",
        value: formatCurrency(round(preAdContribution)),
        detail: "Before PPC and return reserve",
      },
      {
        label: "Break-even ACoS",
        value: `${round(Math.max(0, breakEvenAcos), 1)}%`,
        detail: "Maximum ad spend share before net profit hits zero",
      },
      {
        label: "Net margin",
        value: `${round(marginRate, 1)}%`,
        detail: `${formatCurrency(round(netProfit))} on ${formatCurrency(round(input.sellingPrice))}`,
      },
      {
        label: "Go / no-go line",
        value:
          marginRate >= 15
            ? "Margin is already above the 15% working line"
            : hasAdBasis && breakEvenAcos < 25
              ? `Recover about ${formatCurrency(adCutFor25Acos)} of ad cost per order`
              : `Find about ${formatCurrency(Math.max(priceLiftFor15Margin, costReliefFor15Margin))} of price room or cost relief`,
        detail:
          marginRate >= 15
            ? "The next question is holding this line while you scale, not rescuing it."
            : hasAdBasis && breakEvenAcos < 25
              ? "This is the fastest paid-traffic repair if price cannot move first."
              : "Treat this as the minimum economic repair before approving more inventory, promo depth, or PPC scale.",
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: forbiddenMove,
      },
      {
        label: "Wrong move",
        value: forbiddenMove,
        detail: "Do not let traffic, inventory, or promo planning outrun the current unit truth.",
      },
      {
        label: "Leak share",
        value: `${round(leakShare, 1)}%`,
        detail: "Ads + returns + coupons as share of selling price",
      },
      {
        label: "Return reserve",
        value: formatCurrency(round(expectedReturnReserve)),
        detail: `${round(input.returnRate * 100, 1)}% assumed return rate`,
      },
      {
        label: "Re-run trigger",
        value: rerunTrigger,
        detail: "Do not keep arguing from stale unit economics once a real cost line moves.",
      },
    ],
    recommendations: [
      !hasCostBasis || !hasFulfillmentBasis
        ? "Keep the lane closed until real COGS and fulfillment fees are loaded. Anything else is false precision."
        : preAdContribution <= 0
          ? "Stop at base economics. Repair price, landed cost, or FBA burden before anyone discusses traffic, promo depth, or inventory."
          : hasAdBasis && breakEvenAcos < 20
            ? "The first repair lane is ad room. Lower ad cost per order or recover the same dollars elsewhere before calling this scaleable."
            : "The unit survives the first margin screen. Hold every other debate closed and pressure-test the paid-traffic ceiling next.",
      !hasAdBasis
        ? "Load ad cost per order next. Until then, this is still a partial economics read, not a launch or scale approval."
        : marginRate < 10
          ? "Do not let inventory, PPC, or promo planning outrun this margin stack. One thin unit can burn cash fast."
          : "Keep bids, coupons, and price changes tied to the approved margin floor instead of topline goals.",
      couponCost > 0
        ? "Treat promo depth as part of the same economics lane. Re-run before every discount plan so the margin give-up is explicit."
        : input.returnRate >= 0.08
          ? "Returns are large enough to matter, but they stay as a tracked cost line until the primary economics blocker is fixed."
          : "Keep returns and discounts in the model as monitored cost lines, not background assumptions.",
    ],
    alerts,
    status:
      !hasCostBasis || !hasFulfillmentBasis
        ? { label: "Profit model is incomplete", tone: "critical" as const }
        : buildStatus(marginRate, 18, 10, {
            good: "Profit profile looks workable",
            warning: "Profit profile needs tightening",
            critical: "Profit profile is too thin",
          }),
    actionStance:
      !hasCostBasis || !hasFulfillmentBasis
        ? {
            label: "Do not approve this SKU yet",
            tone: "critical" as const,
            detail: "The model is still missing core cost lines, so any go or no-go call would be false precision.",
          }
        : buildActionStance(marginRate, {
            goAt: 18,
            cautionAt: 10,
          }, {
            go: "Approve the unit economics",
            caution: "Tighten the margin model first",
            stop: "Do not scale this SKU yet",
          }, {
            go: "The unit economics are strong enough to support launch or measured scale without relying on wishful assumptions.",
            caution: "Do not widen inventory or traffic commitments yet. Tighten the margin stack first, then scale.",
            stop: "The current economics are too thin to trust for scale, and small execution misses would likely turn into cash loss.",
          }),
    missingItems: [
      input.adCostPerOrder <= 0 ? "Validated ad cost per order" : "",
      input.fulfillmentFee <= 0 ? "Fulfillment fee input" : "",
      input.productCost <= 0 ? "Accurate product cost" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      !hasCostBasis || !hasFulfillmentBasis
        ? "Finish the core cost stack before any go or no-go call."
        : !hasAdBasis
          ? "Load paid-traffic cost next so this unit can graduate from directional to decision-grade."
          : "Lock the approved break-even ACoS ceiling before PPC scale conversations start.",
      marginRate < 15
        ? hasAdBasis && breakEvenAcos < 25
          ? `Recover about ${formatCurrency(adCutFor25Acos)} from ad cost per order, or recover the same dollars elsewhere in the stack.`
          : `Recover about ${formatCurrency(Math.max(priceLiftFor15Margin, costReliefFor15Margin))} through price, COGS, or fee relief before calling this scale-ready.`
        : "Keep the unit above a 15% net margin while traffic scales.",
      "Re-run only after the active economics blocker changes on the same cost stack.",
    ],
    evidence: profitAnalyzerEvidence,
  } satisfies ToolEvaluation;
}

export function evaluateSalesEstimator(input: {
  marketplace: string;
  category: string;
  bsr: number;
  sellingPrice: number;
  source: "live" | "manual";
}) {
  const normalizedCategory = normalizeCategoryBucket(input.category);
  const monthlyUnits = estimateMonthlyUnitsFromBsr(input.category, input.bsr);
  const dailyUnits = monthlyUnits / 30;
  const monthlyRevenue = monthlyUnits * input.sellingPrice;
  const weeklyRevenue = (monthlyRevenue / 30) * 7;
  const confidence =
    input.source === "live"
      ? input.bsr <= 5000
        ? 82
        : input.bsr <= 30000
          ? 72
          : 60
      : input.bsr <= 10000
        ? 68
        : 55;
  const alerts: string[] = [];

  if (input.bsr > 50000) {
    alerts.push("Higher BSR bands are noisier. Treat this as directional rather than forecast-grade.");
  }
  if (!["US", "CA", "UK", "DE", "FR", "IT", "ES", "JP"].includes(input.marketplace)) {
    alerts.push("This marketplace uses a generic category curve instead of a tuned local one.");
  }
  if (input.sellingPrice <= 0) {
    alerts.push("Revenue interpretation is limited until a realistic selling price is entered.");
  }
  if (monthlyUnits > 0 && monthlyRevenue > 0 && monthlyRevenue < 3000) {
    alerts.push("Even if the estimate is directionally right, this revenue band may still be too small for meaningful effort.");
  }
  const demandVerdict =
    input.sellingPrice <= 0
      ? "Add a real sell price before turning this estimate into a business decision"
      : monthlyUnits < 120
        ? "Keep this demand lane out of sourcing for now"
        : monthlyRevenue < 3000
          ? "Keep this as a directional demand read until the economics justify the effort"
          : input.bsr > 30000
            ? "Validate this demand band with comparables before committing"
            : "Carry this demand band into profit and inventory planning now";
  const demandOwner =
    input.sellingPrice <= 0
      ? "Opportunity screening owner"
      : monthlyUnits < 120 || monthlyRevenue < 3000
        ? "Demand validation lead"
        : input.bsr > 30000
          ? "Market research lead"
          : "Demand planning owner";
  const demandMoveNow =
    input.sellingPrice <= 0
      ? "Add a real sell price so the estimate can be translated into revenue and cover math"
      : monthlyUnits < 120
        ? "Keep this lane out of sourcing and confirm whether adjacent ASINs tell a stronger demand story"
        : monthlyRevenue < 3000
          ? "Route this into profit analysis only if the team still believes the effort level makes sense"
          : input.bsr > 30000
            ? "Use nearby ASINs to confirm the demand band before translating this estimate into sourcing or reorder action"
            : "Push this demand band straight into profit and inventory planning on the same comparable set";
  const demandDoNotCross =
    input.sellingPrice <= 0
      ? "Do not treat a unit estimate without price as a business case"
      : monthlyUnits < 120
        ? "Do not let light demand trigger sourcing or launch work by optimism alone"
        : monthlyRevenue < 3000
          ? "Do not confuse visible demand with a meaningful business lane"
          : input.bsr > 30000
            ? "Do not let one long-tail BSR reading anchor the whole opportunity"
            : "Do not separate demand sizing from margin and inventory reality";
  const demandRiskBrief =
    input.sellingPrice <= 0
      ? "Without a real sell price, this is still only a unit-volume sketch."
      : monthlyRevenue < 3000
        ? `${monthlyUnits.toLocaleString("en-US")} monthly units only translate to about ${formatCurrency(round(monthlyRevenue))} in monthly revenue at the current price input.`
        : input.bsr > 30000
          ? `BSR #${input.bsr.toLocaleString("en-US")} sits in a noisier band, so one reading should not decide the lane.`
          : `${monthlyUnits.toLocaleString("en-US")} monthly units and about ${formatCurrency(round(monthlyRevenue))} monthly revenue are commercially large enough to test further.`;
  const demandRerunTrigger =
    input.sellingPrice <= 0
      ? "Re-run once a real sell price is loaded"
      : input.bsr > 30000
        ? "Re-run only after nearby comparable ASINs confirm or reject this same demand band"
        : "Re-run when the comparable set, live BSR, or sell price changes enough to alter the business call";

  return {
    headline:
      input.sellingPrice <= 0
        ? "Add a real sell price before using this demand estimate"
        : `${demandVerdict} - estimated ${monthlyUnits.toLocaleString("en-US")} monthly units at BSR #${input.bsr.toLocaleString("en-US")}`,
    summary:
      "Use this demand read to decide whether the lane deserves profit and inventory work now or should stay closed until the evidence is stronger.",
    metrics: [
      {
        label: "Commercial call",
        value: demandVerdict,
        detail: `${demandMoveNow}. ${demandOwner} owns the next demand decision.`,
      },
      {
        label: "Open lane",
        value: demandMoveNow,
        detail: demandRiskBrief,
      },
      {
        label: "Monthly unit estimate",
        value: `${monthlyUnits.toLocaleString("en-US")} units`,
        detail: input.source === "live" ? "Pulled from live page BSR" : "Based on manual BSR input",
      },
      {
        label: "Daily run rate",
        value: `${round(dailyUnits, 1)} units`,
        detail: "Monthly units divided by 30 days",
      },
      {
        label: "Monthly revenue",
        value: formatCurrency(round(monthlyRevenue)),
        detail: `${formatCurrency(round(weeklyRevenue))} weekly equivalent`,
      },
      {
        label: "Confidence",
        value: `${confidence}%`,
        detail: `${normalizedCategory} category sales curve`,
      },
      {
        label: "Annualized revenue",
        value: formatCurrency(round(monthlyRevenue * 12)),
        detail: "Simple monthly run-rate extrapolation",
      },
      {
        label: "Decision owner",
        value: demandOwner,
        detail: demandDoNotCross,
      },
      {
        label: "Wrong move",
        value: demandDoNotCross,
        detail: "Keep the same demand sample long enough to know whether the lane is real.",
      },
      {
        label: "Re-run trigger",
        value: demandRerunTrigger,
        detail: "Do not keep refreshing the sample until it says what you want.",
      },
    ],
    recommendations: [
      monthlyUnits < 120
        ? "Demand looks modest. Do not let revenue excitement outrun the real margin and competition check."
        : "Demand is commercially relevant enough to continue, but only if margin and competition still clear the lane.",
      input.bsr > 30000
        ? "Do not let one long-tail BSR reading anchor the decision. Validate with multiple comparable ASINs before trusting it."
        : "Use this as a first-pass screen, then compare against adjacent competitor ASINs so one listing does not anchor the whole demand story.",
      monthlyRevenue < 3000
        ? "Do not confuse visible demand with a worthwhile business. Push this into profit analysis only if the effort level still makes sense."
        : "Push the estimate into profit analysis next so revenue potential and margin quality are judged together instead of separately.",
      `Re-run only when this same demand lane changes state: ${demandRerunTrigger.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(confidence, 75, 60, {
      good: "Estimate confidence looks usable",
      warning: "Estimate is directional",
      critical: "Estimate confidence is limited",
    }),
    actionStance: buildActionStance(confidence, {
      goAt: 75,
      cautionAt: 60,
    }, {
      go: "Use this demand estimate",
      caution: "Validate with more comparables",
      stop: "Do not build the case on this alone",
    }, {
      go: "The BSR-based demand read is stable enough to use as an early commercial screen.",
      caution: "The estimate is directionally useful, but one more comparable or live check should confirm it before it drives bigger decisions.",
      stop: "The current estimate is too noisy or incomplete to support a real business decision on its own.",
    }),
    missingItems: [
      input.source === "manual" ? "Live ASIN verification" : "",
      input.sellingPrice <= 0 ? "Selling price" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${demandOwner} should own the first move: ${demandMoveNow.toLowerCase()}.`,
      "Feed the revenue range into profit analysis before making any sourcing or launch commitment.",
      "Freeze the comparable set for the next check so demand changes are not confused with a different sample.",
      "Track BSR over time only if the opportunity still survives the profit and competition screens.",
    ],
    evidence: salesEstimatorEvidence,
  } satisfies ToolEvaluation;
}

export function evaluateNegativeKeywords(input: {
  termCount: number;
  negateCount: number;
  isolateCount: number;
  keepCount: number;
  testCount: number;
  wastedSpend: number;
  targetAcos: number;
  targetCpa: number;
}) {
  const cleanupRate =
    input.termCount > 0
      ? ((input.negateCount + input.isolateCount) / input.termCount) * 100
      : 0;
  const alerts: string[] = [];

  if (input.negateCount >= Math.max(3, Math.ceil(input.termCount * 0.2))) {
    alerts.push("A large share of the report looks like wasted spend rather than exploration.");
  }
  if (input.wastedSpend >= input.targetCpa * 5) {
    alerts.push("Wasted spend is already large enough to change campaign efficiency materially.");
  }
  if (input.isolateCount === 0 && input.keepCount > 0) {
    alerts.push("There are converting terms, but none are strong enough to isolate yet.");
  }
  if (input.testCount > input.keepCount + input.isolateCount) {
    alerts.push("Too much of the report is still sitting in the test bucket, so budget learning is diffused.");
  }

  const negativeKeywordScore =
    input.negateCount === 0 ? 88 : input.negateCount <= 4 ? 70 : 52;
  const negativeVerdict =
    input.negateCount >= Math.max(3, Math.ceil(input.termCount * 0.2)) || input.wastedSpend >= input.targetCpa * 5
      ? "Ship the waste cleanup before scaling anything else"
      : input.isolateCount > 0
        ? "Isolate winners and tighten the waste pass now"
        : "Keep harvesting, but do not widen spend yet";
  const negativeOwner =
    input.negateCount >= Math.max(3, Math.ceil(input.termCount * 0.2)) || input.wastedSpend >= input.targetCpa * 5
      ? "PPC cleanup lead"
      : input.isolateCount > 0
        ? "Search-term structure owner"
        : "Search-term watch owner";
  const negativeMoveNow =
    input.negateCount >= Math.max(3, Math.ceil(input.termCount * 0.2)) || input.wastedSpend >= input.targetCpa * 5
      ? "Push the obvious waste terms into negatives before any new scale or bid expansion"
      : input.isolateCount > 0
        ? "Split winner isolation from stop-loss cleanup and ship both in one controlled pass"
        : "Keep the report in observation mode until clearer waste or winner signals appear";
  const negativeDoNotCross =
    input.negateCount >= Math.max(3, Math.ceil(input.termCount * 0.2)) || input.wastedSpend >= input.targetCpa * 5
      ? "Do not keep feeding wasted spend while waiting for perfect data"
      : input.isolateCount > 0
        ? "Do not mix stop-loss terms and scale terms into one vague PPC edit"
        : "Do not widen spend from a report that still lacks clear winners";
  const negativeRiskBrief =
    `${input.negateCount} negate candidates, ${input.isolateCount} isolate terms, and ${formatCurrency(round(input.wastedSpend))} in wasted spend are sitting in the current report.`;
  const negativeRerunTrigger =
    input.negateCount > 0 || input.isolateCount > 0
      ? "Re-run after the next fresh search-term report lands from the same campaign set"
      : "Re-run only after more clicks or spend accumulate enough to separate waste from winners";

  return {
    headline: `${negativeVerdict} - ${input.negateCount} negate candidates and ${input.isolateCount} isolate terms found`,
    summary:
      "Use this search-term read to decide whether the first move is stop-loss cleanup, winner isolation, or disciplined watch mode.",
    metrics: [
      {
        label: "Commercial call",
        value: negativeVerdict,
        detail: `${negativeMoveNow}. ${negativeOwner} owns the next search-term decision.`,
      },
      {
        label: "Open lane",
        value: negativeMoveNow,
        detail: negativeRiskBrief,
      },
      {
        label: "Terms parsed",
        value: `${input.termCount}`,
        detail: "Rows successfully read from the report",
      },
      {
        label: "Negate now",
        value: `${input.negateCount}`,
        detail: "High-waste terms with weak conversion evidence",
      },
      {
        label: "Isolate winners",
        value: `${input.isolateCount}`,
        detail: "Terms strong enough for tighter bid control",
      },
      {
        label: "Wasted spend",
        value: formatCurrency(round(input.wastedSpend)),
        detail: `${round(cleanupRate, 1)}% of terms need cleanup or isolation`,
      },
      {
        label: "Guardrails",
        value: `${round(input.targetAcos * 100, 1)}% / ${formatCurrency(round(input.targetCpa))}`,
        detail: "Target ACoS and CPA used in classification",
      },
      {
        label: "Observation queue",
        value: `${input.testCount}`,
        detail: "Terms still gathering evidence before keep or negate",
      },
      {
        label: "Decision owner",
        value: negativeOwner,
        detail: negativeDoNotCross,
      },
      {
        label: "Wrong move",
        value: negativeDoNotCross,
        detail: "Keep cleanup and scale work separate enough that the next report teaches something.",
      },
      {
        label: "Re-run trigger",
        value: negativeRerunTrigger,
        detail: "Do not keep editing against stale search-term evidence.",
      },
    ],
    recommendations: [
      input.negateCount > 0
        ? "Do not keep feeding waste while you wait for more data. Push the obvious waste terms into negative exact or phrase first, then recheck drift next week."
        : "No large waste bucket is visible yet. Keep harvesting terms, but keep the threshold review in place.",
      input.isolateCount > 0
        ? "Move high-confidence winners into their own ad groups or exact-match campaigns so bids and budgets stop being diluted."
        : "There are no clear isolate winners yet. Keep testing before splitting campaign structure further.",
      input.testCount > input.keepCount + input.isolateCount
        ? "Do not let the test bucket become a parking lot. Tighten the evidence threshold so budget is not trapped in endless observation."
        : "Use the test bucket as a protected observation queue rather than leaving every term in broad harvest campaigns indefinitely.",
      input.wastedSpend >= input.targetCpa * 5
        ? "Assign one owner to stop-loss cleanup and one to winner isolation so cost control and scaling do not compete for attention."
        : "Keep negatives and isolate moves on the same review rhythm so the account learns and cleans up at the same time.",
      `Re-run only when this same search-term lane changes state: ${negativeRerunTrigger.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(negativeKeywordScore, 80, 60, {
      good: "Search-term waste looks controlled",
      warning: "Search-term cleanup is needed",
      critical: "Search-term waste is significant",
    }),
    actionStance: buildActionStance(negativeKeywordScore, {
      goAt: 80,
      cautionAt: 60,
    }, {
      go: "Ship the cleanup pass",
      caution: "Negate waste before scaling",
      stop: "Do not leave this report untouched",
    }, {
      go: "The account is clean enough to run the planned negate and isolate pass without broader restructuring first.",
      caution: "The report has usable signals, but waste should be cleaned up before more scale work happens.",
      stop: "The current term waste is too material to leave alone for another cycle.",
    }),
    missingItems: [
      input.termCount === 0 ? "Search term report rows" : "",
      input.keepCount === 0 ? "Confirmed converting search terms" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${negativeOwner} should own the first move: ${negativeMoveNow.toLowerCase()}.`,
      "Separate stop-loss terms from scale terms before the next PPC edit so one pass does not blur two different jobs.",
      "Review the test bucket after more clicks accumulate.",
      "Re-run this workflow on fresh reports every 7 to 14 days.",
    ],
    evidence: negativeKeywordsEvidence,
  } satisfies ToolEvaluation;
}

export function evaluateCompetitorAnalysis(input: {
  ownPrice: number;
  ownReviewCount: number;
  ownImageCount: number;
  ownHasAPlus: boolean;
  ownRating: number;
  competitorCount: number;
  averageCompetitorPrice: number;
  averageCompetitorReviewCount: number;
  averageCompetitorImageCount: number;
  competitorsWithAPlus: number;
  cheaperCompetitors: number;
  strongerReviewCompetitors: number;
  richerImageCompetitors: number;
  higherRatedCompetitors: number;
  ownCurrentRank: number;
  averageCompetitorRank: number;
  bestCompetitorRank: number;
}) {
  const priceGap = input.ownPrice - input.averageCompetitorPrice;
  const reviewGap = input.ownReviewCount - input.averageCompetitorReviewCount;
  const imageGap = input.ownImageCount - input.averageCompetitorImageCount;
  const aPlusCoverage =
    input.competitorCount > 0
      ? (input.competitorsWithAPlus / input.competitorCount) * 100
      : 0;
  const alerts: string[] = [];

  if (input.cheaperCompetitors >= Math.ceil(input.competitorCount / 2)) {
    alerts.push("Most competitors are pricing below this ASIN's current sell price.");
  }
  if (input.strongerReviewCompetitors >= Math.ceil(input.competitorCount / 2)) {
    alerts.push("Competitor review proof is stronger than this ASIN on most comparisons.");
  }
  if (input.richerImageCompetitors >= Math.ceil(input.competitorCount / 2)) {
    alerts.push("Competitors are showing richer image coverage than this ASIN.");
  }
  if (!input.ownHasAPlus && input.competitorsWithAPlus > 0) {
    alerts.push("Competitors are using A+ while this ASIN is not.");
  }
  if (input.ownCurrentRank > 0 && input.bestCompetitorRank > 0 && input.ownCurrentRank > input.bestCompetitorRank) {
    alerts.push("At least one competitor is also outranking this ASIN on visible BSR.");
  }

  const competitorAnalysisScore =
    100 -
    input.cheaperCompetitors * 12 -
    input.strongerReviewCompetitors * 14 -
    input.richerImageCompetitors * 10 -
    (!input.ownHasAPlus && input.competitorsWithAPlus > 0 ? 12 : 0);
  const hasMaterialGap =
    input.cheaperCompetitors > 0 ||
    input.strongerReviewCompetitors > 0 ||
    input.richerImageCompetitors > 0 ||
    (!input.ownHasAPlus && input.competitorsWithAPlus > 0);
  const pricePressureShare =
    input.competitorCount > 0 ? input.cheaperCompetitors / input.competitorCount : 0;
  const proofPressureShare =
    input.competitorCount > 0 ? input.strongerReviewCompetitors / input.competitorCount : 0;
  const assetPressureShare =
    input.competitorCount > 0 ? input.richerImageCompetitors / input.competitorCount : 0;
  const ratingPressureShare =
    input.competitorCount > 0 ? input.higherRatedCompetitors / input.competitorCount : 0;
  const primaryGap =
    !hasMaterialGap
      ? "messaging edge"
      : input.strongerReviewCompetitors >= Math.max(input.cheaperCompetitors, input.richerImageCompetitors)
      ? "proof gap"
      : input.cheaperCompetitors >= input.richerImageCompetitors
        ? "price gap"
        : "asset gap";
  const primaryRepairLane =
    primaryGap === "proof gap"
      ? "Trust-proof repair"
      : primaryGap === "price gap"
        ? "Price-position repair"
        : primaryGap === "asset gap"
          ? "Creative-asset repair"
          : "Message-focus test";
  const firstRepairOwner =
    primaryGap === "proof gap"
      ? "CX / reputation lead"
      : primaryGap === "price gap"
        ? "Pricing / offer lead"
        : primaryGap === "asset gap"
          ? "Creative / PDP lead"
          : "PDP lead";
  const primaryRepairMove =
    primaryGap === "proof gap"
      ? "Freeze spend and repair trust proof"
      : primaryGap === "price gap"
        ? "Freeze spend and repair price position"
        : primaryGap === "asset gap"
          ? "Freeze spend and repair the gallery"
          : "Run one controlled messaging test";
  const gapSeverityBrief =
    primaryGap === "proof gap"
      ? `${input.strongerReviewCompetitors}/${input.competitorCount} rivals carry more review proof`
      : primaryGap === "price gap"
        ? `${input.cheaperCompetitors}/${input.competitorCount} rivals undercut this offer on visible price`
        : primaryGap === "asset gap"
          ? `${input.richerImageCompetitors}/${input.competitorCount} rivals show more image depth`
          : "No clean structural loss is dominating this rival set";
  const doNotCrossLine =
    primaryGap === "proof gap"
      ? "Do not buy traffic into a trust deficit"
      : primaryGap === "price gap"
        ? "Do not sit in the middle on price and story at the same time"
        : primaryGap === "asset gap"
          ? "Do not polish copy while the gallery is still losing the click"
          : "Do not trigger a broad reset without one clean losing surface";
  const commercialCall =
    !hasMaterialGap
      ? "Keep the PDP steady and run one benchmark-led message test"
      : competitorAnalysisScore < 58
      ? primaryGap === "proof gap"
        ? "Freeze spend and repair trust proof now"
        : primaryGap === "price gap"
          ? "Freeze spend and repair price position now"
          : "Freeze spend and rebuild the gallery now"
      : primaryGap === "proof gap"
        ? "Hold scale and repair trust proof first"
        : primaryGap === "price gap"
          ? "Hold scale and repair price position first"
          : "Hold scale and repair creative assets first";

  return {
    headline:
      !hasMaterialGap
        ? `Keep the PDP steady and approve one benchmark-led message test`
        : competitorAnalysisScore < 58
        ? primaryGap === "proof gap"
          ? `Freeze spend now - this PDP is losing on trust proof across ${input.competitorCount} live rivals`
          : primaryGap === "price gap"
            ? `Freeze spend now - this PDP is losing on price position across ${input.competitorCount} live rivals`
            : `Freeze spend now - this PDP is losing on creative assets across ${input.competitorCount} live rivals`
        : commercialCall,
    summary:
      "Use this competitor read to choose the one losing surface that actually matters, assign one owner to it, and keep the rest of the PDP stable until that repair lands.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${primaryRepairLane} is the only lane that should stay open right now. ${gapSeverityBrief}.`,
      },
      {
        label: "Price position",
        value: formatCurrency(round(priceGap)),
        detail:
          priceGap > 0
            ? "This ASIN is priced above competitor average"
            : "This ASIN is at or below competitor average",
      },
      {
        label: "Trust proof",
        value: `${Math.round(reviewGap)}`,
        detail: "Own review count minus competitor average",
      },
      {
        label: "Gallery depth",
        value: `${round(imageGap, 1)}`,
        detail: "Own image count minus competitor average",
      },
      {
        label: "A+ pressure",
        value: `${round(aPlusCoverage, 0)}%`,
        detail: `${input.competitorsWithAPlus} of ${input.competitorCount} competitors show A+`,
      },
      {
        label: "Open lane",
        value: primaryRepairLane,
        detail: `${firstRepairOwner} owns the first commercial response.`,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep every other repair lane closed until the first losing surface stops losing.",
      },
      {
        label: "Rating pressure",
        value: `${input.higherRatedCompetitors}/${input.competitorCount}`,
        detail: "Competitors with higher visible rating than own ASIN",
      },
      {
        label: "Rank pressure",
        value:
          input.ownCurrentRank > 0 && input.bestCompetitorRank > 0
            ? `#${input.ownCurrentRank.toLocaleString("en-US")} vs #${Math.round(input.bestCompetitorRank).toLocaleString("en-US")}`
            : "Partial baseline",
        detail:
          input.averageCompetitorRank > 0
            ? `Competitor average #${Math.round(input.averageCompetitorRank).toLocaleString("en-US")}`
            : "Rank comparison incomplete",
      },
    ],
    recommendations: [
      !hasMaterialGap
        ? "Keep price, proof, and gallery mostly frozen. Approve one controlled message test instead of reopening the whole PDP."
        : `Freeze every lane except ${primaryRepairLane.toLowerCase()}.`,
      primaryGap === "proof gap"
        ? "The owner for this cycle should repair trust proof first. Keep price, gallery, and copy changes closed until proof stops losing."
        : primaryGap === "price gap"
          ? "The owner for this cycle should make one explicit price call: either meet the market or defend a premium. Do not open gallery or copy work yet."
          : primaryGap === "asset gap"
            ? "The owner for this cycle should rebuild the gallery first. Minor wording, price nudges, and broad rewrites stay closed until that lands."
            : "The owner for this cycle should run one message test against one benchmark rival and keep the rest of the PDP closed.",
      primaryGap === "proof gap"
        ? "Forbidden move: buying more traffic into a weaker trust surface."
        : primaryGap === "price gap"
          ? "Forbidden move: drifting in the middle with neither the best price nor the clearest premium case."
          : primaryGap === "asset gap"
            ? "Forbidden move: polishing copy while the gallery still loses the click."
            : "Forbidden move: turning one clean comparison into a full PDP rewrite.",
      input.ownCurrentRank > 0 && input.bestCompetitorRank > 0 && input.ownCurrentRank > input.bestCompetitorRank
        ? "Benchmark the best-ranked rival first and beat its winning surface before broadening the market read."
        : "Use one benchmark rival to validate the first fix before touching secondary gaps.",
      !hasMaterialGap
        ? "Re-run after one measurable PDP change so the next read stays causal instead of speculative."
        : competitorAnalysisScore < 58
          ? "Re-run only after the first hard repair is live. Do not unlock broader spend before that."
          : "Re-run after the first repair ships and check whether the same lane is still losing.",
    ],
    alerts,
    status: buildStatus(competitorAnalysisScore, 78, 58, {
      good: "Competitive posture looks workable",
      warning: "Competitive gaps need attention",
      critical: "Competitive gaps are material",
    }),
    actionStance: buildActionStance(competitorAnalysisScore, {
      goAt: 78,
      cautionAt: 58,
    }, {
      go: "Approve one message test",
      caution: primaryRepairMove,
      stop: commercialCall,
    }, {
      go: "Approve one focused message test only. Keep spend defended and leave the rest of the PDP closed.",
      caution: `${gapSeverityBrief}. Keep one repair lane open, hold scale, and freeze the other levers until the first response lands.`,
      stop: `${gapSeverityBrief}. ${doNotCrossLine}.`,
    }),
    missingItems: [
      input.competitorCount === 0 ? "Competitor ASINs" : "",
      input.ownReviewCount === 0 ? "Visible own review proof" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      !hasMaterialGap
        ? "Approve one benchmark-led message test and keep every other surface closed."
        : `Open ${primaryRepairLane.toLowerCase()} first and freeze every other lane.`,
      `${firstRepairOwner} owns this cycle: ${primaryRepairMove.toLowerCase()}.`,
      `Do not unlock broad rewrites or extra spend until the ${primaryGap} response shows measurable lift.`,
      "Re-run the comparison after the first live repair lands.",
      "Approve the second move only after the first lane stops losing.",
    ],
    evidence: competitorAnalysisEvidence,
  } satisfies ToolEvaluation;
}

export function evaluateReviewAnalyzer(input: {
  reviewCount: number;
  averageRating: number;
  negativeShare: number;
  complaintThemeCount: number;
  praiseThemeCount: number;
  featureOpportunityCount: number;
  topComplaintTheme: string;
  topPraiseTheme: string;
}) {
  const alerts: string[] = [];
  const complaintTheme = input.topComplaintTheme.toLowerCase();
  let primaryFix = "Tighten listing clarity and post-purchase guidance first.";
  let primaryFixReason = "Mixed complaints usually mean buyers are landing with the wrong expectation.";

  if (complaintTheme.includes("pack")) {
    primaryFix = "Strengthen packaging and in-transit protection first.";
    primaryFixReason = "Damage and unboxing complaints usually keep generating returns even if traffic quality improves.";
  } else if (
    complaintTheme.includes("clarity") ||
    complaintTheme.includes("description") ||
    complaintTheme.includes("expect") ||
    complaintTheme.includes("mislead")
  ) {
    primaryFix = "Rewrite the title, bullets, and image sequence for expectation match first.";
    primaryFixReason = "Expectation gaps are usually cheaper to fix in the listing than in the product.";
  } else if (
    complaintTheme.includes("quality") ||
    complaintTheme.includes("durab") ||
    complaintTheme.includes("broken") ||
    complaintTheme.includes("defect")
  ) {
    primaryFix = "Push supplier QA and defect containment first.";
    primaryFixReason = "Quality-led complaints usually keep hurting rating and refund rate until supply is fixed.";
  } else if (
    complaintTheme.includes("assembly") ||
    complaintTheme.includes("setup") ||
    complaintTheme.includes("instruction") ||
    complaintTheme.includes("install")
  ) {
    primaryFix = "Improve setup instructions and demo assets first.";
    primaryFixReason = "Setup friction usually converts into avoidable low-star reviews before the product itself is judged.";
  }

  if (input.negativeShare >= 0.4) {
    alerts.push("Negative review share is high enough to threaten conversion and return rate together.");
  }
  if (input.complaintThemeCount > input.praiseThemeCount) {
    alerts.push("Complaint themes are more concentrated than praise themes.");
  }
  if (input.reviewCount < 8) {
    alerts.push("Review sample is small. Treat themes as directional, not complete.");
  }
  if (input.averageRating > 0 && input.averageRating < 4) {
    alerts.push("Average rating is below the typical comfort zone for stable conversion.");
  }

  const reviewAnalyzerScore =
    100 - input.negativeShare * 100 - Math.max(0, input.complaintThemeCount - input.praiseThemeCount) * 6;
  const commercialCall =
    input.negativeShare >= 0.35 && input.complaintThemeCount > 0
      ? complaintTheme.includes("quality") ||
          complaintTheme.includes("durab") ||
          complaintTheme.includes("broken") ||
          complaintTheme.includes("defect")
        ? "Stop traffic expansion and fix supplier quality now"
        : complaintTheme.includes("pack")
          ? "Stop traffic expansion and fix damage now"
          : complaintTheme.includes("assembly") ||
              complaintTheme.includes("setup") ||
              complaintTheme.includes("instruction") ||
              complaintTheme.includes("install")
            ? "Hold scale and remove setup friction now"
            : "Hold scale and fix the dominant complaint now"
      : "Approve one contained review-led fix";
  const decisionOwner =
    complaintTheme.includes("quality") ||
    complaintTheme.includes("durab") ||
    complaintTheme.includes("broken") ||
    complaintTheme.includes("defect")
      ? "Product / QA lead"
      : complaintTheme.includes("pack")
        ? "Packaging lead"
        : complaintTheme.includes("assembly") ||
            complaintTheme.includes("setup") ||
            complaintTheme.includes("instruction") ||
            complaintTheme.includes("install")
          ? "CX / education lead"
          : "Listing / product lead";
  const forbiddenMove =
    input.negativeShare >= 0.35
      ? "Do not reopen the whole PDP before the main complaint is isolated"
      : "Do not turn a directional review sample into a full product or PDP rewrite";
  const rerunTrigger =
    input.reviewCount < 8
      ? "Re-run after a larger review batch lands"
      : input.negativeShare >= 0.35
        ? "Re-run only after the first complaint fix is live and fresh reviews start reflecting it"
        : "Re-run after the next meaningful batch of reviews or returns lands";
  const reviewActionStance =
    input.negativeShare >= 0.35 && input.complaintThemeCount > 0
      ? {
          label: commercialCall,
          tone: input.negativeShare >= 0.45 ? ("critical" as const) : ("warning" as const),
          detail: `${primaryFix} ${primaryFixReason}`,
        }
      : buildActionStance(reviewAnalyzerScore, {
          goAt: 76,
          cautionAt: 58,
        }, {
          go: "Ship the first review fix",
          caution: "Tighten the complaint read first",
          stop: "Do not scale traffic into this yet",
        }, {
          go: "The complaint pattern is clear enough to assign the first fix owner and move immediately.",
          caution: "The complaint read is usable, but do not spread fixes yet. One more prioritization pass should decide the single complaint worth fixing first.",
          stop: "The review damage is material enough that scaling traffic before fixes land would be a bad trade.",
        });

  return {
    headline:
      input.complaintThemeCount > 0
        ? `${commercialCall} - ${input.complaintThemeCount} recurring complaint themes are already visible`
        : "Keep this in watch mode - no stable complaint theme yet",
    summary:
      "Use this review read to name the complaint that is actually hurting conversion, assign the first fix owner, and keep the rest of the team from reopening the whole PDP too early.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${decisionOwner} should ship the first response.`,
      },
      {
        label: "Reviews parsed",
        value: `${input.reviewCount}`,
        detail: "Rows or lines successfully interpreted as reviews",
      },
      {
        label: "Average rating",
        value: `${round(input.averageRating, 2)}`,
        detail: "Based on visible rating inputs where present",
      },
      {
        label: "Negative share",
        value: `${round(input.negativeShare * 100, 1)}%`,
        detail: "Reviews rated low or carrying strong complaint language",
      },
      {
        label: "Complaint themes",
        value: `${input.complaintThemeCount}`,
        detail: "Distinct recurring issue buckets",
      },
      {
        label: "Opportunity themes",
        value: `${input.featureOpportunityCount}`,
        detail: "Feature or messaging gaps worth action",
      },
      {
        label: "Theme balance",
        value: `${input.complaintThemeCount}:${input.praiseThemeCount}`,
        detail: "Complaint themes versus praise themes",
      },
      {
        label: "Top complaint",
        value: input.topComplaintTheme || "None yet",
        detail: "Most repeated issue cluster in the current sample",
      },
      {
        label: "Top praise",
        value: input.topPraiseTheme || "None yet",
        detail: "Most repeated positive cluster in the current sample",
      },
      {
        label: "First fix",
        value: primaryFix,
        detail: primaryFixReason,
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: forbiddenMove,
      },
      {
        label: "Re-run trigger",
        value: rerunTrigger,
        detail: "Do not keep debating the same complaint read before new buyer evidence lands.",
      },
    ],
    recommendations: [
      input.negativeShare >= 0.35
        ? "Do not try to outspend this review problem. Push the dominant complaint fix first and keep the rest of the page closed."
        : "The sample is usable, but only one complaint lane should open first. Do not rewrite the whole offer.",
      input.featureOpportunityCount > 0
        ? "Repeated buyer language can support the first fix later, but it does not outrank the main complaint."
        : "There is not enough repeated upside language yet to justify broad copy work. Gather more buyer evidence first.",
      input.reviewCount < 8
        ? "Do not overfit the whole listing or product roadmap to this sample yet. Gather more reviews before committing bigger changes."
        : "Keep secondary listing, packaging, and product changes closed until the first complaint repair is live.",
      input.complaintThemeCount > input.praiseThemeCount
        ? "Do not split this into parallel workstreams. The first complaint owner should control the next move."
        : "Keep the strongest praise themes visible only if they support the first complaint fix, not as a separate rewrite project.",
      `Forbidden move: ${forbiddenMove.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(reviewAnalyzerScore, 76, 58, {
      good: "Review profile looks manageable",
      warning: "Review issues need action",
      critical: "Review issues are material",
    }),
    actionStance: reviewActionStance,
    missingItems: [
      input.reviewCount === 0 ? "Review text or CSV rows" : "",
      input.averageRating === 0 ? "Rating values for stronger confidence" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      primaryFix,
      input.reviewCount < 8
        ? "Hold broader listing, packaging, and product changes until the next review batch confirms the same complaint cluster."
        : "Keep the rest of the team off secondary fixes until the first complaint repair is live.",
      "Re-run only after the first fix is live or the next meaningful review batch lands.",
    ],
    evidence: reviewAnalyzerEvidence,
  } satisfies ToolEvaluation;
}

export function evaluateKeywordResearch(input: {
  competitorCount: number;
  seedWordCount: number;
  candidateCount: number;
  titleCoverageCount: number;
  featureTermCount: number;
  categoryTermCount: number;
  consensusCandidateCount: number;
  strongestTermRepeats: number;
  priorityTermCount: number;
  broadSeedRisk: boolean;
}) {
  const alerts: string[] = [];

  if (input.competitorCount < 2) {
    alerts.push("Keyword extraction is using a thin competitor set. Add more ASINs for better coverage.");
  }
  if (input.candidateCount < 8) {
    alerts.push("There are not many strong recurring modifiers yet. Widen the competitor set or adjust the seed.");
  }
  if (input.titleCoverageCount < input.seedWordCount) {
    alerts.push("Seed terms are not consistently represented across competitor titles.");
  }
  if (input.consensusCandidateCount < 4 && input.competitorCount >= 3) {
    alerts.push("Very few terms recur across most competitors, so the shortlist still needs manual pruning and validation.");
  }
  if (input.broadSeedRisk) {
    alerts.push("The seed appears broad or mixed. Narrow the angle before treating the shortlist as a positioning decision.");
  }

  const keywordResearchScore =
    input.candidateCount * 5 + input.competitorCount * 10 + input.consensusCandidateCount * 4;
  const shortlistVerdict =
    input.broadSeedRisk
      ? "Narrow the seed before using this shortlist"
      : input.priorityTermCount >= 3 && input.consensusCandidateCount >= 4
        ? "Approve this shortlist for first-pass copy testing"
        : input.priorityTermCount > 0
          ? "Prune this shortlist before it touches live copy"
          : "Keep this keyword lane out of the listing for now";
  const shortlistOwner =
    input.broadSeedRisk
      ? "SEO strategy lead"
      : input.priorityTermCount >= 3 && input.consensusCandidateCount >= 4
        ? "Keyword placement owner"
        : input.priorityTermCount > 0
          ? "Keyword pruning lead"
          : "Keyword research owner";
  const shortlistMoveNow =
    input.broadSeedRisk
      ? "Rewrite the seed angle into one narrower commercial wedge before collecting more terms"
      : input.priorityTermCount >= 3 && input.consensusCandidateCount >= 4
        ? "Move only the approved shortlist into title, bullets, and backend placement tests"
        : input.priorityTermCount > 0
          ? "Prune the shortlist down to the few terms strong enough to deserve live placement"
          : "Add tighter competitors or adjust the seed before touching the listing";
  const shortlistDoNotCross =
    input.broadSeedRisk
      ? "Do not rewrite the listing from a broad or mixed seed"
      : input.priorityTermCount >= 3 && input.consensusCandidateCount >= 4
        ? "Do not let weak modifiers or pet keywords creep into the first-pass shortlist"
        : input.priorityTermCount > 0
          ? "Do not let a half-pruned keyword pile reach live copy"
          : "Do not pay for listing edits before a real shortlist exists";
  const shortlistRiskBrief =
    input.priorityTermCount > 0
      ? `${input.priorityTermCount} priority terms survive from ${input.candidateCount} recurring candidates across ${input.competitorCount} competitors.`
      : `Only ${input.consensusCandidateCount} terms recur across most competitors, so the lane is still too noisy to trust.`;
  const shortlistRerunTrigger =
    input.broadSeedRisk
      ? "Re-run only after the seed is narrowed into one explicit commercial angle"
      : input.priorityTermCount >= 3 && input.consensusCandidateCount >= 4
        ? "Re-run after the first shortlist placement test proves which terms actually belong"
        : "Re-run only after the competitor set or seed angle changes enough to improve the shortlist";

  return {
    headline:
      input.priorityTermCount > 0
        ? `${shortlistVerdict} - ${input.priorityTermCount} priority terms currently survive`
        : `${shortlistVerdict} - ${input.candidateCount} recurring modifiers found across ${input.competitorCount} competitors`,
    summary:
      "Use this competitor keyword read to decide whether the shortlist is ready for live placement, still needs pruning, or should stay out of the listing entirely.",
    metrics: [
      {
        label: "Commercial call",
        value: shortlistVerdict,
        detail: `${shortlistMoveNow}. ${shortlistOwner} owns the next keyword move.`,
      },
      {
        label: "Open lane",
        value: shortlistMoveNow,
        detail: shortlistRiskBrief,
      },
      {
        label: "Competitors analyzed",
        value: `${input.competitorCount}`,
        detail: "Live ASIN pages successfully parsed",
      },
      {
        label: "Candidate terms",
        value: `${input.candidateCount}`,
        detail: "Recurring non-seed modifiers worth inspection",
      },
      {
        label: "Priority terms",
        value: `${input.priorityTermCount}`,
        detail: `Top recurring term appears in ${input.strongestTermRepeats} competitor content sets`,
      },
      {
        label: "Title coverage",
        value: `${input.titleCoverageCount}/${input.seedWordCount}`,
        detail: "Seed terms found across competitor titles",
      },
      {
        label: "Feature terms",
        value: `${input.featureTermCount}`,
        detail: "Recurring product feature language",
      },
      {
        label: "Category phrases",
        value: `${input.categoryTermCount}`,
        detail: "Terms echoed by breadcrumb or category language",
      },
      {
        label: "Decision owner",
        value: shortlistOwner,
        detail: shortlistDoNotCross,
      },
      {
        label: "Wrong move",
        value: shortlistDoNotCross,
        detail: "Keep the shortlist disciplined enough that the next copy test actually teaches something.",
      },
      {
        label: "Re-run trigger",
        value: shortlistRerunTrigger,
        detail: "Do not keep expanding the field before the current shortlist is proven or killed.",
      },
    ],
    recommendations: [
      input.priorityTermCount >= 3
        ? "Start by testing the priority shortlist in title, bullets, and visible copy before expanding into weaker modifiers."
        : "You do not have enough high-confidence terms yet. Add tighter competitors or narrow the seed before updating copy.",
      input.featureTermCount > 0
        ? "Separate feature terms from generic head terms so listing copy and backend keywords do not collapse into the same bucket."
        : "Feature language is weak. Pull more ASINs or adjacent products.",
      input.categoryTermCount > 0
        ? "Use breadcrumb-led category phrases to sanity-check whether the shortlist matches the browse path Amazon is already showing."
        : "Carry the shortlist into listing optimization and manually confirm browse-path alignment.",
      input.broadSeedRisk
        ? "Do not rewrite the listing around this keyword set yet. Narrow the seed angle first, or the copy will drift into generic coverage."
        : "Keep one owner on shortlist quality so keyword research does not sprawl into unfocused edits.",
      `Re-run only when this same keyword lane changes state: ${shortlistRerunTrigger.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(keywordResearchScore, 78, 58, {
      good: "Keyword coverage looks usable",
      warning: "Keyword coverage is directional",
      critical: "Keyword coverage is too thin",
    }),
    actionStance: buildActionStance(keywordResearchScore, {
      goAt: 78,
      cautionAt: 58,
    }, {
      go: "Use this keyword shortlist",
      caution: "Prune the shortlist first",
      stop: "Do not rewrite copy from this yet",
    }, {
      go: "The shortlist is focused enough to guide first-pass title, bullet, and backend placement work.",
      caution: "There is a usable core here, but the list still needs one pruning pass before it should drive live copy changes.",
      stop: "The current term set is too noisy or thin to justify rewriting listing copy around it.",
    }),
    missingItems: [
      input.competitorCount === 0 ? "Competitor ASINs" : "",
      input.candidateCount === 0 ? "Recurring keyword candidates" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${shortlistOwner} should own the first move: ${shortlistMoveNow.toLowerCase()}.`,
      "Split head terms, feature terms, and category terms so each slot does a different job.",
      "Freeze the first-pass shortlist before editing title and bullets, so you can measure the effect of the actual winners.",
      "Validate only the surviving shortlist later with Search Query Performance or backend keyword testing.",
    ],
    evidence: keywordResearchEvidence,
  } satisfies ToolEvaluation;
}

export function evaluateCompetitorMonitoring(input: {
  competitorCount: number;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  volatilePriceCount: number;
  averageReviewCount: number;
  reviewSpread: number;
  lowReviewCount: number;
  averageRank: number;
  bestRank: number;
  worstRank: number;
  rankSpread: number;
  aPlusCount: number;
  badgeCarrierCount: number;
  missingPriceCount: number;
  missingRankCount: number;
  alertDelta: number;
  reviewAlertThreshold: number;
  cadenceDays: number;
}) {
  const priceSpread = Math.max(0, input.highestPrice - input.lowestPrice);
  const aPlusCoverage =
    input.competitorCount > 0
      ? (input.aPlusCount / input.competitorCount) * 100
      : 0;
  const alerts: string[] = [];

  if (input.competitorCount < 2) {
    alerts.push("The watchlist is thin. Add more competitor ASINs before relying on the monitoring pattern.");
  }
  if (input.volatilePriceCount > 0) {
    alerts.push("At least one competitor is already outside the chosen price-watch band.");
  }
  if (input.lowReviewCount > 0) {
    alerts.push("Low-review competitors are present, which can signal new entrants or fresh launches worth watching closely.");
  }
  if (input.badgeCarrierCount > 0) {
    alerts.push("Some competitors carry visible deal or authority badges that can shift click share quickly.");
  }
  if (input.missingPriceCount > 0) {
    alerts.push("Some listings did not expose a price, so watch coverage is incomplete on this run.");
  }
  if (input.rankSpread > 25000 && input.bestRank > 0) {
    alerts.push("Rank spread is wide, which suggests the watchlist includes both entrenched leaders and vulnerable fringe offers.");
  }
  if (aPlusCoverage >= 60) {
    alerts.push("Most watched competitors already use A+, so content depth is part of the competitive baseline.");
  }
  if (input.missingRankCount > 0) {
    alerts.push("Some listings did not expose a usable BSR, so rank tracking is partial on this run.");
  }

  const score = Math.max(
    0,
    100 -
      (input.competitorCount < 2 ? 20 : 0) -
      input.volatilePriceCount * 10 -
      input.lowReviewCount * 6 -
      input.badgeCarrierCount * 5 -
      input.missingPriceCount * 8 -
      (input.rankSpread > 25000 && input.bestRank > 0 ? 8 : 0) -
      (aPlusCoverage >= 60 ? 6 : 0) -
      input.missingRankCount * 6,
  );
  const monitoringVerdict =
    input.competitorCount < 2
      ? "Rebuild the watchlist before trusting any alert"
      : input.missingPriceCount > 0 || input.missingRankCount > 0
        ? "Repair watch coverage before escalating competitor moves"
        : input.volatilePriceCount > 0
          ? "Open one price-response lane now"
          : input.badgeCarrierCount > 0
            ? "Open one badge-response lane now"
            : input.lowReviewCount > 0
              ? "Promote new entrants into the first watch lane"
              : "Keep the watch cadence live without opening a broad response";
  const decisionOwner =
    input.competitorCount < 2 || input.missingPriceCount > 0 || input.missingRankCount > 0
      ? "Marketplace ops lead"
      : input.volatilePriceCount > 0
        ? "Pricing / marketplace lead"
        : input.badgeCarrierCount > 0
          ? "Brand / content lead"
          : input.lowReviewCount > 0
            ? "Competitive intelligence lead"
            : "Watch owner";
  const firstMove =
    input.competitorCount < 2
      ? "Load a stable weekly watchlist before building response rules"
      : input.missingPriceCount > 0 || input.missingRankCount > 0
        ? "Fix the missing price and rank gaps before treating noise as disruption"
        : input.volatilePriceCount > 0
          ? "Pick the single price outlier that matters most and route it into one response rule"
          : input.badgeCarrierCount > 0
            ? "Escalate one badge pickup rule and keep price and entrant work closed"
            : input.lowReviewCount > 0
              ? "Move the strongest low-review entrant into the first interruption lane"
              : "Freeze this exact watch set and wait for the next real signal";
  const doNotCrossLine =
    input.competitorCount < 2
      ? "Do not monitor from a thin watchlist"
      : input.missingPriceCount > 0 || input.missingRankCount > 0
        ? "Do not escalate alerts from partial watch coverage"
        : input.volatilePriceCount > 0
          ? "Do not let one price move trigger broad pricing, content, and PPC changes at once"
          : input.badgeCarrierCount > 0
            ? "Do not treat badge pickup like a full-market reset"
            : input.lowReviewCount > 0
              ? "Do not keep swapping entrants every run"
              : "Do not let routine watch refresh turn into busywork";
  const watchRiskBrief =
    input.volatilePriceCount > 0
      ? `${input.volatilePriceCount} competitors are already outside the chosen price-watch band.`
      : input.badgeCarrierCount > 0
        ? `${input.badgeCarrierCount} competitors already carry visible deal or authority badges.`
        : input.lowReviewCount > 0
          ? `${input.lowReviewCount} low-review competitors could still be in fresh-launch mode.`
          : `${input.competitorCount} competitors are loaded with a ${input.cadenceDays}-day review cadence.`;

  return {
    headline:
      input.competitorCount < 2
        ? "Rebuild the watchlist before trusting any alert"
        : input.missingPriceCount > 0 || input.missingRankCount > 0
          ? "Repair watch coverage before escalating competitor moves"
          : input.volatilePriceCount > 0
            ? `${monitoringVerdict} - price movement is already outside the watch band`
            : input.badgeCarrierCount > 0
              ? `${monitoringVerdict} - badge movement now outranks passive review`
              : input.lowReviewCount > 0
                ? `${monitoringVerdict} - fresh entrants deserve the next watch lane`
                : `${monitoringVerdict} - no disruption signal outranks the current cadence`,
    summary:
      "This competitor monitor decides which signal deserves the first interruption, who owns it, and what should stay closed so the team does not confuse alerting with strategy.",
    metrics: [
      {
        label: "Commercial call",
        value: monitoringVerdict,
        detail: `${firstMove}. ${decisionOwner} owns the first response lane.`,
      },
      {
        label: "Open lane",
        value: firstMove,
        detail: watchRiskBrief,
      },
      {
        label: "Competitors loaded",
        value: `${input.competitorCount}`,
        detail: `${input.missingPriceCount} listings missing visible price data`,
      },
      {
        label: "Price band",
        value: `${formatCurrency(round(input.lowestPrice))} - ${formatCurrency(round(input.highestPrice))}`,
        detail: `${formatCurrency(round(priceSpread))} current visible spread`,
      },
      {
        label: "Review baseline",
        value: `${Math.round(input.averageReviewCount)}`,
        detail: `${Math.round(input.reviewSpread)} review spread across the watch set`,
      },
      {
        label: "Rank band",
        value:
          input.bestRank > 0 && input.worstRank > 0
            ? `#${input.bestRank.toLocaleString("en-US")} - #${input.worstRank.toLocaleString("en-US")}`
            : "Not fully parsed",
        detail:
          input.averageRank > 0
            ? `Average #${Math.round(input.averageRank).toLocaleString("en-US")}`
            : "Rank baseline is partial",
      },
      {
        label: "Pressure signals",
        value: `${input.volatilePriceCount}/${input.lowReviewCount}/${input.badgeCarrierCount}`,
        detail: "Price outliers / low-review entrants / badge carriers",
      },
      {
        label: "Cadence",
        value: `${input.cadenceDays} day${input.cadenceDays === 1 ? "" : "s"}`,
        detail: `${round(aPlusCoverage, 0)}% A+ coverage | ${input.missingRankCount} listings missing rank`,
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep the first interruption lane narrow until the same watch set proves that lane wrong.",
      },
    ],
    recommendations: [
      input.volatilePriceCount > 0
        ? "Shorten the watch cadence now. Price movement is already outside the alert band, so the next useful job is deciding whether you need a response rule instead of passive tracking."
        : "Keep this on a scheduled cadence. Price behavior is calm enough that you do not need daily intervention yet.",
      input.lowReviewCount > 0
        ? "Promote low-review entrants to the top of the watchlist. They are the competitors most likely to change price or pick up badges before the rest of the market reacts."
        : "This set is mostly mature listings, so the commercial risk is slower share loss through price or proof drift rather than surprise launch entrants.",
      input.badgeCarrierCount > 0
        ? "Create an escalation rule for badge pickup, because visible deal or authority badges can move click share faster than small price changes."
        : "Badge pressure is not the main issue on this run, so price and review movement should stay ahead of creative refresh work.",
      input.missingPriceCount > 0 || input.missingRankCount > 0
        ? "Do not overreact to single-listing moves until the watch coverage is cleaner. Fill the missing price or rank gaps first."
        : "Assign one owner to watch hygiene and one to response rules so monitoring stays operational instead of turning into passive reporting.",
      input.volatilePriceCount === 0 && input.lowReviewCount === 0 && input.badgeCarrierCount === 0
        ? "Do not keep refreshing this out of habit. If nothing is moving, lower the cadence and spend attention where the market is actually changing."
        : "Freeze this competitor set and alert logic so the next run shows market movement, not list churn.",
      `Re-run only when this same lane changes state: ${firstMove.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 80, 60, {
      good: "Competitor watchlist looks usable",
      warning: "Monitoring setup needs tightening",
      critical: "Monitoring blind spots are material",
    }),
    actionStance: buildActionStance(score, {
      goAt: 80,
      cautionAt: 60,
    }, {
      go: "Run this watch cadence",
      caution: "Tighten the watchlist first",
      stop: "Do not rely on this monitor yet",
    }, {
      go: "The watchlist is stable enough to run on the planned cadence and turn movement into practical alerts.",
      caution: "The monitor is usable, but missing coverage or noisy competitors should be tightened before the next cycle.",
      stop: "The current watch setup has enough blind spots that relying on it would create false calm or false alarms.",
    }),
    missingItems: [
      input.competitorCount === 0 ? "Competitor ASINs with live page access" : "",
      input.competitorCount < 2 ? "A broader watchlist across the true competitor set" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${firstMove.toLowerCase()}.`,
      "Lock this ASIN set and re-run the same watchlist on the chosen cadence so the next read shows change, not a different sample.",
      "Define one concrete response rule for price, one for badge pickup, and one for launch entrants before the next cycle.",
      "Move the single most disruptive competitor into pricing, listing, or PPC response planning instead of spreading attention across the whole set.",
    ],
    evidence: competitorMonitoringEvidence,
  } satisfies ToolEvaluation;
}

export function evaluateProductResearch(input: {
  marketplace: string;
  category: string;
  competitorCount: number;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  averageRank: number;
  bestRank: number;
  averageReviewCount: number;
  strongReviewCompetitors: number;
  averageRating: number;
  aPlusCount: number;
  titleSeedCoverage: number;
  targetMargin: number;
  landedCost: number;
  fulfillmentCost: number;
  viableEntryCount: number;
  moatPressure: number;
  differentiationPressure: number;
}) {
  const normalizedCategory = normalizeCategoryBucket(input.category);
  const referralRate = referralFeeRates[normalizedCategory] ?? referralFeeRates.default;
  const estimatedMonthlyUnits = estimateMonthlyUnitsFromBsr(input.category, input.averageRank);
  const estimatedNetMargin =
    input.averagePrice > 0
      ? (input.averagePrice - input.averagePrice * referralRate - input.landedCost - input.fulfillmentCost) / input.averagePrice
      : 0;
  const priceSpread = Math.max(0, input.highestPrice - input.lowestPrice);
  const priceSpreadRate = input.averagePrice > 0 ? priceSpread / input.averagePrice : 0;
  const aPlusCoverage =
    input.competitorCount > 0 ? (input.aPlusCount / input.competitorCount) * 100 : 0;
  const reviewMoatPressure =
    input.competitorCount > 0
      ? input.strongReviewCompetitors / input.competitorCount
      : 0;
  const alerts: string[] = [];

  if (input.competitorCount < 2) {
    alerts.push("The reference set is too small to call this niche with confidence.");
  }
  if (estimatedMonthlyUnits > 0 && estimatedMonthlyUnits < 150) {
    alerts.push("Demand looks modest at the current average rank band.");
  }
  if (estimatedNetMargin < input.targetMargin) {
    alerts.push("Estimated net margin misses the target margin after referral and fulfillment assumptions.");
  }
  if (input.titleSeedCoverage < 60) {
    alerts.push("Seed-keyword coverage across reference titles is weak, so the niche framing may still be fuzzy.");
  }
  if (reviewMoatPressure >= 0.5) {
    alerts.push("Most reference competitors already carry meaningful review proof, which raises entry difficulty.");
  }
  if (aPlusCoverage >= 60) {
    alerts.push("A+ adoption is already common in this niche, so bare-minimum listings will struggle.");
  }
  if (priceSpreadRate < 0.15 && input.averageReviewCount > 250) {
    alerts.push("Pricing is compressed while review proof is high, which can squeeze room for a new entrant.");
  }
  if (input.viableEntryCount === 0 && input.competitorCount >= 3) {
    alerts.push("None of the current references look like easy entry points on both price posture and review burden.");
  }
  if (input.differentiationPressure >= Math.max(4, input.competitorCount)) {
    alerts.push("Competitor messaging is converging, so a new entrant needs a sharper proof angle instead of generic parity copy.");
  }

  const score = Math.max(
    0,
    100 -
      (input.competitorCount < 2 ? 18 : 0) -
      (estimatedMonthlyUnits > 0 && estimatedMonthlyUnits < 150 ? 16 : 0) -
      (estimatedNetMargin < input.targetMargin ? 22 : 0) -
      (input.titleSeedCoverage < 60 ? 10 : 0) -
      (reviewMoatPressure >= 0.5 ? 16 : 0) -
      (aPlusCoverage >= 60 ? 8 : 0) -
      (priceSpreadRate < 0.15 && input.averageReviewCount > 250 ? 10 : 0) -
      (input.viableEntryCount === 0 && input.competitorCount >= 3 ? 10 : 0) -
      (input.moatPressure >= Math.max(5, input.competitorCount + 1) ? 8 : 0) -
      (input.differentiationPressure >= Math.max(4, input.competitorCount) ? 8 : 0),
  );
  const entryVerdict =
    estimatedMonthlyUnits >= 200 &&
    estimatedNetMargin >= input.targetMargin &&
    input.viableEntryCount > 0 &&
    reviewMoatPressure < 0.5
      ? "advance"
      : estimatedNetMargin < input.targetMargin || input.viableEntryCount === 0
        ? "hold"
        : "narrow";
  const entryVerdictLabel =
    entryVerdict === "advance"
      ? "Approve one wedge for sourcing now"
      : entryVerdict === "hold"
        ? estimatedNetMargin < input.targetMargin
          ? "Kill this lane until economics improve"
          : "Kill this lane until one believable entry wedge appears"
        : "Cut the wedge narrower before more work";
  const wedgeOwner =
    entryVerdict === "advance"
      ? "Launch strategy lead"
      : entryVerdict === "hold"
        ? estimatedNetMargin < input.targetMargin
          ? "Economics lead"
          : "Category strategy lead"
        : "Validation lead";
  const firstWedgeMove =
      entryVerdict === "advance"
        ? "Push the softest viable reference into sourcing, compliance, and profit checks now"
      : entryVerdict === "hold"
        ? estimatedNetMargin < input.targetMargin
          ? "Do not open sourcing until cost, price, or fulfillment math improves"
          : "Do not open sourcing until one believable entry wedge survives the cluster"
        : "Define one narrower entry wedge before any more workflow opens";
  const doNotCrossLine =
    entryVerdict === "advance"
      ? "Do not widen the idea before the first wedge survives diligence"
      : entryVerdict === "hold"
        ? estimatedNetMargin < input.targetMargin
          ? "Do not let demand excitement override broken unit economics"
          : "Do not treat a broad cluster as one clean product opening"
        : "Do not spend on sourcing before the wedge is explicit";
  const entryRiskBrief =
    entryVerdict === "advance"
      ? `${input.viableEntryCount}/${input.competitorCount} references still look reachable without combining heavy review moat and hard price pressure`
      : entryVerdict === "hold"
        ? estimatedNetMargin < input.targetMargin
        ? `${round(estimatedNetMargin * 100, 1)}% estimated net margin is still below the ${round(input.targetMargin * 100, 1)}% hurdle`
          : input.viableEntryCount === 0
            ? "None of the current references yet look like a believable low-friction opening"
            : "The current lane is still too broad or too defended to approve sourcing work"
        : "The cluster is not clean enough yet; narrow it to one defensible entry wedge before more work opens";
  const rerunTrigger =
    entryVerdict === "advance"
      ? "Re-run once the first wedge clears contribution margin and compliance on the same reference set"
      : estimatedNetMargin < input.targetMargin
        ? "Re-run only after price, landed cost, or fulfillment assumptions change materially"
        : "Re-run only after the same cluster is narrowed to one explicit entry wedge";

  return {
    headline:
      entryVerdict === "advance"
        ? `Approve sourcing on one wedge now - ${input.viableEntryCount} reachable entry angles remain`
        : entryVerdict === "hold" && estimatedNetMargin < input.targetMargin
          ? `Keep this out of sourcing - ${round(estimatedNetMargin * 100, 1)}% net-margin room still fails the lane`
          : `${entryVerdictLabel} - ${round(estimatedNetMargin * 100, 1)}% net-margin room on the current lane`,
    summary:
      "Use this wedge read to decide whether one entry angle deserves validation now or whether sourcing, creative, and budget work should stay closed.",
    metrics: [
      {
        label: "Commercial call",
        value: entryVerdictLabel,
        detail: `${firstWedgeMove}. ${wedgeOwner} should decide whether this lane earns another dollar.`,
      },
      {
        label: "Open lane",
        value: firstWedgeMove,
        detail: `${entryRiskBrief}.`,
      },
      {
        label: "Demand screen",
        value: estimatedMonthlyUnits > 0 ? `${estimatedMonthlyUnits.toLocaleString("en-US")} units/mo` : "Not enough rank data",
        detail:
          input.averageRank > 0
            ? `Average BSR #${Math.round(input.averageRank).toLocaleString("en-US")} in ${normalizedCategory}`
            : "Live rank baseline is partial",
      },
      {
        label: "Price band",
        value: `${formatCurrency(round(input.lowestPrice))} - ${formatCurrency(round(input.highestPrice))}`,
        detail: `${formatCurrency(round(input.averagePrice))} average visible sell price`,
      },
      {
        label: "Estimated net margin",
        value: `${round(estimatedNetMargin * 100, 1)}%`,
        detail: `${formatCurrency(round(input.landedCost + input.fulfillmentCost))} assumed non-referral unit cost`,
      },
      {
        label: "Decision owner",
        value: wedgeOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Do not let a broad category story open sourcing, launch prep, or inventory work ahead of one surviving wedge.",
      },
      {
        label: "Re-run trigger",
        value: rerunTrigger,
        detail: "Do not keep debating the lane from the same unresolved cluster.",
      },
      {
        label: "Competition proof",
        value: `${Math.round(input.averageReviewCount)} reviews`,
        detail: `${input.strongReviewCompetitors}/${input.competitorCount} competitors over the review-moat threshold`,
      },
      {
        label: "Listing maturity",
        value: `${round(aPlusCoverage, 0)}% A+`,
        detail: `${input.titleSeedCoverage}% seed-keyword coverage across reference titles`,
      },
      {
        label: "Entry angles",
        value: `${input.viableEntryCount}/${input.competitorCount}`,
        detail: "References that do not combine high review burden with aggressive price pressure",
      },
    ],
    recommendations: [
      estimatedMonthlyUnits >= 200
        ? "Demand is good enough to keep the lane alive, but only one wedge deserves validation."
        : "Demand alone does not rescue this lane. If the wedge is weak, kill it early.",
      entryVerdict === "advance"
        ? "Do not broaden into adjacent variants yet. Move only the softest reachable reference into the next diligence pass."
        : entryVerdict === "hold"
          ? estimatedNetMargin < input.targetMargin
            ? "Forbidden move: asking demand to rescue broken unit economics. Repair landed cost, price posture, or fulfillment load first."
            : "Forbidden move: keeping the whole cluster alive as if it were one opportunity. Reduce it to one believable opening or kill it."
          : "Write the wedge in one sentence first: who this product wins for, why that opening is softer, and what proof lets it enter.",
      estimatedNetMargin >= input.targetMargin
        ? "Economics are not the blocker right now. Keep the lane focused on whether one entry wedge is actually soft enough."
        : "Do not advance this idea yet. Repair the economics before spending more time on the niche.",
      reviewMoatPressure >= 0.5 || aPlusCoverage >= 60
        ? "Assume this needs a real proof edge. Parity positioning does not deserve more workflow."
        : "Competition is not shutting the door yet, but only the cleanest wedge deserves the next pass.",
      `Re-run only when this same wedge changes state: ${rerunTrigger.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 78, 58, {
      good: "Product opportunity looks workable",
      warning: "Product opportunity needs more proof",
      critical: "Product opportunity looks weak",
    }),
    actionStance: buildActionStance(score, {
      goAt: 78,
      cautionAt: 58,
    }, {
      go: "Advance this product idea",
      caution: estimatedNetMargin < input.targetMargin ? "Fix economics before entry" : firstWedgeMove,
      stop: doNotCrossLine,
    }, {
      go: `${entryRiskBrief}. The product concept is strong enough to justify deeper sourcing, economics, and launch planning work.`,
      caution: `${entryRiskBrief}. Keep wedge truth and economics under separate control until the lane earns sourcing approval.`,
      stop: `${entryRiskBrief}. ${doNotCrossLine}.`,
    }),
    missingItems: [
      input.competitorCount === 0 ? "Reference ASINs" : "",
      input.averagePrice <= 0 ? "Visible competitor price data" : "",
      !input.category ? "Category selection or inferred browse path" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      entryVerdict === "advance"
        ? "Approve only the surviving wedge for sourcing, compliance, and contribution-margin validation."
        : "Do not open sourcing or launch prep yet.",
      `${wedgeOwner} should run the next move: ${firstWedgeMove.toLowerCase()}.`,
      "Write down the exact entry wedge in one sentence before spending on inventory, creatives, or launch prep.",
      "Freeze the surviving reference set before the next pass so the go/no-go call stays tied to the same battlefield.",
    ],
    evidence: productResearchEvidence,
  } satisfies ToolEvaluation;
}

export function evaluateKeywordTracker(input: {
  trackedKeywordCount: number;
  ownCoverageCount: number;
  competitorCount: number;
  majorityCompetitorCount: number;
  gapCount: number;
  defendCount: number;
  observeCount: number;
  currentRank: number;
  bestCompetitorRank: number;
  alertThreshold: number;
  cheaperCompetitorCount: number;
  strongerReviewCompetitorCount: number;
  aPlusCompetitorCount: number;
  ownHasAPlus: boolean;
}) {
  const coverage = percentCovered(input.ownCoverageCount, input.trackedKeywordCount);
  const rankGap =
    input.currentRank > 0 && input.bestCompetitorRank > 0
      ? input.currentRank - input.bestCompetitorRank
      : 0;
  const alerts: string[] = [];

  if (input.trackedKeywordCount === 0) {
    alerts.push("No target keywords are loaded yet, so the tracker has no watchlist.");
  }
  if (coverage < 60) {
    alerts.push("Visible own-copy coverage is thin across the tracked keyword set.");
  }
  if (input.gapCount > 0) {
    alerts.push("Some tracked keywords are common in competitor copy but missing from the own listing.");
  }
  if (rankGap > input.alertThreshold) {
    alerts.push("The ASIN is materially outranked by the strongest visible competitor baseline.");
  }
  if (input.competitorCount < 2) {
    alerts.push("Competitor coverage is thin. Add more ASINs before relying on this watchlist.");
  }
  if (input.cheaperCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2))) {
    alerts.push("Most competitors in the watch set are priced below the tracked ASIN.");
  }
  if (input.strongerReviewCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2))) {
    alerts.push("Most competitors in the watch set carry stronger review proof.");
  }
  if (!input.ownHasAPlus && input.aPlusCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2))) {
    alerts.push("Most competitors in the watch set already show A+, so ranking defense depends on thinner merchandising support.");
  }

  const score = Math.max(
    0,
    100 -
      (input.trackedKeywordCount === 0 ? 22 : 0) -
      (coverage < 60 ? 16 : 0) -
      input.gapCount * 8 -
      (rankGap > input.alertThreshold ? 16 : 0) -
      (input.competitorCount < 2 ? 12 : 0) -
      (input.cheaperCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2)) ? 8 : 0) -
      (input.strongerReviewCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2)) ? 8 : 0) -
      (!input.ownHasAPlus && input.aPlusCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2)) ? 6 : 0),
  );
  const keywordVerdict =
    input.trackedKeywordCount === 0
      ? "Build the watchlist before treating this as keyword defense"
      : input.gapCount > 0
        ? "Close the commercial keyword gaps before defending anything else"
        : rankGap > input.alertThreshold &&
            (input.strongerReviewCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2)) ||
              (!input.ownHasAPlus && input.aPlusCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2))))
          ? "Repair proof before trusting the defended keyword set"
          : rankGap > input.alertThreshold && input.cheaperCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2))
            ? "Repair price posture before treating this as a keyword-only defense job"
            : rankGap > input.alertThreshold
              ? "Open one keyword-defense lane now"
              : "Defend the current keyword set and keep the watchlist tight";
  const decisionOwner =
    input.trackedKeywordCount === 0
      ? "SEO strategy lead"
      : input.gapCount > 0
        ? "SEO / listing lead"
        : rankGap > input.alertThreshold &&
            (input.strongerReviewCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2)) ||
              (!input.ownHasAPlus && input.aPlusCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2))))
          ? "CX / merchandising lead"
          : rankGap > input.alertThreshold && input.cheaperCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2))
            ? "Pricing lead"
            : rankGap > input.alertThreshold
              ? "Keyword defense lead"
              : "Keyword watch owner";
  const firstMove =
    input.trackedKeywordCount === 0
      ? "Load and lock the commercial phrase set before calling anything a gap or defend term"
      : input.gapCount > 0
        ? "Fix the strongest gap phrases first and keep the defend set frozen"
        : rankGap > input.alertThreshold &&
            (input.strongerReviewCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2)) ||
              (!input.ownHasAPlus && input.aPlusCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2))))
          ? "Repair trust proof first and keep phrase churn closed"
          : rankGap > input.alertThreshold && input.cheaperCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2))
            ? "Make one explicit price-position call before blaming the keyword set"
            : rankGap > input.alertThreshold
              ? "Open one controlled defense lane around the existing tracked set"
              : "Hold the current defend set steady and only re-open when the live set changes";
  const doNotCrossLine =
    input.trackedKeywordCount === 0
      ? "Do not treat an empty watchlist like a defense system"
      : input.gapCount > 0
        ? "Do not keep adding phrases while current commercial gaps are still unresolved"
        : rankGap > input.alertThreshold &&
            (input.strongerReviewCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2)) ||
              (!input.ownHasAPlus && input.aPlusCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2))))
          ? "Do not blame phrase drift before checking proof pressure"
          : rankGap > input.alertThreshold && input.cheaperCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2))
            ? "Do not blame keyword coverage while the market set is visibly cheaper"
            : rankGap > input.alertThreshold
              ? "Do not open gap closure, pricing, and proof fixes at the same time"
              : "Do not bloat the watchlist beyond what someone will actually review";
  const keywordRiskBrief =
    input.gapCount > 0
      ? `${input.gapCount} tracked phrases are supported by competitors but still missing from the own listing.`
      : rankGap > input.alertThreshold
        ? `Current rank sits ${rankGap.toLocaleString("en-US")} positions behind the strongest visible competitor baseline.`
        : `${input.defendCount} phrases are currently in defend mode with ${input.observeCount} still in observation.`;

  return {
    headline:
      input.trackedKeywordCount === 0
        ? "Build the keyword watchlist before using it as a defense system"
        : input.gapCount > 0
          ? `${keywordVerdict} - ${input.gapCount} commercial gaps are still open`
          : rankGap > input.alertThreshold
            ? `${keywordVerdict} - rank pressure is outside the watch band`
            : `${keywordVerdict} - no major gap pressure in the current set`,
    summary:
      "Use this keyword watch to decide whether the first move is gap repair, defend-set protection, proof repair, or price review before the team turns term tracking into generic copy churn.",
    metrics: [
      {
        label: "Commercial call",
        value: keywordVerdict,
        detail: `${firstMove}. ${decisionOwner} owns the first response lane.`,
      },
      {
        label: "Open lane",
        value: firstMove,
        detail: keywordRiskBrief,
      },
      {
        label: "Tracked keywords",
        value: `${input.trackedKeywordCount}`,
        detail: `${input.majorityCompetitorCount} phrases appear across most competitors`,
      },
      {
        label: "Own coverage",
        value: `${coverage}%`,
        detail: `${input.ownCoverageCount}/${input.trackedKeywordCount} phrases visible in own copy`,
      },
      {
        label: "Gap terms",
        value: `${input.gapCount}`,
        detail: "Competitor-supported phrases missing from own copy",
      },
      {
        label: "Defend terms",
        value: `${input.defendCount}`,
        detail: `${input.observeCount} phrases remain observation-only`,
      },
      {
        label: "Rank pressure",
        value:
          input.currentRank > 0 && input.bestCompetitorRank > 0
            ? `${rankGap.toLocaleString("en-US")} ranks`
            : "Partial baseline",
        detail: `${input.alertThreshold.toLocaleString("en-US")} rank alert threshold`,
      },
      {
        label: "Competitor pressure",
        value: `${input.cheaperCompetitorCount}/${input.strongerReviewCompetitorCount}/${input.aPlusCompetitorCount}`,
        detail: "Cheaper / stronger-review / A+ competitors",
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
    ],
    recommendations: [
      input.gapCount > 0
        ? "Fix the strongest gap terms first. Do not expand the watchlist while commercially important phrases are still missing from visible copy."
        : "There are no obvious copy gaps at the top of the list, so the next job is defending conversion strength and rank rather than stuffing more terms.",
      rankGap > input.alertThreshold
        ? "Treat this as a rank-defense problem now, not just a copy-coverage cleanup task."
        : "Rank pressure is still inside the watch band, so the main job is maintaining and tightening support on the tracked phrases.",
      input.strongerReviewCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2))
        ? "Pair keyword fixes with stronger proof or merchandising upgrades, because tracked terms will not defend themselves if competitor proof is stronger."
        : "Proof pressure is not dominant in this watch set, so copy coverage remains the first lever.",
      input.cheaperCompetitorCount >= Math.max(2, Math.ceil(input.competitorCount / 2))
        ? "Watch price alongside term coverage. A cheaper market can erase the benefit of cleaner keyword support."
        : "Re-run the same term set when listing copy or the competitor set changes so you can spot drift cheaply.",
      input.trackedKeywordCount === 0 || input.competitorCount < 2
        ? "Do not treat this as a real defense system yet. Finish the tracked term set and competitor baseline first."
        : "Assign one owner to gap-term fixes and one to rank-defense checks so copy work and market response do not blur together.",
      `Re-run only when this same lane changes state: ${firstMove.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 80, 60, {
      good: "Keyword watchlist looks usable",
      warning: "Keyword watch setup needs refinement",
      critical: "Keyword watch coverage is weak",
    }),
    actionStance: buildActionStance(score, {
      goAt: 80,
      cautionAt: 60,
    }, {
      go: "Defend the current keyword set",
      caution: "Close the key gaps first",
      stop: "Do not trust this watchlist yet",
    }, {
      go: "The tracked terms are stable enough to defend and monitor without rewriting the whole keyword map.",
      caution: "The watchlist has a workable core, but visible gaps should be fixed before you rely on it for defense.",
      stop: "The current keyword watch is too incomplete to trust as a real defense system.",
    }),
    missingItems: [
      input.trackedKeywordCount === 0 ? "Tracked keyword phrases" : "",
      input.competitorCount === 0 ? "Competitor ASINs" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${firstMove.toLowerCase()}.`,
      "Fix the largest gap phrases before adding more tracked terms, so the watchlist stays commercially focused.",
      "Freeze the defend set while testing gap-term fixes so you can tell whether visibility improved or the market simply moved.",
      "Use the defend set to protect existing relevance while testing new copy, rather than rewriting everything at once.",
    ],
    evidence: keywordTrackerEvidence,
  } satisfies ToolEvaluation;
}

export function evaluateNicheFinder(input: {
  category: string;
  referenceCount: number;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  targetMinPrice: number;
  targetMaxPrice: number;
  averageRank: number;
  averageReviewCount: number;
  strongReviewCount: number;
  aPlusCount: number;
  launchBudget: number;
  landedCost: number;
  affordableUnits: number;
  monthsOfCover: number;
  riskTolerance: "low" | "medium" | "high";
  affordableCount?: number;
  compressedCount?: number;
}) {
  const estimatedMonthlyUnits = estimateMonthlyUnitsFromBsr(input.category, input.averageRank);
  const inRange =
    input.averagePrice >= input.targetMinPrice && input.averagePrice <= input.targetMaxPrice;
  const reviewMoatPressure =
    input.referenceCount > 0 ? input.strongReviewCount / input.referenceCount : 0;
  const aPlusCoverage =
    input.referenceCount > 0 ? (input.aPlusCount / input.referenceCount) * 100 : 0;
  const alerts: string[] = [];

  if (input.referenceCount < 2) {
    alerts.push("The niche sample is too small. Add more direct reference ASINs.");
  }
  if (!inRange) {
    alerts.push("The average visible sell price sits outside the target price band.");
  }
  if (estimatedMonthlyUnits > 0 && estimatedMonthlyUnits < 150) {
    alerts.push("Demand looks modest for this niche at the current rank band.");
  }
  if (reviewMoatPressure >= 0.5) {
    alerts.push("Review proof is already strong across much of the reference set.");
  }
  if (aPlusCoverage >= 60) {
    alerts.push("A+ usage is already common, which raises listing-quality expectations.");
  }
  if (input.monthsOfCover > 0 && input.monthsOfCover < 1.5) {
    alerts.push("The planned budget does not buy much inventory cover at the current demand band.");
  }
  if (input.riskTolerance === "low" && (reviewMoatPressure >= 0.4 || input.monthsOfCover < 2)) {
    alerts.push("This niche may be too aggressive for a low-risk launch posture.");
  }
  if (inRange && input.averagePrice > 0 && input.landedCost / input.averagePrice >= 0.42) {
    alerts.push("The price band looks workable on the surface, but landed cost is consuming a large share of it.");
  }
  if ((input.compressedCount ?? 0) >= Math.ceil(Math.max(1, input.referenceCount) / 2)) {
    alerts.push("Too many references pair lower price with strong review proof, which makes the niche more hostile for a new entrant.");
  }

  const score = Math.max(
    0,
    100 -
      (input.referenceCount < 2 ? 18 : 0) -
      (!inRange ? 14 : 0) -
      (estimatedMonthlyUnits > 0 && estimatedMonthlyUnits < 150 ? 16 : 0) -
      (reviewMoatPressure >= 0.5 ? 16 : 0) -
      (aPlusCoverage >= 60 ? 8 : 0) -
      (input.monthsOfCover > 0 && input.monthsOfCover < 1.5 ? 14 : 0) -
      (input.riskTolerance === "low" && (reviewMoatPressure >= 0.4 || input.monthsOfCover < 2) ? 8 : 0),
  );
  const nicheVerdict =
    inRange &&
    estimatedMonthlyUnits >= 150 &&
    input.monthsOfCover >= 2 &&
    reviewMoatPressure < 0.5 &&
    (input.compressedCount ?? 0) < Math.ceil(Math.max(1, input.referenceCount) / 2)
      ? "advance"
      : !inRange || input.monthsOfCover < 1.5 || (input.affordableCount ?? 0) === 0
        ? "hold"
        : "narrow";
  const nicheVerdictLabel =
    nicheVerdict === "advance"
      ? "Approve one narrow niche wedge now"
      : nicheVerdict === "hold"
        ? "Keep this niche out of sourcing for now"
        : "Narrow this niche to one smaller wedge";
  const nicheOwner =
    nicheVerdict === "advance"
      ? "Category validation lead"
      : nicheVerdict === "hold"
        ? input.monthsOfCover < 1.5 || (input.affordableCount ?? 0) === 0
          ? "Budget / sourcing lead"
          : "Category strategy lead"
        : "Niche research owner";
  const nicheMoveNow =
    nicheVerdict === "advance"
      ? "Carry only the softest niche wedge into product research and margin validation"
      : nicheVerdict === "hold"
        ? input.monthsOfCover < 1.5 || (input.affordableCount ?? 0) === 0
          ? "Stop sourcing work until budget cover and landed-cost reality clear the lane"
          : "Keep this niche closed until one believable wedge survives the cluster"
        : "Rewrite the niche as one explicit wedge before spending more time on it";
  const nicheDoNotCross =
    nicheVerdict === "advance"
      ? "Do not widen this niche before the first wedge survives economics and competition"
      : nicheVerdict === "hold"
        ? input.monthsOfCover < 1.5 || (input.affordableCount ?? 0) === 0
          ? "Do not let adjacency or excitement override broken budget reality"
          : "Do not treat a broad niche cluster like one clean product opening"
        : "Do not send this niche into sourcing before the wedge is written in one sentence";
  const nicheRiskBrief =
    nicheVerdict === "advance"
      ? `${input.strongReviewCount}/${input.referenceCount} references carry strong review proof and ${round(input.monthsOfCover, 1)} months of budget cover still remain`
      : nicheVerdict === "hold"
        ? input.monthsOfCover < 1.5 || (input.affordableCount ?? 0) === 0
          ? `${round(input.monthsOfCover, 1)} months of cover is too thin for this lane at the current landed-cost assumption`
          : "The current reference cluster still does not expose one believable low-friction niche wedge"
        : "The cluster may still hold value, but it is too broad to earn sourcing or launch work yet";
  const nicheRerunTrigger =
    nicheVerdict === "advance"
      ? "Re-run once the surviving wedge clears product research and contribution margin on the same reference set"
      : nicheVerdict === "hold"
        ? input.monthsOfCover < 1.5 || (input.affordableCount ?? 0) === 0
          ? "Re-run only after launch budget or landed cost changes enough to support the same niche lane"
          : "Re-run only after the same cluster is narrowed to one explicit niche wedge"
        : "Re-run only after the niche is rewritten into one narrower wedge";

  return {
    headline:
      nicheVerdict === "advance"
        ? `Approve one niche wedge now - ${estimatedMonthlyUnits.toLocaleString("en-US")} monthly units still support this lane`
        : `${nicheVerdictLabel} - ${round(input.monthsOfCover, 1)} months of budget cover on the current lane`,
    summary:
      "Use this niche screen to decide whether one narrow wedge deserves sourcing and margin work now or whether the whole lane should stay closed.",
    metrics: [
      {
        label: "Commercial call",
        value: nicheVerdictLabel,
        detail: `${nicheMoveNow}. ${nicheOwner} owns the first niche call.`,
      },
      {
        label: "Open lane",
        value: nicheMoveNow,
        detail: nicheRiskBrief,
      },
      {
        label: "Reference ASINs",
        value: `${input.referenceCount}`,
        detail: `${round(aPlusCoverage, 0)}% A+ coverage across the set`,
      },
      {
        label: "Demand band",
        value: estimatedMonthlyUnits > 0 ? `${estimatedMonthlyUnits.toLocaleString("en-US")} units/mo` : "Not enough rank data",
        detail:
          input.averageRank > 0
            ? `Average BSR #${Math.round(input.averageRank).toLocaleString("en-US")}`
            : "Rank baseline is partial",
      },
      {
        label: "Price band",
        value: `${formatCurrency(round(input.lowestPrice))} - ${formatCurrency(round(input.highestPrice))}`,
        detail: `${formatCurrency(round(input.averagePrice))} average vs target ${formatCurrency(round(input.targetMinPrice))} - ${formatCurrency(round(input.targetMaxPrice))}`,
      },
      {
        label: "Competition proof",
        value: `${Math.round(input.averageReviewCount)} reviews`,
        detail: `${input.strongReviewCount}/${input.referenceCount} strong-review competitors`,
      },
      {
        label: "Launch cover",
        value: `${round(input.monthsOfCover, 1)} months`,
        detail: `${Math.floor(input.affordableUnits).toLocaleString("en-US")} affordable units at ${formatCurrency(round(input.landedCost))} landed cost`,
      },
      {
        label: "Cost pressure",
        value:
          input.averagePrice > 0
            ? `${round((input.landedCost / input.averagePrice) * 100, 1)}%`
            : "Unknown",
        detail: "Landed cost as share of visible average sell price",
      },
      {
        label: "Decision owner",
        value: nicheOwner,
        detail: nicheDoNotCross,
      },
      {
        label: "Wrong move",
        value: nicheDoNotCross,
        detail: "Do not let a broad category story open sourcing, inventory, or launch work before one wedge survives.",
      },
      {
        label: "Re-run trigger",
        value: nicheRerunTrigger,
        detail: "Keep the same niche battlefield long enough to learn from it.",
      },
    ],
    recommendations: [
      inRange
        ? "The niche is inside the target band, but only one wedge deserves validation."
        : "Do not keep validating this exact lane until the niche, offer, or target price band changes.",
      nicheVerdict === "advance"
        ? "Carry only the softest reference set forward. The broad cluster is not the product."
        : nicheVerdict === "hold"
          ? input.monthsOfCover < 1.5 || (input.affordableCount ?? 0) === 0
            ? "Forbidden move: asking a tight budget to rescue a weak niche. Repair capital reality first."
            : "Forbidden move: keeping the whole niche alive as if it were one opportunity. Reduce it to one believable opening or kill it."
          : "Write the niche wedge in one sentence first: who it wins for, why the opening is softer, and what proof supports entry.",
      reviewMoatPressure >= 0.5
        ? "Assume this lane needs a real proof edge. Generic parity positioning does not deserve another pass."
        : "Competition is not shutting the door yet, but only the cleanest wedge deserves the next pass.",
      input.monthsOfCover >= 2
        ? "Budget cover is workable enough to keep the lane alive, but keep spending closed outside the approved wedge."
        : "Budget cover is still the blocker. Do not open sourcing before cash reality improves.",
      `Re-run only when this same wedge changes state: ${nicheRerunTrigger.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 78, 58, {
      good: "Niche screen looks workable",
      warning: "Niche needs more validation",
      critical: "Niche looks weak",
    }),
    actionStance: buildActionStance(score, {
      goAt: 78,
      cautionAt: 58,
    }, {
      go: "Keep validating this niche",
      caution: "Narrow the niche first",
      stop: "Do not push this niche forward",
    }, {
      go: "The niche looks credible enough to justify another focused validation pass and deeper economics work.",
      caution: "There may be a workable opening here, but the niche should narrow before more effort goes in.",
      stop: "The current niche case is too weak or too broad to justify pushing it further right now.",
    }),
    missingItems: [
      input.referenceCount === 0 ? "Reference ASINs" : "",
      input.landedCost <= 0 ? "Assumed landed cost" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      nicheVerdict === "advance"
        ? "Carry only the surviving wedge into product research and contribution-margin work."
        : "Do not move this into sourcing or launch prep yet.",
      `${nicheOwner} should own the first move: ${nicheMoveNow.toLowerCase()}.`,
      "Freeze the same reference cluster before the next pass so the go/no-go call stays tied to the same battlefield.",
      "Write the exact entry wedge in one sentence before the next pass, or kill the niche.",
      "Reject the lane quickly if budget cover and competition both remain unfavorable after the next pass.",
    ],
    evidence: nicheFinderEvidence,
  } satisfies ToolEvaluation;
}

function getSeasonalityFactor(category: string, month: number) {
  const normalizedCategory = normalizeCategoryBucket(category);
  const calendar: Record<string, number[]> = {
    apparel: [0.95, 0.9, 0.95, 1, 1.05, 1.1, 1.05, 0.95, 1, 1.05, 1.2, 1.3],
    beauty: [0.95, 0.95, 1, 1, 1.05, 1.05, 1, 0.95, 1, 1.05, 1.1, 1.15],
    books: [1, 0.95, 0.95, 0.95, 1, 1.05, 1.1, 1.15, 1.2, 1.1, 1.05, 1.15],
    electronics: [0.95, 0.9, 0.95, 1, 1, 0.95, 0.95, 1, 1.05, 1.15, 1.25, 1.35],
    home: [1, 0.95, 1, 1.05, 1.1, 1.05, 0.95, 0.95, 1, 1.05, 1.15, 1.2],
    office: [0.95, 0.9, 0.95, 1, 1.05, 0.95, 0.9, 1.2, 1.15, 1, 0.95, 0.95],
    pet: [1, 0.95, 1, 1, 1.05, 1.05, 1, 1, 1.05, 1.1, 1.15, 1.15],
    sports: [0.9, 0.95, 1, 1.1, 1.15, 1.15, 1.05, 1, 0.95, 1, 1.05, 1.1],
    toys: [0.85, 0.8, 0.85, 0.9, 0.95, 0.95, 0.9, 0.95, 1.1, 1.25, 1.45, 1.65],
  };

  const values = calendar[normalizedCategory] ?? [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  return values[Math.max(0, Math.min(11, month - 1))] ?? 1;
}

export function evaluateTrendingProducts(input: {
  category: string;
  keyword: string;
  referenceCount: number;
  timeHorizonDays: number;
  currentMonth: number;
  averagePrice: number;
  averageRank: number;
  lowReviewCount: number;
  badgeCarrierCount: number;
  strongDemandCount: number;
  aPlusCount: number;
  launchBudget: number;
  landedCost: number;
  earlySignalCount: number;
  matureSignalCount: number;
}) {
  const estimatedMonthlyUnits = estimateMonthlyUnitsFromBsr(input.category, input.averageRank);
  const seasonalityFactor = getSeasonalityFactor(input.category, input.currentMonth);
  const horizonMultiplier =
    input.timeHorizonDays <= 30 ? 0.5 : input.timeHorizonDays <= 90 ? 1 : 1.25;
  const momentumScore =
    Math.round(
      (input.referenceCount > 0
        ? ((input.lowReviewCount + input.badgeCarrierCount + input.strongDemandCount) / (input.referenceCount * 3)) * 100
        : 0) * seasonalityFactor,
    );
  const affordableUnits = input.landedCost > 0 ? input.launchBudget / input.landedCost : 0;
  const estimatedHorizonUnits = Math.round((estimatedMonthlyUnits / 30) * input.timeHorizonDays * horizonMultiplier);
  const alerts: string[] = [];

  if (input.referenceCount < 2) {
    alerts.push("Trend reading is thin because the reference set is too small.");
  }
  if (seasonalityFactor < 1) {
    alerts.push("The current seasonal window is not the strongest point in the cycle for this category.");
  }
  if (input.lowReviewCount === 0 && input.badgeCarrierCount === 0) {
    alerts.push("There are no obvious fresh-launch or badge-driven momentum signals in this set.");
  }
  if (estimatedMonthlyUnits < 150) {
    alerts.push("Demand looks modest, so trend excitement alone would not justify entry.");
  }
  if (affordableUnits < estimatedMonthlyUnits) {
    alerts.push("Budget cover is tight relative to the current demand band.");
  }
  if (input.aPlusCount >= Math.ceil(Math.max(1, input.referenceCount) * 0.6)) {
    alerts.push("Most reference listings already use richer merchandising, so a trend signal alone is not enough.");
  }
  if (input.matureSignalCount > input.earlySignalCount) {
    alerts.push("The cluster may already be maturing into a crowded merchandising race rather than an early trend entry.");
  }

  const score = Math.max(
    0,
    100 -
      (input.referenceCount < 2 ? 18 : 0) -
      (seasonalityFactor < 1 ? 10 : 0) -
      (input.lowReviewCount === 0 && input.badgeCarrierCount === 0 ? 16 : 0) -
      (estimatedMonthlyUnits < 150 ? 18 : 0) -
      (affordableUnits < estimatedMonthlyUnits ? 14 : 0),
  );
  const trendVerdict =
    momentumScore >= 55 &&
    input.earlySignalCount >= Math.ceil(Math.max(1, input.referenceCount) / 2) &&
    estimatedMonthlyUnits >= 150 &&
    affordableUnits >= estimatedMonthlyUnits
      ? "advance"
      : input.matureSignalCount > input.earlySignalCount || affordableUnits < estimatedMonthlyUnits
        ? "hold"
        : "watch";
  const budgetCoverageRatio =
    estimatedMonthlyUnits > 0 ? affordableUnits / estimatedMonthlyUnits : 0;
  const trendVerdictLabel =
    trendVerdict === "advance"
      ? "Approve one validation sprint now"
      : trendVerdict === "hold"
        ? budgetCoverageRatio < 1
          ? "Reject this window until capital reality changes"
          : "Keep this out of launch work"
        : "Keep this in timed watch mode";
  const windowOwner =
    trendVerdict === "advance"
      ? "Launch validation lead"
      : trendVerdict === "hold"
        ? "Category / finance lead"
        : "Trend watch lead";
  const firstWindowMove =
      trendVerdict === "advance"
      ? "Approve one validation sprint now"
      : trendVerdict === "hold"
        ? budgetCoverageRatio < 1
          ? "Reject this window until budget cover clears the lane"
          : "Keep this out of launch work until the same cluster proves the window again"
        : "Require one more persistence check before naming a launch window";
  const doNotCrossLine =
    trendVerdict === "advance"
      ? "Do not widen the cluster before the best signal clears economics"
      : trendVerdict === "hold"
        ? budgetCoverageRatio < 1
          ? "Do not let a trend story outrun capital reality"
          : "Do not treat mature momentum as an early window"
        : "Do not build launch timing from one noisy read";
  const timingRiskBrief =
    trendVerdict === "advance"
      ? `${input.earlySignalCount}/${input.referenceCount} references still look early enough to justify a fast validation pass`
      : trendVerdict === "hold"
        ? budgetCoverageRatio < 1
          ? `Budget cover only supports ${Math.floor(affordableUnits).toLocaleString("en-US")} units against an estimated ${estimatedMonthlyUnits.toLocaleString("en-US")} units/mo demand band`
          : `${input.matureSignalCount}/${input.referenceCount} references already look merchandised or mature`
        : "The cluster still needs one more persistence check before it becomes a commercial timing call";
  const rerunTrigger =
    trendVerdict === "advance"
      ? "Re-run once the first validation sprint confirms economics on the same ASIN cluster"
      : trendVerdict === "hold"
        ? budgetCoverageRatio < 1
          ? "Re-run only after launch budget or landed cost changes enough to fund the same window"
          : "Re-run only if the same cluster still looks earlier on the next timed pass"
        : "Re-run the same cluster once more before any launch task opens";
  const trendActionStance =
    trendVerdict === "advance"
      ? {
          tone: "good" as const,
          label: "Approve one validation sprint now",
          detail:
            `${timingRiskBrief}. Keep the validation narrow and force economics to prove the window before the cluster broadens.`,
        }
      : trendVerdict === "hold"
        ? {
            tone: "critical" as const,
            label: doNotCrossLine,
            detail:
              `${timingRiskBrief}. The current cluster is too late, too weak, or too underfunded to justify launch work until the same references prove a better commercial window.`,
          }
        : {
            tone: "warning" as const,
            label: "Keep this in timed watch mode",
            detail:
              `${timingRiskBrief}. The signal is not strong enough yet to justify launch work, sourcing work, or creative work.`,
          };

  return {
    headline:
      trendVerdict === "advance" && input.earlySignalCount > 0
        ? `Approve this window now - ${input.earlySignalCount} listings still look early enough to validate`
        : trendVerdict === "hold" && budgetCoverageRatio < 1
          ? `Reject this window for now - ${Math.floor(affordableUnits).toLocaleString("en-US")} units of cover is too thin for this window`
        : trendVerdict === "hold"
            ? `Keep this out of launch work - the visible cluster already looks too mature`
            : `Keep this in timed watch mode - ${momentumScore}% signal still needs one more persistence check`,
    summary:
      "Use this timing read to decide whether the window deserves one validation sprint now or should stay closed until persistence is clearer.",
    metrics: [
      {
        label: "Commercial call",
        value: trendVerdictLabel,
        detail: `${firstWindowMove}. ${windowOwner} should decide whether this window deserves real launch attention.`,
      },
      {
        label: "Approval lane",
        value: firstWindowMove,
        detail: timingRiskBrief,
      },
      {
        label: "Momentum score",
        value: `${momentumScore}%`,
        detail: `${input.lowReviewCount} low-review listings and ${input.badgeCarrierCount} badge carriers`,
      },
      {
        label: "Demand baseline",
        value: `${estimatedMonthlyUnits.toLocaleString("en-US")} units/mo`,
        detail: input.averageRank > 0 ? `Average BSR #${Math.round(input.averageRank).toLocaleString("en-US")}` : "Rank baseline is partial",
      },
      {
        label: "Seasonality",
        value: `${round(seasonalityFactor * 100, 0)}%`,
        detail: `${input.timeHorizonDays}-day horizon in current category cycle`,
      },
      {
        label: "Average price",
        value: formatCurrency(round(input.averagePrice)),
        detail: `${input.strongDemandCount}/${input.referenceCount} strong-demand references`,
      },
      {
        label: "Budget cover",
        value: `${Math.floor(affordableUnits).toLocaleString("en-US")} units`,
        detail: `${formatCurrency(round(input.launchBudget))} budget at ${formatCurrency(round(input.landedCost))} landed cost`,
      },
      {
        label: "Decision owner",
        value: windowOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Do not let trend curiosity create sourcing, creative, or launch work outside the single approved lane.",
      },
      {
        label: "Re-run trigger",
        value: rerunTrigger,
        detail: "Do not keep resetting the sample until the window tells a different story.",
      },
      {
        label: "Merchandising maturity",
        value: `${input.aPlusCount}/${input.referenceCount}`,
        detail: "Reference listings already using A+",
      },
      {
        label: "Early vs mature",
        value: `${input.earlySignalCount}/${input.matureSignalCount}`,
        detail: "Early-signal listings versus already-mature merchandised listings",
      },
    ],
    recommendations: [
      momentumScore >= 55 && input.earlySignalCount >= Math.ceil(Math.max(1, input.referenceCount) / 2)
        ? "Approve one controlled validation cycle now. Do not widen the cluster until the first economics pass survives."
        : "This is not approval-grade yet. Do not open launch work from momentum alone.",
      trendVerdict === "advance"
        ? "Do not spread effort across adjacent ideas yet. Pick the strongest timing cluster and force economics to clear it."
        : trendVerdict === "hold"
          ? budgetCoverageRatio < 1
            ? "Forbidden move: asking timing to compensate for an underfunded lane. Fix capital reality or drop the window."
            : "Forbidden move: calling this an early opening when the visible winners already look merchandised and established."
          : "Forbidden move: opening sourcing, creatives, or launch tasks before the same cluster proves persistence one more time.",
      seasonalityFactor >= 1
        ? "Timing is supportive enough. The next gate is whether this one cluster survives economics."
        : "Timing is not helping you right now. If the cluster still matters, re-check whether the next seasonal window improves the case.",
      affordableUnits >= estimatedMonthlyUnits
        ? "Capital is not the blocker on this pass. Keep the lane on timing quality instead of opening broader launch planning."
        : "Trend potential is less useful if the budget cannot support initial inventory and testing. Fix capital discipline before calling this an opportunity.",
      input.matureSignalCount > input.earlySignalCount
        ? "Do not confuse crowded maturity with exploitable momentum. This belongs in standard niche validation, not launch timing."
        : "Freeze this exact ASIN cluster for the next recheck so you can tell whether momentum is persisting or you are just swapping samples.",
      `Re-run only when this same cluster changes state: ${rerunTrigger.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 78, 58, {
      good: "Trend signal looks usable",
      warning: "Trend signal is directional",
      critical: "Trend signal looks weak",
    }),
    actionStance: trendActionStance,
    missingItems: [
      input.referenceCount === 0 ? "Reference ASINs" : "",
      input.landedCost <= 0 ? "Assumed landed cost" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      trendVerdict === "advance"
        ? "Approve only the strongest cluster for product research, niche screening, and contribution-margin validation now."
        : "Keep this out of launch prep until the same cluster proves itself again.",
      `${windowOwner} should run the next move: ${firstWindowMove.toLowerCase()}.`,
      "Freeze the same ASIN cluster for the next read so persistence and noise are not confused.",
      trendVerdict === "watch"
        ? "Re-open this window only if the same cluster survives one more pass with stronger early-signal proof."
        : "Reject the window quickly if demand and budget cover both remain weak after the next validation pass.",
    ],
    evidence: trendingProductsEvidence,
  } satisfies ToolEvaluation;
}

export function evaluateSellerAnalytics(input: {
  referenceCount: number;
  categoryCount: number;
  heroCategory: string;
  heroCategoryShare: number;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  premiumShare: number;
  valueShare: number;
  averageReviewCount: number;
  aPlusCount: number;
  badgeCarrierCount: number;
}) {
  const aPlusCoverage =
    input.referenceCount > 0 ? (input.aPlusCount / input.referenceCount) * 100 : 0;
  const alerts: string[] = [];

  if (input.referenceCount < 3) {
    alerts.push("Portfolio sample is thin. Add more storefront ASINs for a believable pattern read.");
  }
  if (input.categoryCount <= 1) {
    alerts.push("The assortment looks concentrated in one category, so diversification is limited.");
  }
  if (input.heroCategoryShare >= 0.65) {
    alerts.push("One category dominates the portfolio, which raises concentration risk.");
  }
  if (input.premiumShare >= 0.6 && input.averageReviewCount < 200) {
    alerts.push("The seller is leaning premium without especially deep review proof.");
  }
  if (aPlusCoverage < 40 && input.referenceCount >= 3) {
    alerts.push("A+ coverage is lighter than expected for a mature portfolio.");
  }
  if (input.valueShare >= 0.55 && input.premiumShare >= 0.35) {
    alerts.push("The price ladder spans both value and premium heavily, which can signal a less coherent assortment story.");
  }

  const score = Math.max(
    0,
    100 -
      (input.referenceCount < 3 ? 16 : 0) -
      (input.categoryCount <= 1 ? 12 : 0) -
      (input.heroCategoryShare >= 0.65 ? 14 : 0) -
      (input.premiumShare >= 0.6 && input.averageReviewCount < 200 ? 12 : 0) -
      (aPlusCoverage < 40 && input.referenceCount >= 3 ? 10 : 0),
  );
  const sellerVerdict =
    input.referenceCount < 3
      ? "Expand the sample before using this storefront as strategy input"
      : input.heroCategoryShare >= 0.65
        ? "Treat this seller as a concentrated specialist first"
        : input.premiumShare >= 0.6 && input.averageReviewCount < 200
          ? "Do not copy the premium posture before proof catches up"
          : aPlusCoverage < 40
            ? "Use the assortment pattern, but verify asset depth before copying the playbook"
            : "Use this storefront pattern as a competitor playbook";
  const sellerOwner =
    input.referenceCount < 3
      ? "Competitive research lead"
      : input.heroCategoryShare >= 0.65
        ? "Assortment strategy lead"
        : input.premiumShare >= 0.6 && input.averageReviewCount < 200
          ? "Pricing / positioning lead"
          : aPlusCoverage < 40
            ? "Brand content lead"
            : "Portfolio strategy owner";
  const sellerMoveNow =
    input.referenceCount < 3
      ? "Load more seller ASINs before turning this read into assortment or pricing decisions"
      : input.heroCategoryShare >= 0.65
        ? "Benchmark against the hero category first and keep adjacent categories closed"
        : input.premiumShare >= 0.6 && input.averageReviewCount < 200
          ? "Pressure-test the premium posture before copying the price ladder"
          : aPlusCoverage < 40
            ? "Use the assortment shape but verify content depth before mirroring the strategy"
            : "Carry this storefront pattern into competitor positioning and gap analysis";
  const sellerDoNotCross =
    input.referenceCount < 3
      ? "Do not make portfolio calls from a thin storefront sample"
      : input.heroCategoryShare >= 0.65
        ? "Do not treat a concentrated specialist like a diversified operator"
        : input.premiumShare >= 0.6 && input.averageReviewCount < 200
          ? "Do not copy premium pricing without matching proof depth"
          : aPlusCoverage < 40
            ? "Do not confuse assortment breadth with fully mature merchandising"
            : "Do not turn one seller read into a generic market truth";
  const sellerRiskBrief =
    input.referenceCount < 3
      ? "The storefront sample is still too thin to separate signal from noise."
      : input.heroCategoryShare >= 0.65
        ? `${Math.round(input.heroCategoryShare * 100)}% of the visible portfolio sits in ${input.heroCategory}.`
        : input.premiumShare >= 0.6 && input.averageReviewCount < 200
          ? `${Math.round(input.premiumShare * 100)}% of the visible mix is premium while average review proof is still modest.`
          : `${round(aPlusCoverage, 0)}% A+ coverage and ${Math.round(input.averageReviewCount)} average reviews describe the current maturity level.`;
  const sellerRerunTrigger =
    input.referenceCount < 3
      ? "Re-run once more storefront ASINs are loaded from the same seller"
      : input.heroCategoryShare >= 0.65
        ? "Re-run only if the visible category mix changes or the hero category thesis breaks"
        : input.premiumShare >= 0.6 && input.averageReviewCount < 200
          ? "Re-run only after proof depth or price posture changes materially"
          : "Re-run when the storefront assortment or asset depth shifts enough to change the playbook";

  return {
    headline:
      input.referenceCount < 3
        ? "Expand the storefront sample before using this seller as strategy input"
        : `${sellerVerdict} - ${Math.round(input.heroCategoryShare * 100)}% of the portfolio sits in ${input.heroCategory}`,
    summary:
      "Use this storefront read to decide which part of the seller playbook is worth copying, which part should stay closed, and who owns the next comparison move.",
    metrics: [
      {
        label: "Commercial call",
        value: sellerVerdict,
        detail: `${sellerMoveNow}. ${sellerOwner} owns the first competitor-pattern call.`,
      },
      {
        label: "Open lane",
        value: sellerMoveNow,
        detail: sellerRiskBrief,
      },
      {
        label: "Portfolio size",
        value: `${input.referenceCount} ASINs`,
        detail: `${input.categoryCount} visible category buckets`,
      },
      {
        label: "Hero category",
        value: input.heroCategory,
        detail: `${Math.round(input.heroCategoryShare * 100)}% category concentration`,
      },
      {
        label: "Price ladder",
        value: `${formatCurrency(round(input.lowestPrice))} - ${formatCurrency(round(input.highestPrice))}`,
        detail: `${formatCurrency(round(input.averagePrice))} average visible price`,
      },
      {
        label: "Value vs premium",
        value: `${Math.round(input.valueShare * 100)}% / ${Math.round(input.premiumShare * 100)}%`,
        detail: "Share of low-priced vs premium-priced listings",
      },
      {
        label: "Asset depth",
        value: `${round(aPlusCoverage, 0)}% A+`,
        detail: `${input.badgeCarrierCount} badge-carrying listings and ${Math.round(input.averageReviewCount)} avg reviews`,
      },
      {
        label: "Portfolio balance",
        value: `${input.categoryCount} buckets`,
        detail: `${Math.round((1 - input.heroCategoryShare) * 100)}% sits outside the hero category`,
      },
      {
        label: "Decision owner",
        value: sellerOwner,
        detail: sellerDoNotCross,
      },
      {
        label: "Wrong move",
        value: sellerDoNotCross,
        detail: "Do not let one storefront read trigger broad assortment, pricing, and content imitation at the same time.",
      },
      {
        label: "Re-run trigger",
        value: sellerRerunTrigger,
        detail: "Keep comparing against the same seller long enough to learn the real operating pattern.",
      },
    ],
    recommendations: [
      input.referenceCount < 3
        ? "Do not make storefront strategy calls from this sample yet. Load more ASINs before reallocating assortment effort."
        : "Use the strongest concentration or price-ladder signal to decide where the next competitive deep dive should go.",
      input.heroCategoryShare >= 0.65
        ? "Treat this seller as a specialist first. Decide whether that concentration is a moat or a fragility before copying it."
        : "The portfolio is not overly concentrated, so assortment range is part of the strategy rather than an accident.",
      input.premiumShare >= 0.6
        ? "Do not price-anchor to the premium tier unless review proof and asset depth actually support it."
        : "The visible price ladder is not strongly premium-led, so assortment architecture matters more than prestige pricing.",
      aPlusCoverage < 40
        ? "Assortment signal may be useful, but content maturity is still lighter than a best-in-class seller playbook."
        : "Asset depth is strong enough to take the storefront pattern seriously as a competitor blueprint.",
      `Re-run only when this same seller pattern changes state: ${sellerRerunTrigger.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 78, 58, {
      good: "Seller pattern read looks usable",
      warning: "Seller pattern read is directional",
      critical: "Seller pattern read is thin",
    }),
    actionStance: buildActionStance(score, {
      goAt: 78,
      cautionAt: 58,
    }, {
      go: "Use this seller pattern",
      caution: "Expand the seller sample",
      stop: "Do not act on this read yet",
    }, {
      go: "The portfolio pattern is strong enough to use for competitor positioning, assortment benchmarking, or pricing follow-up.",
      caution: "There are useful signals here, but the sample or pattern still needs more coverage before major decisions are made.",
      stop: "The current storefront read is too thin or too noisy to justify acting on yet.",
    }),
    missingItems: [
      input.referenceCount === 0 ? "Storefront or portfolio ASINs" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${sellerOwner} should own the first move: ${sellerMoveNow.toLowerCase()}.`,
      "Turn the strongest category or pricing pattern into a competitor benchmark rather than treating this as a generic seller summary.",
      "Freeze the same storefront sample before the next pass so the comparison stays honest.",
      "Use the biggest gap in concentration, price ladder, or asset depth to decide the next analysis angle.",
    ],
    evidence: sellerAnalyticsEvidence,
  } satisfies ToolEvaluation;
}

export function evaluateBrandAnalytics(input: {
  rowCount: number;
  topQueryCount: number;
  clickedAsinCount: number;
  convertedAsinCount: number;
  ownAsinMentions: number;
  ownAsinProvided: boolean;
  competitorAsinCount: number;
  concentrationShare: number;
  medianSfr: number;
}) {
  const alerts: string[] = [];

  if (input.rowCount < 5) {
    alerts.push("The export sample is thin. Add more Brand Analytics rows before trusting the pattern.");
  }
  if (input.ownAsinProvided && input.ownAsinMentions === 0) {
    alerts.push("Your ASIN does not appear in the visible clicked or converted slots of this sample.");
  }
  if (input.concentrationShare >= 0.5) {
    alerts.push("A small set of ASINs is capturing a large share of the sample, which suggests concentration pressure.");
  }
  if (input.competitorAsinCount < 3) {
    alerts.push("There are not many distinct competing ASINs yet, so the comparison view is narrow.");
  }
  if (
    input.ownAsinProvided &&
    input.topQueryCount > 0 &&
    input.ownAsinMentions / input.topQueryCount < 0.2
  ) {
    alerts.push("Own presence is thin relative to the query set, so defense coverage is limited.");
  }

  const score = Math.max(
    0,
    100 -
      (input.rowCount < 5 ? 18 : 0) -
      (input.ownAsinProvided && input.ownAsinMentions === 0 ? 20 : 0) -
      (input.concentrationShare >= 0.5 ? 16 : 0) -
      (input.competitorAsinCount < 3 ? 10 : 0),
  );
  const commercialCall =
    input.rowCount < 5
      ? "Do not plan from a thin Brand Analytics export"
      : input.ownAsinProvided && input.ownAsinMentions === 0
        ? "Treat this as a gap map before defending anything else"
        : input.concentrationShare >= 0.5
          ? "Attack the concentrated winner set before broadening query work"
          : input.ownAsinProvided &&
              input.topQueryCount > 0 &&
              input.ownAsinMentions / input.topQueryCount >= 0.2
            ? "Defend visible query share before chasing colder queries"
            : "Balance defense and attack from this export";
  const decisionOwner =
    input.rowCount < 5
      ? "Analytics lead"
      : input.ownAsinProvided && input.ownAsinMentions === 0
        ? "Growth / gap-closure lead"
        : input.concentrationShare >= 0.5
          ? "Competitive response lead"
          : input.ownAsinProvided &&
              input.topQueryCount > 0 &&
              input.ownAsinMentions / input.topQueryCount >= 0.2
            ? "Listing / defense lead"
            : "Brand analytics lead";
  const moveNow =
    input.rowCount < 5
      ? "Load a wider export before turning this into budget, copy, or ranking work"
      : input.ownAsinProvided && input.ownAsinMentions === 0
        ? "Open the highest-value absent query first and keep defense work closed"
        : input.concentrationShare >= 0.5
          ? "Pressure-test the top repeated winner ASIN before widening into generic query work"
          : input.ownAsinProvided &&
              input.topQueryCount > 0 &&
              input.ownAsinMentions / input.topQueryCount >= 0.2
            ? "Protect the visible own-ASIN queries first and keep colder attack lanes closed"
            : "Split one defend lane and one attack lane, then keep the rest of the export closed";
  const doNotCrossLine =
    input.rowCount < 5
      ? "Do not plan from a thin Brand Analytics export"
      : input.ownAsinProvided && input.ownAsinMentions === 0
        ? "Do not pretend this is a defense map when your ASIN is absent"
        : input.concentrationShare >= 0.5
          ? "Do not spread effort across every query while a small winner set controls the field"
          : input.ownAsinProvided &&
              input.topQueryCount > 0 &&
              input.ownAsinMentions / input.topQueryCount >= 0.2
            ? "Do not chase colder queries while visible share is still leaking"
            : "Do not mix defense rows and gap rows into one vague action list";
  const queryRiskBrief =
    input.ownAsinProvided && input.ownAsinMentions === 0
      ? "Your ASIN is absent from the visible clicked and converted winners in this sample."
      : input.concentrationShare >= 0.5
        ? `${Math.round(input.concentrationShare * 100)}% of the sample is concentrated in a small repeated winner set.`
        : input.ownAsinProvided && input.topQueryCount > 0
          ? `${input.ownAsinMentions} own-ASIN appearances are visible across ${input.topQueryCount} tracked query rows.`
          : `${input.topQueryCount} tracked query rows are currently led by ${input.competitorAsinCount} competing ASINs.`;

  return {
    headline:
      input.rowCount < 5
        ? "Do not plan from a thin Brand Analytics export"
        : input.ownAsinProvided && input.ownAsinMentions === 0
          ? `${commercialCall} - your ASIN is absent from visible winners`
          : input.concentrationShare >= 0.5
            ? `${commercialCall} - winner concentration is too high to ignore`
            : `${commercialCall} - the export is strong enough to act`,
    summary:
      "This Brand Analytics read decides whether the first move is query defense, gap attack, or winner-specific response before the team turns a good export into a vague research pile.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${moveNow}. ${decisionOwner} owns the first query-share lane.`,
      },
      {
        label: "Open lane",
        value: moveNow,
        detail: queryRiskBrief,
      },
      {
        label: "Rows parsed",
        value: `${input.rowCount}`,
        detail: `${input.topQueryCount} usable query rows`,
      },
      {
        label: input.ownAsinProvided ? "Own appearances" : "Own ASIN",
        value: input.ownAsinProvided ? `${input.ownAsinMentions}` : "Not set",
        detail: input.ownAsinProvided
          ? "Times your ASIN showed in clicked or converted slots"
          : "Add your ASIN to measure visible share and defense coverage",
      },
      {
        label: "Competitor ASINs",
        value: `${input.competitorAsinCount}`,
        detail: `${input.clickedAsinCount} clicked-slot ASINs and ${input.convertedAsinCount} converted-slot ASINs`,
      },
      {
        label: "Concentration",
        value: `${Math.round(input.concentrationShare * 100)}%`,
        detail: "Share captured by the most repeated ASINs in sample",
      },
      {
        label: "Median SFR",
        value: input.medianSfr > 0 ? `${Math.round(input.medianSfr).toLocaleString("en-US")}` : "Not found",
        detail: "Middle search-frequency-rank in the current sample",
      },
      {
        label: input.ownAsinProvided ? "Presence rate" : "Coverage mode",
        value: input.ownAsinProvided
          ? input.topQueryCount > 0
            ? `${Math.round((input.ownAsinMentions / input.topQueryCount) * 100)}%`
            : "0%"
          : "Competitor map",
        detail: input.ownAsinProvided
          ? "Share of tracked queries where the own ASIN appears"
          : "Current read focuses on repeated winners and query concentration",
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep the first query-share move narrow so the next export teaches whether defense or attack actually worked.",
      },
    ],
    recommendations: [
      input.ownAsinProvided && input.ownAsinMentions > 0
        ? "Use the query rows where your ASIN already appears to defend share before chasing colder terms."
        : input.ownAsinProvided
          ? "If your ASIN is absent from visible slots, do not spread effort broadly yet. Treat this sample as a gap map rather than a defense map."
          : "Add your own ASIN when you want a defense read instead of a pure competitor map.",
      input.concentrationShare >= 0.5
        ? "A concentrated winner set means competitor-specific action can matter more than broad generic copy edits."
        : "The field is not overly concentrated, so diversify actions across multiple terms and ASIN patterns.",
      input.rowCount < 5
        ? "Do not make ranking-defense decisions from this export alone. Add more rows before reallocating budget or copy effort."
        : "Push the top queries and repeated competitor ASINs into keyword, listing, or competitive follow-up next.",
      input.ownAsinProvided && input.ownAsinMentions > 0
        ? "Assign one owner to defend visible query rows and one to attack competitor-led gaps where your ASIN is still missing."
        : "Assign one owner to expand the export and one to turn repeated competitor winners into action items.",
      `Re-run only when this same lane changes state: ${moveNow.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 80, 60, {
      good: "Brand Analytics read looks usable",
      warning: "Brand Analytics read is directional",
      critical: "Brand Analytics read is thin",
    }),
    actionStance: buildActionStance(score, {
      goAt: 80,
      cautionAt: 60,
    }, {
      go: "Work these query insights",
      caution: "Add more export coverage",
      stop: "Do not plan from this export yet",
    }, {
      go: "This export is strong enough to drive immediate query-defense or competitor-gap actions.",
      caution: "There are some useful signals, but the export should be widened before it drives broad prioritization.",
      stop: "The current export is too thin or too incomplete to justify planning from yet.",
    }),
    missingItems: [
      input.rowCount === 0 ? "Brand Analytics export rows" : "",
      input.clickedAsinCount === 0 && input.convertedAsinCount === 0 ? "Clicked or converted ASIN columns" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${moveNow.toLowerCase()}.`,
      "Carry the most repeated competitor ASINs into comparison or keyword workflows.",
      "Defend the highest-value visible query rows before broadening coverage.",
      "Separate defense queries from gap queries so budget and copy changes do not get mixed together.",
      "Refresh this read when the next Brand Analytics export lands.",
    ],
    evidence: brandAnalyticsEvidence,
  } satisfies ToolEvaluation;
}

export function evaluateSeasonalPlanning(input: {
  monthsAhead: number;
  leadTimeDays: number;
  inventoryCoverDays: number;
  promoBudget: number;
  eventCount: number;
  urgentEventCount: number;
  adMilestoneCount: number;
  reorderRiskCount: number;
}) {
  const alerts: string[] = [];

  if (input.eventCount === 0) {
    alerts.push("No events are selected, so the calendar has no actual commercial anchors.");
  }
  if (input.urgentEventCount > 0) {
    alerts.push("One or more selected events is inside the current production or replenishment danger zone.");
  }
  if (input.inventoryCoverDays < 45) {
    alerts.push("Inventory cover looks tight for seasonal execution.");
  }
  if (input.promoBudget <= 0) {
    alerts.push("Promo budget is missing, so ad and deal planning are only structural.");
  }
  if (input.leadTimeDays > input.inventoryCoverDays) {
    alerts.push("Lead time is longer than current inventory cover, which creates a replenishment timing mismatch.");
  }

  const score = Math.max(
    0,
    100 -
      (input.eventCount === 0 ? 24 : 0) -
      input.urgentEventCount * 12 -
      (input.inventoryCoverDays < 45 ? 16 : 0) -
      (input.promoBudget <= 0 ? 10 : 0),
  );
  const seasonalVerdict =
    input.eventCount === 0
      ? "Load real commercial events before planning the season"
      : input.urgentEventCount > 0 && input.leadTimeDays > input.inventoryCoverDays
        ? "Stop adding events and rescue the nearest window now"
        : input.urgentEventCount > 0
          ? "Lock the nearest seasonal window now"
          : input.inventoryCoverDays < 45
            ? "Tighten inventory before widening the seasonal calendar"
            : "Run the season through the current priority windows";
  const seasonalOwner =
    input.eventCount === 0
      ? "Calendar planning owner"
      : input.urgentEventCount > 0 && input.leadTimeDays > input.inventoryCoverDays
        ? "Inventory / replenishment lead"
        : input.urgentEventCount > 0
          ? "Seasonal execution lead"
          : input.inventoryCoverDays < 45
            ? "Operations lead"
            : "Seasonal plan owner";
  const seasonalMoveNow =
    input.eventCount === 0
      ? "Select the actual events that matter before opening inventory, ads, or promo work"
      : input.urgentEventCount > 0 && input.leadTimeDays > input.inventoryCoverDays
        ? "Rescue the nearest event and close the rest of the calendar until replenishment catches up"
        : input.urgentEventCount > 0
          ? "Lock the nearest reorder, ad, and promo milestones now"
          : input.inventoryCoverDays < 45
            ? "Reduce the active calendar to the few windows current cover can actually support"
            : "Keep the next priority windows moving and leave later events closed";
  const seasonalDoNotCross =
    input.eventCount === 0
      ? "Do not build a seasonal plan without real commercial events"
      : input.urgentEventCount > 0 && input.leadTimeDays > input.inventoryCoverDays
        ? "Do not widen the calendar while lead time already exceeds inventory cover"
        : input.urgentEventCount > 0
          ? "Do not distribute attention evenly across the full season"
          : input.inventoryCoverDays < 45
            ? "Do not approve more seasonal windows than current inventory can support"
            : "Do not let later events steal resources from the next executable window";
  const seasonalRiskBrief =
    input.eventCount === 0
      ? "The calendar has no actual commercial anchors yet."
      : input.urgentEventCount > 0 && input.leadTimeDays > input.inventoryCoverDays
        ? `${input.urgentEventCount} mapped events are already inside the danger zone while lead time exceeds inventory cover.`
        : input.urgentEventCount > 0
          ? `${input.urgentEventCount} mapped events are already inside the immediate action window.`
          : `${input.eventCount} mapped events currently sit against ${input.inventoryCoverDays} days of cover and ${input.leadTimeDays} days of lead time.`;
  const seasonalRerunTrigger =
    input.eventCount === 0
      ? "Re-run once the real seasonal event list is loaded"
      : input.urgentEventCount > 0 && input.leadTimeDays > input.inventoryCoverDays
        ? "Re-run only after the nearest replenishment and inventory checkpoint changes"
        : input.inventoryCoverDays < 45
          ? "Re-run when inventory cover or event priority changes enough to reopen the calendar"
          : "Re-run when the next event window is locked or inventory cover materially changes";

  return {
    headline:
      input.eventCount === 0
        ? "Load real events before planning the season"
        : `${seasonalVerdict} - ${input.eventCount} events mapped with ${input.reorderRiskCount} inventory-risk checkpoints`,
    summary:
      "Use this calendar read to decide which seasonal window is live now, which windows stay closed, and who owns the next execution move.",
    metrics: [
      {
        label: "Commercial call",
        value: seasonalVerdict,
        detail: `${seasonalMoveNow}. ${seasonalOwner} owns the next seasonal decision.`,
      },
      {
        label: "Open lane",
        value: seasonalMoveNow,
        detail: seasonalRiskBrief,
      },
      {
        label: "Events planned",
        value: `${input.eventCount}`,
        detail: `${input.urgentEventCount} events need immediate action`,
      },
      {
        label: "Lead time",
        value: `${input.leadTimeDays} days`,
        detail: `${input.monthsAhead} months planning horizon`,
      },
      {
        label: "Inventory cover",
        value: `${input.inventoryCoverDays} days`,
        detail: `${input.reorderRiskCount} event checkpoints at risk`,
      },
      {
        label: "Ad milestones",
        value: `${input.adMilestoneCount}`,
        detail: input.promoBudget > 0 ? `${formatCurrency(round(input.promoBudget))} promo budget loaded` : "No promo budget loaded",
      },
      {
        label: "Calendar pressure",
        value: `${Math.max(0, input.eventCount - input.urgentEventCount)}/${input.eventCount}`,
        detail: "Events still outside the immediate danger window",
      },
      {
        label: "Urgency share",
        value: input.eventCount > 0 ? `${Math.round((input.urgentEventCount / input.eventCount) * 100)}%` : "0%",
        detail: "Share of mapped events already inside the danger zone",
      },
      {
        label: "Decision owner",
        value: seasonalOwner,
        detail: seasonalDoNotCross,
      },
      {
        label: "Wrong move",
        value: seasonalDoNotCross,
        detail: "Keep the calendar narrow enough that operations, ads, and promo work can actually execute.",
      },
      {
        label: "Re-run trigger",
        value: seasonalRerunTrigger,
        detail: "Do not keep remapping the season without a real operational state change.",
      },
    ],
    recommendations: [
      input.urgentEventCount > 0
        ? "Do not plan the whole season evenly. Work the nearest window first because the lead-time window is already closing."
        : "The current calendar still has enough runway to stage the next priority windows in order.",
      input.leadTimeDays > input.inventoryCoverDays
        ? "Fix the replenishment mismatch before adding more events, or the calendar will outrun operational reality."
        : "Lead time is not the primary blocker yet, so keep the calendar focused on the next executable windows.",
      input.promoBudget <= 0
        ? "Do not greenlight promo-heavy event plans yet. Load a real promo budget first."
        : "Use the event calendar as the control surface for inventory, ad prep, and promo approvals rather than treating them as separate streams.",
      `Re-run only when this same seasonal lane changes state: ${seasonalRerunTrigger.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 80, 60, {
      good: "Seasonal plan looks usable",
      warning: "Seasonal plan needs tightening",
      critical: "Seasonal plan is at risk",
    }),
    actionStance: buildActionStance(score, {
      goAt: 80,
      cautionAt: 60,
    }, {
      go: "Lock the next event plan",
      caution: "Tighten the calendar first",
      stop: "Fix replenishment before planning wider",
    }, {
      go: "The calendar is strong enough to commit the nearest event milestones and run execution through one shared event plan.",
      caution: "The seasonal plan is usable in outline, but timing, budget, or inventory pressure should be tightened before more campaign work starts.",
      stop: "The current calendar is outrunning inventory or lead-time reality, so broader seasonal planning should pause until operations catch up.",
    }),
    missingItems: [
      input.eventCount === 0 ? "Selected seasonal events" : "",
      input.promoBudget <= 0 ? "Promo budget" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${seasonalOwner} should own the first move: ${seasonalMoveNow.toLowerCase()}.`,
      "Lock the nearest reorder and ad-prep milestones first.",
      "Freeze lower-priority events until the current window is secured.",
      "Revisit the calendar when inventory cover or lead times change.",
    ],
    evidence: seasonalPlanningEvidence,
  } satisfies ToolEvaluation;
}

export function evaluateListingOptimization(input: {
  category: string;
  titleLength: number;
  bulletCount: number;
  imageCount: number;
  reviewCount: number;
  hasAPlus: boolean;
  targetKeywordCount: number;
  coveredKeywordCount: number;
  competitorCount: number;
  cheaperCompetitors: number;
  richerImageCompetitors: number;
  strongerReviewCompetitors: number;
  competitorAPlusCount: number;
}) {
  const keywordCoverage = percentCovered(
    input.coveredKeywordCount,
    input.targetKeywordCount,
  );
  const profile = getCategoryRuleProfile(input.category);
  const titleMin = profile?.titleMinChars ?? 80;
  const titleMax = profile?.titleMaxChars ?? 180;
  const recommendedImageCount = profile?.recommendedImageCount ?? 6;
  let score = 100;
  const alerts: string[] = [];
  let firstFocus = "Run one controlled conversion-layer test.";
  let firstFocusReason =
    "When the structural gaps are mostly closed, the next paid-test value comes from tightening objection handling and trust density, not reopening the full PDP.";

  if (input.titleLength < titleMin || input.titleLength > titleMax) {
    alerts.push(`Title length sits outside the category comfort zone of roughly ${titleMin}-${titleMax} characters.`);
    score -= 10;
  }
  if (input.bulletCount < 4) {
    alerts.push("Visible bullet depth is light, which weakens copy coverage and objection handling.");
    score -= 16;
  }
  if (input.imageCount < recommendedImageCount) {
    alerts.push(`Image stack is thin for this category. The current benchmark expects about ${recommendedImageCount} usable images.`);
    score -= 14;
  }
  if (keywordCoverage < 70) {
    alerts.push("Target keyword coverage is incomplete in the current visible copy.");
    score -= 18;
  }
  if (!input.hasAPlus) {
    alerts.push("A+ is not visible, so educational and trust-building space is limited.");
    score -= 10;
  }
  if (input.reviewCount < 50) {
    alerts.push("Review proof is still thin for a well-defended conversion page.");
    score -= 8;
  }
  if (input.cheaperCompetitors >= Math.max(2, Math.ceil(input.competitorCount / 2))) {
    alerts.push("Most compared competitors are pricing below this listing.");
    score -= 10;
  }
  if (input.richerImageCompetitors >= Math.max(2, Math.ceil(input.competitorCount / 2))) {
    alerts.push("Competitors are carrying richer image coverage than this listing.");
    score -= 8;
  }
  if (input.strongerReviewCompetitors >= Math.max(2, Math.ceil(input.competitorCount / 2))) {
    alerts.push("Competitor review proof is materially stronger than this listing.");
    score -= 10;
  }
  if (!input.hasAPlus && input.competitorAPlusCount >= Math.max(2, Math.ceil(input.competitorCount / 2))) {
    alerts.push("Most compared competitors already have A+, so this listing is light on branded education and trust content.");
    score -= 8;
  }

  // A structural audit can confirm that a PDP is usable, but not that it is
  // ready for broader scale without one measured follow-up test.
  score -= 6;

  if (keywordCoverage < 70) {
    firstFocus = "Place the missing target terms into the title, bullets, and browse-path language first.";
    firstFocusReason = "The page is still missing obvious relevance coverage, so ranking and conversion signals are both capped.";
  } else if (input.imageCount < recommendedImageCount || input.richerImageCompetitors > 0) {
    firstFocus = "Rebuild the image stack before touching price or traffic volume.";
    firstFocusReason = "Richer competitor media usually beats minor copy tweaks when shoppers are comparing fast.";
  } else if (input.reviewCount < 50 || input.strongerReviewCompetitors > 0) {
    firstFocus = "Strengthen proof and objection handling before scaling traffic.";
    firstFocusReason = "Weak review proof makes listing improvements harder to convert into stable lift.";
  } else if (!input.hasAPlus && input.competitorAPlusCount > 0) {
    firstFocus = "Add A+ education next.";
    firstFocusReason = "Competitors already own the mid-page education space, so the listing is losing trust depth.";
  } else if (input.cheaperCompetitors >= Math.max(2, Math.ceil(input.competitorCount / 2))) {
    firstFocus = "Recheck price positioning against the current competitor set.";
    firstFocusReason = "When most close competitors are cheaper, copy gains alone may not carry the offer.";
  }

  const commercialCall =
    alerts.length === 0
      ? "Controlled iteration only"
      : firstFocus;
  const decisionOwner =
    keywordCoverage < 70
      ? "SEO / listing owner"
      : input.imageCount < recommendedImageCount || input.richerImageCompetitors > 0
        ? "Creative owner"
        : input.reviewCount < 50 || input.strongerReviewCompetitors > 0
          ? "Proof / CX owner"
          : !input.hasAPlus && input.competitorAPlusCount > 0
            ? "Brand content owner"
            : input.cheaperCompetitors >= Math.max(2, Math.ceil(input.competitorCount / 2))
              ? "Pricing owner"
              : "Conversion owner";
  const forbiddenMove =
    keywordCoverage < 70
      ? "Do not scale traffic into a page that is still missing obvious relevance coverage"
      : input.imageCount < recommendedImageCount || input.richerImageCompetitors > 0
        ? "Do not rewrite copy while the gallery is still losing the comparison click"
        : input.reviewCount < 50 || input.strongerReviewCompetitors > 0
          ? "Do not buy more traffic into a weak trust surface"
          : "Do not reopen the whole PDP before the first blocker is measured";

  score = Math.max(0, score);
  const evidence = [...toEvidence(input.category, 2), ...listingReadinessEvidence.slice(0, 1)];

  return {
    headline:
      alerts.length === 0
        ? "Hold the PDP steady and prove one controlled lift"
        : score >= 84
          ? "Fix one blocker before the next PDP test"
          : score >= 62
            ? "Do not reopen the whole PDP"
            : "Do not scale this PDP yet",
    summary:
      "This PDP call decides which blocker gets fixed first, who owns it, and what stays frozen until the live page stops losing.",
    metrics: [
      {
        label: "First blocker",
        value:
          keywordCoverage < 70
            ? "Keyword coverage"
            : input.imageCount < recommendedImageCount || input.richerImageCompetitors > 0
              ? "Image stack"
              : input.reviewCount < 50 || input.strongerReviewCompetitors > 0
                ? "Trust proof"
                : !input.hasAPlus && input.competitorAPlusCount > 0
                  ? "A+ depth"
                  : input.cheaperCompetitors >= Math.max(2, Math.ceil(input.competitorCount / 2))
                    ? "Price posture"
                    : "Controlled iteration",
        detail:
          alerts.length === 0 ? "Structural gaps are mostly closed." : firstFocusReason,
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: "One owner clears the first PDP blocker.",
      },
      {
        label: "Execution call",
        value: commercialCall,
        detail: "Do one repair before reopening the rest of the page.",
      },
      {
        label: "Do not cross",
        value: forbiddenMove,
        detail: "Keep the rest of the PDP frozen until the blocker changes.",
      },
    ],
    recommendations: [
      firstFocus,
      `${decisionOwner} owns this blocker until it clears.`,
      "Do not rerun until the active blocker changes on the live PDP.",
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "Listing structure looks usable",
      warning: "Listing structure needs work",
      critical: "Listing structure is weak",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Run one controlled optimization test",
      caution: "Fix the main blocker first",
      stop: "Do not scale traffic yet",
    }, {
      go: "The listing is structurally strong enough for measured iteration, but it should still prove one controlled improvement before traffic scaling gets more aggressive.",
      caution: "The listing has a viable base, but one clear blocker should be fixed before more spend or wider testing.",
      stop: "The current page is still too weak to trust as the destination for meaningful traffic or merchandising effort.",
    }),
    missingItems: [
      input.bulletCount < 4 ? "Full bullet coverage" : "",
      input.imageCount < recommendedImageCount ? "Deeper image set" : "",
      keywordCoverage < 70 ? "Target keyword placement" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      firstFocus,
      "Put one lead on the first blocker and hold the rest of the PDP steady until the first controlled change is measured.",
      "Do not rerun until the active blocker changes on the live PDP.",
      "Approve the next edit only after the first blocker stops losing.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

export function evaluateAPlusContent(input: {
  hasAPlus: boolean;
  benefitCount: number;
  objectionCount: number;
  assetCount: number;
  moduleCount: number;
  comparisonRows: number;
  brandStoryReady: boolean;
  professionalSeller: boolean;
  brandRepresentative: boolean;
  premiumRequested: boolean;
  premiumEligibilityReady: boolean;
  imageSpecReady: boolean;
  altTextReady: boolean;
  plainTextMigrated: boolean;
  retailContributionConflict: boolean;
  genericAsin: boolean;
}) {
  let score = 100;
  const alerts: string[] = [];
  let firstBuildStep = "Lock the module order around the strongest benefits first.";
  let firstBuildReason = "A clean module sequence prevents design work from drifting into filler sections.";

  if (input.benefitCount < 3) {
    alerts.push("Benefit coverage is thin, so the module plan will struggle to educate buyers fully.");
    score -= 18;
  }
  if (input.objectionCount < 2) {
    alerts.push("There are not enough objection-handling angles in the current brief.");
    score -= 12;
  }
  if (input.assetCount < 4) {
    alerts.push("Existing asset inventory is light for a strong A+ build.");
    score -= 14;
  }
  if (input.moduleCount < 4) {
    alerts.push("The current module plan is too shallow for meaningful education.");
    score -= 12;
  }
  if (input.comparisonRows === 0) {
    alerts.push("No comparison block is planned, which leaves cross-family upsell or differentiation weak.");
    score -= 8;
  }
  if (!input.brandStoryReady) {
    alerts.push("Brand-story material is not ready yet.");
    score -= 10;
  }
  if (!input.professionalSeller) {
    alerts.push("A+ Content requires a Professional seller account.");
    score -= 18;
  }
  if (!input.brandRepresentative) {
    alerts.push("Brand Registry role access is not ready for A+ publishing.");
    score -= 18;
  }
  if (input.premiumRequested && !input.premiumEligibilityReady) {
    alerts.push("Premium A+ is requested, but the catalog-level eligibility proof is not ready.");
    score -= 16;
  }
  if (!input.imageSpecReady) {
    alerts.push("Image assets are not yet clean against Amazon's A+ technical requirements.");
    score -= 12;
  }
  if (!input.altTextReady) {
    alerts.push("Alt-text is not ready for the module images.");
    score -= 8;
  }
  if (!input.plainTextMigrated) {
    alerts.push("Key plain-text description details have not yet been migrated into the A+ structure.");
    score -= 8;
  }
  if (input.retailContributionConflict) {
    alerts.push("A retail-vendor contribution conflict can block or override seller A+ on this ASIN.");
    score -= 20;
  }
  if (input.genericAsin && input.premiumRequested) {
    alerts.push("Generic ASIN assumptions do not fit Premium A+ planning.");
    score -= 12;
  }
  if (input.hasAPlus) {
    score += 4;
  }
  if (input.assetCount > 0 && input.moduleCount > input.assetCount + 2) {
    alerts.push("The planned module count is running ahead of the current asset inventory.");
  }
  if (input.comparisonRows > 0 && input.benefitCount < input.comparisonRows) {
    alerts.push("Comparison ambition is outrunning the number of clearly differentiated benefits in the brief.");
  }

  if (!input.professionalSeller || !input.brandRepresentative) {
    firstBuildStep = "Fix publishing access before briefing any build work.";
    firstBuildReason = "Without seller-plan and brand-role access, the plan cannot be published cleanly.";
  } else if (input.premiumRequested && !input.premiumEligibilityReady) {
    firstBuildStep = "Scope this as Basic A+ until premium eligibility is proven.";
    firstBuildReason = "Premium planning without catalog eligibility usually creates rework instead of speed.";
  } else if (input.assetCount < 4 || !input.imageSpecReady) {
    firstBuildStep = "Close the asset checklist before finalizing module layout.";
    firstBuildReason = "Thin or non-compliant assets break otherwise solid A+ structure quickly.";
  } else if (input.benefitCount < 3 || input.objectionCount < 2) {
    firstBuildStep = "Expand the benefit and objection brief before writing copy.";
    firstBuildReason = "The page needs stronger commercial raw material before layout polish matters.";
  } else if (!input.brandStoryReady) {
    firstBuildStep = "Keep Brand Story minimal and focus on product proof first.";
    firstBuildReason = "Brand narrative without evidence usually weakens the A+ page instead of strengthening it.";
  }

  score = Math.max(0, Math.min(100, score));
  const evidence = getAPlusPolicyEvidence({
    professionalSeller: input.professionalSeller,
    brandRepresentative: input.brandRepresentative,
    premiumRequested: input.premiumRequested,
    premiumEligibilityReady: input.premiumEligibilityReady,
    imageSpecReady: input.imageSpecReady,
    altTextReady: input.altTextReady,
    plainTextMigrated: input.plainTextMigrated,
    retailContributionConflict: input.retailContributionConflict,
    genericAsin: input.genericAsin,
  });
  const commercialCall =
    !input.professionalSeller || !input.brandRepresentative
      ? "Fix publishing access before briefing A+ production"
      : input.premiumRequested && !input.premiumEligibilityReady
        ? "Scope this as Basic A+ until Premium eligibility is proven"
        : input.assetCount < 4 || !input.imageSpecReady
          ? "Close the asset checklist before locking the module plan"
          : input.benefitCount < 3 || input.objectionCount < 2
            ? "Expand proof inputs before writing the A+ page"
            : !input.brandStoryReady
              ? "Keep Brand Story minimal and focus on product proof first"
              : "Brief the A+ build now and keep the rest of the page closed";
  const decisionOwner =
    !input.professionalSeller || !input.brandRepresentative
      ? "Catalog access owner"
      : input.premiumRequested && !input.premiumEligibilityReady
        ? "Brand content owner"
        : input.assetCount < 4 || !input.imageSpecReady
          ? "Asset readiness lead"
          : input.benefitCount < 3 || input.objectionCount < 2
            ? "Messaging / proof lead"
            : !input.brandStoryReady
              ? "Brand narrative lead"
              : "A+ production owner";
  const moveNow =
    !input.professionalSeller || !input.brandRepresentative
      ? "Restore seller-plan and Brand Registry publishing access before doing more build work"
      : input.premiumRequested && !input.premiumEligibilityReady
        ? "Freeze Premium ambition and finalize a Basic A+ brief first"
        : input.assetCount < 4 || !input.imageSpecReady
          ? "Close the asset and spec checklist before finalizing module layout"
          : input.benefitCount < 3 || input.objectionCount < 2
            ? "Add stronger benefits and objections before copy production starts"
            : !input.brandStoryReady
              ? "Keep Brand Story light and ship product-proof modules first"
              : "Build the current A+ page and keep extra module expansion closed";
  const doNotCrossLine =
    !input.professionalSeller || !input.brandRepresentative
      ? "Do not commit design or copy time before publishing access is real"
      : input.premiumRequested && !input.premiumEligibilityReady
        ? "Do not plan Premium A+ on unproven eligibility"
        : input.assetCount < 4 || !input.imageSpecReady
          ? "Do not lock module design on thin or non-compliant assets"
          : input.benefitCount < 3 || input.objectionCount < 2
            ? "Do not polish layout before the proof brief is strong enough"
            : !input.brandStoryReady
              ? "Do not let brand narrative outrun product proof"
              : "Do not expand module count faster than the current proof and asset set";
  const aPlusRiskBrief =
    !input.professionalSeller || !input.brandRepresentative
      ? "Publishing access is still incomplete for a clean A+ launch."
      : input.premiumRequested && !input.premiumEligibilityReady
        ? "Premium A+ is still unproven at the catalog level."
        : input.assetCount < 4 || !input.imageSpecReady
          ? `${input.assetCount} assets and current spec readiness are too thin for a stable A+ build.`
          : input.benefitCount < 3 || input.objectionCount < 2
            ? `${input.benefitCount} benefits and ${input.objectionCount} objections are too light for a strong module map.`
            : !input.brandStoryReady
              ? "Brand narrative is still thinner than the product-proof layer."
              : "Proof inputs, assets, and access are aligned enough for one controlled A+ production lane.";

  return {
    headline:
      !input.professionalSeller || !input.brandRepresentative
        ? `${commercialCall} - access is the first broken gate`
        : input.premiumRequested && !input.premiumEligibilityReady
          ? `${commercialCall} - Premium eligibility is the first broken gate`
          : input.assetCount < 4 || !input.imageSpecReady
            ? `${commercialCall} - asset readiness is the first broken gate`
            : input.benefitCount < 3 || input.objectionCount < 2
              ? `${commercialCall} - proof depth is the first broken gate`
              : !input.brandStoryReady
                ? `${commercialCall} - brand narrative is the first broken gate`
                : `${commercialCall} - the A+ production lane is workable`,
    summary:
      "This A+ brief decides whether production should start now, which gate is broken first, who owns the next fix, and which other content moves must stay closed so the next build stays interpretable.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${moveNow}. ${decisionOwner} owns the first A+ lane.`,
      },
      {
        label: "Open lane",
        value: moveNow,
        detail: aPlusRiskBrief,
      },
      {
        label: "Benefit angles",
        value: `${input.benefitCount}`,
        detail: "Distinct commercial benefits available for module planning",
      },
      {
        label: "Objection angles",
        value: `${input.objectionCount}`,
        detail: "Buyer doubts or friction points to resolve visually",
      },
      {
        label: "Asset inventory",
        value: `${input.assetCount}`,
        detail: input.hasAPlus ? "A+ already exists live" : "No live A+ detected",
      },
      {
        label: "Module plan",
        value: `${input.moduleCount}`,
        detail: `${input.comparisonRows} planned comparison rows`,
      },
      {
        label: "Publishing gates",
        value: input.professionalSeller ? "Seller ready" : "Seller plan gap",
        detail: input.brandRepresentative ? (input.premiumRequested ? "Brand role ready | premium path in scope" : "Brand role ready") : "Brand role missing",
      },
      {
        label: "Brand story",
        value: input.brandStoryReady ? "Ready" : "Missing",
        detail: "Whether a brand-story section can be built cleanly",
      },
      {
        label: "Asset pressure",
        value: `${input.assetCount}/${input.moduleCount}`,
        detail: "Current asset inventory versus planned module count",
      },
      {
        label: "Proof spread",
        value: `${input.benefitCount}/${input.objectionCount}/${input.comparisonRows}`,
        detail: "Benefit, objection, and comparison coverage across the plan",
      },
      {
        label: "First build step",
        value: firstBuildStep,
        detail: firstBuildReason,
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep one content-build lane open so you can tell whether access, proof, or assets changed the outcome.",
      },
    ],
    recommendations: [
      input.benefitCount < 3
        ? "Do not brief design production yet. Add more concrete benefit angles before locking module order."
        : "Benefit coverage is broad enough to sequence modules from hero benefit to proof to comparison.",
      input.assetCount < 4
        ? "Do not pay for final layout work yet. Capture more usable assets before briefing production."
        : "Asset inventory is workable enough to brief production next.",
      input.premiumRequested && !input.premiumEligibilityReady
        ? "Do not plan this as Premium A+ yet. Treat it as Basic A+ until eligibility is actually unlocked."
        : "Match the module ambition to the account's actual A+ access level.",
      !input.brandStoryReady
        ? "Keep Brand Story minimal until the narrative and proof are actually available."
        : "Use Brand Story space to reinforce trust and cross-family navigation rather than generic mission text.",
      input.professionalSeller && input.brandRepresentative && input.assetCount >= 4 && input.benefitCount >= 3
        ? "Spend effort on the modules that move conversion first: hero benefit, objection handling, proof, then comparison."
        : "Fix access, proof, and assets before polishing copy tone or visual style.",
      `Re-run only when this same lane changes state: ${moveNow.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "A+ production brief looks usable",
      warning: "A+ plan needs more inputs",
      critical: "A+ plan is too thin",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Build the A+ page now",
      caution: "Tighten the brief first",
      stop: "Do not brief production yet",
    }, {
      go: "The A+ plan is strong enough to brief design and copy production without likely rework.",
      caution: "The A+ direction is workable, but access, assets, or proof depth should be tightened before production starts.",
      stop: "The current A+ plan is too thin or blocked to justify production effort yet.",
    }),
    missingItems: [
      input.benefitCount < 3 ? "More benefit angles" : "",
      input.assetCount < 4 ? "More visual assets" : "",
      !input.brandStoryReady ? "Brand story inputs" : "",
      !input.professionalSeller ? "Professional seller access" : "",
      !input.brandRepresentative ? "Brand Registry role access" : "",
    ].filter(Boolean),
    riskItems: alerts.length
      ? alerts
      : [
          input.premiumRequested
            ? "Do not let Premium ambition outrun the live proof, asset quality, or publishing control behind this page."
            : "Do not let module count expand faster than the proof and asset quality behind the page.",
        ],
    nextSteps: [
      `${decisionOwner} should own the first move: ${moveNow.toLowerCase()}.`,
      "Pair each planned module with exactly one benefit, objection, or comparison job.",
      "Freeze the module map before copy polishing so the asset team is not chasing moving targets.",
      "Refresh the plan after asset capture, eligibility changes, or product-family decisions.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

export function evaluatePpcCampaign(input: {
  rowCount: number;
  campaignTypeCount: number;
  spend: number;
  sales: number;
  orders: number;
  acos: number;
  ctr: number;
  cvr: number;
  winnerCount: number;
  wasteCount: number;
  targetAcos: number;
  topWinnerCampaign: string;
  topWasteCampaign: string;
}) {
  const alerts: string[] = [];
  let score = 100;
  let firstMove = "Tighten campaign segmentation before changing budget broadly.";
  let firstMoveReason = "Cleaner structure makes the next bid and budget decision easier to trust.";

  if (input.rowCount < 4) {
    alerts.push("Campaign sample is thin, so structure decisions are only directional.");
    score -= 14;
  }
  if (input.acos > input.targetAcos * 1.2) {
    alerts.push("Observed ACoS is materially above the target guardrail.");
    score -= 20;
  }
  if (input.ctr < 0.003) {
    alerts.push("Click-through rate is weak, which suggests targeting or creative mismatch.");
    score -= 10;
  }
  if (input.cvr < 0.08) {
    alerts.push("Conversion rate is weak enough that traffic cleanup alone may not solve efficiency.");
    score -= 12;
  }
  if (input.winnerCount === 0) {
    alerts.push("No campaign is clearly outperforming the target guardrail yet.");
    score -= 10;
  }
  if (input.wasteCount >= Math.max(2, Math.ceil(input.rowCount * 0.3))) {
    alerts.push("Too many campaigns are spending without efficient conversion support.");
    score -= 14;
  }
  if (input.spend > 0 && input.sales / input.spend < 2.5) {
    alerts.push("Sales efficiency is light relative to spend, so campaign sprawl may still be masking the main issue.");
  }

  if (input.wasteCount > 0 && input.acos > input.targetAcos) {
    firstMove = `Cut bids or pause waste in ${input.topWasteCampaign || "the weakest campaign"} first.`;
    firstMoveReason = "High ACoS with visible waste means the account is leaking before more scale can help.";
  } else if (input.ctr < 0.003) {
    firstMove = "Split search intent and tighten targeting first.";
    firstMoveReason = "Weak click-through usually points to targeting mismatch more than bid level.";
  } else if (input.cvr < 0.08) {
    firstMove = "Support listing conversion before scaling ad spend.";
    firstMoveReason = "When conversion is weak, traffic cleanup alone rarely restores efficiency.";
  } else if (input.winnerCount > 0) {
    firstMove = `Scale ${input.topWinnerCampaign || "the strongest campaign"} with controlled budget increases.`;
    firstMoveReason = "At least one campaign is already inside the guardrail, so the account has a scale path.";
  }

  score = Math.max(0, score);
  const commercialCall =
    input.rowCount < 4
      ? "Do not widen spend from a thin campaign sample"
      : input.acos > input.targetAcos * 1.2 && input.wasteCount > 0
        ? `Stop waste and cut ${input.topWasteCampaign || "the weakest campaign"} now`
        : input.ctr < 0.003
          ? "Rebuild targeting before adding more budget"
          : input.cvr < 0.08
            ? "Repair offer conversion before scaling traffic"
            : input.winnerCount > 0
              ? `Scale ${input.topWinnerCampaign || "the strongest campaign"} and keep the rest tight`
              : "Do not add budget until one winner exists";
  const decisionOwner =
    input.rowCount < 4
      ? "PPC lead"
      : input.acos > input.targetAcos * 1.2 && input.wasteCount > 0
        ? "PPC efficiency lead"
        : input.ctr < 0.003
          ? "Targeting lead"
          : input.cvr < 0.08
            ? "Offer / conversion lead"
            : input.winnerCount > 0
              ? "Growth lead"
              : "PPC lead";
  const doNotCrossLine =
    input.rowCount < 4
      ? "Do not approve broader budget changes from a thin campaign sample"
      : input.acos > input.targetAcos * 1.2 && input.wasteCount > 0
        ? "Do not scale winners while obvious waste is still leaking cash"
        : input.ctr < 0.003
          ? "Do not solve weak click-through with bid changes alone"
          : input.cvr < 0.08
            ? "Do not buy more traffic into a weak conversion surface"
            : input.winnerCount > 0
              ? "Do not spread budget across the whole account just because one campaign works"
              : "Do not add budget until one campaign proves it can live inside guardrails";
  const moveNow =
    input.rowCount < 4
      ? "Load more campaign rows before changing structure or budget materially"
      : input.acos > input.targetAcos * 1.2 && input.wasteCount > 0
        ? `Cut bids or pause waste in ${input.topWasteCampaign || "the weakest campaign"} first`
        : input.ctr < 0.003
          ? "Split intent and tighten targeting before making broader budget moves"
          : input.cvr < 0.08
            ? "Repair listing conversion and offer support before adding more spend"
            : input.winnerCount > 0
              ? `Increase budget on ${input.topWinnerCampaign || "the strongest campaign"} in controlled steps`
              : "Keep the account in cleanup mode until one campaign becomes a credible scale lane";
  const riskBrief =
    input.acos > input.targetAcos * 1.2
      ? `${round(input.acos * 100, 1)}% observed ACoS is outside the ${round(input.targetAcos * 100, 1)}% guardrail.`
      : input.ctr < 0.003
        ? `${round(input.ctr * 100, 2)}% CTR suggests targeting or creative mismatch.`
        : input.cvr < 0.08
          ? `${round(input.cvr * 100, 1)}% CVR is too weak to trust traffic scale alone.`
          : `${input.winnerCount} campaigns are already inside the guardrail and ${input.wasteCount} still need cleanup.`;

  return {
    headline:
      input.rowCount < 4
        ? "Do not widen spend from a thin campaign sample"
        : input.acos > input.targetAcos * 1.2 && input.wasteCount > 0
          ? `${commercialCall} - efficiency is outside the guardrail`
          : input.ctr < 0.003
            ? `${commercialCall} - click quality is too weak`
            : input.cvr < 0.08
              ? `${commercialCall} - conversion is the real blocker`
              : `${commercialCall} - one clean scale lane is visible`,
    summary:
      "This PPC read decides whether budget should stay frozen, which campaign deserves the first cut or scale action, and what must stay closed so the account learns from one clean move.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${moveNow}. ${decisionOwner} owns the first response lane.`,
      },
      {
        label: "Open lane",
        value: moveNow,
        detail: riskBrief,
      },
      {
        label: "Campaign rows",
        value: `${input.rowCount}`,
        detail: `${input.campaignTypeCount} campaign types detected`,
      },
      {
        label: "Spend / sales",
        value: `${formatCurrency(round(input.spend))} / ${formatCurrency(round(input.sales))}`,
        detail: `${input.orders} tracked orders`,
      },
      {
        label: "Observed ACoS",
        value: `${round(input.acos * 100, 1)}%`,
        detail: `${round(input.targetAcos * 100, 1)}% target`,
      },
      {
        label: "CTR / CVR",
        value: `${round(input.ctr * 100, 2)}% / ${round(input.cvr * 100, 1)}%`,
        detail: "Blended click-through and conversion rate",
      },
      {
        label: "Winners / waste",
        value: `${input.winnerCount} / ${input.wasteCount}`,
        detail: "Campaigns under guardrail vs campaigns needing cleanup",
      },
      {
        label: "Revenue per ad dollar",
        value: input.spend > 0 ? `${round(input.sales / input.spend, 2)}x` : "0x",
        detail: "Sales generated per advertising dollar",
      },
      {
        label: "Best scale target",
        value: input.topWinnerCampaign || "None yet",
        detail: "Strongest campaign currently inside the guardrail",
      },
      {
        label: "First cleanup target",
        value: input.topWasteCampaign || "None yet",
        detail: "Campaign most likely to need bid, targeting, or structure cleanup first",
      },
      {
        label: "First move",
        value: firstMove,
        detail: firstMoveReason,
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep the first PPC response narrow so one edit teaches the account instead of blurring the cause.",
      },
    ],
    recommendations: [
      input.acos > input.targetAcos
        ? "Do not add budget yet. Cut or isolate waste first before scaling bids."
        : "Efficiency is workable enough to scale winners rather than rebuilding from zero.",
      input.ctr < 0.003
        ? "Do not solve this with bid changes alone. Fix targeting quality before assuming CPC is the main issue."
        : "Targeting engagement is not the main issue; focus next on conversion or spend allocation.",
      input.cvr < 0.08
        ? "Do not keep pushing traffic into a weak offer. Listing or offer support needs to happen alongside campaign changes."
        : "Conversion support is workable enough that cleaner structure should translate into better efficiency.",
      input.winnerCount === 0
        ? "Do not broaden the account structure until at least one campaign proves it can live inside guardrails."
        : "Assign one owner to waste cleanup and one to controlled winner scaling so cost control does not get buried by growth work.",
      `Re-run only when this same lane changes state: ${moveNow.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "Campaign structure looks usable",
      warning: "Campaign structure needs tightening",
      critical: "Campaign structure is inefficient",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Scale the winners",
      caution: "Cut waste before scaling",
      stop: "Do not add budget yet",
    }, {
      go: "The account has enough efficient structure to scale winning campaigns with controlled budget increases.",
      caution: "There is a workable base here, but waste or structure leakage should be cleaned up before more budget goes in.",
      stop: "The current campaign mix is still too inefficient to justify more spend.",
    }),
    missingItems: [
      input.rowCount === 0 ? "Campaign performance rows" : "",
      input.winnerCount === 0 ? "At least one efficient campaign to scale" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${moveNow.toLowerCase()}.`,
      "Clean waste before pushing more budget into winners.",
      "Freeze one clean winner and one clean waste example before the next edit so the account learns from a controlled contrast.",
      "Re-run after bid, budget, or listing changes.",
    ],
    evidence: ppcCampaignEvidence,
  } satisfies ToolEvaluation;
}

export function evaluateAdvertisingStrategy(input: {
  rowCount: number;
  campaignTypeCount: number;
  monthlyBudget: number;
  heroAsinCount: number;
  topCampaignShare: number;
  weakCampaignCount: number;
  sponsoredProductsCount: number;
  sponsoredBrandsCount: number;
  sponsoredDisplayCount: number;
  brandRegistered: boolean;
  storefrontReady: boolean;
  newSellerCreditWindow: boolean;
}) {
  const alerts: string[] = [];
  let score = 100;

  if (input.rowCount < 4) {
    alerts.push("The advertising sample is thin, so the funnel read is only directional.");
    score -= 14;
  }
  if (input.campaignTypeCount < 2) {
    alerts.push("Campaign-type mix is narrow, which limits funnel coverage.");
    score -= 14;
  }
  if (input.topCampaignShare > 0.45) {
    alerts.push("Spend is too concentrated in a small part of the account.");
    score -= 12;
  }
  if (input.weakCampaignCount >= Math.max(2, Math.ceil(input.rowCount * 0.35))) {
    alerts.push("A large slice of the current account is underperforming.");
    score -= 14;
  }
  if (input.monthlyBudget < 1000) {
    alerts.push("Budget is tight, so channel spread should stay narrow and hero-led.");
    score -= 8;
  }
  if (input.heroAsinCount < 1) {
    alerts.push("No hero ASIN count is set, so budget focus is not anchored.");
    score -= 8;
  }
  if (!input.brandRegistered && input.sponsoredBrandsCount > 0) {
    alerts.push("Sponsored Brands is active without a strong brand foundation behind it.");
    score -= 10;
  }
  if (!input.storefrontReady && input.sponsoredBrandsCount > 0) {
    alerts.push("Branded traffic is running without a strong store destination.");
    score -= 8;
  }
  if (input.sponsoredDisplayCount > input.sponsoredProductsCount && input.monthlyBudget < 2000) {
    alerts.push("Display weight looks too heavy for the current budget and may be stealing focus from search-led demand capture.");
  }

  score = Math.max(0, score);
  const commercialCall =
    input.rowCount < 4
      ? "Do not widen the account from a thin sample"
      : input.campaignTypeCount < 2
        ? "Keep the mix narrow and hero-led for now"
        : input.topCampaignShare > 0.45
          ? "Reduce spend concentration before adding reach"
          : input.weakCampaignCount >= Math.max(2, Math.ceil(input.rowCount * 0.35))
            ? "Shrink the weak slice before opening more funnel"
            : input.monthlyBudget < 1000
              ? "Keep budget concentrated in search capture first"
              : !input.storefrontReady && input.sponsoredBrandsCount > 0
                ? "Repair the brand destination before scaling upper funnel"
                : "Scale this ad mix as a controlled funnel";
  const decisionOwner =
    input.rowCount < 4
      ? "Advertising lead"
      : input.campaignTypeCount < 2
        ? "Search growth lead"
        : input.topCampaignShare > 0.45
          ? "Budget allocation lead"
          : input.weakCampaignCount >= Math.max(2, Math.ceil(input.rowCount * 0.35))
            ? "Account repair lead"
            : input.monthlyBudget < 1000
              ? "Budget owner"
              : !input.storefrontReady && input.sponsoredBrandsCount > 0
                ? "Brand funnel lead"
                : "Advertising strategy lead";
  const moveNow =
    input.rowCount < 4
      ? "Load a broader account sample before changing channel roles or budget concentration materially"
      : input.campaignTypeCount < 2
        ? "Keep spend concentrated in Sponsored Products until the hero layer is stable"
        : input.topCampaignShare > 0.45
          ? "Reduce dependence on the top spend cluster before opening new funnel layers"
          : input.weakCampaignCount >= Math.max(2, Math.ceil(input.rowCount * 0.35))
            ? "Cut the weak campaign slice before adding another channel role"
            : input.monthlyBudget < 1000
              ? "Keep the account hero-led and resist spreading budget across too many ad types"
              : !input.storefrontReady && input.sponsoredBrandsCount > 0
                ? "Fix the store path before buying more branded traffic"
                : "Push one clearer role into each ad type and scale from that cleaner funnel";
  const doNotCrossLine =
    input.rowCount < 4
      ? "Do not widen the account from a thin sample"
      : input.campaignTypeCount < 2
        ? "Do not add funnel layers before search capture is stable"
        : input.topCampaignShare > 0.45
          ? "Do not let one spend cluster define the whole account"
          : input.weakCampaignCount >= Math.max(2, Math.ceil(input.rowCount * 0.35))
            ? "Do not expand reach while a large weak slice is still leaking budget"
            : input.monthlyBudget < 1000
              ? "Do not spread a tight budget across too many ad types"
              : !input.storefrontReady && input.sponsoredBrandsCount > 0
                ? "Do not scale branded clicks into a weak store path"
                : "Do not let every channel try to do every job";
  const strategyRiskBrief =
    input.topCampaignShare > 0.45
      ? `${Math.round(input.topCampaignShare * 100)}% of spend is concentrated in the top campaign cluster.`
      : input.weakCampaignCount >= Math.max(2, Math.ceil(input.rowCount * 0.35))
        ? `${input.weakCampaignCount} campaigns are underperforming enough to distort the budget read.`
        : input.monthlyBudget < 1000
          ? `${formatCurrency(round(input.monthlyBudget))} monthly budget is too tight for a diffuse funnel.`
          : `${input.campaignTypeCount} channel layers are currently active with ${input.heroAsinCount} hero ASINs in focus.`;
  const evidence = getAdvertisingPolicyEvidence({
    brandRegistered: input.brandRegistered,
    storefrontReady: input.storefrontReady,
    campaignTypeCount: input.campaignTypeCount,
    sponsoredProductsCount: input.sponsoredProductsCount,
    sponsoredBrandsCount: input.sponsoredBrandsCount,
    sponsoredDisplayCount: input.sponsoredDisplayCount,
    newSellerCreditWindow: input.newSellerCreditWindow,
  });

  return {
    headline:
      input.rowCount < 4
        ? "Do not widen the account from a thin sample"
        : input.campaignTypeCount < 2
          ? "Keep the ad mix narrow until search capture is stable"
          : input.topCampaignShare > 0.45
            ? `${commercialCall} - spend concentration is too high`
            : input.weakCampaignCount >= Math.max(2, Math.ceil(input.rowCount * 0.35))
              ? `${commercialCall} - too much of the account is still weak`
              : `${commercialCall} - the funnel is structured enough to act`,
    summary:
      "This ad-strategy read decides where budget should concentrate, which channel role deserves the next dollar, and what must stay closed so the account does not widen faster than it learns.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${moveNow}. ${decisionOwner} owns the first strategy lane.`,
      },
      {
        label: "Open lane",
        value: moveNow,
        detail: strategyRiskBrief,
      },
      {
        label: "Campaign rows",
        value: `${input.rowCount}`,
        detail: `${input.weakCampaignCount} weak campaigns detected`,
      },
      {
        label: "Channel mix",
        value: `${input.sponsoredProductsCount}/${input.sponsoredBrandsCount}/${input.sponsoredDisplayCount}`,
        detail: "SP / SB / SD campaign counts",
      },
      {
        label: "Budget",
        value: formatCurrency(round(input.monthlyBudget)),
        detail: `${input.heroAsinCount} hero ASINs in focus`,
      },
      {
        label: "Spend concentration",
        value: `${Math.round(input.topCampaignShare * 100)}%`,
        detail: "Share held by the top-spend campaigns",
      },
      {
        label: "Funnel breadth",
        value: `${input.campaignTypeCount} layers`,
        detail: input.campaignTypeCount >= 3 ? "Full-funnel mix present" : "Funnel mix still narrow",
      },
      {
        label: "Brand stack",
        value: input.brandRegistered ? "Ready" : "Weak",
        detail: input.storefrontReady ? "Store route is in place" : "No strong branded destination",
      },
      {
        label: "Channel focus",
        value: `${input.sponsoredProductsCount + input.sponsoredBrandsCount + input.sponsoredDisplayCount}`,
        detail: input.heroAsinCount > 0 ? `${round(input.monthlyBudget / input.heroAsinCount, 0)} budget per hero ASIN` : "No hero ASIN focus",
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep channel roles narrow so the next budget shift teaches the account instead of smearing across the whole funnel.",
      },
    ],
    recommendations: [
      input.campaignTypeCount < 2
        ? "Do not widen the funnel yet. Keep the account hero-led until Sponsored Products is under control and budget focus stops leaking."
        : "The channel mix is broad enough to manage as a funnel, so the next job is role clarity rather than adding more campaign types.",
      input.topCampaignShare > 0.45
        ? "Reduce spend concentration before scaling. One campaign is carrying too much account risk and can distort the whole budget read."
        : "Spend concentration is manageable enough for controlled scaling, so budget can expand without depending on one fragile winner.",
      input.monthlyBudget < 1000
        ? "With this budget, stay narrow. Do not spread spend across too many ad types before the hero ASIN and search capture layer are stable."
        : "Budget is large enough to support clearer role separation across ad types, so the constraint shifts from money to execution discipline.",
      !input.storefrontReady && input.sponsoredBrandsCount > 0
        ? "Do not scale branded clicks into a weak store path. Fix the destination before buying more upper-funnel traffic."
        : "Branded traffic path is workable enough for structured scaling, so Sponsored Brands can play a deliberate role rather than a vanity role.",
      input.weakCampaignCount >= Math.max(2, Math.ceil(input.rowCount * 0.35))
        ? "Do not add another campaign layer while a large slice of the account is still weak. Shrink failure before expanding reach."
        : "Assign one owner to channel roles and one to budget concentration so account growth does not outrun structure clarity.",
      `Re-run only when this same lane changes state: ${moveNow.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "Advertising mix looks usable",
      warning: "Advertising mix needs focus",
      critical: "Advertising mix is unstable",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Scale this ad mix",
      caution: "Refocus the funnel first",
      stop: "Do not widen the account yet",
    }, {
      go: "The channel mix is clear enough to scale as a deliberate funnel rather than a pile of overlapping campaigns.",
      caution: "The account has a usable base, but focus and role clarity should tighten before more reach is added.",
      stop: "The current advertising mix is too unstable or diffuse to justify widening the account.",
    }),
    missingItems: [
      input.heroAsinCount < 1 ? "Hero ASIN focus" : "",
      input.campaignTypeCount < 2 ? "Broader but controlled funnel coverage" : "",
      !input.storefrontReady && input.sponsoredBrandsCount > 0 ? "Store destination for branded traffic" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${moveNow.toLowerCase()}.`,
      "Anchor spend around hero ASINs first so every later channel decision has a commercial center of gravity.",
      "Give each ad type one job instead of overlapping everything, or the account will hide which layer is actually working.",
      "Freeze one primary search-capture lane and one upper-funnel lane before the next budget change so you can measure layer performance cleanly.",
      "Re-run after channel mix, budget concentration, or storefront readiness changes enough to alter the scaling decision.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

export function evaluateRepricingStrategy(input: {
  ownPrice: number;
  lowestCompetitorPrice: number;
  averageCompetitorPrice: number;
  competitorCount: number;
  netMarginRate: number;
  minimumMarginRate: number;
  floorPrice: number;
  ceilingPrice: number;
  goal: string;
  fulfillmentMode: string;
}) {
  const priceGapToLow =
    input.lowestCompetitorPrice > 0 ? input.ownPrice - input.lowestCompetitorPrice : 0;
  const alerts: string[] = [];
  let score = 100;

  if (input.competitorCount === 0) {
    alerts.push("No competitor prices are loaded, so repricing logic has no real market reference.");
    score -= 20;
  }
  if (input.netMarginRate < input.minimumMarginRate) {
    alerts.push("Current net margin already sits below the minimum guardrail.");
    score -= 22;
  }
  if (input.floorPrice >= input.ownPrice) {
    alerts.push("The computed price floor is too close to or above the current price.");
    score -= 12;
  }
  if (priceGapToLow > 5 && input.goal !== "premium-defense") {
    alerts.push("Own price is materially above the lowest visible competitor for the current goal.");
    score -= 12;
  }
  if (input.fulfillmentMode === "FBM" && input.goal === "buy-box") {
    alerts.push("FBM can make Buy Box defense harder when FBA competitors are close in price.");
    score -= 10;
  }
  if (input.ceilingPrice < input.ownPrice && input.goal !== "clearance") {
    alerts.push("The suggested ceiling is already below the current price, which means the market is tighter than the current offer position.");
  }

  score = Math.max(0, score);
  const commercialCall =
    input.competitorCount === 0
      ? "Do not automate repricing without a real market set"
      : input.netMarginRate < input.minimumMarginRate
        ? "Raise price or repair economics before reacting to the market"
        : input.floorPrice >= input.ownPrice
          ? "Reset the floor before any automated response goes live"
          : priceGapToLow > 5 && input.goal !== "premium-defense"
            ? "Close the market gap without crossing the margin floor"
            : input.fulfillmentMode === "FBM" && input.goal === "buy-box"
              ? "Keep Buy Box repricing in guarded mode"
              : "Ship the repricing guardrails";
  const decisionOwner =
    input.competitorCount === 0
      ? "Marketplace lead"
      : input.netMarginRate < input.minimumMarginRate
        ? "Unit economics lead"
        : input.floorPrice >= input.ownPrice
          ? "Pricing operations lead"
          : priceGapToLow > 5 && input.goal !== "premium-defense"
            ? "Pricing lead"
            : input.fulfillmentMode === "FBM" && input.goal === "buy-box"
              ? "Buy Box lead"
              : "Repricing owner";
  const moveNow =
    input.competitorCount === 0
      ? "Load a real competitor market pack before turning this into a live pricing rule"
      : input.netMarginRate < input.minimumMarginRate
        ? "Raise price or repair unit economics before following competitor moves"
        : input.floorPrice >= input.ownPrice
          ? "Recompute the floor so automation cannot cut below the current safe price"
          : priceGapToLow > 5 && input.goal !== "premium-defense"
            ? "Close the largest visible market gap in controlled steps without crossing the floor"
            : input.fulfillmentMode === "FBM" && input.goal === "buy-box"
              ? "Keep repricing manual or guarded until fulfillment disadvantage is accounted for"
              : "Publish the floor and ceiling as live repricing guardrails";
  const doNotCrossLine =
    input.competitorCount === 0
      ? "Do not automate repricing without market context"
      : input.netMarginRate < input.minimumMarginRate
        ? "Do not chase the market below the minimum margin guardrail"
        : input.floorPrice >= input.ownPrice
          ? "Do not let the floor sit at or above the current price"
          : priceGapToLow > 5 && input.goal !== "premium-defense"
            ? "Do not defend a large premium by habit"
            : input.fulfillmentMode === "FBM" && input.goal === "buy-box"
              ? "Do not trust aggressive Buy Box repricing under FBM"
              : "Do not let repricing rules outrun the published floor and ceiling";
  const repricingRiskBrief =
    input.netMarginRate < input.minimumMarginRate
      ? `${round(input.netMarginRate, 1)}% current margin is already below the ${round(input.minimumMarginRate, 1)}% floor.`
      : input.floorPrice >= input.ownPrice
        ? `${formatCurrency(round(input.floorPrice))} floor is already at or above the current price.`
        : priceGapToLow > 5 && input.goal !== "premium-defense"
          ? `${formatCurrency(round(priceGapToLow))} gap sits above the visible lowest competitor.`
          : `${formatCurrency(round(input.floorPrice))} to ${formatCurrency(round(input.ceilingPrice))} is the current safe response band.`;

  return {
    headline:
      input.competitorCount === 0
        ? "Do not automate repricing without a real market set"
        : input.netMarginRate < input.minimumMarginRate
          ? `${commercialCall} - margin floor is already broken`
          : input.floorPrice >= input.ownPrice
            ? `${commercialCall} - the guardrail is unsafe`
            : priceGapToLow > 5 && input.goal !== "premium-defense"
              ? `${commercialCall} - market gap is too wide to ignore`
              : `${commercialCall} - the repricing band is usable`,
    summary:
      "This repricing read decides whether price should move now, where the hard floor and safe ceiling sit, and what must stay closed so the next market response does not quietly destroy margin.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${moveNow}. ${decisionOwner} owns the first pricing lane.`,
      },
      {
        label: "Open lane",
        value: moveNow,
        detail: repricingRiskBrief,
      },
      {
        label: "Current price",
        value: formatCurrency(round(input.ownPrice)),
        detail: `${input.competitorCount} competitors in the current band`,
      },
      {
        label: "Low / avg competitor",
        value: `${formatCurrency(round(input.lowestCompetitorPrice))} / ${formatCurrency(round(input.averageCompetitorPrice))}`,
        detail: `Gap to low competitor ${formatCurrency(round(priceGapToLow))}`,
      },
      {
        label: "Net margin",
        value: `${round(input.netMarginRate, 1)}%`,
        detail: `${round(input.minimumMarginRate, 1)}% minimum guardrail`,
      },
      {
        label: "Price band",
        value: `${formatCurrency(round(input.floorPrice))} - ${formatCurrency(round(input.ceilingPrice))}`,
        detail: `${input.goal} goal under ${input.fulfillmentMode}`,
      },
      {
        label: "Strategy score",
        value: `${score}%`,
        detail: "Higher is safer to automate into rules",
      },
      {
        label: "Undercut risk",
        value: priceGapToLow > 0 ? formatCurrency(round(priceGapToLow)) : formatCurrency(0),
        detail: "Distance above the visible lowest competitor",
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep the first repricing response narrow so one move teaches whether the floor, goal, and market set still agree.",
      },
    ],
    recommendations: [
      input.netMarginRate < input.minimumMarginRate
        ? "Do not automate price chasing yet. Raise price or lower unit-economics leakage before the market pushes you below the guardrail."
        : "Margin guardrail is workable enough to define a clean floor rule.",
      priceGapToLow > 5 && input.goal !== "premium-defense"
        ? "Do not defend a large price premium by habit. Close the biggest visible gap first unless the listing clearly wins on proof or brand strength."
        : "Current price gap can be defended if conversion proof supports it.",
      input.fulfillmentMode === "FBM" && input.goal === "buy-box"
        ? "Do not trust aggressive Buy Box automation under FBM without manual review. Fulfillment disadvantage can make price cuts look smarter than they are."
        : "Treat the floor as a hard stop and the ceiling as the upper test band, not just reference notes.",
      input.competitorCount === 0
        ? "Do not ship repricing rules from this input alone. Load a real competitor set before automating responses."
        : "Assign one owner to guardrails and one to market responses so floor discipline is not weakened by reactive repricing.",
      `Re-run only when this same lane changes state: ${moveNow.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "Repricing band looks usable",
      warning: "Repricing band needs tightening",
      critical: "Repricing band is unsafe",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Ship the pricing guardrails",
      caution: "Tighten the band first",
      stop: "Do not automate repricing yet",
    }, {
      go: "The floor and ceiling are stable enough to use as live pricing guardrails with minimal manual override.",
      caution: "The pricing logic is directionally usable, but margin or market-reference gaps should tighten before automation.",
      stop: "The current repricing setup is too unsafe to automate without risking margin or bad reactions.",
    }),
    missingItems: [
      input.competitorCount === 0 ? "Competitor price references" : "",
      input.netMarginRate < input.minimumMarginRate ? "Margin-safe price floor" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${moveNow.toLowerCase()}.`,
      "Lock the floor before changing ceilings or aggression.",
      "Define one manual-review trigger for margin conflict and one for Buy Box conflict before enabling faster price moves.",
      "Re-run after price, fee, or competitor shifts.",
      "Keep manual review on whenever margin pressure and Buy Box pressure conflict.",
    ],
    evidence: repricingStrategyEvidence,
  } satisfies ToolEvaluation;
}

export function evaluateBuyBox(input: {
  ownPrice: number;
  averageCompetitorPrice: number;
  sellerRating: number;
  competitorRating: number;
  fulfillmentMode: string;
  shippingSlaDays: number;
  stockReady: boolean;
  returnRate: number;
  priceGap: number;
}) {
  const alerts: string[] = [];
  let score = 100;

  if (input.fulfillmentMode === "FBM") {
    alerts.push("FBM typically faces more Buy Box pressure than FBA when price is close.");
    score -= 12;
  }
  if (input.priceGap > 3) {
    alerts.push("Own price is meaningfully above the competitor reference price.");
    score -= 14;
  }
  if (input.sellerRating < input.competitorRating) {
    alerts.push("Seller rating lags the competitor reference set.");
    score -= 10;
  }
  if (input.shippingSlaDays > 2) {
    alerts.push("Slower delivery promise can reduce Buy Box competitiveness.");
    score -= 10;
  }
  if (!input.stockReady) {
    alerts.push("Stock readiness is weak, which can break Buy Box retention even if price is competitive.");
    score -= 14;
  }
  if (input.returnRate >= 0.08) {
    alerts.push("High return rate can indirectly weaken account health and Buy Box competitiveness.");
    score -= 8;
  }
  if (input.priceGap < 0) {
    alerts.push("Pricing below the competitor reference set may help defensibility, but can create unnecessary margin sacrifice if the offer already wins elsewhere.");
  }

  score = Math.max(0, score);
  const commercialCall =
    !input.stockReady
      ? "Fix stock continuity before trying to defend the Buy Box"
      : input.priceGap > 3
        ? "Close the price gap before treating this like a visibility problem"
        : input.fulfillmentMode === "FBM" || input.shippingSlaDays > 2
          ? "Repair fulfillment speed before leaning harder on price"
          : input.sellerRating < input.competitorRating || input.returnRate >= 0.08
            ? "Repair offer trust before pushing harder for Buy Box share"
            : "Defend the current Buy Box posture without cutting price first";
  const decisionOwner =
    !input.stockReady
      ? "Inventory lead"
      : input.priceGap > 3
        ? "Pricing / marketplace lead"
        : input.fulfillmentMode === "FBM" || input.shippingSlaDays > 2
          ? "Fulfillment lead"
          : input.sellerRating < input.competitorRating || input.returnRate >= 0.08
            ? "Account health lead"
            : "Buy Box owner";
  const moveNow =
    !input.stockReady
      ? "Restore stable in-stock coverage before changing price, traffic, or promo pressure"
      : input.priceGap > 3
        ? "Close the visible market gap first and keep fulfillment and traffic changes frozen"
        : input.fulfillmentMode === "FBM" || input.shippingSlaDays > 2
          ? "Tighten delivery speed or fulfillment mode before using more price pressure"
          : input.sellerRating < input.competitorRating || input.returnRate >= 0.08
            ? "Clean up rating and returns pressure before trying to buy back the Buy Box"
            : "Hold price discipline and defend the current non-price edge";
  const doNotCrossLine =
    !input.stockReady
      ? "Do not push traffic or discounts into unstable stock coverage"
      : input.priceGap > 3
        ? "Do not change price, fulfillment, and PPC at the same time"
        : input.fulfillmentMode === "FBM" || input.shippingSlaDays > 2
          ? "Do not solve a fulfillment disadvantage with deeper price cuts alone"
          : input.sellerRating < input.competitorRating || input.returnRate >= 0.08
            ? "Do not use price cuts to hide trust and account-quality weakness"
            : "Do not cut price first when the offer is already commercially defendable";
  const buyBoxRiskBrief =
    !input.stockReady
      ? "Stock continuity is already exposed, so Buy Box retention can break even if price is workable."
      : input.priceGap > 3
        ? `${formatCurrency(round(input.priceGap))} price gap sits above the visible competitor reference.`
        : input.fulfillmentMode === "FBM" || input.shippingSlaDays > 2
          ? `${input.fulfillmentMode} with a ${input.shippingSlaDays}-day promise leaves the offer exposed on speed.`
          : input.sellerRating < input.competitorRating || input.returnRate >= 0.08
            ? `${round(input.sellerRating, 2)} seller rating and ${round(input.returnRate * 100, 1)}% returns weaken trust relative to the market.`
            : "Price, speed, and trust are aligned well enough to defend the current posture.";

  return {
    headline:
      !input.stockReady
        ? `${commercialCall} - availability is the first broken lever`
        : input.priceGap > 3
          ? `${commercialCall} - price is the first losing lever`
          : input.fulfillmentMode === "FBM" || input.shippingSlaDays > 2
            ? `${commercialCall} - speed is the first losing lever`
            : input.sellerRating < input.competitorRating || input.returnRate >= 0.08
              ? `${commercialCall} - trust is the first losing lever`
              : `${commercialCall} - price discipline can stay intact`,
    summary:
      "This Buy Box read names the first losing lever, assigns the owner, and closes the moves that would muddy the result before you know whether price, speed, stock, or trust is actually costing you share.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${moveNow}. ${decisionOwner} owns the first recovery lane.`,
      },
      {
        label: "Open lane",
        value: moveNow,
        detail: buyBoxRiskBrief,
      },
      {
        label: "Price gap",
        value: formatCurrency(round(input.priceGap)),
        detail: `${formatCurrency(round(input.ownPrice))} own vs ${formatCurrency(round(input.averageCompetitorPrice))} competitor average`,
      },
      {
        label: "Fulfillment",
        value: input.fulfillmentMode,
        detail: `${input.shippingSlaDays} day shipping promise`,
      },
      {
        label: "Seller rating",
        value: `${round(input.sellerRating, 2)}`,
        detail: `${round(input.competitorRating, 2)} competitor reference`,
      },
      {
        label: "Stock readiness",
        value: input.stockReady ? "Ready" : "At risk",
        detail: input.returnRate > 0 ? `${round(input.returnRate * 100, 1)}% return rate` : "Return rate not loaded",
      },
      {
        label: "Defense score",
        value: `${score}%`,
        detail: "Higher is more workable for retention",
      },
      {
        label: "Offer posture",
        value: input.priceGap <= 0 ? "Price-led" : "Needs support",
        detail: input.stockReady ? "Stock continuity in place" : "Stock continuity weak",
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep the first Buy Box response narrow so one fix teaches which lever is really causing the loss.",
      },
    ],
    recommendations: [
      !input.stockReady
        ? "Do not scale traffic or enter discount periods until stock continuity is protected."
        : "Stock continuity is workable enough to keep the first recovery lane focused on competitiveness.",
      input.priceGap > 3
        ? "Do not treat this as a vague Buy Box issue. Close the price gap first if the offer does not clearly win on speed or trust."
        : "Price is within a workable band, so avoid cutting margin unless another lever is clearly broken.",
      input.fulfillmentMode === "FBM" || input.shippingSlaDays > 2
        ? "Do not overcut on price under a slower fulfillment posture. Improve speed first so price moves are measured against a fairer offer."
        : "Fulfillment speed is not the first blocker right now.",
      input.sellerRating < input.competitorRating || input.returnRate >= 0.08
        ? "Keep trust repair separate from pricing so account-quality weakness is not hidden by discounting."
        : "Keep the non-primary levers frozen while you test the first Buy Box fix.",
      `Re-run only when this same lane changes state: ${moveNow.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "Buy Box posture looks usable",
      warning: "Buy Box posture needs work",
      critical: "Buy Box posture is weak",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Defend the Buy Box",
      caution: "Fix the main losing lever first",
      stop: "Do not push traffic yet",
    }, {
      go: "The offer is defensible enough that you can focus on maintaining the Buy Box rather than rebuilding the offer.",
      caution: "The Buy Box path is still recoverable, but one main losing lever should be fixed before more spend or promo pressure goes in.",
      stop: "The current offer posture is too weak to trust for traffic or promo pushes until the core gap is fixed.",
    }),
    missingItems: [
      !input.stockReady ? "Stable stock coverage" : "",
      input.shippingSlaDays > 2 ? "Faster shipping promise" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${moveNow.toLowerCase()}.`,
      "Freeze the non-primary levers while testing the first Buy Box fix so you can see what actually changed retention.",
      "Re-check after price, stock, SLA, or trust changes.",
      "Keep Buy Box defense tied to margin guardrails instead of price-only reactions.",
    ],
    evidence: buyBoxEvidence,
  } satisfies ToolEvaluation;
}

export function evaluateDealFinder(input: {
  price: number;
  netMarginRate: number;
  inventoryDays: number;
  promoWindowDays: number;
  discountRate: number;
  goal: string;
  recommendedDeal: string;
  urgencyScore: number;
  featuredOfferLikely: boolean;
  dealQuantityReady: boolean;
  referencePriceReady: boolean;
  stackRisk: boolean;
}) {
  const alerts: string[] = [];
  let score = 100;
  let firstDealAction = "Lock promo type and window together.";
  let firstDealReason = "Promo format works best when it is chosen together with the inventory and timing constraint.";

  if (input.netMarginRate < 12) {
    alerts.push("Net margin is thin, so aggressive promos will likely destroy contribution.");
    score -= 18;
  }
  if (input.inventoryDays < input.promoWindowDays) {
    alerts.push("Inventory cover is shorter than the intended promo window.");
    score -= 16;
  }
  if (input.discountRate > 0.15) {
    alerts.push("Discount depth is heavy for the current economics.");
    score -= 12;
  }
  if (!input.featuredOfferLikely) {
    alerts.push("A deal may not display well if the offer is unlikely to hold the Featured Offer.");
    score -= 16;
  }
  if (!input.dealQuantityReady) {
    alerts.push("Inventory allocated to the deal may be too weak for Amazon's quantity expectations.");
    score -= 14;
  }
  if (!input.referencePriceReady) {
    alerts.push("Recent pricing history may not support the intended deal price cleanly.");
    score -= 10;
  }
  if (input.stackRisk) {
    alerts.push("Other stacked promotions can distort the real discount seen by customers.");
    score -= 8;
  }
  if (input.urgencyScore >= 75 && input.recommendedDeal === "hold") {
    alerts.push("Commercial urgency is high, but current economics still do not support a safe deal format.");
  }
  if (input.goal === "clearance" && input.inventoryDays > 90) {
    score += 4;
  }

  if (input.recommendedDeal === "hold") {
    firstDealAction = "Hold promo activity until margin or stock conditions improve.";
    firstDealReason = "The current economics do not support a safe deal format yet.";
  } else if (!input.featuredOfferLikely) {
    firstDealAction = "Fix Featured Offer competitiveness before relying on deal visibility.";
    firstDealReason = "A deal that does not surface cleanly will underperform even if the discount is correct.";
  } else if (!input.dealQuantityReady || input.inventoryDays < input.promoWindowDays) {
    firstDealAction = "Shorten the promo window or secure more deal inventory first.";
    firstDealReason = "The current stock position is too tight for the planned promotional window.";
  } else if (!input.referencePriceReady) {
    firstDealAction = "Clean up recent pricing history before launching the deal.";
    firstDealReason = "Weak reference-price support can block or blunt the promo display.";
  } else if (input.stackRisk) {
    firstDealAction = "Remove stacked promo conflicts before launch.";
    firstDealReason = "Stacked promotions can distort the real discount and damage contribution unexpectedly.";
  }

  score = Math.max(0, Math.min(100, score));
  const evidence = getDealFinderPolicyEvidence({
    featuredOfferLikely: input.featuredOfferLikely,
    dealQuantityReady: input.dealQuantityReady,
    referencePriceReady: input.referencePriceReady,
    stackRisk: input.stackRisk,
    goal: input.goal,
  });
  const commercialCall =
    input.recommendedDeal === "hold" || input.netMarginRate < 12
      ? "Do not launch a deal until the unit economics recover"
      : !input.featuredOfferLikely
        ? "Repair Featured Offer competitiveness before paying for promo visibility"
        : !input.dealQuantityReady || input.inventoryDays < input.promoWindowDays
          ? "Fix inventory coverage before opening the deal window"
          : !input.referencePriceReady
            ? "Repair price-history proof before launching the deal"
            : input.stackRisk
              ? "Remove promo conflicts before this deal goes live"
              : `Run ${recommendedDealLabel(input.recommendedDeal).toLowerCase()} as the single promo lane`;
  const decisionOwner =
    input.recommendedDeal === "hold" || input.netMarginRate < 12
      ? "Unit economics lead"
      : !input.featuredOfferLikely
        ? "Offer competitiveness lead"
        : !input.dealQuantityReady || input.inventoryDays < input.promoWindowDays
          ? "Inventory lead"
          : !input.referencePriceReady
            ? "Pricing operations lead"
            : input.stackRisk
              ? "Promo operations lead"
              : "Promotions lead";
  const moveNow =
    input.recommendedDeal === "hold" || input.netMarginRate < 12
      ? "Raise margin safety or change inventory pressure before putting any deal live"
      : !input.featuredOfferLikely
        ? "Fix Featured Offer competitiveness first and keep discount planning closed"
        : !input.dealQuantityReady || input.inventoryDays < input.promoWindowDays
          ? "Shorten the deal window or secure more promo inventory before launch"
          : !input.referencePriceReady
            ? "Clean up recent pricing history before submitting the deal"
            : input.stackRisk
              ? "Remove overlapping promo conflicts and reopen one clean launch lane"
              : `Launch ${recommendedDealLabel(input.recommendedDeal).toLowerCase()} with the current window and keep other promo types closed`;
  const doNotCrossLine =
    input.recommendedDeal === "hold" || input.netMarginRate < 12
      ? "Do not force a deal into a cycle that cannot support it economically"
      : !input.featuredOfferLikely
        ? "Do not pay for deal depth before the offer can actually surface"
        : !input.dealQuantityReady || input.inventoryDays < input.promoWindowDays
          ? "Do not let the promo window outrun committed deal inventory"
          : !input.referencePriceReady
            ? "Do not submit a deal while pricing history is still weak"
            : input.stackRisk
              ? "Do not stack multiple promo mechanics on the same retail moment"
              : "Do not keep multiple promo formats open at once just to stay active";
  const dealRiskBrief =
    input.recommendedDeal === "hold" || input.netMarginRate < 12
      ? `${round(input.netMarginRate, 1)}% margin is too thin for a safe deal cycle.`
      : !input.featuredOfferLikely
        ? "Visibility is weak because the offer is not likely to hold the key retail placement."
        : !input.dealQuantityReady || input.inventoryDays < input.promoWindowDays
          ? `${Math.round(input.inventoryDays)} days of cover is too tight for a ${input.promoWindowDays}-day promo window.`
          : !input.referencePriceReady
            ? "Recent price history is not yet strong enough to support clean deal presentation."
            : input.stackRisk
              ? "Overlapping promotions will blur the real discount and hide contribution loss."
              : `${recommendedDealLabel(input.recommendedDeal)} fits the current economics, visibility, and stock window.`;

  return {
    headline:
      input.recommendedDeal === "hold" || input.netMarginRate < 12
        ? `${commercialCall} - the economics are not safe yet`
        : !input.featuredOfferLikely
          ? `${commercialCall} - visibility is the first broken gate`
          : !input.dealQuantityReady || input.inventoryDays < input.promoWindowDays
            ? `${commercialCall} - stock cover is the first broken gate`
            : !input.referencePriceReady
              ? `${commercialCall} - pricing proof is the first broken gate`
              : input.stackRisk
                ? `${commercialCall} - promo overlap must close first`
                : `${commercialCall} - the deal lane is commercially workable`,
    summary:
      "This deal read names whether a promotion should run now, which gate is broken first, who owns the fix, and which other promo moves must stay closed until one clean launch lane is ready.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${moveNow}. ${decisionOwner} owns the first launch lane.`,
      },
      {
        label: "Open lane",
        value: moveNow,
        detail: dealRiskBrief,
      },
      {
        label: "Sell price",
        value: formatCurrency(round(input.price)),
        detail: `${round(input.netMarginRate, 1)}% net margin baseline`,
      },
      {
        label: "Inventory cover",
        value: `${Math.round(input.inventoryDays)} days`,
        detail: `${input.promoWindowDays} day promo window`,
      },
      {
        label: "Discount depth",
        value: `${round(input.discountRate * 100, 1)}%`,
        detail: `${input.goal} goal`,
      },
      {
        label: "Recommended format",
        value: recommendedDealLabel(input.recommendedDeal),
        detail: "Coupon / limited-time deal / Prime-exclusive / hold",
      },
      {
        label: "Deal gates",
        value: input.featuredOfferLikely ? "Featured Offer likely" : "Featured Offer weak",
        detail: input.dealQuantityReady ? "Deal quantity ready" : "Deal quantity gap",
      },
      {
        label: "Urgency",
        value: `${input.urgencyScore}%`,
        detail: "Higher means stronger need to act this cycle",
      },
      {
        label: "Window tension",
        value: `${Math.max(0, Math.round(input.inventoryDays - input.promoWindowDays))} days`,
        detail: "Inventory cover remaining after the planned promo window",
      },
      {
        label: "First deal action",
        value: firstDealAction,
        detail: firstDealReason,
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep only one promo lane open so the next retail cycle teaches whether economics, stock, or visibility was the real blocker.",
      },
    ],
    recommendations: [
      input.recommendedDeal === "hold" || input.netMarginRate < 12
        ? "Do not force a promo into this cycle. Recover margin or inventory safety first."
        : `Keep ${recommendedDealLabel(input.recommendedDeal).toLowerCase()} as the only open promo format instead of drifting between discount mechanics.`,
      input.inventoryDays < input.promoWindowDays
        ? "Shorten the promo window or secure more cover before launch. Do not let the deal outgrow the stock position."
        : "Inventory cover is workable enough that stock is not the first blocker right now.",
      input.stackRisk
        ? "Remove stacked promo conflicts before launch, because overlapping incentives can hide the real discount cost."
        : "Keep promo type and discount depth tied together so the economics stay readable.",
      !input.featuredOfferLikely
        ? "Do not count on promo visibility until Featured Offer competitiveness is fixed."
        : "Keep visibility and economics under one launch owner so a workable deal does not fail on execution drift.",
      `Re-run only when this same lane changes state: ${moveNow.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "Promo fit looks usable",
      warning: "Promo fit needs work",
      critical: "Promo fit is unsafe",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Run this promo format",
      caution: "Tighten promo economics first",
      stop: "Do not launch this deal yet",
    }, {
      go: "The selected promo format is commercially strong enough to run in the current cycle.",
      caution: "The promo could work, but inventory, margin, or visibility gates should tighten before launch.",
      stop: "The current promo setup is too weak economically or operationally to launch safely.",
    }),
    missingItems: [
      input.netMarginRate < 12 ? "Safer margin baseline" : "",
      input.inventoryDays < input.promoWindowDays ? "Enough inventory cover" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${moveNow.toLowerCase()}.`,
      "Freeze promo type, inventory allocation, and visibility checks together before launch so the deal does not drift mid-cycle.",
      "Re-run whenever stock cover, Featured Offer strength, or margin shifts enough to change the promo format decision.",
      "Check the final promo against pricing history and ad plans before launch so the deal is visible and commercially survivable.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

export function evaluateCouponStrategy(input: {
  price: number;
  netMarginRate: number;
  discountRate: number;
  inventoryDays: number;
  objective: string;
  stackRisk: boolean;
  couponAfterMargin: number;
  professionalSeller: boolean;
  feedbackRating: number;
  offerBuyable: boolean;
  featuredOfferLikely: boolean;
  audienceType: string;
  brandRepresentative: boolean;
}) {
  const alerts: string[] = [];
  let score = 100;
  let firstCouponStep = "Protect post-coupon margin before increasing depth.";
  let firstCouponReason = "Coupons only help when unit economics remain healthy after the discount is applied.";

  if (input.couponAfterMargin < 8) {
    alerts.push("Margin after couponing is too thin for safe repetition.");
    score -= 22;
  }
  if (input.discountRate > 0.12) {
    alerts.push("Coupon depth is already heavy for a standard retail cycle.");
    score -= 12;
  }
  if (input.inventoryDays < 21 && input.objective !== "clearance") {
    alerts.push("Inventory cover is tight, so coupons may accelerate stock risk.");
    score -= 12;
  }
  if (input.stackRisk) {
    alerts.push("Other promos or ad pushes may stack badly with this coupon plan.");
    score -= 10;
  }
  if (!input.professionalSeller) {
    alerts.push("Coupons require a Professional seller account.");
    score -= 18;
  }
  if (input.feedbackRating > 0 && input.feedbackRating < 3.5) {
    alerts.push("Seller feedback rating is below Amazon's coupon eligibility floor.");
    score -= 18;
  }
  if (input.discountRate < 0.05) {
    alerts.push("Coupon depth is below Amazon's minimum percentage threshold.");
    score -= 16;
  }
  if (!input.offerBuyable) {
    alerts.push("Coupons may not render if the offer is not buyable.");
    score -= 14;
  }
  if (!input.featuredOfferLikely) {
    alerts.push("Coupon visibility is weaker when the offer is unlikely to hold the Featured Offer.");
    score -= 10;
  }
  if (input.audienceType === "brand" && !input.brandRepresentative) {
    alerts.push("Brand-targeted coupon audiences require Brand Representative access.");
    score -= 16;
  }
  if (input.objective === "rank" && input.discountRate < 0.08) {
    alerts.push("Rank-push intent may be underpowered at the current coupon depth.");
  }

  if (input.couponAfterMargin < 8) {
    firstCouponStep = "Raise post-coupon margin before running the plan again.";
    firstCouponReason = "The current discount leaves too little contribution for safe repetition.";
  } else if (!input.professionalSeller || (input.audienceType === "brand" && !input.brandRepresentative)) {
    firstCouponStep = "Fix coupon access and audience permissions before planning more depth.";
    firstCouponReason = "The coupon cannot execute cleanly if account or audience permissions are missing.";
  } else if (!input.offerBuyable || !input.featuredOfferLikely) {
    firstCouponStep = "Fix offer buyability and Featured Offer strength before expecting coupon visibility.";
    firstCouponReason = "Coupons are much weaker when the offer is not buyable or unlikely to win the key placement.";
  } else if (input.discountRate < 0.05) {
    firstCouponStep = "Lift discount depth into the eligible range before launch.";
    firstCouponReason = "The current coupon is below the minimum threshold for a clean retail test.";
  } else if (input.inventoryDays < 21 && input.objective !== "clearance") {
    firstCouponStep = "Protect stock cover before pushing the coupon live.";
    firstCouponReason = "Tight inventory can turn a coupon into an avoidable stock-risk accelerator.";
  } else if (input.stackRisk) {
    firstCouponStep = "Remove stacked promo conflicts before scaling the coupon.";
    firstCouponReason = "Overlapping offers can erode margin and distort the effective discount shown to shoppers.";
  }

  score = Math.max(0, score);
  const evidence = getCouponStrategyPolicyEvidence({
    professionalSeller: input.professionalSeller,
    feedbackRating: input.feedbackRating,
    offerBuyable: input.offerBuyable,
    featuredOfferLikely: input.featuredOfferLikely,
    audienceType: input.audienceType,
    brandRepresentative: input.brandRepresentative,
    discountRate: input.discountRate,
    stackRisk: input.stackRisk,
  });
  const commercialCall =
    input.couponAfterMargin < 8
      ? "Do not run this coupon until the post-coupon margin is safe"
      : !input.professionalSeller || (input.audienceType === "brand" && !input.brandRepresentative)
        ? "Fix coupon access before planning deeper discounts"
        : !input.offerBuyable || !input.featuredOfferLikely
          ? "Repair offer buyability before expecting coupon visibility"
          : input.discountRate < 0.05
            ? "Lift the coupon into the eligible depth band before launch"
            : input.inventoryDays < 21 && input.objective !== "clearance"
              ? "Protect stock cover before using coupons for demand lift"
              : input.stackRisk
                ? "Remove stacked promo pressure before launching the coupon"
                : "Launch this coupon as a controlled retail test";
  const decisionOwner =
    input.couponAfterMargin < 8
      ? "Unit economics lead"
      : !input.professionalSeller || (input.audienceType === "brand" && !input.brandRepresentative)
        ? "Account access lead"
        : !input.offerBuyable || !input.featuredOfferLikely
          ? "Offer competitiveness lead"
          : input.discountRate < 0.05
            ? "Promotions lead"
            : input.inventoryDays < 21 && input.objective !== "clearance"
              ? "Inventory lead"
              : input.stackRisk
                ? "Promo operations lead"
                : "Coupon owner";
  const moveNow =
    input.couponAfterMargin < 8
      ? "Reduce depth or improve contribution before reopening the coupon plan"
      : !input.professionalSeller || (input.audienceType === "brand" && !input.brandRepresentative)
        ? "Fix seller access and audience permissions before changing coupon depth"
        : !input.offerBuyable || !input.featuredOfferLikely
          ? "Restore buyability and placement first, then re-check coupon visibility"
          : input.discountRate < 0.05
            ? "Raise coupon depth into the eligible band and keep other launch assumptions frozen"
            : input.inventoryDays < 21 && input.objective !== "clearance"
              ? "Protect inventory cover before using coupons to drive more demand"
              : input.stackRisk
                ? "Remove overlapping promo pressure and reopen one clean coupon launch lane"
                : "Launch the coupon with the current economics and keep other promo mechanics closed";
  const doNotCrossLine =
    input.couponAfterMargin < 8
      ? "Do not buy traffic with a coupon that leaves unsafe contribution behind"
      : !input.professionalSeller || (input.audienceType === "brand" && !input.brandRepresentative)
        ? "Do not plan around coupon audiences you cannot actually access"
        : !input.offerBuyable || !input.featuredOfferLikely
          ? "Do not expect coupons to rescue a weak or unbuyable offer"
          : input.discountRate < 0.05
            ? "Do not ship a coupon below the eligible retail threshold"
            : input.inventoryDays < 21 && input.objective !== "clearance"
              ? "Do not accelerate demand into tight stock coverage"
              : input.stackRisk
                ? "Do not stack coupons with other promo spikes in the same retail moment"
                : "Do not keep adjusting depth, traffic, and stacking at the same time";
  const couponRiskBrief =
    input.couponAfterMargin < 8
      ? `${round(input.couponAfterMargin, 1)}% margin after couponing is too thin for safe repetition.`
      : !input.professionalSeller || (input.audienceType === "brand" && !input.brandRepresentative)
        ? "Account or audience permissions are incomplete for the planned coupon audience."
        : !input.offerBuyable || !input.featuredOfferLikely
          ? "Coupon visibility is weak because the offer is not cleanly buyable or placed."
          : input.discountRate < 0.05
            ? `${round(input.discountRate * 100, 1)}% depth is below the minimum eligible threshold.`
            : input.inventoryDays < 21 && input.objective !== "clearance"
              ? `${Math.round(input.inventoryDays)} days of cover is too tight for a non-clearance coupon push.`
              : input.stackRisk
                ? "Overlapping promos will blur incrementality and hide the real margin cost."
                : `${round(input.couponAfterMargin, 1)}% post-coupon margin leaves enough room for a controlled test.`;

  return {
    headline:
      input.couponAfterMargin < 8
        ? `${commercialCall} - the economics are too thin`
        : !input.professionalSeller || (input.audienceType === "brand" && !input.brandRepresentative)
          ? `${commercialCall} - account access is the first broken gate`
          : !input.offerBuyable || !input.featuredOfferLikely
            ? `${commercialCall} - offer visibility is the first broken gate`
            : input.discountRate < 0.05
              ? `${commercialCall} - depth is below the live threshold`
              : input.inventoryDays < 21 && input.objective !== "clearance"
                ? `${commercialCall} - stock cover is too tight`
                : input.stackRisk
                  ? `${commercialCall} - promo overlap must close first`
                  : `${commercialCall} - the coupon lane is commercially workable`,
    summary:
      "This coupon read names whether the launch should proceed now, which gate is broken first, who owns the fix, and which other levers must stay frozen so the next result is actually interpretable.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${moveNow}. ${decisionOwner} owns the first coupon lane.`,
      },
      {
        label: "Open lane",
        value: moveNow,
        detail: couponRiskBrief,
      },
      {
        label: "Price",
        value: formatCurrency(round(input.price)),
        detail: `${input.objective} objective`,
      },
      {
        label: "Coupon depth",
        value: `${round(input.discountRate * 100, 1)}%`,
        detail: `${Math.round(input.inventoryDays)} inventory-cover days`,
      },
      {
        label: "Post-coupon margin",
        value: `${round(input.couponAfterMargin, 1)}%`,
        detail: `${round(input.netMarginRate, 1)}% baseline before coupon`,
      },
      {
        label: "Stacking risk",
        value: input.stackRisk ? "Present" : "Low",
        detail: "Other promos or ad pushes overlapping this plan",
      },
      {
        label: "Eligibility",
        value: input.professionalSeller ? "Professional seller" : "Seller plan gap",
        detail: input.offerBuyable ? (input.featuredOfferLikely ? "Buyable + featured" : "Buyable but featured weak") : "Offer not buyable",
      },
      {
        label: "Plan score",
        value: `${score}%`,
        detail: "Higher means safer to run repeatedly",
      },
      {
        label: "Margin retained",
        value: `${round(Math.max(0, input.couponAfterMargin / Math.max(input.netMarginRate, 0.1) * 100), 1)}%`,
        detail: "Share of baseline margin left after couponing",
      },
      {
        label: "First coupon step",
        value: firstCouponStep,
        detail: firstCouponReason,
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep one coupon lane open so you can tell whether economics, visibility, or stock was the real gating factor.",
      },
    ],
    recommendations: [
      input.couponAfterMargin < 8
        ? "Do not launch this coupon yet. Reduce discount depth or improve contribution until the post-coupon margin is safe enough to repeat."
        : "Margin after couponing is workable enough for a controlled test, so unit economics are not the first blocker.",
      input.stackRisk
        ? "De-stack this coupon from other demand spikes unless the clearance goal is explicit. Otherwise you will not know what actually drove the lift or the margin loss."
        : "Stacking risk is low enough that you can get a clean read on coupon impact.",
      input.inventoryDays < 21 && input.objective !== "clearance"
        ? "Protect inventory before using coupons for traffic growth. Tight stock turns a traffic tool into an avoidable stock-risk accelerant."
        : "Inventory cover is workable for the current coupon objective, so stock is not the immediate blocker.",
      !input.offerBuyable || !input.featuredOfferLikely
        ? "Do not assume the coupon will rescue a weak offer. Fix buyability and placement before trying to buy the click."
        : "Assign one owner to coupon economics and one to visibility gates so the launch decision is not based on discount depth alone.",
      `Re-run only when this same lane changes state: ${moveNow.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "Coupon plan looks usable",
      warning: "Coupon plan needs tightening",
      critical: "Coupon plan is unsafe",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Launch the coupon",
      caution: "Tighten economics first",
      stop: "Do not run this coupon yet",
    }, {
      go: "The coupon is commercially safe enough to run as a controlled retail test.",
      caution: "The coupon idea is workable, but margin, stock, or visibility gates should tighten before launch.",
      stop: "The current coupon plan is too weak economically or operationally to run safely.",
    }),
    missingItems: [
      input.couponAfterMargin < 8 ? "Safer post-coupon margin" : "",
      input.inventoryDays < 21 && input.objective !== "clearance" ? "More inventory cover" : "",
      !input.professionalSeller ? "Professional seller account" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${moveNow.toLowerCase()}.`,
      "Tie coupon depth to a margin floor, not just traffic or click goals, before the plan is approved.",
      "Freeze visibility assumptions and stack status before the launch check so coupon performance is judged on a stable offer state.",
      "Check the plan against stock cover and offer buyability right before launch, not just when the coupon idea is drafted.",
      "Re-run whenever ad pressure, overlapping deals, or stock conditions change enough to alter the real coupon economics.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

export function evaluateDaypartingStrategy(input: {
  rowCount: number;
  highWasteHours: number;
  winnerHours: number;
  spend: number;
  sales: number;
  acos: number;
  cvr: number;
  bestHourShare: number;
  timezone: string;
}) {
  const alerts: string[] = [];
  let score = 100;

  if (input.rowCount < 8) {
    alerts.push("Hourly sample is thin, so the schedule should stay conservative.");
    score -= 18;
  }
  if (input.highWasteHours >= Math.max(3, Math.ceil(input.rowCount * 0.3))) {
    alerts.push("Too many hours are spending without efficient return.");
    score -= 16;
  }
  if (input.winnerHours === 0) {
    alerts.push("No clear high-efficiency hour block is visible yet.");
    score -= 10;
  }
  if (input.bestHourShare > 0.35) {
    alerts.push("A large share of the account depends on a narrow time window.");
    score -= 10;
  }
  if (input.acos > 0.45) {
    alerts.push("Blended ACoS is high enough that time-window control should stay defensive until efficiency improves.");
  }

  score = Math.max(0, score);
  const commercialCall =
    input.rowCount < 8
      ? "Do not automate dayparting until the hourly evidence is deeper"
      : input.highWasteHours >= Math.max(3, Math.ceil(input.rowCount * 0.3))
        ? "Cut waste hours before funding any winning block harder"
        : input.winnerHours === 0
          ? "Keep the schedule defensive until a real winning block appears"
          : input.bestHourShare > 0.35
            ? "Reduce hour-block concentration before trusting this schedule"
            : "Apply the schedule and scale only the proven winning hours";
  const decisionOwner =
    input.rowCount < 8
      ? "PPC analytics lead"
      : input.highWasteHours >= Math.max(3, Math.ceil(input.rowCount * 0.3))
        ? "Budget efficiency lead"
        : input.winnerHours === 0
          ? "Dayparting owner"
          : input.bestHourShare > 0.35
            ? "Risk control lead"
            : "Schedule owner";
  const moveNow =
    input.rowCount < 8
      ? "Collect a deeper hour sample before changing bids or schedules live"
      : input.highWasteHours >= Math.max(3, Math.ceil(input.rowCount * 0.3))
        ? "Bid down or cut the worst hours first and keep winner expansion frozen"
        : input.winnerHours === 0
          ? "Hold the schedule tight and wait for one durable winning block before scaling"
          : input.bestHourShare > 0.35
            ? "Reduce dependence on the top hour block before adding more daypart aggression"
            : "Raise support only in the proven winning hours and keep waste windows closed";
  const doNotCrossLine =
    input.rowCount < 8
      ? "Do not automate an hour schedule from a thin sample"
      : input.highWasteHours >= Math.max(3, Math.ceil(input.rowCount * 0.3))
        ? "Do not raise winner budgets while obvious waste hours are still leaking spend"
        : input.winnerHours === 0
          ? "Do not invent winning hours that the data does not support"
          : input.bestHourShare > 0.35
            ? "Do not let one narrow hour block carry the whole account"
            : "Do not change timezone, bids, and schedule rules at the same time";
  const daypartRiskBrief =
    input.rowCount < 8
      ? `${input.rowCount} hourly rows is too thin for a stable live schedule.`
      : input.highWasteHours >= Math.max(3, Math.ceil(input.rowCount * 0.3))
        ? `${input.highWasteHours} hours are still wasting budget without efficient return.`
        : input.winnerHours === 0
          ? "No durable high-efficiency hour block is visible yet."
          : input.bestHourShare > 0.35
            ? `${round(input.bestHourShare * 100, 1)}% of performance sits in one narrow time block.`
            : `${input.winnerHours} winning hours are strong enough to support a controlled live schedule.`;

  return {
    headline:
      input.rowCount < 8
        ? `${commercialCall} - the sample is too thin`
        : input.highWasteHours >= Math.max(3, Math.ceil(input.rowCount * 0.3))
          ? `${commercialCall} - waste is the first broken lane`
          : input.winnerHours === 0
            ? `${commercialCall} - there is no winner lane yet`
            : input.bestHourShare > 0.35
              ? `${commercialCall} - concentration risk is too high`
              : `${commercialCall} - the schedule lane is commercially workable`,
    summary:
      "This hour-map read decides whether dayparting should go live now, which time-window lane is broken first, who owns the first fix, and which other changes must stay frozen so the next result is interpretable.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${moveNow}. ${decisionOwner} owns the first schedule lane.`,
      },
      {
        label: "Open lane",
        value: moveNow,
        detail: daypartRiskBrief,
      },
      {
        label: "Hourly rows",
        value: `${input.rowCount}`,
        detail: `${input.timezone} timezone`,
      },
      {
        label: "Spend / sales",
        value: `${formatCurrency(round(input.spend))} / ${formatCurrency(round(input.sales))}`,
        detail: `${round(input.acos * 100, 1)}% blended ACoS`,
      },
      {
        label: "Conversion rate",
        value: `${round(input.cvr * 100, 1)}%`,
        detail: `${input.winnerHours} strong hours identified`,
      },
      {
        label: "Waste hours",
        value: `${input.highWasteHours}`,
        detail: "Hours with poor efficiency or no conversion support",
      },
      {
        label: "Concentration",
        value: `${round(input.bestHourShare * 100, 1)}%`,
        detail: "Share held by the best hour block",
      },
      {
        label: "Hour balance",
        value: `${input.winnerHours}/${input.highWasteHours}`,
        detail: "Priority hours versus cutback hours",
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep one schedule-change lane open so you can tell whether waste reduction or winner support is driving the result.",
      },
    ],
    recommendations: [
      input.highWasteHours > 0
        ? "Cut or bid down the worst hours before expanding the good ones. Stop the leak before funding the winners harder."
        : "No major waste block is visible yet, so protect the best hours first instead of overengineering the schedule.",
      input.bestHourShare > 0.35
        ? "Do not let one hour block carry the whole account without backup coverage. That concentration is operationally fragile."
        : "Schedule concentration is manageable enough for measured optimization rather than emergency redistribution.",
      input.acos > 0.45
        ? "Keep the schedule defensive until blended efficiency improves; do not mistake high spend windows for winning windows."
        : "Keep dayparting tied to actual hourly conversion and ACoS, not intuition or anecdotal timing beliefs.",
      input.winnerHours === 0
        ? "Do not automate aggressive hour-based scaling yet. Wait until at least one durable winning block is visible."
        : "Assign one owner to waste-hour cuts and one to winning-block expansion so the schedule learns in both directions.",
      `Re-run only when this same lane changes state: ${moveNow.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "Daypart schedule looks usable",
      warning: "Daypart schedule needs tuning",
      critical: "Daypart schedule is weak",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Apply the schedule",
      caution: "Trim waste windows first",
      stop: "Do not automate the schedule yet",
    }, {
      go: "The hour map is strong enough to apply as a live schedule and learn from controlled timing changes.",
      caution: "The schedule has promise, but waste windows or thin evidence should be tightened before automation.",
      stop: "The current hour-level pattern is too weak to trust as a live bidding schedule.",
    }),
    missingItems: [
      input.rowCount < 8 ? "Richer hourly performance history" : "",
      input.winnerHours === 0 ? "Clear winning hour blocks" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${moveNow.toLowerCase()}.`,
      "Freeze timezone handling and one reference week before the next change so hour-level comparisons stay trustworthy.",
      "Re-run after major promo, campaign-type, or budget changes so the hour map reflects the new traffic mix.",
      "Keep timezone alignment explicit when applying the schedule, or the automation will optimize the wrong windows.",
    ],
    evidence: daypartingEvidence,
  } satisfies ToolEvaluation;
}

export function evaluateDisplayAds(input: {
  audienceCount: number;
  competitorCount: number;
  retargetingShare: number;
  prospectingShare: number;
  budget: number;
  heroAsinCount: number;
  creativeReady: boolean;
}) {
  const alerts: string[] = [];
  let score = 100;

  if (input.audienceCount < 2) {
    alerts.push("Audience mix is too narrow for a useful Sponsored Display structure.");
    score -= 18;
  }
  if (input.retargetingShare > 0.75) {
    alerts.push("Budget is overconcentrated in retargeting and lacks enough acquisition coverage.");
    score -= 10;
  }
  if (input.prospectingShare > 0.55 && input.creativeReady === false) {
    alerts.push("Prospecting is too aggressive for the current creative readiness.");
    score -= 12;
  }
  if (input.budget < 500) {
    alerts.push("Budget is thin, so audience spread should stay focused.");
    score -= 8;
  }
  if (input.heroAsinCount < 1) {
    alerts.push("No hero ASIN focus is defined for the display plan.");
    score -= 8;
  }
  if (input.competitorCount === 0 && input.prospectingShare > 0.3) {
    alerts.push("Prospecting share is meaningful, but competitor or audience target depth is still thin.");
  }

  score = Math.max(0, score);
  const commercialCall =
    input.audienceCount < 2
      ? "Do not widen display until the audience structure is real"
      : input.retargetingShare > 0.75
        ? "Reduce retargeting concentration before adding more budget"
        : input.prospectingShare > 0.55 && input.creativeReady === false
          ? "Repair creative support before pushing prospecting harder"
          : input.heroAsinCount < 1
            ? "Define a hero ASIN before launching broader display lanes"
            : "Launch the display plan with one clear audience job per lane";
  const decisionOwner =
    input.audienceCount < 2
      ? "Audience strategy lead"
      : input.retargetingShare > 0.75
        ? "Budget allocation lead"
        : input.prospectingShare > 0.55 && input.creativeReady === false
          ? "Creative readiness lead"
          : input.heroAsinCount < 1
            ? "Merchandising lead"
            : "Display owner";
  const moveNow =
    input.audienceCount < 2
      ? "Build at least one additional audience lane before expanding spend"
      : input.retargetingShare > 0.75
        ? "Pull budget concentration down from retargeting before opening more audience reach"
        : input.prospectingShare > 0.55 && input.creativeReady === false
          ? "Fix creative support first and keep prospecting expansion frozen"
          : input.heroAsinCount < 1
            ? "Anchor the plan to one hero ASIN before widening the audience map"
            : "Launch one audience job per lane and keep the mix disciplined";
  const doNotCrossLine =
    input.audienceCount < 2
      ? "Do not spread display budget across a fake one-audience structure"
      : input.retargetingShare > 0.75
        ? "Do not let retargeting absorb the whole display budget"
        : input.prospectingShare > 0.55 && input.creativeReady === false
          ? "Do not buy colder display traffic without the creative to convert it"
          : input.heroAsinCount < 1
            ? "Do not launch broad display without a clear product destination"
            : "Do not let every display lane chase the same vague awareness goal";
  const displayRiskBrief =
    input.audienceCount < 2
      ? `${input.audienceCount} audience lane is too narrow for a stable display structure.`
      : input.retargetingShare > 0.75
        ? `${round(input.retargetingShare * 100, 1)}% of budget is trapped in retargeting.`
        : input.prospectingShare > 0.55 && input.creativeReady === false
          ? "Prospecting is ahead of the creative support needed to make it pay back."
          : input.heroAsinCount < 1
            ? "There is no hero ASIN focus anchoring the display plan."
            : `${input.audienceCount} audience lanes and ${input.heroAsinCount} hero ASINs are enough for a controlled launch.`;

  return {
    headline:
      input.audienceCount < 2
        ? `${commercialCall} - the audience map is too thin`
        : input.retargetingShare > 0.75
          ? `${commercialCall} - concentration is the first broken lane`
          : input.prospectingShare > 0.55 && input.creativeReady === false
            ? `${commercialCall} - creative support is the first broken lane`
            : input.heroAsinCount < 1
              ? `${commercialCall} - product focus is missing`
              : `${commercialCall} - the display lane is commercially workable`,
    summary:
      "This display read decides whether the plan should launch now, which audience lane is broken first, who owns the fix, and which other levers must stay closed so the next result can be trusted.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${moveNow}. ${decisionOwner} owns the first display lane.`,
      },
      {
        label: "Open lane",
        value: moveNow,
        detail: displayRiskBrief,
      },
      {
        label: "Audience count",
        value: `${input.audienceCount}`,
        detail: `${input.competitorCount} competitor targets in scope`,
      },
      {
        label: "Budget split",
        value: `${round(input.retargetingShare * 100, 1)}% / ${round(input.prospectingShare * 100, 1)}%`,
        detail: "Retargeting vs prospecting allocation",
      },
      {
        label: "Monthly budget",
        value: formatCurrency(round(input.budget)),
        detail: `${input.heroAsinCount} hero ASINs`,
      },
      {
        label: "Creative readiness",
        value: input.creativeReady ? "Ready" : "Thin",
        detail: "Whether remarketing and prospecting have enough asset support",
      },
      {
        label: "Coverage posture",
        value: `${input.competitorCount} targets`,
        detail: `${input.heroAsinCount} hero ASINs anchoring the plan`,
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep one audience-expansion lane open so you can tell whether structure, budget split, or creative was the real blocker.",
      },
    ],
    recommendations: [
      input.budget < 500
        ? "Do not spread this budget across too many audiences. Keep the plan tight around the highest-value retargeting and one prospecting lane."
        : "Budget is workable enough to separate retargeting from competitor/product targeting cleanly.",
      input.retargetingShare > 0.75
        ? "Reduce retargeting concentration so the account can still learn from new audiences."
        : "Retargeting weight is balanced enough for controlled learning.",
      input.creativeReady
        ? "Use display to support product education where the listing alone is not enough."
        : "Do not expand prospecting display yet. Delay broader display work until creative and asset support improve.",
      input.heroAsinCount < 1
        ? "Fix hero ASIN focus before launch so the audience plan has a clear product destination."
        : "Assign one audience job and one hero ASIN to each display lane instead of running a vague awareness mix.",
      `Re-run only when this same lane changes state: ${moveNow.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "Display plan looks usable",
      warning: "Display plan needs focus",
      critical: "Display plan is weak",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Launch the display plan",
      caution: "Refocus the audiences first",
      stop: "Do not widen display yet",
    }, {
      go: "The audience mix and creative support are clear enough to launch a disciplined display plan.",
      caution: "The display idea is workable, but audience focus or asset support should tighten before expansion.",
      stop: "The current display plan is too diffuse or too thin to justify broader spend.",
    }),
    missingItems: [
      input.heroAsinCount < 1 ? "Hero ASIN focus" : "",
      input.audienceCount < 2 ? "Audience breadth" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${moveNow.toLowerCase()}.`,
      "Map creative to one audience job at a time.",
      "Assign one owner to audience structure, one to creative readiness, and one to budget pacing.",
      "Re-run when budget or asset depth changes.",
    ],
    evidence: displayAdsEvidence,
  } satisfies ToolEvaluation;
}

export function evaluateGlobalSelling(input: {
  targetCount: number;
  marginReadyCount: number;
  complianceReadyCount: number;
  localizationReadyCount: number;
  nearestExpansionScore: number;
  currentMarketplace: string;
  taxReady: boolean;
  supportReady: boolean;
  buildInternationalListingsReady: boolean;
}) {
  const alerts: string[] = [];
  let score = 100;

  if (input.targetCount === 0) {
    alerts.push("No target marketplaces are selected yet.");
    score -= 24;
  }
  if (input.marginReadyCount < input.targetCount) {
    alerts.push("Some target marketplaces do not meet margin assumptions.");
    score -= 14;
  }
  if (input.complianceReadyCount < input.targetCount) {
    alerts.push("Compliance readiness is incomplete for one or more target marketplaces.");
    score -= 18;
  }
  if (input.localizationReadyCount < input.targetCount) {
    alerts.push("Localization inputs are still thin for some targets.");
    score -= 10;
  }
  if (!input.taxReady) {
    alerts.push("Tax, duty, or landed-cost readiness is still incomplete.");
    score -= 16;
  }
  if (!input.supportReady) {
    alerts.push("Customer support and returns handling are not ready for the target market set.");
    score -= 10;
  }
  if (!input.buildInternationalListingsReady && input.targetCount > 1) {
    alerts.push("Multi-market expansion is missing a clear Build International Listings operating path.");
    score -= 8;
  }
  if (input.targetCount > 3) {
    alerts.push("The target list is broad enough that sequencing discipline matters more than adding more stores.");
    score -= 6;
  }
  if (input.nearestExpansionScore < 60 && input.targetCount > 0) {
    alerts.push("Even the nearest-fit market is not especially strong yet, so expansion sequencing should stay conservative.");
  }

  score = Math.max(0, score);
  const evidence = getGlobalSellingPolicyEvidence({
    targetCount: input.targetCount,
    currentMarketplace: input.currentMarketplace,
    localizationReadyCount: input.localizationReadyCount,
    complianceReadyCount: input.complianceReadyCount,
    taxReady: input.taxReady,
    supportReady: input.supportReady,
    buildInternationalListingsReady: input.buildInternationalListingsReady,
  });
  const blockedTargets = Math.max(
    input.targetCount - input.marginReadyCount,
    input.targetCount - input.complianceReadyCount,
    input.targetCount - input.localizationReadyCount,
  );
  const commercialCall =
    input.targetCount === 0
      ? "Do not expand until a real target shortlist exists"
      : input.complianceReadyCount < input.targetCount
        ? "Fix compliance gates before opening the next marketplace"
        : input.marginReadyCount < input.targetCount
          ? "Cut weak-margin markets before spending more launch effort"
          : !input.taxReady || !input.supportReady
            ? "Repair operating readiness before cross-border launch"
            : input.targetCount > 3 || input.nearestExpansionScore < 60
              ? "Narrow the shortlist before broad expansion"
              : "Enter the nearest-fit market and keep the rest closed";
  const decisionOwner =
    input.targetCount === 0
      ? "Expansion strategy lead"
      : input.complianceReadyCount < input.targetCount
        ? "Compliance lead"
        : input.marginReadyCount < input.targetCount
          ? "Landed margin lead"
          : !input.taxReady || !input.supportReady
            ? "Marketplace operations lead"
            : input.targetCount > 3 || input.nearestExpansionScore < 60
              ? "Expansion sequencing lead"
              : "International launch owner";
  const moveNow =
    input.targetCount === 0
      ? "Build a real target shortlist before committing localization or logistics work"
      : input.complianceReadyCount < input.targetCount
        ? "Remove non-compliant targets first and reopen only the cleanest market"
        : input.marginReadyCount < input.targetCount
          ? "Drop the weakest-margin targets before expanding translation or setup work"
          : !input.taxReady || !input.supportReady
            ? "Close tax and support readiness before submitting the next launch"
            : input.targetCount > 3 || input.nearestExpansionScore < 60
              ? "Shrink the shortlist to the single strongest next market before scaling"
              : "Launch the nearest-fit market first and keep the wider cluster frozen";
  const doNotCrossLine =
    input.targetCount === 0
      ? "Do not start cross-border work without a real market shortlist"
      : input.complianceReadyCount < input.targetCount
        ? "Do not let translation or ads outrun compliance clearance"
        : input.marginReadyCount < input.targetCount
          ? "Do not localize markets that fail landed margin reality"
          : !input.taxReady || !input.supportReady
            ? "Do not open a marketplace before tax and support paths are ready"
            : input.targetCount > 3 || input.nearestExpansionScore < 60
              ? "Do not open several middling markets at the same time"
              : "Do not launch multiple markets before one proof market is stable";
  const expansionRiskBrief =
    input.targetCount === 0
      ? "No target markets are selected yet, so there is no real expansion sequence."
      : input.complianceReadyCount < input.targetCount
        ? `${input.targetCount - input.complianceReadyCount} targets are still blocked by compliance gaps.`
        : input.marginReadyCount < input.targetCount
          ? `${input.targetCount - input.marginReadyCount} targets fail the current margin threshold.`
          : !input.taxReady || !input.supportReady
            ? "Tax or support operations are still incomplete for the selected market set."
            : input.targetCount > 3 || input.nearestExpansionScore < 60
              ? `${blockedTargets} targets are still weaker than the next best candidate.`
              : `${input.nearestExpansionScore}% nearest-market fit is strong enough to justify one controlled launch.`;

  return {
    headline:
      input.targetCount === 0
        ? `${commercialCall} - there is no live shortlist yet`
        : input.complianceReadyCount < input.targetCount
          ? `${commercialCall} - compliance is the first broken gate`
          : input.marginReadyCount < input.targetCount
            ? `${commercialCall} - economics are the first broken gate`
            : !input.taxReady || !input.supportReady
              ? `${commercialCall} - operating readiness is the first broken gate`
              : input.targetCount > 3 || input.nearestExpansionScore < 60
                ? `${commercialCall} - sequencing discipline is weak`
                : `${commercialCall} - the next market lane is commercially workable`,
    summary:
      "This expansion read decides whether the next market should open now, which market-entry gate is broken first, who owns the first fix, and which wider expansion moves must stay closed until one proof market is stable.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${moveNow}. ${decisionOwner} owns the first expansion lane.`,
      },
      {
        label: "Open lane",
        value: moveNow,
        detail: expansionRiskBrief,
      },
      {
        label: "Targets",
        value: `${input.targetCount}`,
        detail: `Starting from ${input.currentMarketplace}`,
      },
      {
        label: "Margin-ready",
        value: `${input.marginReadyCount}/${input.targetCount}`,
        detail: "Markets that still clear the current margin threshold",
      },
      {
        label: "Compliance-ready",
        value: `${input.complianceReadyCount}/${input.targetCount}`,
        detail: "Markets where product and import readiness is not obviously blocked",
      },
      {
        label: "Localization-ready",
        value: `${input.localizationReadyCount}/${input.targetCount}`,
        detail: "Markets where listing and offer adaptation is plausible now",
      },
      {
        label: "Nearest-fit score",
        value: `${input.nearestExpansionScore}%`,
        detail: "Best candidate among the current short list",
      },
      {
        label: "Ops readiness",
        value: input.taxReady ? "Tax ready" : "Tax gap",
        detail: input.supportReady ? "Support path mapped" : "Support path still weak",
      },
      {
        label: "Sequencing pressure",
        value: `${input.targetCount - input.marginReadyCount}/${input.targetCount - input.complianceReadyCount}`,
        detail: "Targets still blocked by margin / compliance gaps",
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep only one market-entry lane open so the next launch teaches whether compliance, economics, or ops was the real blocker.",
      },
    ],
    recommendations: [
      input.complianceReadyCount < input.targetCount
        ? "Do not open more marketplaces yet. Filter targets by compliance first, because blocked entry destroys sequencing quality."
        : "Compliance readiness is workable enough to sequence by commercial upside next.",
      input.marginReadyCount < input.targetCount
        ? "Do not let translation or logistics work get ahead of weak margin reality."
        : "Margin assumptions are strong enough to justify sequencing work.",
      input.targetCount > 3
        ? "Cut the shortlist down before expanding. Too many target markets at once usually hide the real first winner."
        : "Keep the shortlist tight enough that one launch can teach the next one.",
      "Enter the nearest-fit market first and reuse that proof stack before opening a wider cluster.",
      `Re-run only when this same lane changes state: ${moveNow.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "Expansion shortlist looks usable",
      warning: "Expansion shortlist needs tightening",
      critical: "Expansion shortlist is weak",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Enter the nearest market",
      caution: "Tighten the shortlist first",
      stop: "Do not expand yet",
    }, {
      go: "The shortlist is ready enough to launch the nearest-fit marketplace and use it as the proof base for later expansion.",
      caution: "The expansion idea is plausible, but margin, compliance, or localization gaps should be narrowed before launch work spreads wider.",
      stop: "The current expansion set is too operationally weak to justify opening another marketplace yet.",
    }),
    missingItems: [
      input.targetCount === 0 ? "Target marketplaces" : "",
      input.complianceReadyCount < input.targetCount ? "Compliance evidence for all targets" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${moveNow.toLowerCase()}.`,
      "Assign one owner for compliance, one for landed economics, and one for listing localization before launch work starts.",
      "Launch the nearest-fit market before broad rollout.",
      "Re-run after fee, duty, or localization assumptions change.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

export function evaluateReviewStrategy(input: {
  orderVolume: number;
  reviewCount: number;
  reviewRate: number;
  channels: string[];
  compliantChannels: string[];
  stage: string;
  vineEligible: boolean;
}) {
  const alerts: string[] = [];
  let score = 100;
  const channelCount = input.channels.length;
  const compliantChannelCount = input.compliantChannels.length;
  const hasExternalIncentive = input.channels.includes("external-incentive");
  const hasInsertCard = input.channels.includes("insert-card-safe");

  if (input.orderVolume < 50) {
    alerts.push("Order flow is light, so review growth pace will be slow without patience or Vine.");
    score -= 12;
  }
  if (input.reviewRate < 0.01) {
    alerts.push("Review conversion is low relative to current order flow.");
    score -= 16;
  }
  if (compliantChannelCount < channelCount) {
    alerts.push("Some planned channels are not clearly compliant and should be removed.");
    score -= 18;
  }
  if (input.stage === "launch" && input.reviewCount < 10 && !input.vineEligible) {
    alerts.push("Launch-stage proof is thin and Vine is not yet available as a support path.");
    score -= 10;
  }
  if (hasExternalIncentive) {
    alerts.push("The plan includes an incentive-based review tactic that conflicts with Amazon review policy.");
    score -= 28;
  }
  if (hasInsertCard && !input.compliantChannels.includes("insert-card-safe")) {
    alerts.push("Insert-card review asks are risky unless the language stays fully neutral and non-incentivized.");
    score -= 10;
  }

  score = Math.max(0, score);
  const evidence = getReviewStrategyPolicyEvidence({
    channels: input.channels,
    compliantChannels: input.compliantChannels,
    vineEligible: input.vineEligible,
    reviewCount: input.reviewCount,
  });
  const commercialCall =
    hasExternalIncentive
      ? "Stop the risky review tactic before doing anything else"
      : compliantChannelCount < channelCount
        ? "Remove non-compliant channels before scaling review requests"
        : input.reviewRate < 0.01
          ? "Repair review conversion before adding more request volume"
          : input.stage === "launch" && input.reviewCount < 10 && !input.vineEligible
            ? "Keep launch-stage proof work conservative until a cleaner proof lane exists"
            : "Scale one compliant review flow and keep the rest frozen";
  const decisionOwner =
    hasExternalIncentive
      ? "Policy compliance lead"
      : compliantChannelCount < channelCount
        ? "Review compliance lead"
        : input.reviewRate < 0.01
          ? "Lifecycle operations lead"
          : input.stage === "launch" && input.reviewCount < 10 && !input.vineEligible
            ? "Launch proof lead"
            : "Review growth owner";
  const moveNow =
    hasExternalIncentive
      ? "Shut off the incentive-based tactic immediately and keep all growth tests frozen"
      : compliantChannelCount < channelCount
        ? "Remove the risky channels first and reopen only one compliant request path"
        : input.reviewRate < 0.01
          ? "Fix timing and request placement before increasing review-request volume"
          : input.stage === "launch" && input.reviewCount < 10 && !input.vineEligible
            ? "Keep the launch review plan narrow until one safe proof lane is working"
            : "Scale the clean request flow and keep new channel experiments closed";
  const doNotCrossLine =
    hasExternalIncentive
      ? "Do not keep any incentive-based review tactic live"
      : compliantChannelCount < channelCount
        ? "Do not optimize risky channels as if they were normal acquisition levers"
        : input.reviewRate < 0.01
          ? "Do not add more channels before the core review flow converts"
          : input.stage === "launch" && input.reviewCount < 10 && !input.vineEligible
            ? "Do not panic-open risky proof tactics during launch"
            : "Do not test timing, channel, and messaging all at once";
  const reviewRiskBrief =
    hasExternalIncentive
      ? "An incentive-based tactic creates direct policy exposure and invalidates the plan."
      : compliantChannelCount < channelCount
        ? `${channelCount - compliantChannelCount} planned channels are not clearly compliant.`
        : input.reviewRate < 0.01
          ? `${round(input.reviewRate * 100, 2)}% review conversion is too weak to scale confidently.`
          : input.stage === "launch" && input.reviewCount < 10 && !input.vineEligible
            ? "Launch-stage proof is still thin and there is no clean acceleration path yet."
            : `${compliantChannelCount} compliant channels are available, but one stable flow should lead.`;

  return {
    headline:
      hasExternalIncentive
        ? `${commercialCall} - policy risk is the first broken gate`
        : compliantChannelCount < channelCount
          ? `${commercialCall} - channel safety is the first broken gate`
          : input.reviewRate < 0.01
            ? `${commercialCall} - conversion is the first broken gate`
            : input.stage === "launch" && input.reviewCount < 10 && !input.vineEligible
              ? `${commercialCall} - proof depth is still thin`
              : `${commercialCall} - the review lane is commercially workable`,
    summary:
      "This review-growth read decides whether the current plan should scale now, which proof lane is broken first, who owns the fix, and which other review tactics must stay closed so the next result is trustworthy.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${moveNow}. ${decisionOwner} owns the first review lane.`,
      },
      {
        label: "Open lane",
        value: moveNow,
        detail: reviewRiskBrief,
      },
      {
        label: "Recent orders",
        value: `${input.orderVolume}`,
        detail: `${input.reviewCount} current reviews in scope`,
      },
      {
        label: "Review rate",
        value: `${round(input.reviewRate * 100, 2)}%`,
        detail: `${input.stage} stage`,
      },
      {
        label: "Compliant channels",
        value: `${compliantChannelCount}/${channelCount}`,
        detail: input.vineEligible ? "Vine can be considered" : "No Vine support assumed",
      },
      {
        label: "Plan score",
        value: `${score}%`,
        detail: "Higher means better review growth without policy drift",
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep one review-growth lane open so you can tell whether compliance cleanup or flow timing changed the result.",
      },
    ],
    recommendations: [
      input.reviewRate < 0.01
        ? "Do not add more channels yet. Fix post-purchase timing and proof requests before trying to multiply outreach."
        : "Review conversion is workable enough to scale through compliant operations.",
      compliantChannelCount < channelCount
        ? "Remove non-compliant channels now rather than trying to optimize risky tactics."
        : "Channel mix is compliant enough to keep refining timing and order coverage.",
      input.vineEligible && input.reviewCount < 20
        ? "Use Vine selectively if launch-stage proof is still thin, but only after the compliant organic flow is clean."
        : "Let operational review flow do the work unless proof depth is truly blocked.",
      hasExternalIncentive
        ? "Stop incentive-based review tactics now. They are not an optimization problem; they are a policy risk."
        : "Keep every ask neutral, channel-safe, and easy to trace back to a compliant operational step.",
      hasInsertCard && !input.compliantChannels.includes("insert-card-safe")
        ? "Do not let packaging insert experiments continue until the language is neutral, support-first, and policy-reviewed."
        : "Freeze one compliant request flow before testing more messaging variants, or you will not know what actually improved review rate.",
      "Assign one owner to policy compliance and one to operational timing. Review growth breaks when those jobs are mixed together.",
      `Re-run only when this same lane changes state: ${moveNow.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "Review plan looks usable",
      warning: "Review plan needs cleanup",
      critical: "Review plan is risky or weak",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Scale the compliant review flow",
      caution: "Clean policy risk first",
      stop: "Stop the current review plan",
    }, {
      go: "The review plan is compliant and operational enough to scale through one stable post-purchase flow.",
      caution: "The plan has a workable core, but risky channels or weak timing should be cleaned up before adding more volume.",
      stop: "The current plan carries policy or conversion risk that makes continued execution a bad trade.",
    }),
    missingItems: [
      channelCount === 0 ? "Allowed review-acquisition channels" : "",
      input.reviewRate < 0.01 ? "Stronger review conversion process" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${moveNow.toLowerCase()}.`,
      "Freeze one compliant request flow and remove risky channels before testing anything else.",
      "Assign one owner to message timing, one to request placement, and one to policy review.",
      "Improve timing before adding volume.",
      "Re-run after order flow or Vine eligibility changes.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

export function evaluateVineProgram(input: {
  reviewCount: number;
  marginRate: number;
  unitsAvailable: number;
  launchStage: string;
  brandRegistered: boolean;
  marketReady: boolean;
  fbaReady: boolean;
  detailPageReady: boolean;
}) {
  const alerts: string[] = [];
  let score = 100;

  if (!input.brandRegistered) {
    alerts.push("Brand Registry readiness is not clear, which weakens Vine fit.");
    score -= 18;
  }
  if (input.reviewCount >= 30) {
    alerts.push("Review count is already beyond the strongest Vine use case.");
    score -= 10;
  }
  if (input.marginRate < 15) {
    alerts.push("Margin is thin for absorbing Vine costs and sample risk.");
    score -= 14;
  }
  if (input.unitsAvailable < 20) {
    alerts.push("Available unit buffer is thin for a clean Vine run.");
    score -= 16;
  }
  if (!input.marketReady) {
    alerts.push("The offer is not operationally ready enough to benefit from added review attention.");
    score -= 10;
  }
  if (!input.fbaReady) {
    alerts.push("Vine requires an active FBA listing, and that prerequisite is not ready.");
    score -= 18;
  }
  if (!input.detailPageReady) {
    alerts.push("Vine eligibility expects a detail page with image and description coverage.");
    score -= 12;
  }

  score = Math.max(0, score);
  const evidence = getVinePolicyEvidence({
    brandRegistered: input.brandRegistered,
    reviewCount: input.reviewCount,
    fbaReady: input.fbaReady,
    detailPageReady: input.detailPageReady,
  });
  const commercialCall =
    !input.brandRegistered || !input.fbaReady
      ? "Fix Vine eligibility before thinking about enrollment"
      : !input.detailPageReady || !input.marketReady
        ? "Repair the offer before sending Vine traffic into it"
        : input.marginRate < 15 || input.unitsAvailable < 20
          ? "Protect margin and unit buffer before opening Vine"
          : input.reviewCount >= 30
            ? "Skip Vine and keep proof growth organic"
            : "Enroll this SKU in Vine as a controlled proof lane";
  const decisionOwner =
    !input.brandRegistered || !input.fbaReady
      ? "Eligibility lead"
      : !input.detailPageReady || !input.marketReady
        ? "Listing readiness lead"
        : input.marginRate < 15 || input.unitsAvailable < 20
          ? "Unit economics lead"
          : input.reviewCount >= 30
            ? "Review growth lead"
            : "Vine owner";
  const moveNow =
    !input.brandRegistered || !input.fbaReady
      ? "Close Brand Registry and FBA eligibility gaps before planning enrollment"
      : !input.detailPageReady || !input.marketReady
        ? "Fix the detail page and offer readiness before using Vine as proof acceleration"
        : input.marginRate < 15 || input.unitsAvailable < 20
          ? "Raise buffer and margin tolerance before committing units to Vine"
          : input.reviewCount >= 30
            ? "Keep proof growth organic and reserve Vine for thinner-proof launches"
            : "Enroll this SKU in Vine and keep other proof experiments closed";
  const doNotCrossLine =
    !input.brandRegistered || !input.fbaReady
      ? "Do not plan around Vine without Brand Registry and live FBA readiness"
      : !input.detailPageReady || !input.marketReady
        ? "Do not send Vine reviewers into a weak detail page or unready offer"
        : input.marginRate < 15 || input.unitsAvailable < 20
          ? "Do not buy proof acceleration with margin or inventory you cannot spare"
          : input.reviewCount >= 30
            ? "Do not use Vine by habit when the SKU already has enough proof"
            : "Do not run Vine and broad proof experiments at the same time";
  const vineRiskBrief =
    !input.brandRegistered || !input.fbaReady
      ? "Core Vine eligibility is still blocked by Brand Registry or FBA readiness."
      : !input.detailPageReady || !input.marketReady
        ? "The offer is not strong enough yet to benefit cleanly from added review attention."
        : input.marginRate < 15 || input.unitsAvailable < 20
          ? `${round(input.marginRate, 1)}% margin and ${input.unitsAvailable} units leave too little Vine buffer.`
          : input.reviewCount >= 30
            ? `${input.reviewCount} reviews already puts the SKU beyond the cleanest Vine use case.`
            : "Proof gap, readiness, and inventory are aligned enough for a controlled Vine run.";

  return {
    headline:
      !input.brandRegistered || !input.fbaReady
        ? `${commercialCall} - eligibility is the first broken gate`
        : !input.detailPageReady || !input.marketReady
          ? `${commercialCall} - offer readiness is the first broken gate`
          : input.marginRate < 15 || input.unitsAvailable < 20
            ? `${commercialCall} - economics are the first broken gate`
            : input.reviewCount >= 30
              ? `${commercialCall} - proof need is no longer strong enough`
              : `${commercialCall} - the Vine lane is commercially workable`,
    summary:
      "This Vine read decides whether enrollment should happen now, which proof gate is broken first, who owns the fix, and which other proof moves must stay closed so the next result is interpretable.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${moveNow}. ${decisionOwner} owns the first Vine lane.`,
      },
      {
        label: "Open lane",
        value: moveNow,
        detail: vineRiskBrief,
      },
      {
        label: "Review count",
        value: `${input.reviewCount}`,
        detail: `${input.launchStage} stage`,
      },
      {
        label: "Margin",
        value: `${round(input.marginRate, 1)}%`,
        detail: `${input.unitsAvailable} units available`,
      },
      {
        label: "Brand readiness",
        value: input.brandRegistered ? "Registered" : "Missing",
        detail: input.marketReady ? "Offer ready" : "Offer not ready",
      },
      {
        label: "Vine fit",
        value: `${score}%`,
        detail: "Higher means stronger reason to enroll",
      },
      {
        label: "Eligibility gates",
        value: input.fbaReady ? "FBA live" : "FBA missing",
        detail: input.detailPageReady ? "Detail page complete" : "Image/description gap",
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep one proof-acceleration lane open so you can tell whether readiness or proof need changed the result.",
      },
    ],
    recommendations: [
      input.reviewCount < 15 && input.brandRegistered && input.marketReady
        ? "Vine is a reasonable option if margin and unit buffer can absorb it."
        : "Do not use Vine by default if the SKU already has enough proof or weak economics.",
      input.marginRate < 15
        ? "Do not pay for proof acceleration until economics can survive it."
        : "Economics are workable enough if the proof gap is real.",
      input.detailPageReady
        ? "Use Vine for proof acceleration, not as a substitute for listing or product quality work."
        : "Do not send traffic or reviewers into an unfinished detail page. Fix the page first.",
      input.unitsAvailable < 20
        ? "Protect the unit buffer first or the program will strain launch inventory."
        : "Keep Vine scoped to the proof gap you actually need to close, not a broad hope for momentum.",
      `Re-run only when this same lane changes state: ${moveNow.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "Vine fit looks usable",
      warning: "Vine fit needs caution",
      critical: "Vine fit is weak",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Enroll in Vine",
      caution: "Tighten readiness first",
      stop: "Do not use Vine yet",
    }, {
      go: "The proof gap and offer readiness are aligned enough to justify a controlled Vine enrollment.",
      caution: "Vine could help, but economics, unit buffer, or page readiness should tighten before enrollment.",
      stop: "The current SKU is too weak economically or operationally to justify a Vine run now.",
    }),
    missingItems: [
      !input.brandRegistered ? "Brand Registry readiness" : "",
      input.unitsAvailable < 20 ? "Enough sample units" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${moveNow.toLowerCase()}.`,
      "Confirm unit buffer and margin tolerance.",
      "Assign one owner to detail-page readiness and one to inventory tolerance before enrolling.",
      "Re-run after review count or readiness changes.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

export function evaluateProductBundling(input: {
  marketplace: string;
  componentCount: number;
  complementaryScore: number;
  marginRate: number;
  bundleDiscountRate: number;
  clarityScore: number;
  aovLiftScore: number;
  brandRepresentative: boolean;
  fbaReady: boolean;
}) {
  const alerts: string[] = [];
  let score = 100;

  if (input.componentCount < 2) {
    alerts.push("A bundle needs at least two clear components.");
    score -= 24;
  }
  if (input.complementaryScore < 60) {
    alerts.push("The items do not look complementary enough yet.");
    score -= 14;
  }
  if (input.marginRate - input.bundleDiscountRate * 100 < 10) {
    alerts.push("Bundle discounting erodes too much contribution margin.");
    score -= 16;
  }
  if (input.clarityScore < 60) {
    alerts.push("Offer clarity is weak, so shoppers may not understand the bundle value fast enough.");
    score -= 12;
  }
  if (input.marketplace !== "US") {
    alerts.push("Amazon's virtual bundle tool is a US-store workflow, so this bundle may not map cleanly to the selected market.");
    score -= 18;
  }
  if (!input.brandRepresentative) {
    alerts.push("Bundle creation access is weak because Brand Representative status is not ready.");
    score -= 16;
  }
  if (!input.fbaReady) {
    alerts.push("Bundle components need active FBA inventory to be buildable and stay buyable.");
    score -= 14;
  }
  if (input.componentCount > 5) {
    alerts.push("Virtual product bundles cap out at five component ASINs.");
    score -= 14;
  }

  score = Math.max(0, score);
  const evidence = getProductBundlingPolicyEvidence({
    marketplace: input.marketplace,
    brandRepresentative: input.brandRepresentative,
    fbaReady: input.fbaReady,
    componentCount: input.componentCount,
  });
  const effectiveMargin = input.marginRate - input.bundleDiscountRate * 100;
  const commercialCall =
    input.marketplace !== "US" || !input.brandRepresentative || !input.fbaReady
      ? "Fix bundle eligibility before building the offer"
      : input.componentCount < 2 || input.componentCount > 5
        ? "Reset the component set before trying to launch this bundle"
        : input.complementaryScore < 60
          ? "Tighten product fit before touching bundle pricing"
          : effectiveMargin < 10
            ? "Repair bundle economics before launch"
            : input.clarityScore < 60
              ? "Clarify the bundle promise before sending traffic"
              : "Launch one focused bundle and keep the rest closed";
  const decisionOwner =
    input.marketplace !== "US" || !input.brandRepresentative || !input.fbaReady
      ? "Bundle eligibility lead"
      : input.componentCount < 2 || input.componentCount > 5
        ? "Assortment lead"
        : input.complementaryScore < 60
          ? "Merchandising lead"
          : effectiveMargin < 10
            ? "Bundle economics lead"
            : input.clarityScore < 60
              ? "Offer clarity lead"
              : "Bundle owner";
  const moveNow =
    input.marketplace !== "US" || !input.brandRepresentative || !input.fbaReady
      ? "Close marketplace, Brand Representative, and FBA readiness gaps before building the bundle"
      : input.componentCount < 2 || input.componentCount > 5
        ? "Reset the component mix into one valid bundle set before pricing work continues"
        : input.complementaryScore < 60
          ? "Improve functional fit between the items before adjusting discount depth"
          : effectiveMargin < 10
            ? "Reduce discount pressure or raise perceived value before launch"
            : input.clarityScore < 60
              ? "Rewrite the bundle promise until the value is obvious in one pass"
              : "Launch one use-case-led bundle and keep other concepts frozen";
  const doNotCrossLine =
    input.marketplace !== "US" || !input.brandRepresentative || !input.fbaReady
      ? "Do not build a virtual bundle without the required store and access prerequisites"
      : input.componentCount < 2 || input.componentCount > 5
        ? "Do not force an invalid component set into production"
        : input.complementaryScore < 60
          ? "Do not solve weak product fit with deeper discounting"
          : effectiveMargin < 10
            ? "Do not buy traffic into a bundle with broken contribution margin"
            : input.clarityScore < 60
              ? "Do not send traffic into a bundle shoppers cannot understand quickly"
              : "Do not launch multiple vague bundle concepts at once";
  const bundleRiskBrief =
    input.marketplace !== "US" || !input.brandRepresentative || !input.fbaReady
      ? "Bundle creation is blocked by marketplace, access, or FBA readiness."
      : input.componentCount < 2 || input.componentCount > 5
        ? `${input.componentCount} components does not fit a clean virtual bundle setup.`
        : input.complementaryScore < 60
          ? `${input.complementaryScore}% complementarity is too weak for a convincing bundle promise.`
          : effectiveMargin < 10
            ? `${round(effectiveMargin, 1)}% effective bundle margin is too thin to defend.`
            : input.clarityScore < 60
              ? `${input.clarityScore}% clarity is too weak for a fast retail read.`
              : `${input.componentCount} components and ${round(effectiveMargin, 1)}% margin support one focused launch.`;

  return {
    headline:
      input.marketplace !== "US" || !input.brandRepresentative || !input.fbaReady
        ? `${commercialCall} - eligibility is the first broken gate`
        : input.componentCount < 2 || input.componentCount > 5
          ? `${commercialCall} - component structure is the first broken gate`
          : input.complementaryScore < 60
            ? `${commercialCall} - product fit is the first broken gate`
            : effectiveMargin < 10
              ? `${commercialCall} - economics are the first broken gate`
              : input.clarityScore < 60
                ? `${commercialCall} - shopper clarity is the first broken gate`
                : `${commercialCall} - the bundle lane is commercially workable`,
    summary:
      "This bundle read decides whether the offer should launch now, which bundle gate is broken first, who owns the fix, and which other bundle concepts must stay closed so the next result is readable.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${moveNow}. ${decisionOwner} owns the first bundle lane.`,
      },
      {
        label: "Open lane",
        value: moveNow,
        detail: bundleRiskBrief,
      },
      {
        label: "Components",
        value: `${input.componentCount}`,
        detail: `${input.complementaryScore}% complementarity score`,
      },
      {
        label: "Margin",
        value: `${round(input.marginRate, 1)}%`,
        detail: `${round(input.bundleDiscountRate * 100, 1)}% bundle discount`,
      },
      {
        label: "Eligibility",
        value: input.brandRepresentative ? "Brand ready" : "Brand role gap",
        detail: input.fbaReady ? `${input.marketplace} with FBA` : "FBA inventory gap",
      },
      {
        label: "Clarity",
        value: `${input.clarityScore}%`,
        detail: `${input.aovLiftScore}% AOV lift potential`,
      },
      {
        label: "Bundle fit",
        value: `${score}%`,
        detail: "Higher means the bundle is commercially easier to defend",
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep one bundle concept open so you can tell whether fit, economics, or clarity changed the result.",
      },
    ],
    recommendations: [
      input.complementaryScore < 60
        ? "Do not launch the bundle yet. Tighten functional fit between items before thinking about price."
        : "Complementarity is good enough to move into pricing and copy design.",
      input.marginRate - input.bundleDiscountRate * 100 < 10
        ? "Do not buy traffic into this bundle yet. Reduce discount depth or raise perceived value before launch."
        : "Margin survives the current bundle concept well enough for testing.",
      input.clarityScore < 60
        ? "Simplify the bundle promise so shoppers understand why the pair belongs together immediately."
        : "Offer clarity is workable enough for listing and bundle-page execution.",
      !input.brandRepresentative || !input.fbaReady
        ? "Fix creation access and FBA readiness before copy or creative work expands."
        : "Once access and FBA are stable, keep each bundle attached to one use case instead of a vague value stack.",
      `Re-run only when this same lane changes state: ${moveNow.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "Bundle concept looks usable",
      warning: "Bundle concept needs work",
      critical: "Bundle concept is weak",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Launch one focused bundle",
      caution: "Tighten economics or clarity first",
      stop: "Do not launch this bundle yet",
    }, {
      go: "The bundle is commercially coherent enough to launch as one clear use-case offer and learn from real demand.",
      caution: "The bundle could work, but economics, eligibility, or shopper clarity should be tightened before traffic or creative effort expands.",
      stop: "The current bundle idea is too weak or blocked to justify launch work right now.",
    }),
    missingItems: [
      input.componentCount < 2 ? "A real multi-item bundle" : "",
      input.clarityScore < 60 ? "Clearer value proposition" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${moveNow.toLowerCase()}.`,
      "Then pressure-test the bundle margin and copy clarity.",
      "Assign one owner to economics and one to component availability before launch.",
      "Re-run after final component selection or pricing changes.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

export function evaluateListingImages(input: {
  existingImageCount: number;
  benefitCount: number;
  objectionCount: number;
  differentiatorCount: number;
  mobileReadyCount: number;
  infographicCount: number;
}) {
  const alerts: string[] = [];
  let score = 100;
  let firstImageStep = "Lock image jobs before art direction.";
  let firstImageReason = "The sequence gets easier to execute once each image has one commercial job.";

  if (input.existingImageCount < 6) {
    alerts.push("Image stack is still thin for a competitive listing.");
    score -= 16;
  }
  if (input.benefitCount < 3) {
    alerts.push("Not enough benefit angles are mapped into the image brief yet.");
    score -= 12;
  }
  if (input.objectionCount < 2) {
    alerts.push("Buyer objections are underrepresented in the current image plan.");
    score -= 10;
  }
  if (input.mobileReadyCount < 3) {
    alerts.push("Too few images are clearly designed for fast mobile comprehension.");
    score -= 12;
  }
  if (input.infographicCount < 2) {
    alerts.push("Infographic support is thin for explaining dimensions or feature proof.");
    score -= 10;
  }
  if (input.differentiatorCount < 2) {
    alerts.push("The brief does not yet show enough differentiated reasons to choose this product visually.");
  }

  if (input.existingImageCount < 6) {
    firstImageStep = "Expand the image stack before fine-tuning sequence.";
    firstImageReason = "Basic coverage is still too light to support a strong retail image flow.";
  } else if (input.mobileReadyCount < 3) {
    firstImageStep = "Prioritize more mobile-first images before polishing details.";
    firstImageReason = "Fast mobile comprehension usually drives more lift than decorative complexity.";
  } else if (input.objectionCount < 2) {
    firstImageStep = "Add an objection-handling image before adding more aspirational shots.";
    firstImageReason = "The current brief still underweights the buyer hesitation that blocks conversion.";
  } else if (input.infographicCount < 2) {
    firstImageStep = "Add more infographic-style proof before refining lifestyle balance.";
    firstImageReason = "Dimensions, feature proof, and explanation are still too thin in the current stack.";
  } else if (input.differentiatorCount < 2) {
    firstImageStep = "Clarify differentiated reasons before styling more assets.";
    firstImageReason = "Without a sharper product gap, additional images risk repeating generic claims.";
  }

  score = Math.max(0, score);
  const executionCall =
    input.existingImageCount < 6
      ? "Expand the image stack first"
      : input.mobileReadyCount < 3
        ? "Add more mobile-first frames"
        : input.objectionCount < 2
          ? "Add objection-handling images"
          : input.infographicCount < 2
            ? "Add more proof-style graphics"
        : input.differentiatorCount < 2
          ? "Clarify the product gap visually"
          : "Move this brief into production";
  const commercialCall =
    input.existingImageCount < 6
      ? "Fill the missing image stack before briefing production"
      : input.mobileReadyCount < 3
        ? "Repair mobile readability before polishing the rest of the image set"
        : input.objectionCount < 2
          ? "Add objection-handling frames before expanding lifestyle shots"
          : input.infographicCount < 2
            ? "Add proof graphics before styling more variation"
            : input.differentiatorCount < 2
              ? "Clarify the visual product gap before producing more assets"
              : "Send this image brief into production as one controlled execution lane";
  const decisionOwner =
    input.existingImageCount < 6
      ? "Creative planning lead"
      : input.mobileReadyCount < 3
        ? "Mobile conversion lead"
        : input.objectionCount < 2
          ? "Conversion proof lead"
          : input.infographicCount < 2
            ? "Visual proof lead"
            : input.differentiatorCount < 2
              ? "Positioning lead"
              : "Image production owner";
  const moveNow =
    input.existingImageCount < 6
      ? "Expand the stack to a complete set before art direction refinement"
      : input.mobileReadyCount < 3
        ? "Rewrite the next frames for fast mobile comprehension and keep styling changes frozen"
        : input.objectionCount < 2
          ? "Add the strongest objection-handling image before opening more aspirational concepts"
          : input.infographicCount < 2
            ? "Build one more proof-style infographic before broadening the sequence"
            : input.differentiatorCount < 2
              ? "Clarify the visual win message before producing more generic frames"
              : "Produce the current image brief and keep new concepts closed until it ships";
  const doNotCrossLine =
    input.existingImageCount < 6
      ? "Do not polish art direction while the image stack is still incomplete"
      : input.mobileReadyCount < 3
        ? "Do not optimize decorative detail before mobile comprehension is fixed"
        : input.objectionCount < 2
          ? "Do not add more lifestyle variety while buyer objections are still unanswered"
          : input.infographicCount < 2
            ? "Do not skip proof graphics and hope the hero alone will carry conversion"
            : input.differentiatorCount < 2
              ? "Do not keep adding generic images without a clear product win"
              : "Do not redesign the whole image set while one production lane is already clear";
  const imageRiskBrief =
    input.existingImageCount < 6
      ? `${input.existingImageCount} images is still too thin for a competitive retail stack.`
      : input.mobileReadyCount < 3
        ? `${input.mobileReadyCount} frames are mobile-ready, which is too few for fast small-screen comprehension.`
        : input.objectionCount < 2
          ? `${input.objectionCount} objection-handling frames leaves core buying hesitation under-covered.`
          : input.infographicCount < 2
            ? `${input.infographicCount} proof graphics is too light for explanation-heavy retail decisions.`
            : input.differentiatorCount < 2
              ? `${input.differentiatorCount} differentiators is not enough to anchor a strong visual gap.`
              : "The image brief has enough coverage, proof, and mobile clarity for a controlled production run.";

  return {
    headline:
      input.existingImageCount < 6
        ? `${commercialCall} - coverage is the first broken gate`
        : input.mobileReadyCount < 3
          ? `${commercialCall} - mobile clarity is the first broken gate`
          : input.objectionCount < 2
            ? `${commercialCall} - objection coverage is the first broken gate`
            : input.infographicCount < 2
              ? `${commercialCall} - proof density is the first broken gate`
              : input.differentiatorCount < 2
                ? `${commercialCall} - differentiation is the first broken gate`
                : `${commercialCall} - the image production lane is workable`,
    summary:
      "This image brief read decides whether production should start now, which visual job is broken first, who owns the next fix, and which other image changes must stay closed so the next result is interpretable.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${moveNow}. ${decisionOwner} owns the first image lane.`,
      },
      {
        label: "Open lane",
        value: moveNow,
        detail: imageRiskBrief,
      },
      {
        label: "Existing images",
        value: `${input.existingImageCount}`,
        detail: `${input.mobileReadyCount} mobile-first images planned`,
      },
      {
        label: "Benefits",
        value: `${input.benefitCount}`,
        detail: `${input.differentiatorCount} differentiators to visualize`,
      },
      {
        label: "Objections",
        value: `${input.objectionCount}`,
        detail: `${input.infographicCount} infographic-style images`,
      },
      {
        label: "Plan score",
        value: `${score}%`,
        detail: "Higher means the image brief is commercially usable",
      },
      {
        label: "Proof density",
        value: `${input.differentiatorCount}/${input.infographicCount}`,
        detail: "Differentiators versus infographic-style proof images",
      },
      {
        label: "First image step",
        value: firstImageStep,
        detail: firstImageReason,
      },
      {
        label: "Execution call",
        value: executionCall,
        detail: firstImageReason,
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep one image-execution lane open so you can tell whether coverage, clarity, or proof changed the conversion surface.",
      },
    ],
    recommendations: [
      input.existingImageCount < 6
        ? "Do not polish art direction yet. Expand the stack before fine-tuning sequence because basic coverage is still light."
        : "Image depth is workable enough to focus on sequencing and proof hierarchy next.",
      input.objectionCount < 2
        ? "Use at least one image to resolve the biggest buyer hesitation directly before adding more lifestyle variation."
        : "Objection coverage is good enough to balance aspiration with explanation.",
      input.mobileReadyCount < 3
        ? "Prioritize mobile readability before decorative detail. Small-screen comprehension is still underbuilt."
        : "Design every non-hero image around one job only: educate, prove, compare, or reassure.",
      input.differentiatorCount < 2
        ? "Do not keep adding generic images. Clarify why this product wins first."
        : "Keep the image stack anchored to differentiated proof, not aesthetic variety alone.",
      `Re-run only when this same lane changes state: ${moveNow.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "Image plan looks usable",
      warning: "Image plan needs work",
      critical: "Image plan is thin",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Produce this image set",
      caution: "Fill the missing image jobs first",
      stop: "Do not brief production yet",
    }, {
      go: "The brief is commercially clear enough to move into production and sequence testing.",
      caution: "The image plan is close, but one or two missing proof jobs should be added before art production begins.",
      stop: "The current image brief is still too thin to justify production time or creative budget.",
    }),
    missingItems: [
      input.existingImageCount < 6 ? "Full image stack" : "",
      input.objectionCount < 2 ? "Objection-resolution images" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${moveNow.toLowerCase()}.`,
      "Assign one owner to copy proof, one to visual production, and one to mobile QA.",
      "Push mobile readability before decorative complexity.",
      "Re-run after asset capture or new objections emerge.",
    ],
    evidence: listingImagesEvidence,
  } satisfies ToolEvaluation;
}

export function evaluateProductPhotography(input: {
  shotCount: number;
  useCaseCount: number;
  featureCount: number;
  propCount: number;
  retouchNeedCount: number;
  studioReady: boolean;
}) {
  const alerts: string[] = [];
  let score = 100;
  let firstShootStep = "Lock the shot order before styling details.";
  let firstShootReason = "A clear shot sequence keeps the brief commercial instead of decorative.";

  if (input.shotCount < 6) {
    alerts.push("Shot list is too short for a production-ready Amazon photography brief.");
    score -= 16;
  }
  if (input.useCaseCount < 2) {
    alerts.push("Use-case coverage is thin, so the photography plan lacks context shots.");
    score -= 10;
  }
  if (input.featureCount < 3) {
    alerts.push("Not enough product features are mapped into photography priorities.");
    score -= 10;
  }
  if (input.retouchNeedCount > input.shotCount) {
    alerts.push("Retouching burden is unusually high relative to the planned shot count.");
    score -= 10;
  }
  if (!input.studioReady) {
    alerts.push("Production setup is not ready enough for efficient capture.");
    score -= 14;
  }
  if (input.propCount > input.shotCount) {
    alerts.push("Prop complexity is high relative to the shot count, which may overcomplicate production.");
  }

  if (!input.studioReady) {
    firstShootStep = "Fix studio and production setup before adding more shot complexity.";
    firstShootReason = "Production friction will burn time and budget faster than a thin creative brief.";
  } else if (input.shotCount < 6) {
    firstShootStep = "Expand the shot list before debating art direction.";
    firstShootReason = "The current brief is still too short to cover hero, feature, scale, and lifestyle jobs.";
  } else if (input.useCaseCount < 2) {
    firstShootStep = "Add more use-case scenes before polishing support shots.";
    firstShootReason = "Context imagery is still too thin to show how the product fits into real use.";
  } else if (input.featureCount < 3) {
    firstShootStep = "Map more product features into the shot plan first.";
    firstShootReason = "Without feature priorities, the camera plan stays generic and hard to convert.";
  } else if (input.retouchNeedCount > input.shotCount) {
    firstShootStep = "Reduce retouch burden before expanding the brief.";
    firstShootReason = "Too many cleanup-heavy shots can slow production and weaken consistency.";
  }

  score = Math.max(0, score);
  const commercialCall =
    !input.studioReady
      ? "Fix production setup before booking the shoot"
      : input.shotCount < 6
        ? "Expand the shot list before locking the shoot day"
        : input.useCaseCount < 2
          ? "Add real use-case scenes before polishing support shots"
          : input.featureCount < 3
            ? "Map more feature jobs before production spend goes live"
            : input.retouchNeedCount > input.shotCount
              ? "Reduce retouch burden before scaling this shoot plan"
              : "Book the shoot and keep the brief disciplined";
  const decisionOwner =
    !input.studioReady
      ? "Production operations lead"
      : input.shotCount < 6
        ? "Shot planning lead"
        : input.useCaseCount < 2
          ? "Use-case merchandising lead"
          : input.featureCount < 3
            ? "Feature proof lead"
            : input.retouchNeedCount > input.shotCount
              ? "Retouch control lead"
              : "Photography owner";
  const moveNow =
    !input.studioReady
      ? "Fix studio setup and logistics before adding more shot complexity"
      : input.shotCount < 6
        ? "Expand the shot list to cover hero, feature, scale, and lifestyle before booking"
        : input.useCaseCount < 2
          ? "Add at least one stronger use-case scene and keep styling variations frozen"
          : input.featureCount < 3
            ? "Map more product-feature priorities before finalizing the camera plan"
            : input.retouchNeedCount > input.shotCount
              ? "Cut cleanup-heavy concepts before production spend goes live"
              : "Book the current shoot plan and keep extra concepts closed until capture is complete";
  const doNotCrossLine =
    !input.studioReady
      ? "Do not book a shoot before the studio and logistics are ready"
      : input.shotCount < 6
        ? "Do not debate styling while the shot plan is still incomplete"
        : input.useCaseCount < 2
          ? "Do not spend on aesthetic variety while context coverage is still thin"
          : input.featureCount < 3
            ? "Do not let generic lifestyle imagery replace feature proof"
            : input.retouchNeedCount > input.shotCount
              ? "Do not overload the shoot with retouch-heavy concepts"
              : "Do not change shot count, props, and retouch scope all at once";
  const photographyRiskBrief =
    !input.studioReady
      ? "Production setup is still too weak for an efficient commercial shoot."
      : input.shotCount < 6
        ? `${input.shotCount} shots is too short for a strong Amazon photography set.`
        : input.useCaseCount < 2
          ? `${input.useCaseCount} use-case setups leaves the product too abstract in real use.`
          : input.featureCount < 3
            ? `${input.featureCount} mapped feature jobs is too thin for a conversion-first shoot.`
            : input.retouchNeedCount > input.shotCount
              ? `${input.retouchNeedCount} retouch-heavy concepts is too much relative to ${input.shotCount} planned shots.`
              : "The current shoot plan has enough structure, context, and operational readiness for a controlled production run.";

  return {
    headline:
      !input.studioReady
        ? `${commercialCall} - setup is the first broken gate`
        : input.shotCount < 6
          ? `${commercialCall} - coverage is the first broken gate`
          : input.useCaseCount < 2
            ? `${commercialCall} - context is the first broken gate`
            : input.featureCount < 3
              ? `${commercialCall} - feature proof is the first broken gate`
              : input.retouchNeedCount > input.shotCount
                ? `${commercialCall} - production complexity is the first broken gate`
                : `${commercialCall} - the shoot lane is commercially workable`,
    summary:
      "This shoot read decides whether production should be booked now, which capture gate is broken first, who owns the next fix, and which other changes must stay frozen so the next result is readable.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${moveNow}. ${decisionOwner} owns the first shoot lane.`,
      },
      {
        label: "Open lane",
        value: moveNow,
        detail: photographyRiskBrief,
      },
      {
        label: "Shot count",
        value: `${input.shotCount}`,
        detail: `${input.useCaseCount} use-case setups`,
      },
      {
        label: "Feature coverage",
        value: `${input.featureCount}`,
        detail: `${input.propCount} prop or scene elements`,
      },
      {
        label: "Retouch burden",
        value: `${input.retouchNeedCount}`,
        detail: input.studioReady ? "Studio setup ready" : "Studio setup still weak",
      },
      {
        label: "Plan score",
        value: `${score}%`,
        detail: "Higher means the photography brief is ready to execute",
      },
      {
        label: "Shoot complexity",
        value: `${input.propCount}/${input.retouchNeedCount}`,
        detail: "Props or scene elements versus retouch-heavy shots",
      },
      {
        label: "First shoot step",
        value: firstShootStep,
        detail: firstShootReason,
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep one production lane open so you can tell whether setup, shot coverage, or feature proof improved the brief.",
      },
    ],
    recommendations: [
      input.shotCount < 6
        ? "Do not brief the shoot crew yet. Expand the shot list before debating styling details."
        : "Shot volume is workable enough to focus on prioritization and order next.",
      !input.studioReady
        ? "Fix setup and logistics before adding more shot complexity."
        : "Production setup is workable enough to move into detailed sequencing.",
      input.retouchNeedCount > input.shotCount
        ? "Reduce retouch-heavy concepts before expanding the brief, or the shoot will get expensive and slow."
        : "Separate hero, feature, scale, and lifestyle shots so each image has one job.",
      input.useCaseCount < 2
        ? "Do not spend extra on styling variety while real use-case coverage is still thin."
        : "Keep the brief anchored to commercial jobs instead of decorative scene variety.",
      `Re-run only when this same lane changes state: ${moveNow.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "Photography plan looks usable",
      warning: "Photography plan needs tightening",
      critical: "Photography plan is weak",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Book the shoot",
      caution: "Tighten the shot plan first",
      stop: "Do not schedule production yet",
    }, {
      go: "The shot plan is strong enough to schedule production and hold the crew to a commercial brief.",
      caution: "The shoot is plausible, but setup, use-case coverage, or feature priorities should be tightened before booking.",
      stop: "The current photography brief is too weak or operationally loose to justify a scheduled shoot.",
    }),
    missingItems: [
      input.shotCount < 6 ? "Full shot list" : "",
      !input.studioReady ? "Studio or production readiness" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${moveNow.toLowerCase()}.`,
      "Keep one commercial job per image.",
      "Assign one owner to shot priorities, one to production logistics, and one to retouch control.",
      "Re-run after feature or use-case priorities change.",
    ],
    evidence: productPhotographyEvidence,
  } satisfies ToolEvaluation;
}

export function evaluateStorefrontDesign(input: {
  catalogCount: number;
  collectionCount: number;
  audienceSegmentCount: number;
  trafficSourceCount: number;
  navDepth: number;
  seasonalReady: boolean;
  brandStoryReady: boolean;
  storeLinkedFromBrandStory: boolean;
  experimentReady: boolean;
}) {
  const alerts: string[] = [];
  let score = 100;
  let firstStoreStep = "Lock collection hierarchy first.";
  let firstStoreReason = "The store gets easier to route once the collection structure is stable.";

  if (input.catalogCount < 5) {
    alerts.push("Catalog depth may be too light for a meaningful storefront hierarchy.");
    score -= 12;
  }
  if (input.collectionCount < 2) {
    alerts.push("Collection structure is too shallow for clear store navigation.");
    score -= 14;
  }
  if (input.audienceSegmentCount < 2) {
    alerts.push("Audience segmentation is thin, so traffic routing will stay generic.");
    score -= 10;
  }
  if (input.trafficSourceCount < 2) {
    alerts.push("Traffic plan is too narrow for a useful store experience.");
    score -= 10;
  }
  if (input.navDepth > 3) {
    alerts.push("Navigation depth is too heavy for a fast retail storefront.");
    score -= 10;
  }
  if (!input.seasonalReady) {
    alerts.push("Seasonal or promotional rotation is not planned yet.");
    score -= 8;
  }
  if (!input.brandStoryReady) {
    alerts.push("Brand Story is not ready, so the PDP to storefront path is weaker.");
    score -= 10;
  }
  if (!input.storeLinkedFromBrandStory) {
    alerts.push("The storefront is not clearly linked from Brand Story or other brand modules.");
    score -= 8;
  }
  if (!input.experimentReady) {
    alerts.push("No published Brand Story testing path is ready for validating storefront changes.");
    score -= 8;
  }
  if (input.collectionCount > 0 && input.catalogCount / input.collectionCount < 2) {
    alerts.push("Collections may be too fragmented relative to the current catalog depth.");
  }

  if (input.collectionCount < 2) {
    firstStoreStep = "Create clearer collection groupings before layout work.";
    firstStoreReason = "Weak collection structure makes every other routing and design choice noisier.";
  } else if (input.trafficSourceCount < 2) {
    firstStoreStep = "Add more traffic-entry paths before refining modules.";
    firstStoreReason = "A storefront without multiple entry paths is still too narrow to measure well.";
  } else if (input.navDepth > 3) {
    firstStoreStep = "Flatten navigation before adding more pages.";
    firstStoreReason = "Deep store hierarchies slow shopper movement and weaken campaign landings.";
  } else if (!input.brandStoryReady || !input.storeLinkedFromBrandStory) {
    firstStoreStep = "Strengthen the PDP-to-store route before polishing page layout.";
    firstStoreReason = "The store cannot carry brand traffic well if the main product surfaces do not feed it.";
  } else if (!input.experimentReady) {
    firstStoreStep = "Set up a test path before large storefront changes.";
    firstStoreReason = "Without a test path, store iteration turns into taste-driven editing instead of measured routing.";
  }

  score = Math.max(0, score);
  const evidence = getStorefrontPolicyEvidence({
    brandStoryReady: input.brandStoryReady,
    storeLinkedFromBrandStory: input.storeLinkedFromBrandStory,
    experimentReady: input.experimentReady,
    seasonalReady: input.seasonalReady,
    collectionCount: input.collectionCount,
    trafficSourceCount: input.trafficSourceCount,
  });
  const commercialCall =
    input.collectionCount < 2
      ? "Fix collection architecture before redesigning the storefront"
      : input.trafficSourceCount < 2 || input.audienceSegmentCount < 2
        ? "Repair traffic routing before treating the store like a destination"
        : input.navDepth > 3
          ? "Flatten navigation before adding more store depth"
          : !input.brandStoryReady || !input.storeLinkedFromBrandStory
            ? "Repair the PDP-to-store route before spending on layout polish"
            : !input.experimentReady
              ? "Set up a test path before expanding storefront work"
              : "Launch this storefront structure as one controlled traffic lane";
  const decisionOwner =
    input.collectionCount < 2
      ? "Store IA lead"
      : input.trafficSourceCount < 2 || input.audienceSegmentCount < 2
        ? "Traffic routing lead"
        : input.navDepth > 3
          ? "Navigation lead"
          : !input.brandStoryReady || !input.storeLinkedFromBrandStory
            ? "Brand route lead"
            : !input.experimentReady
              ? "Experimentation lead"
              : "Storefront owner";
  const moveNow =
    input.collectionCount < 2
      ? "Create clearer collection groupings before touching page layout"
      : input.trafficSourceCount < 2 || input.audienceSegmentCount < 2
        ? "Add clearer entry paths and audience routes before widening the store structure"
        : input.navDepth > 3
          ? "Flatten the nav and keep new pages frozen until shopper flow is shorter"
          : !input.brandStoryReady || !input.storeLinkedFromBrandStory
            ? "Strengthen the PDP-to-store route before refining design modules"
            : !input.experimentReady
              ? "Publish one measurable test path before making broader storefront edits"
              : "Launch the current storefront structure and keep extra hierarchy changes closed";
  const doNotCrossLine =
    input.collectionCount < 2
      ? "Do not polish layout before the collection structure is real"
      : input.trafficSourceCount < 2 || input.audienceSegmentCount < 2
        ? "Do not redesign a store that still lacks clear traffic jobs"
        : input.navDepth > 3
          ? "Do not add more pages while the store is still too deep to navigate fast"
          : !input.brandStoryReady || !input.storeLinkedFromBrandStory
            ? "Do not buy traffic into a storefront that the PDP barely feeds"
            : !input.experimentReady
              ? "Do not let storefront edits turn into taste-only changes without a test path"
              : "Do not change hierarchy, routing, and page modules all at once";
  const storefrontRiskBrief =
    input.collectionCount < 2
      ? `${input.collectionCount} collections is too shallow for a useful storefront structure.`
      : input.trafficSourceCount < 2 || input.audienceSegmentCount < 2
        ? `${input.trafficSourceCount} traffic sources and ${input.audienceSegmentCount} audience segments are too thin for real routing.`
        : input.navDepth > 3
          ? `${input.navDepth} levels of nav is too deep for a fast retail storefront.`
          : !input.brandStoryReady || !input.storeLinkedFromBrandStory
            ? "The storefront is not being fed cleanly from Brand Story or PDP brand routes."
            : !input.experimentReady
              ? "There is no measured test path to validate bigger storefront changes."
              : "Hierarchy, routing, and brand-entry paths are aligned enough for one controlled launch.";

  return {
    headline:
      input.collectionCount < 2
        ? `${commercialCall} - structure is the first broken gate`
        : input.trafficSourceCount < 2 || input.audienceSegmentCount < 2
          ? `${commercialCall} - routing is the first broken gate`
          : input.navDepth > 3
            ? `${commercialCall} - navigation is the first broken gate`
            : !input.brandStoryReady || !input.storeLinkedFromBrandStory
              ? `${commercialCall} - brand entry is the first broken gate`
              : !input.experimentReady
                ? `${commercialCall} - measurement is the first broken gate`
                : `${commercialCall} - the storefront lane is commercially workable`,
    summary:
      "This storefront read decides whether the store should launch as a traffic destination now, which retail-routing gate is broken first, who owns the fix, and which other store changes must stay closed so the next result is trustworthy.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${moveNow}. ${decisionOwner} owns the first storefront lane.`,
      },
      {
        label: "Open lane",
        value: moveNow,
        detail: storefrontRiskBrief,
      },
      {
        label: "Catalog",
        value: `${input.catalogCount}`,
        detail: `${input.collectionCount} collections mapped`,
      },
      {
        label: "Audience segments",
        value: `${input.audienceSegmentCount}`,
        detail: `${input.trafficSourceCount} traffic sources planned`,
      },
      {
        label: "Nav depth",
        value: `${input.navDepth}`,
        detail: input.seasonalReady ? "Seasonal rotation ready" : "No seasonal rotation plan",
      },
      {
        label: "Plan score",
        value: `${score}%`,
        detail: "Higher means the store IA is usable for traffic landing",
      },
      {
        label: "Brand route",
        value: input.brandStoryReady ? "Live" : "Weak",
        detail: input.storeLinkedFromBrandStory ? "Store linked from brand content" : "No strong PDP entry path",
      },
      {
        label: "Catalog density",
        value: input.collectionCount > 0 ? `${round(input.catalogCount / input.collectionCount, 1)} items` : "0 items",
        detail: "Average catalog depth per collection",
      },
      {
        label: "First store step",
        value: firstStoreStep,
        detail: firstStoreReason,
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep one storefront-change lane open so you can tell whether hierarchy or routing actually improved shopper flow.",
      },
    ],
    recommendations: [
      input.collectionCount < 2
        ? "Do not start page-design polish yet. Create clearer collection groupings before layout work."
        : "Collection structure is workable enough to refine page roles and routing next.",
      input.navDepth > 3
        ? "Flatten the navigation so shoppers can land and move faster."
        : "Navigation depth is reasonable for a retail store flow.",
      !input.brandStoryReady
        ? "Do not treat the store like a traffic destination yet. Publish Brand Story first so the storefront can act as a real branded route from the PDP."
        : "Brand Story is ready to support storefront routing from the PDP.",
      !input.experimentReady
        ? "Set up a measurable test path before making bigger layout changes, or the redesign will turn into taste-driven editing."
        : "Build the homepage around traffic routing jobs, not just brand storytelling.",
      `Re-run only when this same lane changes state: ${moveNow.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "Storefront plan looks usable",
      warning: "Storefront plan needs work",
      critical: "Storefront plan is weak",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Launch the storefront structure",
      caution: "Tighten routing before launch",
      stop: "Do not redesign yet",
    }, {
      go: "The storefront structure is clear enough to launch as a real traffic destination and learn from shopper flow.",
      caution: "The store has a workable base, but hierarchy or routing gaps should be tightened before more design effort goes in.",
      stop: "The current storefront plan is too shallow or unmeasured to justify a redesign push yet.",
    }),
    missingItems: [
      input.collectionCount < 2 ? "Clearer collection architecture" : "",
      input.trafficSourceCount < 2 ? "Traffic routing plan" : "",
      !input.brandStoryReady ? "Brand Story publishing path" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${moveNow.toLowerCase()}.`,
      "Then assign landing roles by audience and traffic source.",
      "Assign one owner to hierarchy, one to traffic routing, and one to experiment measurement.",
      "Re-run after major catalog or campaign changes.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

export function evaluateInternationalListings(input: {
  keywordGoalCount: number;
  complianceCaveatCount: number;
  pricingReady: boolean;
  localizationDepth: number;
  targetLocale: string;
  sourceLocale: string;
  buildInternationalListingsReady: boolean;
  taxesReady: boolean;
}) {
  const alerts: string[] = [];
  let score = 100;
  let firstLocalizationMove = "Lock target-market pricing before polishing copy.";
  let firstLocalizationReason = "Commercial fit usually breaks before wording quality does in a new locale.";

  if (input.keywordGoalCount < 3) {
    alerts.push("Keyword goals are too thin for a localized listing plan.");
    score -= 12;
  }
  if (input.complianceCaveatCount > 2) {
    alerts.push("Compliance caveats are heavy for the current target locale.");
    score -= 18;
  }
  if (!input.pricingReady) {
    alerts.push("Pricing context is not ready for the target market.");
    score -= 14;
  }
  if (input.localizationDepth < 60) {
    alerts.push("Localization depth is too shallow and still reads like direct translation risk.");
    score -= 16;
  }
  if (!input.buildInternationalListingsReady) {
    alerts.push("The Build International Listings operating path is not ready.");
    score -= 10;
  }
  if (!input.taxesReady) {
    alerts.push("Tax and regulation readiness is still incomplete for the target market.");
    score -= 16;
  }
  if (input.sourceLocale === input.targetLocale && input.localizationDepth < 75) {
    alerts.push("The locale is unchanged, but the adaptation depth is still thin for a real market-fit rewrite.");
  }
  if (input.complianceCaveatCount === 0 && !input.taxesReady) {
    alerts.push("Operational tax risk is present even though explicit compliance caveats are not yet fully mapped.");
  }

  if (!input.pricingReady) {
    firstLocalizationMove = "Set local price, fee, and tax context before deeper localization.";
    firstLocalizationReason = "Without local economics, the page can be well translated and still commercially wrong.";
  } else if (!input.taxesReady || input.complianceCaveatCount > 2) {
    firstLocalizationMove = "Resolve policy and tax caveats before claim expansion.";
    firstLocalizationReason = "Cross-market copy that outruns compliance creates expensive cleanup later.";
  } else if (input.localizationDepth < 60) {
    firstLocalizationMove = "Rewrite for local buyer intent instead of translating literally.";
    firstLocalizationReason = "Shallow localization usually misses search behavior and buying objections in the target market.";
  } else if (!input.buildInternationalListingsReady) {
    firstLocalizationMove = "Fix the cross-market operating path before publishing localized copy.";
    firstLocalizationReason = "A workable listing still stalls if the catalog sync path is not ready.";
  }

  score = Math.max(0, score);
  const evidence = getInternationalListingsPolicyEvidence({
    pricingReady: input.pricingReady,
    localizationDepth: input.localizationDepth,
    buildInternationalListingsReady: input.buildInternationalListingsReady,
    taxesReady: input.taxesReady,
  });
  const commercialCall =
    !input.pricingReady
      ? "Fix target-market economics before localizing deeper"
      : !input.taxesReady || input.complianceCaveatCount > 2
        ? "Repair policy and tax readiness before publishing this listing"
        : input.localizationDepth < 60
          ? "Rewrite for local buyer intent before going live"
          : !input.buildInternationalListingsReady
            ? "Fix the cross-market operating path before publishing"
            : input.keywordGoalCount < 3
              ? "Tighten market-search intent before final publish"
              : "Publish this localized listing and keep the rest frozen";
  const decisionOwner =
    !input.pricingReady
      ? "Local economics lead"
      : !input.taxesReady || input.complianceCaveatCount > 2
        ? "Compliance lead"
        : input.localizationDepth < 60
          ? "Localization lead"
          : !input.buildInternationalListingsReady
            ? "International operations lead"
            : input.keywordGoalCount < 3
              ? "Search localization lead"
              : "International listing owner";
  const moveNow =
    !input.pricingReady
      ? "Set target-market price, fee, and tax context before rewriting more copy"
      : !input.taxesReady || input.complianceCaveatCount > 2
        ? "Close tax and compliance caveats before expanding live claims"
        : input.localizationDepth < 60
          ? "Rewrite for target-market buyer intent and keep literal translation cleanup closed"
          : !input.buildInternationalListingsReady
            ? "Fix the BIL operating path before publishing localized copy"
            : input.keywordGoalCount < 3
              ? "Add stronger target-market keyword intent before final publish"
              : "Publish this localized listing and keep other locale changes closed until readout";
  const doNotCrossLine =
    !input.pricingReady
      ? "Do not localize copy while target-market economics are still wrong"
      : !input.taxesReady || input.complianceCaveatCount > 2
        ? "Do not expand claims while tax or compliance caveats are unresolved"
        : input.localizationDepth < 60
          ? "Do not ship a direct-translation listing into a real market"
          : !input.buildInternationalListingsReady
            ? "Do not spend more on localized copy while the operating path is still broken"
            : input.keywordGoalCount < 3
              ? "Do not publish without a real target-market search brief"
              : "Do not change pricing, compliance, and copy depth all at once";
  const intlRiskBrief =
    !input.pricingReady
      ? "Target-market pricing and fee context is still missing."
      : !input.taxesReady || input.complianceCaveatCount > 2
        ? `${input.complianceCaveatCount} compliance caveats and tax gaps still make the listing unsafe to publish.`
        : input.localizationDepth < 60
          ? `${input.localizationDepth}% localization depth still reads too close to literal translation.`
          : !input.buildInternationalListingsReady
            ? "The Build International Listings operating path is still too weak to support live publishing."
            : input.keywordGoalCount < 3
              ? `${input.keywordGoalCount} keyword goals is too thin for a real market-entry search plan.`
              : "Economics, ops, and buyer-intent adaptation are aligned enough for one controlled publish decision.";

  return {
    headline:
      !input.pricingReady
        ? `${commercialCall} - economics are the first broken gate`
        : !input.taxesReady || input.complianceCaveatCount > 2
          ? `${commercialCall} - policy is the first broken gate`
          : input.localizationDepth < 60
            ? `${commercialCall} - adaptation depth is the first broken gate`
            : !input.buildInternationalListingsReady
              ? `${commercialCall} - operating path is the first broken gate`
              : input.keywordGoalCount < 3
                ? `${commercialCall} - search intent is the first broken gate`
                : `${commercialCall} - the international listing lane is commercially workable`,
    summary:
      "This localization read decides whether the listing should publish now, which market-entry gate is broken first, who owns the fix, and which other localization moves must stay closed so the next result is interpretable.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${moveNow}. ${decisionOwner} owns the first localization lane.`,
      },
      {
        label: "Open lane",
        value: moveNow,
        detail: intlRiskBrief,
      },
      {
        label: "Keyword goals",
        value: `${input.keywordGoalCount}`,
        detail: `${input.sourceLocale} to ${input.targetLocale}`,
      },
      {
        label: "Compliance caveats",
        value: `${input.complianceCaveatCount}`,
        detail: input.pricingReady ? "Pricing context ready" : "Pricing context missing",
      },
      {
        label: "Expansion ops",
        value: input.buildInternationalListingsReady ? "BIL ready" : "BIL gap",
        detail: input.taxesReady ? "Tax path ready" : "Tax path missing",
      },
      {
        label: "Localization depth",
        value: `${input.localizationDepth}%`,
        detail: "Higher means messaging is more adapted to the target market",
      },
      {
        label: "Plan score",
        value: `${score}%`,
        detail: "Higher means localization is commercially usable",
      },
      {
        label: "Adaptation pressure",
        value: `${input.keywordGoalCount}/${input.complianceCaveatCount}`,
        detail: "Keyword ambitions versus compliance caveats in the target locale",
      },
      {
        label: "Ops fit",
        value: input.buildInternationalListingsReady ? "BIL path ready" : "BIL path weak",
        detail: input.pricingReady ? "Pricing localized" : "Pricing still not localized",
      },
      {
        label: "First move",
        value: firstLocalizationMove,
        detail: firstLocalizationReason,
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep one localization lane open so you can tell whether economics, compliance, or buyer-language adaptation changed the outcome.",
      },
    ],
    recommendations: [
      !input.pricingReady
        ? "Do not translate deeper yet. Fix pricing context before polishing wording."
        : "Pricing context is workable enough to move into positioning refinement.",
      input.localizationDepth < 60
        ? "Adapt claims, examples, and keyword intent to the target locale instead of translating literally."
        : "Localization depth is strong enough for listing execution with local QA.",
      !input.taxesReady || input.complianceCaveatCount > 2
        ? "Do not expand claims while tax or compliance caveats are still unresolved."
        : "Keep compliance caveats explicit so copy adaptation does not create policy risk.",
      !input.buildInternationalListingsReady
        ? "Fix the cross-market operating path before spending more on localized copy production."
        : "Once ops are stable, assign localization work to buyer-intent adaptation instead of literal translation cleanup.",
      `Re-run only when this same lane changes state: ${moveNow.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "Localization plan looks usable",
      warning: "Localization plan needs work",
      critical: "Localization plan is weak",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Publish the localized listing",
      caution: "Tighten localization fit first",
      stop: "Do not localize this live yet",
    }, {
      go: "The localized plan is commercially and operationally strong enough to publish into the target market.",
      caution: "The market entry is plausible, but pricing, compliance, or adaptation depth should tighten before publishing.",
      stop: "The current localization work is too shallow or too exposed to publish safely.",
    }),
    missingItems: [
      input.keywordGoalCount < 3 ? "Clearer target-market keyword goals" : "",
      !input.pricingReady ? "Target-market pricing context" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${moveNow.toLowerCase()}.`,
      "Then adapt keyword and buyer-language intent.",
      "Assign one owner to local economics, one to compliance review, and one to copy adaptation.",
      "Re-run when target-market evidence improves.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

export function evaluateBrandTailoredPromotions(input: {
  segmentCount: number;
  productCount: number;
  discountBudget: number;
  retentionGoalScore: number;
  audienceDataReady: boolean;
  channelCount: number;
  audienceSize: number;
  discountRate: number;
  brandRepresentative: boolean;
  activePromotionCount: number;
}) {
  const alerts: string[] = [];
  let score = 100;
  let firstPromoStep = "Define segments before offers.";
  let firstPromoReason = "The offer design gets easier once each segment has one retention job.";

  if (input.segmentCount < 2) {
    alerts.push("Audience segmentation is too thin for tailored promotions.");
    score -= 14;
  }
  if (input.productCount < 1) {
    alerts.push("No clear target products are selected yet.");
    score -= 20;
  }
  if (input.discountBudget <= 0) {
    alerts.push("Discount budget is not defined.");
    score -= 14;
  }
  if (!input.audienceDataReady) {
    alerts.push("Audience data is not ready enough to support tailored targeting.");
    score -= 16;
  }
  if (input.channelCount < 2) {
    alerts.push("Channel spread is too narrow for a useful retention test.");
    score -= 8;
  }
  if (input.audienceSize < 1000) {
    alerts.push("Audience size is below Amazon's minimum threshold for tailored promotions.");
    score -= 22;
  }
  if (input.discountRate < 0.1 || input.discountRate > 0.5) {
    alerts.push("Discount rate is outside Amazon's tailored-promotion range of 10% to 50%.");
    score -= 18;
  }
  if (input.discountBudget < 100) {
    alerts.push("Budget is below Amazon's minimum tailored-promotion threshold.");
    score -= 16;
  }
  if (!input.brandRepresentative) {
    alerts.push("Brand Representative access is missing, so the promotion may not be creatable.");
    score -= 18;
  }
  if (input.activePromotionCount >= 20) {
    alerts.push("Amazon caps active or scheduled Brand Tailored promotions at 20.");
    score -= 12;
  }
  if (input.retentionGoalScore > 70 && input.segmentCount < 3) {
    alerts.push("Retention ambition is high, but segment granularity is still too coarse.");
  }
  if (input.productCount > 0 && input.productCount > input.segmentCount * 3) {
    alerts.push("Product spread is getting too wide for the current segmentation depth.");
  }

  if (!input.audienceDataReady) {
    firstPromoStep = "Fix audience readiness before personalizing offers.";
    firstPromoReason = "Weak audience data makes tailored promotions behave like broad discounts.";
  } else if (input.audienceSize < 1000) {
    firstPromoStep = "Grow the eligible audience before planning a broader promo test.";
    firstPromoReason = "The current audience is below the threshold for a dependable tailored-promotion run.";
  } else if (input.segmentCount < 2) {
    firstPromoStep = "Create at least one repeat-buyer segment and one reactivation segment first.";
    firstPromoReason = "A single segment is too coarse to make the promotion feel truly tailored.";
  } else if (!input.brandRepresentative) {
    firstPromoStep = "Fix Brand Representative access before building more campaign detail.";
    firstPromoReason = "The plan cannot be executed cleanly if the required role access is missing.";
  } else if (input.discountBudget < 100 || input.discountRate < 0.1 || input.discountRate > 0.5) {
    firstPromoStep = "Normalize budget and discount settings before scaling the plan.";
    firstPromoReason = "The offer economics are outside the workable range for a clean tailored-promotion test.";
  } else if (input.activePromotionCount >= 20) {
    firstPromoStep = "Reduce active promotion load before adding another tailored campaign.";
    firstPromoReason = "The account is already at the edge of the active-promotion cap.";
  }

  score = Math.max(0, score);
  const evidence = getBrandTailoredPromotionPolicyEvidence({
    audienceSize: input.audienceSize,
    discountRate: input.discountRate,
    brandRepresentative: input.brandRepresentative,
    activePromotionCount: input.activePromotionCount,
  });
  const commercialCall =
    !input.audienceDataReady
      ? "Fix audience readiness before launching a tailored promotion"
      : input.audienceSize < 1000
        ? "Grow the eligible audience before opening this promo lane"
        : input.segmentCount < 2
          ? "Tighten segmentation before offering personalized discounts"
          : !input.brandRepresentative
            ? "Fix access before building a tailored-promo plan"
            : input.discountBudget < 100 || input.discountRate < 0.1 || input.discountRate > 0.5
              ? "Normalize budget and discount settings before launch"
              : input.activePromotionCount >= 20
                ? "Free promotion capacity before adding another tailored campaign"
                : "Launch one controlled tailored promotion and keep the rest closed";
  const decisionOwner =
    !input.audienceDataReady
      ? "Audience readiness lead"
      : input.audienceSize < 1000
        ? "CRM growth lead"
        : input.segmentCount < 2
          ? "Segmentation lead"
          : !input.brandRepresentative
            ? "Access operations lead"
            : input.discountBudget < 100 || input.discountRate < 0.1 || input.discountRate > 0.5
              ? "Promo economics lead"
              : input.activePromotionCount >= 20
                ? "Promotion operations lead"
                : "Tailored promotion owner";
  const moveNow =
    !input.audienceDataReady
      ? "Fix audience quality before writing more tailored offers"
      : input.audienceSize < 1000
        ? "Grow the eligible audience and keep new segment offers frozen"
        : input.segmentCount < 2
          ? "Create one repeat-buyer segment and one reactivation segment before launch"
          : !input.brandRepresentative
            ? "Restore Brand Representative access before expanding campaign detail"
            : input.discountBudget < 100 || input.discountRate < 0.1 || input.discountRate > 0.5
              ? "Reset budget and discount settings into the eligible range before launch"
              : input.activePromotionCount >= 20
                ? "Reduce active promotion load before opening one new tailored lane"
                : "Launch one segment-specific promo and keep other segment experiments closed";
  const doNotCrossLine =
    !input.audienceDataReady
      ? "Do not personalize discounts on weak audience data"
      : input.audienceSize < 1000
        ? "Do not launch a tailored promotion below the eligible audience threshold"
        : input.segmentCount < 2
          ? "Do not call a broad discount tailored when segmentation is still coarse"
          : !input.brandRepresentative
            ? "Do not build launch plans around access you do not have"
            : input.discountBudget < 100 || input.discountRate < 0.1 || input.discountRate > 0.5
              ? "Do not ship a tailored promotion outside the workable budget and discount range"
              : input.activePromotionCount >= 20
                ? "Do not stack another tailored promotion on top of a full promotion slate"
                : "Do not mix too many segments, products, and offers in one launch";
  const tailoredRiskBrief =
    !input.audienceDataReady
      ? "Audience quality is still too weak for real personalization."
      : input.audienceSize < 1000
        ? `${input.audienceSize} eligible shoppers is below the workable threshold for tailored promotions.`
        : input.segmentCount < 2
          ? `${input.segmentCount} segment is too coarse for a real retention test.`
          : !input.brandRepresentative
            ? "Required Brand Representative access is still missing."
            : input.discountBudget < 100 || input.discountRate < 0.1 || input.discountRate > 0.5
              ? `${formatCurrency(round(input.discountBudget))} budget and ${Math.round(input.discountRate * 100)}% discount are outside the clean launch range.`
              : input.activePromotionCount >= 20
                ? `${input.activePromotionCount}/20 active promotions leaves no clean capacity for another tailored test.`
                : "Audience, economics, and execution capacity are aligned enough for one clean retention test.";

  return {
    headline:
      !input.audienceDataReady
        ? `${commercialCall} - audience quality is the first broken gate`
        : input.audienceSize < 1000
          ? `${commercialCall} - audience size is the first broken gate`
          : input.segmentCount < 2
            ? `${commercialCall} - segmentation is the first broken gate`
            : !input.brandRepresentative
              ? `${commercialCall} - access is the first broken gate`
              : input.discountBudget < 100 || input.discountRate < 0.1 || input.discountRate > 0.5
                ? `${commercialCall} - economics are the first broken gate`
                : input.activePromotionCount >= 20
                  ? `${commercialCall} - promotion capacity is the first broken gate`
                  : `${commercialCall} - the tailored-promo lane is commercially workable`,
    summary:
      "This tailored-promo read decides whether one retention offer should launch now, which gate is broken first, who owns the fix, and which other segment or product moves must stay closed so the readout is trustworthy.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${moveNow}. ${decisionOwner} owns the first tailored-promo lane.`,
      },
      {
        label: "Open lane",
        value: moveNow,
        detail: tailoredRiskBrief,
      },
      {
        label: "Segments",
        value: `${input.segmentCount}`,
        detail: `${input.productCount} target products`,
      },
      {
        label: "Budget",
        value: formatCurrency(round(input.discountBudget)),
        detail: `${input.channelCount} delivery channels`,
      },
      {
        label: "Audience",
        value: `${input.audienceSize}`,
        detail: `${Math.round(input.discountRate * 100)}% discount | ${input.activePromotionCount}/20 active`,
      },
      {
        label: "Retention goal",
        value: `${input.retentionGoalScore}%`,
        detail: input.audienceDataReady ? "Audience data ready" : "Audience data still weak",
      },
      {
        label: "Plan score",
        value: `${score}%`,
        detail: "Higher means the tailored promotion plan is usable",
      },
      {
        label: "Segment pressure",
        value: `${input.segmentCount}/${input.channelCount}`,
        detail: "Audience segments versus delivery channels",
      },
      {
        label: "Offer density",
        value: `${input.productCount}/${input.segmentCount}`,
        detail: "Target products per audience segment",
      },
      {
        label: "First promo step",
        value: firstPromoStep,
        detail: firstPromoReason,
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep one audience-offer lane open so you can tell whether audience quality or promo economics changed the outcome.",
      },
    ],
    recommendations: [
      !input.audienceDataReady
        ? "Do not personalize offers yet. Fix audience readiness first, or the promotion will behave like a broad discount with extra complexity."
        : "Audience data is workable enough to test segment-specific offers, so targeting quality is not the first blocker.",
      input.segmentCount < 2
        ? "Create at least one repeat-buyer segment and one reactivation segment before you spend more budget. One segment is too coarse to justify tailored offers."
        : "Segment structure is broad enough for controlled retention testing, so the next job is tightening the offer-to-segment match.",
      input.productCount > input.segmentCount * 3
        ? "Narrow the product set before scaling. Too many products per segment will blur the retention signal and waste discount budget."
        : "Keep tailored promotions attached to one retention job per segment instead of drifting back into one-size-fits-all discounts.",
      input.discountBudget < 100 || input.discountRate < 0.1 || input.discountRate > 0.5
        ? "Do not lock the offer plan yet. Normalize budget and discount settings before launch so the test is actually eligible and interpretable."
        : "Assign one retention job, one segment, and one product cluster to each promo so the readout stays clean.",
      `Re-run only when this same lane changes state: ${moveNow.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "Tailored promo plan looks usable",
      warning: "Tailored promo plan needs focus",
      critical: "Tailored promo plan is weak",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Launch one controlled promo",
      caution: "Tighten audience and offer first",
      stop: "Do not launch this promo yet",
    }, {
      go: "The audience, discount shape, and execution lane are clean enough to run one contained retention test.",
      caution: "The plan is directionally useful, but audience quality or offer structure still needs one cleanup pass before spend.",
      stop: "This promotion setup is still too noisy or too expensive to trust as a tailored retention test.",
    }),
    missingItems: [
      input.segmentCount < 2 ? "Audience segments" : "",
      !input.audienceDataReady ? "Audience readiness" : "",
      input.audienceSize < 1000 ? "Audience size above 1,000" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${moveNow.toLowerCase()}.`,
      "Then attach one product and one retention goal to each segment so the test reveals which audience-job pair actually responds.",
      "Assign one owner to audience readiness, one to offer economics, and one to campaign execution before launch.",
      "Re-run after audience readiness, eligible audience size, or discount budget changes enough to alter the launch decision.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

export function evaluateSubscribeSave(input: {
  repeatIntervalDays: number;
  currentDiscountRate: number;
  repeatOrderRate: number;
  marginRate: number;
  churnRiskScore: number;
  consumable: boolean;
  brandRepresentative: boolean;
  inStockRate: number;
  offerBuyable: boolean;
  fbmMetricsReady: boolean;
}) {
  const alerts: string[] = [];
  let score = 100;
  let firstRetentionStep = "Validate replenishment cadence first.";
  let firstRetentionReason = "The offer only works if the reorder rhythm is real enough to support enrollment.";

  if (!input.consumable) {
    alerts.push("Subscribe and Save is structurally weaker for products without a clear replenishment cycle.");
    score -= 18;
  }
  if (input.repeatIntervalDays > 75) {
    alerts.push("Replenishment interval is too long for strong repeat-order momentum.");
    score -= 12;
  }
  if (input.currentDiscountRate > 0.15) {
    alerts.push("Discount depth may be too aggressive for healthy repeat economics.");
    score -= 12;
  }
  if (input.repeatOrderRate < 0.12) {
    alerts.push("Current repeat-order rate is too low to support an efficient Subscribe and Save push.");
    score -= 14;
  }
  if (input.marginRate < 20) {
    alerts.push("Margin is thin, so repeat discounts can erode contribution quickly.");
    score -= 12;
  }
  if (input.churnRiskScore > 60) {
    alerts.push("Churn risk is elevated, so enrollment may not hold long enough to pay back the discount.");
    score -= 10;
  }
  if (!input.brandRepresentative) {
    alerts.push("Subscribe and Save access is weak because the required Brand Registry role is not ready.");
    score -= 18;
  }
  if (input.inStockRate < 90) {
    alerts.push("Trailing in-stock rate is below Amazon's Subscribe and Save eligibility floor.");
    score -= 18;
  }
  if (!input.offerBuyable) {
    alerts.push("The offer is not buyable, which blocks Subscribe and Save eligibility.");
    score -= 16;
  }
  if (!input.fbmMetricsReady) {
    alerts.push("FBM quality metrics are not consistently strong enough for Subscribe and Save eligibility.");
    score -= 10;
  }
  if (![0, 0.05, 0.1, 0.15, 0.2].includes(Number(input.currentDiscountRate.toFixed(2)))) {
    alerts.push("Funding rate does not match Amazon's standard Subscribe and Save discount steps.");
    score -= 10;
  }
  if (input.repeatIntervalDays < 20 && input.currentDiscountRate === 0) {
    alerts.push("Short replenishment cycle with no discount support may limit enrollment appeal.");
  }
  if (input.repeatOrderRate > 0.2 && input.currentDiscountRate > 0.15) {
    alerts.push("Repeat behavior is already decent, so discounting this heavily may be more generous than necessary.");
  }

  if (!input.consumable) {
    firstRetentionStep = "Do not push enrollment until the replenishment use case is clear.";
    firstRetentionReason = "Weak-repeat products usually need a stronger reorder habit before a subscription layer helps.";
  } else if (input.inStockRate < 90 || !input.offerBuyable) {
    firstRetentionStep = "Fix eligibility and in-stock reliability before optimizing discounts.";
    firstRetentionReason = "Enrollment pushes break quickly when the offer cannot stay buyable and in stock.";
  } else if (input.marginRate < 20) {
    firstRetentionStep = "Protect contribution margin before increasing enrollment incentives.";
    firstRetentionReason = "Thin margin gets punished fast when a repeat discount is layered on top.";
  } else if (input.repeatOrderRate < 0.12) {
    firstRetentionStep = "Build stronger repeat-order proof before scaling enrollment asks.";
    firstRetentionReason = "Low repeat behavior means the subscription ask is arriving before the habit is proven.";
  } else if (input.currentDiscountRate > 0.15) {
    firstRetentionStep = "Reduce discount depth before expanding the program.";
    firstRetentionReason = "The current funding rate is likely too generous relative to healthy repeat economics.";
  }

  score = Math.max(0, score);
  const evidence = getSubscribeSavePolicyEvidence({
    brandRepresentative: input.brandRepresentative,
    inStockRate: input.inStockRate,
    offerBuyable: input.offerBuyable,
    fbmMetricsReady: input.fbmMetricsReady,
    currentDiscountRate: input.currentDiscountRate,
  });
  const commercialCall =
    !input.consumable
      ? "Do not push Subscribe and Save until the replenishment case is real"
      : input.inStockRate < 90 || !input.offerBuyable
        ? "Fix eligibility and in-stock reliability before pushing enrollment"
        : input.marginRate < 20
          ? "Protect contribution margin before offering more repeat discounts"
          : input.repeatOrderRate < 0.12
            ? "Build repeat-order proof before scaling enrollment asks"
            : input.currentDiscountRate > 0.15 || ![0, 0.05, 0.1, 0.15, 0.2].includes(Number(input.currentDiscountRate.toFixed(2)))
              ? "Reset discount depth before expanding the program"
              : "Push enrollment to repeat-intent cohorts and keep the rest closed";
  const decisionOwner =
    !input.consumable
      ? "Retention strategy lead"
      : input.inStockRate < 90 || !input.offerBuyable
        ? "Inventory reliability lead"
        : input.marginRate < 20
          ? "Unit economics lead"
          : input.repeatOrderRate < 0.12
            ? "Lifecycle growth lead"
            : input.currentDiscountRate > 0.15 || ![0, 0.05, 0.1, 0.15, 0.2].includes(Number(input.currentDiscountRate.toFixed(2)))
              ? "Discount strategy lead"
              : "Subscribe and Save owner";
  const moveNow =
    !input.consumable
      ? "Clarify the replenishment use case before designing enrollment prompts"
      : input.inStockRate < 90 || !input.offerBuyable
        ? "Fix buyability and in-stock reliability before touching discount depth"
        : input.marginRate < 20
          ? "Raise contribution room before expanding repeat discounts"
          : input.repeatOrderRate < 0.12
            ? "Strengthen repeat behavior before widening subscription asks"
            : input.currentDiscountRate > 0.15 || ![0, 0.05, 0.1, 0.15, 0.2].includes(Number(input.currentDiscountRate.toFixed(2)))
              ? "Normalize discount steps and keep enrollment expansion frozen"
              : "Push one repeat-cohort enrollment lane and keep broad prompts closed";
  const doNotCrossLine =
    !input.consumable
      ? "Do not force Subscribe and Save onto weak-repeat products"
      : input.inStockRate < 90 || !input.offerBuyable
        ? "Do not push enrollment while the subscription promise will break operationally"
        : input.marginRate < 20
          ? "Do not buy repeat intent with discounts your margin cannot absorb"
          : input.repeatOrderRate < 0.12
            ? "Do not widen enrollment before the repeat habit is proven"
            : input.currentDiscountRate > 0.15 || ![0, 0.05, 0.1, 0.15, 0.2].includes(Number(input.currentDiscountRate.toFixed(2)))
              ? "Do not expand Subscribe and Save on an unsafe discount ladder"
              : "Do not change cadence, discount, and enrollment timing all at once";
  const snsRiskBrief =
    !input.consumable
      ? "This SKU still lacks a strong replenishment habit."
      : input.inStockRate < 90 || !input.offerBuyable
        ? `${Math.round(input.inStockRate)}% in stock and current buyability are too weak for a subscription promise.`
        : input.marginRate < 20
          ? `${Math.round(input.marginRate)}% margin is too thin for safe repeat discounting.`
          : input.repeatOrderRate < 0.12
            ? `${Math.round(input.repeatOrderRate * 100)}% repeat rate is still too weak to support broad enrollment asks.`
            : input.currentDiscountRate > 0.15 || ![0, 0.05, 0.1, 0.15, 0.2].includes(Number(input.currentDiscountRate.toFixed(2)))
              ? `${Math.round(input.currentDiscountRate * 100)}% discount is outside the clean operating ladder.`
              : "Repeat fit, economics, and ops readiness are aligned enough for one controlled enrollment push.";

  return {
    headline:
      !input.consumable
        ? `${commercialCall} - replenishment fit is the first broken gate`
        : input.inStockRate < 90 || !input.offerBuyable
          ? `${commercialCall} - eligibility is the first broken gate`
          : input.marginRate < 20
            ? `${commercialCall} - economics are the first broken gate`
            : input.repeatOrderRate < 0.12
              ? `${commercialCall} - repeat habit is the first broken gate`
              : input.currentDiscountRate > 0.15 || ![0, 0.05, 0.1, 0.15, 0.2].includes(Number(input.currentDiscountRate.toFixed(2)))
                ? `${commercialCall} - discount shape is the first broken gate`
                : `${commercialCall} - the Subscribe and Save lane is commercially workable`,
    summary:
      "This retention read decides whether Subscribe and Save should be pushed now, which gate is broken first, who owns the fix, and which other retention moves must stay closed so the next result is interpretable.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${moveNow}. ${decisionOwner} owns the first subscription lane.`,
      },
      {
        label: "Open lane",
        value: moveNow,
        detail: snsRiskBrief,
      },
      {
        label: "Repeat interval",
        value: `${input.repeatIntervalDays}d`,
        detail: input.consumable ? "Consumable or replenish-able offer" : "Weak replenishment behavior",
      },
      {
        label: "Discount",
        value: `${Math.round(input.currentDiscountRate * 100)}%`,
        detail: `${Math.round(input.repeatOrderRate * 100)}% repeat-order rate`,
      },
      {
        label: "Eligibility",
        value: `${Math.round(input.inStockRate)}% in stock`,
        detail: input.offerBuyable ? "Offer buyable" : "Offer not buyable",
      },
      {
        label: "Margin",
        value: `${Math.round(input.marginRate)}%`,
        detail: `Churn risk ${input.churnRiskScore}%`,
      },
      {
        label: "Plan score",
        value: `${score}%`,
        detail: "Higher means Subscribe and Save is commercially safer to push",
      },
      {
        label: "Retention efficiency",
        value: `${Math.round(input.repeatOrderRate * 100)}/${input.churnRiskScore}`,
        detail: "Repeat-order rate versus churn-risk score",
      },
      {
        label: "Eligibility stack",
        value: input.brandRepresentative ? "Brand ready" : "Brand weak",
        detail: input.fbmMetricsReady ? "Ops metrics ready" : "Ops metrics still weak",
      },
      {
        label: "First retention step",
        value: firstRetentionStep,
        detail: firstRetentionReason,
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep one enrollment lane open so you can tell whether habit strength or discount shape changed the result.",
      },
    ],
    recommendations: [
      !input.consumable
        ? "Do not force Subscribe and Save on weak-repeat products; fix replenishment logic first."
        : "Product fit is good enough to tune the discount ladder and enrollment trigger next.",
      input.marginRate < 20
        ? "Do not buy repeat rate with discount depth yet. Protect contribution margin before increasing enrollment incentives."
        : "Margin can support a controlled repeat-purchase offer.",
      input.inStockRate < 90 || !input.offerBuyable
        ? "Do not push enrollment while buyability or in-stock reliability is weak. The subscription promise will break operationally."
        : "Tie enrollment asks to the natural reorder moment, not the first visit only.",
      input.repeatOrderRate < 0.12
        ? "Build repeat-order proof first, then widen enrollment prompts. Low habit strength is the real blocker right now."
        : "Assign the program to retention economics, not vanity enrollment volume, so discounting does not outrun real repeat behavior.",
      `Re-run only when this same lane changes state: ${moveNow.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "Subscribe and Save plan looks usable",
      warning: "Subscribe and Save plan needs work",
      critical: "Subscribe and Save plan is weak",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Push enrollment to repeat cohorts",
      caution: "Fix economics or eligibility first",
      stop: "Do not push Subscribe and Save yet",
    }, {
      go: "Repeat fit, margin room, and eligibility are strong enough to test enrollment where reorder intent already exists.",
      caution: "The offer is close, but stock reliability, retention economics, or habit strength still needs tightening before scale.",
      stop: "This SKU is still too weak on repeat fit or operational reliability to justify a subscription push.",
    }),
    missingItems: [
      input.repeatOrderRate < 0.12 ? "Stronger repeat-order proof" : "",
      !input.consumable ? "Clear replenishment use case" : "",
      input.inStockRate < 90 ? "In-stock rate above 90%" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${moveNow.toLowerCase()}.`,
      "Then lock a discount ladder that margin can absorb.",
      "Assign one owner to inventory reliability, one to discount economics, and one to enrollment timing.",
      "Re-run after repeat-order data improves.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

export function evaluatePrivateLabel(input: {
  demandScore: number;
  differentiationScore: number;
  sourcingConfidence: number;
  launchBudget: number;
  complianceCount: number;
  brandReady: boolean;
  gtinExemptionReady: boolean;
  permanentBrandingReady: boolean;
}) {
  const alerts: string[] = [];
  let score = 100;
  let firstLaunchStep = "Lock differentiation before scale assumptions.";
  let firstLaunchReason = "A launch without a clear product gap usually spends money before it earns position.";

  if (input.demandScore < 60) {
    alerts.push("Demand evidence is too soft for a confident private-label launch.");
    score -= 14;
  }
  if (input.differentiationScore < 55) {
    alerts.push("Differentiation is weak, so the offer risks blending into existing listings.");
    score -= 16;
  }
  if (input.sourcingConfidence < 60) {
    alerts.push("Supplier or production confidence is too low for a smooth launch sequence.");
    score -= 14;
  }
  if (input.launchBudget < 5000) {
    alerts.push("Launch budget may be too thin for inventory, creative, and ad ramp together.");
    score -= 12;
  }
  if (input.complianceCount > 2) {
    alerts.push("Compliance complexity is heavy for an early private-label entry.");
    score -= 12;
  }
  if (!input.brandReady) {
    alerts.push("Brand assets and registration path are not ready yet.");
    score -= 10;
  }
  if (!input.gtinExemptionReady) {
    alerts.push("The product-ID or GTIN exemption path is not ready for listing creation.");
    score -= 14;
  }
  if (!input.permanentBrandingReady) {
    alerts.push("Permanent brand marking on product or packaging is still too weak for Amazon approval workflows.");
    score -= 12;
  }
  if (input.launchBudget > 0 && input.launchBudget < 8000 && input.complianceCount >= 2) {
    alerts.push("Budget is tight relative to the current compliance burden, which raises execution risk.");
  }
  if (input.brandReady && input.gtinExemptionReady && !input.permanentBrandingReady) {
    alerts.push("The paperwork path is moving faster than the physical brand-proof path, which can still block launch readiness.");
  }

  if (input.differentiationScore < 55) {
    firstLaunchStep = "Strengthen product or positioning differentiation before launch spend.";
    firstLaunchReason = "Weak differentiation makes the offer blend into existing listings too easily.";
  } else if (input.sourcingConfidence < 60) {
    firstLaunchStep = "Fix supplier confidence before broadening launch planning.";
    firstLaunchReason = "Supply instability will break inventory, quality, and ad assumptions at the same time.";
  } else if (!input.brandReady || !input.gtinExemptionReady || !input.permanentBrandingReady) {
    firstLaunchStep = "Complete the listing and brand-approval path before launch scaling.";
    firstLaunchReason = "The launch should not outpace the approval stack needed to list and defend the offer.";
  } else if (input.launchBudget < 5000) {
    firstLaunchStep = "Rework budget scope before treating this as a real launch.";
    firstLaunchReason = "Inventory, creative, and ads together can outrun a thin budget quickly.";
  } else if (input.demandScore < 60) {
    firstLaunchStep = "Gather stronger demand proof before committing launch capital.";
    firstLaunchReason = "Soft demand evidence can make even a differentiated product hard to scale.";
  }

  score = Math.max(0, score);
  const evidence = getPrivateLabelPolicyEvidence({
    brandReady: input.brandReady,
    gtinExemptionReady: input.gtinExemptionReady,
    permanentBrandingReady: input.permanentBrandingReady,
    complianceCount: input.complianceCount,
  });
  const commercialCall =
    input.differentiationScore < 55
      ? "Fix differentiation before committing launch capital"
      : input.sourcingConfidence < 60
        ? "Repair supply confidence before broadening launch work"
        : !input.brandReady || !input.gtinExemptionReady || !input.permanentBrandingReady
          ? "Complete the approval stack before scaling the launch"
          : input.launchBudget < 5000
            ? "Re-scope the launch before treating this as a real go"
            : input.demandScore < 60
              ? "Strengthen demand proof before funding the launch"
              : "Run the smallest defensible launch and keep the rest closed";
  const decisionOwner =
    input.differentiationScore < 55
      ? "Product strategy lead"
      : input.sourcingConfidence < 60
        ? "Supply chain lead"
        : !input.brandReady || !input.gtinExemptionReady || !input.permanentBrandingReady
          ? "Launch approvals lead"
          : input.launchBudget < 5000
            ? "Launch finance lead"
            : input.demandScore < 60
              ? "Demand validation lead"
              : "Private-label launch owner";
  const moveNow =
    input.differentiationScore < 55
      ? "Strengthen the product or positioning gap before adding more launch assumptions"
      : input.sourcingConfidence < 60
        ? "Raise supplier confidence before inventory, creative, and ad plans widen"
        : !input.brandReady || !input.gtinExemptionReady || !input.permanentBrandingReady
          ? "Close brand, GTIN, and physical brand-proof gaps before launch scaling"
          : input.launchBudget < 5000
            ? "Rebuild the launch scope so inventory, creative, and ads can all be funded together"
            : input.demandScore < 60
              ? "Collect stronger demand proof before committing launch capital"
              : "Run one narrow launch wedge and keep broader expansion closed";
  const doNotCrossLine =
    input.differentiationScore < 55
      ? "Do not spend harder on a parity offer"
      : input.sourcingConfidence < 60
        ? "Do not widen launch plans on weak supply confidence"
        : !input.brandReady || !input.gtinExemptionReady || !input.permanentBrandingReady
          ? "Do not let optimism outrun the approval stack"
          : input.launchBudget < 5000
            ? "Do not pretend a thin budget can carry inventory, creative, and ads together"
            : input.demandScore < 60
              ? "Do not fund a launch on soft demand evidence"
              : "Do not expand channels, creatives, and geographies all at once";
  const privateLabelRiskBrief =
    input.differentiationScore < 55
      ? `${input.differentiationScore}% differentiation is too weak for a defendable private-label launch.`
      : input.sourcingConfidence < 60
        ? `${input.sourcingConfidence}% sourcing confidence is too low for a clean launch sequence.`
        : !input.brandReady || !input.gtinExemptionReady || !input.permanentBrandingReady
          ? "Brand, listing-permission, or physical brand-proof readiness is still incomplete."
          : input.launchBudget < 5000
            ? `${formatCurrency(round(input.launchBudget))} budget is too thin for a full launch stack.`
            : input.demandScore < 60
              ? `${input.demandScore}% demand evidence is still too soft to justify launch capital.`
              : "Demand, product gap, supply, and approvals are aligned enough for one controlled first launch.";

  return {
    headline:
      input.differentiationScore < 55
        ? `${commercialCall} - product gap is the first broken gate`
        : input.sourcingConfidence < 60
          ? `${commercialCall} - supply confidence is the first broken gate`
          : !input.brandReady || !input.gtinExemptionReady || !input.permanentBrandingReady
            ? `${commercialCall} - approvals are the first broken gate`
            : input.launchBudget < 5000
              ? `${commercialCall} - budget is the first broken gate`
              : input.demandScore < 60
                ? `${commercialCall} - demand proof is the first broken gate`
                : `${commercialCall} - the private-label launch lane is commercially workable`,
    summary:
      "This launch read decides whether the private-label idea deserves capital now, which launch gate is broken first, who owns the fix, and which other launch moves must stay closed so the next result is trustworthy.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${moveNow}. ${decisionOwner} owns the first launch lane.`,
      },
      {
        label: "Open lane",
        value: moveNow,
        detail: privateLabelRiskBrief,
      },
      {
        label: "Demand",
        value: `${input.demandScore}%`,
        detail: `${input.differentiationScore}% differentiation strength`,
      },
      {
        label: "Sourcing",
        value: `${input.sourcingConfidence}%`,
        detail: input.brandReady ? "Brand path ready" : "Brand path still weak",
      },
      {
        label: "Launch budget",
        value: formatCurrency(round(input.launchBudget)),
        detail: `${input.complianceCount} compliance hurdles`,
      },
      {
        label: "Listing path",
        value: input.gtinExemptionReady ? "ID path ready" : "ID path weak",
        detail: input.permanentBrandingReady ? "Brand affix proof ready" : "Brand affix proof missing",
      },
      {
        label: "Plan score",
        value: `${score}%`,
        detail: "Higher means the launch plan is commercially more workable",
      },
      {
        label: "Launch pressure",
        value: `${input.demandScore}/${input.sourcingConfidence}`,
        detail: "Demand confidence versus sourcing confidence",
      },
      {
        label: "Approval stack",
        value: input.brandReady ? "Brand ready" : "Brand weak",
        detail: input.gtinExemptionReady ? "GTIN path ready" : "GTIN path weak",
      },
      {
        label: "First launch step",
        value: firstLaunchStep,
        detail: firstLaunchReason,
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep one launch wedge open so you can tell whether differentiation, approvals, or demand proof changed the decision.",
      },
    ],
    recommendations: [
      input.differentiationScore < 55
        ? "Do not spend harder on launch yet. Fix product or positioning differentiation first, because a parity offer will waste the rest of the plan."
        : "Differentiation is workable enough that the next bottleneck should move to sourcing, approvals, or budget discipline.",
      input.sourcingConfidence < 60
        ? "Do not broaden launch planning until supplier confidence improves. Weak supply will break inventory, QC, and ad assumptions together."
        : "Supply readiness is strong enough for pre-launch operations planning, so sourcing is not the first blocker right now.",
      input.launchBudget < 5000
        ? "Budget is part of the core go/no-go call here. Keep launch scope narrow until inventory, creative, and ads can be funded together."
        : "Treat budget, sourcing, and offer differentiation as one system; if one weakens, the whole launch should slow down.",
      !input.brandReady || !input.gtinExemptionReady || !input.permanentBrandingReady
        ? "Do not let demand or supplier optimism outrun the approval stack. Listing permission and brand proof still gate the launch."
        : "Assign one owner to launch approvals and one to commercial viability so the project does not look ready on paper but fail in setup.",
      `Re-run only when this same lane changes state: ${moveNow.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "Private-label plan looks usable",
      warning: "Private-label plan needs work",
      critical: "Private-label plan is weak",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Run the smallest defensible launch",
      caution: "Tighten the launch thesis first",
      stop: "Do not launch this idea yet",
    }, {
      go: "Demand, differentiation, sourcing, and approval readiness are coherent enough to justify a disciplined first launch.",
      caution: "The idea has life, but one weak layer in differentiation, approvals, or supply still needs fixing before real spend.",
      stop: "This private-label concept is still too soft or too exposed to earn launch capital.",
    }),
    missingItems: [
      input.demandScore < 60 ? "Stronger demand validation" : "",
      !input.brandReady ? "Brand-readiness path" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${moveNow.toLowerCase()}.`,
      "Only after that, validate sourcing confidence and launch budget together instead of solving them in separate tracks.",
      "Freeze the exact launch wedge before adding more channels, creatives, or expansion assumptions.",
      "Re-run when supplier proof, demand evidence, or category constraints improve enough to change the real launch decision.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

export function evaluateWholesaleSourcing(input: {
  supplierCount: number;
  authorizedSupplierCount: number;
  moqUnits: number;
  grossMarginRate: number;
  documentCount: number;
  ungatingReady: boolean;
  invoiceRecent: boolean;
  hasLoa: boolean;
  brandRestricted: boolean;
}) {
  const alerts: string[] = [];
  let score = 100;
  let firstDealStep = "Confirm authorized supply first.";
  let firstDealReason = "Authorization is the gate that turns a catalog opportunity into a real resale path.";

  if (input.supplierCount < 3) {
    alerts.push("Supplier pool is too shallow to negotiate or validate the deal safely.");
    score -= 14;
  }
  if (input.authorizedSupplierCount < 1) {
    alerts.push("No clearly authorized supplier is confirmed yet.");
    score -= 18;
  }
  if (input.moqUnits > 500) {
    alerts.push("MOQ is high enough to raise inventory and cash risk materially.");
    score -= 10;
  }
  if (input.grossMarginRate < 18) {
    alerts.push("Gross margin is too thin for a resilient wholesale offer.");
    score -= 16;
  }
  if (input.documentCount < 2) {
    alerts.push("Documentation is too light for clean resale or ungating workflows.");
    score -= 12;
  }
  if (!input.ungatingReady) {
    alerts.push("Ungating or resale-permission readiness is still incomplete.");
    score -= 12;
  }
  if (!input.invoiceRecent) {
    alerts.push("Recent supplier invoices are missing, which weakens resale and appeal proof.");
    score -= 10;
  }
  if (!input.hasLoa && input.brandRestricted) {
    alerts.push("Restricted-brand sourcing is missing a letter of authorization or equivalent distributor proof.");
    score -= 14;
  }

  if (input.authorizedSupplierCount < 1) {
    firstDealStep = "Do not advance until an authorized supplier path is confirmed.";
    firstDealReason = "Without authorized supply, margin math and catalog fit are secondary.";
  } else if (input.documentCount < 2 || !input.invoiceRecent) {
    firstDealStep = "Upgrade invoices and resale documents before expanding the deal.";
    firstDealReason = "Weak documentation can block ungating, resale proof, and later appeals.";
  } else if (input.grossMarginRate < 18) {
    firstDealStep = "Fix buy cost or resale price assumptions before moving further.";
    firstDealReason = "Thin gross margin leaves too little room for fees, price pressure, and errors.";
  } else if (!input.ungatingReady) {
    firstDealStep = "Complete ungating readiness before a larger buy.";
    firstDealReason = "The economics are not enough if the catalog access path is still incomplete.";
  } else if (input.moqUnits > 500) {
    firstDealStep = "Pressure-test MOQ against cash and sell-through before scaling.";
    firstDealReason = "Large MOQ commitments can turn a workable deal into an inventory trap.";
  }

  score = Math.max(0, score);
  const evidence = getWholesaleSourcingPolicyEvidence({
    authorizedSupplierCount: input.authorizedSupplierCount,
    documentCount: input.documentCount,
    invoiceRecent: input.invoiceRecent,
    hasLoa: input.hasLoa,
    brandRestricted: input.brandRestricted,
  });
  const commercialCall =
    input.authorizedSupplierCount < 1
      ? "Stop here until authorized supply is confirmed"
      : input.documentCount < 2 || !input.invoiceRecent || (!input.hasLoa && input.brandRestricted)
        ? "Upgrade the proof stack before advancing this wholesale deal"
        : input.grossMarginRate < 18
          ? "Repair margin before spending more time on this deal"
          : !input.ungatingReady
            ? "Complete ungating readiness before a larger buy"
            : input.moqUnits > 500
              ? "Pressure-test MOQ before scaling this buy"
              : "Move to a controlled test buy and keep the rest closed";
  const decisionOwner =
    input.authorizedSupplierCount < 1
      ? "Supplier authorization lead"
      : input.documentCount < 2 || !input.invoiceRecent || (!input.hasLoa && input.brandRestricted)
        ? "Document compliance lead"
        : input.grossMarginRate < 18
          ? "Unit economics lead"
          : !input.ungatingReady
            ? "Category access lead"
            : input.moqUnits > 500
              ? "Inventory risk lead"
              : "Wholesale sourcing owner";
  const moveNow =
    input.authorizedSupplierCount < 1
      ? "Confirm one authorized supplier path before negotiating broader economics"
      : input.documentCount < 2 || !input.invoiceRecent || (!input.hasLoa && input.brandRestricted)
        ? "Refresh invoices and authorization proof before expanding the deal"
        : input.grossMarginRate < 18
          ? "Fix buy cost or resale price assumptions before going deeper"
          : !input.ungatingReady
            ? "Close ungating readiness before authorizing a larger buy"
            : input.moqUnits > 500
              ? "Stress-test MOQ against cash and sell-through before scaling"
              : "Run one controlled first buy and keep alternative supplier expansion closed";
  const doNotCrossLine =
    input.authorizedSupplierCount < 1
      ? "Do not treat hypothetical supply like an approved resale path"
      : input.documentCount < 2 || !input.invoiceRecent || (!input.hasLoa && input.brandRestricted)
        ? "Do not move money before the proof stack is clean"
        : input.grossMarginRate < 18
          ? "Do not hide thin margin behind paperwork progress"
          : !input.ungatingReady
            ? "Do not place a larger buy before the catalog access path is ready"
            : input.moqUnits > 500
              ? "Do not let MOQ pressure force the decision"
              : "Do not change suppliers, MOQ, and margin assumptions all at once";
  const wholesaleRiskBrief =
    input.authorizedSupplierCount < 1
      ? "No clearly authorized supplier is confirmed yet."
      : input.documentCount < 2 || !input.invoiceRecent || (!input.hasLoa && input.brandRestricted)
        ? "Invoices, LOA, or resale proof are still too weak for a clean wholesale path."
        : input.grossMarginRate < 18
          ? `${Math.round(input.grossMarginRate)}% gross margin is too thin for a resilient resale offer.`
          : !input.ungatingReady
            ? "The category-access or ungating path is still incomplete."
            : input.moqUnits > 500
              ? `${input.moqUnits} units is too large to approve without tighter sell-through proof.`
              : "Authorization, proof, and economics are aligned enough for one disciplined first buy.";

  return {
    headline:
      input.authorizedSupplierCount < 1
        ? `${commercialCall} - supply authorization is the first broken gate`
        : input.documentCount < 2 || !input.invoiceRecent || (!input.hasLoa && input.brandRestricted)
          ? `${commercialCall} - proof is the first broken gate`
          : input.grossMarginRate < 18
            ? `${commercialCall} - economics are the first broken gate`
            : !input.ungatingReady
              ? `${commercialCall} - access is the first broken gate`
              : input.moqUnits > 500
                ? `${commercialCall} - MOQ risk is the first broken gate`
                : `${commercialCall} - the wholesale buy lane is commercially workable`,
    summary:
      "This wholesale read decides whether the deal should advance now, which sourcing gate is broken first, who owns the fix, and which other buy moves must stay closed so the next decision is trustworthy.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${moveNow}. ${decisionOwner} owns the first wholesale lane.`,
      },
      {
        label: "Open lane",
        value: moveNow,
        detail: wholesaleRiskBrief,
      },
      {
        label: "Supplier pool",
        value: `${input.supplierCount}`,
        detail: `${input.authorizedSupplierCount} authorized`,
      },
      {
        label: "MOQ",
        value: `${input.moqUnits}`,
        detail: `${Math.round(input.grossMarginRate)}% gross margin`,
      },
      {
        label: "Documentation",
        value: `${input.documentCount}`,
        detail: input.ungatingReady ? "Ungating path ready" : "Ungating still weak",
      },
      {
        label: "Authorization proof",
        value: input.hasLoa ? "LOA ready" : "LOA missing",
        detail: input.invoiceRecent ? "Invoices recent" : "Invoice recency weak",
      },
      {
        label: "Plan score",
        value: `${score}%`,
        detail: "Higher means the deal is more workable for resale",
      },
      {
        label: "First deal step",
        value: firstDealStep,
        detail: firstDealReason,
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep one buy-decision lane open so you can tell whether proof, margin, or MOQ changed the outcome.",
      },
    ],
    recommendations: [
      input.authorizedSupplierCount < 1
        ? "Stop here until an authorized supplier path is confirmed. Without authorization, the economics are still hypothetical."
        : "Authorization is usable enough that economics and documentation can become the next gating layer.",
      input.grossMarginRate < 18
        ? "Do not move further with this deal shape. Fix buy cost or resale price assumptions before you spend more time on MOQ or paperwork."
        : "Margin is workable enough for deeper document and MOQ review, so economics are not the immediate blocker.",
      input.documentCount < 2 || !input.invoiceRecent || (!input.hasLoa && input.brandRestricted)
        ? "Treat documentation as a hard gate now. Weak invoices or missing authorization proof will invalidate the deal later."
        : "Treat authorization and documentation as hard gates that stay clean while you negotiate MOQ and margin.",
      input.moqUnits > 500
        ? "Do not let MOQ pressure force the decision. Validate sell-through and cash exposure before a larger buy is approved."
        : "Assign one owner to supplier proof and one to economics so the resale path is not approved on supplier enthusiasm alone.",
      `Re-run only when this same lane changes state: ${moveNow.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "Wholesale plan looks usable",
      warning: "Wholesale plan needs work",
      critical: "Wholesale plan is weak",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Move to a controlled test buy",
      caution: "Tighten proof and economics first",
      stop: "Do not advance this deal yet",
    }, {
      go: "Authorization, paperwork, and unit economics are stable enough to justify a disciplined first buy.",
      caution: "The deal is promising, but documentation, access, or margin still needs tightening before money moves.",
      stop: "This wholesale opportunity is still too weak on proof, access, or economics to trust.",
    }),
    missingItems: [
      input.authorizedSupplierCount < 1 ? "Authorized supplier proof" : "",
      input.documentCount < 2 ? "Invoices or resale documents" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${moveNow.toLowerCase()}.`,
      "Then pressure-test MOQ and margin together, because a large order only works if the economics still survive after cash exposure.",
      "Freeze the supplier set before the next decision so better paperwork is not confused with a different source mix.",
      "Re-run after supplier authorization, documentation, or pricing changes materially enough to change the resale decision.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

export function evaluateSuspensionAppeal(input: {
  issueType: string;
  rootCauseCount: number;
  evidenceCount: number;
  correctiveActionCount: number;
  preventionCount: number;
  issueSeverity: number;
  submissionReady: boolean;
  hasAsinOrPolicyReference: boolean;
  evidenceFresh: boolean;
  usesAccountHealthPath: boolean;
}) {
  const alerts: string[] = [];
  let score = 100;
  let firstRepairStep = "Lock root causes and evidence before rewriting the packet.";
  let firstRepairReason = "An appeal with weak proof usually fails even if the wording sounds polished.";

  if (input.rootCauseCount < 2) {
    alerts.push("Root cause analysis is too thin for a credible plan of action.");
    score -= 18;
  }
  if (input.evidenceCount < 2) {
    alerts.push("Evidence stack is too weak to support the appeal.");
    score -= 16;
  }
  if (input.correctiveActionCount < 2) {
    alerts.push("Corrective actions are too shallow for a strong immediate-fix section.");
    score -= 14;
  }
  if (input.preventionCount < 2) {
    alerts.push("Prevention measures are too thin for long-term trust repair.");
    score -= 14;
  }
  if (input.issueSeverity > 70) {
    alerts.push("Issue severity is high, so the appeal needs stronger proof and tighter accountability.");
    score -= 10;
  }
  if (!input.submissionReady) {
    alerts.push("The packet is not ready for submission yet.");
    score -= 10;
  }
  if (!input.hasAsinOrPolicyReference) {
    alerts.push("The appeal does not clearly identify the ASIN or policy involved.");
    score -= 10;
  }
  if (!input.evidenceFresh) {
    alerts.push("Evidence freshness or invoice recency may be too weak for the appeal.");
    score -= 8;
  }
  if (!input.usesAccountHealthPath) {
    alerts.push("The appeal path is unclear. Amazon often expects issue-specific submission through Account Health.");
    score -= 8;
  }

  if (!input.hasAsinOrPolicyReference) {
    firstRepairStep = "Name the exact ASIN or violated policy first.";
    firstRepairReason = "A vague notice scope makes every other section of the packet less credible.";
  } else if (input.evidenceCount < 2 || !input.evidenceFresh) {
    firstRepairStep = "Upgrade the evidence pack before editing narrative flow.";
    firstRepairReason = "Fresh operational proof carries more weight than polished wording in a weak packet.";
  } else if (input.rootCauseCount < 2) {
    firstRepairStep = "Deepen root-cause analysis before submission.";
    firstRepairReason = "Amazon usually expects more than one surface explanation for the same failure.";
  } else if (input.preventionCount < 2) {
    firstRepairStep = "Add stronger prevention controls before final submission.";
    firstRepairReason = "Backward-looking fixes alone do not show that the issue will stay contained.";
  } else if (!input.usesAccountHealthPath) {
    firstRepairStep = "Confirm the correct submission path before sending the appeal.";
    firstRepairReason = "A solid packet can still stall if it goes through the wrong path.";
  }

  score = Math.max(0, score);
  const evidence = getSuspensionAppealPolicyEvidence({
    issueType: input.issueType,
    hasAsinOrPolicyReference: input.hasAsinOrPolicyReference,
    evidenceFresh: input.evidenceFresh,
    usesAccountHealthPath: input.usesAccountHealthPath,
  });
  const commercialCall =
    !input.hasAsinOrPolicyReference
      ? "Name the exact issue scope before doing anything else"
      : input.evidenceCount < 2 || !input.evidenceFresh
        ? "Upgrade the evidence pack before submitting this appeal"
        : input.rootCauseCount < 2
          ? "Deepen root-cause analysis before final submission"
          : input.preventionCount < 2
            ? "Strengthen prevention controls before sending the appeal"
            : !input.usesAccountHealthPath
              ? "Fix the submission path before filing the appeal"
              : "Submit this appeal packet and keep further edits closed";
  const decisionOwner =
    !input.hasAsinOrPolicyReference
      ? "Case owner"
      : input.evidenceCount < 2 || !input.evidenceFresh
        ? "Evidence lead"
        : input.rootCauseCount < 2
          ? "Root-cause lead"
          : input.preventionCount < 2
            ? "Operational controls lead"
            : !input.usesAccountHealthPath
              ? "Appeal operations lead"
              : "Appeal owner";
  const moveNow =
    !input.hasAsinOrPolicyReference
      ? "Name the exact ASIN or policy violation before rewriting the packet"
      : input.evidenceCount < 2 || !input.evidenceFresh
        ? "Add fresher and harder proof before touching narrative polish again"
        : input.rootCauseCount < 2
          ? "Expand the root-cause map before final submission"
          : input.preventionCount < 2
            ? "Add stronger prevention controls and keep narrative edits frozen"
            : !input.usesAccountHealthPath
              ? "Confirm the exact Account Health submission path before filing"
              : "Submit the current packet and keep further editing closed until response";
  const doNotCrossLine =
    !input.hasAsinOrPolicyReference
      ? "Do not submit a vague appeal packet"
      : input.evidenceCount < 2 || !input.evidenceFresh
        ? "Do not use polished wording to hide weak proof"
        : input.rootCauseCount < 2
          ? "Do not submit with a shallow root-cause story"
          : input.preventionCount < 2
            ? "Do not rely on corrective actions without durable prevention"
            : !input.usesAccountHealthPath
              ? "Do not send a strong packet through the wrong path"
              : "Do not rewrite causes, evidence, and prevention all at once";
  const appealRiskBrief =
    !input.hasAsinOrPolicyReference
      ? "The appeal still does not clearly identify the ASIN or policy scope."
      : input.evidenceCount < 2 || !input.evidenceFresh
        ? `${input.evidenceCount} evidence items and current freshness are still too weak for a high-trust submission.`
        : input.rootCauseCount < 2
          ? `${input.rootCauseCount} root cause is too thin for a credible POA.`
          : input.preventionCount < 2
            ? `${input.preventionCount} prevention control is too weak to prove containment.`
            : !input.usesAccountHealthPath
              ? "The submission path is still unclear even if the packet content is improving."
              : "Issue scope, proof, and controls are aligned enough for one clean submission.";

  return {
    headline:
      !input.hasAsinOrPolicyReference
        ? `${commercialCall} - issue scope is the first broken gate`
        : input.evidenceCount < 2 || !input.evidenceFresh
          ? `${commercialCall} - proof is the first broken gate`
          : input.rootCauseCount < 2
            ? `${commercialCall} - diagnosis is the first broken gate`
            : input.preventionCount < 2
              ? `${commercialCall} - prevention is the first broken gate`
              : !input.usesAccountHealthPath
                ? `${commercialCall} - submission path is the first broken gate`
                : `${commercialCall} - the appeal lane is ready to file`,
    summary:
      "This POA read decides whether the appeal should be filed now, which gate is broken first, who owns the next fix, and which other edits must stay closed so the next filing is trustworthy.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${moveNow}. ${decisionOwner} owns the first appeal lane.`,
      },
      {
        label: "Open lane",
        value: moveNow,
        detail: appealRiskBrief,
      },
      {
        label: "Root causes",
        value: `${input.rootCauseCount}`,
        detail: `${input.correctiveActionCount} corrective actions`,
      },
      {
        label: "Evidence",
        value: `${input.evidenceCount}`,
        detail: `${input.preventionCount} prevention measures`,
      },
      {
        label: "Issue scope",
        value: input.hasAsinOrPolicyReference ? "Specific" : "Too vague",
        detail: input.issueType,
      },
      {
        label: "Severity",
        value: `${input.issueSeverity}%`,
        detail: input.submissionReady ? "Packet ready to submit" : "Packet not ready yet",
      },
      {
        label: "First repair step",
        value: firstRepairStep,
        detail: firstRepairReason,
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep one appeal-edit lane open so you can tell whether proof or prevention actually changed the submission quality.",
      },
    ],
    recommendations: [
      input.evidenceCount < 2
        ? "Do not submit yet. Add harder proof before polishing the narrative."
        : "Evidence is workable enough to refine ordering and accountability.",
      input.preventionCount < 2
        ? "Do not rely on corrective actions alone. Strengthen long-term controls so the appeal is not only backward-looking."
        : "Prevention coverage is solid enough for a cleaner final packet.",
      !input.usesAccountHealthPath
        ? "Confirm the exact submission path before sending anything, or a good packet may stall in the wrong queue."
        : "Keep the packet factual, accountable, and tied to the actual issue path.",
      input.rootCauseCount >= 2 && input.evidenceCount >= 2 && input.correctiveActionCount >= 2 && input.preventionCount >= 2
        ? "Assign one owner to every root cause, immediate fix, and prevention control before final submission."
        : "Tighten ownership before rewriting the appeal language again.",
      `Re-run only when this same lane changes state: ${moveNow.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(score, 84, 62, {
      good: "Appeal structure looks usable",
      warning: "Appeal structure needs work",
      critical: "Appeal structure is weak",
    }),
    actionStance: buildActionStance(score, {
      goAt: 84,
      cautionAt: 62,
    }, {
      go: "Submit the appeal",
      caution: "Tighten the packet first",
      stop: "Do not submit yet",
    }, {
      go: "The appeal packet is structured enough to submit without obvious avoidable weakness.",
      caution: "The appeal has a workable base, but evidence or prevention controls should tighten before submission.",
      stop: "The current appeal is too weak to submit without risking another avoidable rejection.",
    }),
    missingItems: [
      input.rootCauseCount < 2 ? "Full root-cause breakdown" : "",
      input.evidenceCount < 2 ? "Evidence pack" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${moveNow.toLowerCase()}.`,
      "Map each root cause to one corrective action, one preventive control, and one owner.",
      "Remove weak claims that are not backed by dates, documents, or operational proof.",
      "Re-run before final submission.",
    ],
    evidence,
  } satisfies ToolEvaluation;
}

function recommendedDealLabel(value: string) {
  if (value === "coupon") return "Coupon";
  if (value === "ltd") return "Limited-time deal";
  if (value === "prime") return "Prime-exclusive discount";
  return "Hold promo";
}

export function evaluateBackendKeywords(input: {
  byteLimit: number;
  usedBytes: number;
  includedCount: number;
  removedCount: number;
  duplicateCount: number;
  coveredSeedCount: number;
  totalSeedCount: number;
}) {
  const fillRate = input.byteLimit > 0 ? (input.usedBytes / input.byteLimit) * 100 : 0;
  const alerts: string[] = [];
  let firstBackendStep = "Fill the remaining backend capacity with net-new relevant terms.";
  let firstBackendReason = "There is still room to improve hidden search coverage without touching visible copy.";

  if (fillRate < 55) {
    alerts.push("Backend search-term field is underfilled. There may still be room for net-new relevant coverage.");
  }
  if (fillRate > 95) {
    alerts.push("Backend field is close to the byte ceiling. New additions will need compression or replacement.");
  }
  if (input.duplicateCount > 0) {
    alerts.push("Some candidate terms were removed because they already appear in the title or bullets.");
  }
  if (input.coveredSeedCount < input.totalSeedCount) {
    alerts.push("Not all seed concepts are currently preserved in the visible copy plus backend set.");
  }
  if (input.removedCount > input.includedCount && input.totalSeedCount > 0) {
    alerts.push("Compression pressure is removing too much of the candidate pool, so prioritization may still be too loose.");
  }

  if (input.coveredSeedCount < input.totalSeedCount) {
    firstBackendStep = "Close the missing seed coverage before adding lower-priority modifiers.";
    firstBackendReason = "Important seed concepts are still falling out of the visible-copy plus backend set.";
  } else if (fillRate > 95) {
    firstBackendStep = "Trim or replace terms before adding anything new.";
    firstBackendReason = "The field is already too close to the byte ceiling for safe expansion.";
  } else if (input.duplicateCount > 0) {
    firstBackendStep = "Keep duplicates out so every byte goes to net-new coverage.";
    firstBackendReason = "Visible-copy duplication is wasting backend capacity that should add incremental search reach.";
  } else if (fillRate < 55) {
    firstBackendStep = "Add more commercially relevant modifiers before finalizing the field.";
    firstBackendReason = "The backend field is underfilled and likely leaving discoverability on the table.";
  } else if (input.removedCount > input.includedCount && input.totalSeedCount > 0) {
    firstBackendStep = "Tighten prioritization before compressing the term pool further.";
    firstBackendReason = "Too many drops usually mean the candidate list still needs sharper ordering.";
  }
  const backendOwner =
    input.coveredSeedCount < input.totalSeedCount
      ? "Search coverage owner"
      : input.duplicateCount > 0
        ? "Catalog owner"
        : fillRate > 95
          ? "Byte-efficiency lead"
          : fillRate < 55
            ? "SEO growth lead"
            : "Backend keyword owner";
  const commercialCall =
    input.coveredSeedCount < input.totalSeedCount
      ? "Close missing seed coverage before shipping this backend field"
      : input.duplicateCount > 0
        ? "Remove visible-copy duplication before publishing"
        : fillRate > 95
          ? "Trim the field before adding anything new"
          : fillRate < 55
            ? "Add more net-new relevant coverage before final publish"
            : input.removedCount > input.includedCount && input.totalSeedCount > 0
              ? "Tighten prioritization before pasting this backend field"
              : "Publish this backend field and freeze it until the live copy changes";
  const moveNow =
    input.coveredSeedCount < input.totalSeedCount
      ? "Restore the missing seed concepts before touching lower-priority modifiers"
      : input.duplicateCount > 0
        ? "Clear duplicate overlap with visible copy before repacking the hidden field"
        : fillRate > 95
          ? "Trim or replace terms and keep new additions frozen"
          : fillRate < 55
            ? "Add more relevant modifiers before finalizing the field"
            : input.removedCount > input.includedCount && input.totalSeedCount > 0
              ? "Re-rank the term pool before compressing further"
              : "Publish the current backend string and keep further edits closed until the live copy changes";
  const doNotCrossLine =
    input.coveredSeedCount < input.totalSeedCount
      ? "Do not spend bytes on lower-priority modifiers while seed coverage is incomplete"
      : input.duplicateCount > 0
        ? "Do not waste backend bytes on visible-copy duplicates"
        : fillRate > 95
          ? "Do not keep stuffing the field by habit"
          : fillRate < 55
            ? "Do not publish an underfilled field if commercial coverage is still thin"
            : input.removedCount > input.includedCount && input.totalSeedCount > 0
              ? "Do not compress a weakly prioritized term pool further"
              : "Do not change visible copy and backend terms at the same time";
  const backendRiskBrief =
    input.coveredSeedCount < input.totalSeedCount
      ? `${input.coveredSeedCount}/${input.totalSeedCount} seed concepts are still covered.`
      : input.duplicateCount > 0
        ? `${input.duplicateCount} terms are still duplicating visible copy.`
        : fillRate > 95
          ? `${round(fillRate, 1)}% fill rate is too close to the byte ceiling for safe expansion.`
          : fillRate < 55
            ? `${round(fillRate, 1)}% fill rate is too light for a fully worked keyword field.`
            : input.removedCount > input.includedCount && input.totalSeedCount > 0
              ? `${input.removedCount} removals against ${input.includedCount} included terms suggests weak prioritization.`
              : "Coverage, compression, and deduplication are aligned enough for one controlled publish.";

  return {
    headline:
      input.coveredSeedCount < input.totalSeedCount
        ? `${commercialCall} - coverage is the first broken gate`
        : input.duplicateCount > 0
          ? `${commercialCall} - duplication is the first broken gate`
          : fillRate > 95
            ? `${commercialCall} - byte pressure is the first broken gate`
            : fillRate < 55
              ? `${commercialCall} - field depth is the first broken gate`
              : input.removedCount > input.includedCount && input.totalSeedCount > 0
                ? `${commercialCall} - prioritization is the first broken gate`
                : `${commercialCall} - the backend keyword lane is publishable`,
    summary:
      "This backend-keyword check decides whether the hidden field should publish now, which search-coverage gate is broken first, who owns the next fix, and which other keyword edits must stay closed so the next result is readable.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${moveNow}. ${backendOwner} owns the first backend lane.`,
      },
      {
        label: "Open lane",
        value: moveNow,
        detail: backendRiskBrief,
      },
      {
        label: "Used bytes",
        value: `${input.usedBytes}/${input.byteLimit}`,
        detail: `${round(fillRate, 1)}% of backend field capacity`,
      },
      {
        label: "Included terms",
        value: `${input.includedCount}`,
        detail: "Terms that survived deduplication and byte limits",
      },
      {
        label: "Removed terms",
        value: `${input.removedCount}`,
        detail: "Dropped because of duplication or byte-budget pressure",
      },
      {
        label: "Visible duplicates",
        value: `${input.duplicateCount}`,
        detail: "Already covered by title or bullets",
      },
      {
        label: "Seed coverage",
        value: `${input.coveredSeedCount}/${input.totalSeedCount}`,
        detail: "Seed concepts retained across visible copy and backend field",
      },
      {
        label: "Compression pressure",
        value: `${input.removedCount}`,
        detail: "Terms dropped to stay deduplicated and byte-safe",
      },
      {
        label: "First backend step",
        value: firstBackendStep,
        detail: firstBackendReason,
      },
      {
        label: "Decision owner",
        value: backendOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep one backend-keyword lane open so you can tell whether coverage or compression changed discoverability.",
      },
    ],
    recommendations: [
      fillRate > 90
        ? "Do not keep stuffing the field by habit. Only add more terms if they create clear incremental coverage beyond the current title and bullets."
        : "There is still room to add more commercially relevant modifiers if the current pool is thin.",
      input.duplicateCount > 0
        ? "Keep duplicates out of the hidden field so every byte goes toward net-new search coverage."
        : "Visible-copy duplication is already controlled, which makes the backend field more efficient.",
      input.coveredSeedCount < input.totalSeedCount
        ? "Do not spend bytes on lower-priority modifiers while seed coverage is still incomplete."
        : "Assign one owner to seed coverage and one to byte efficiency so backend edits stay disciplined.",
      "Re-run this pack whenever title, bullets, or the keyword pool changes.",
      `Re-run only when this same lane changes state: ${moveNow.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(fillRate + input.coveredSeedCount * 5, 82, 62, {
      good: "Backend keyword pack looks usable",
      warning: "Backend keyword pack needs cleanup",
      critical: "Backend keyword pack is weak",
    }),
    actionStance: buildActionStance(fillRate + input.coveredSeedCount * 5, {
      goAt: 82,
      cautionAt: 62,
    }, {
      go: "Publish this backend field",
      caution: "Clean the pack once more",
      stop: "Do not paste this field yet",
    }, {
      go: "The hidden search-term field is strong enough to publish because it is adding incremental search coverage instead of repeating visible copy.",
      caution: "This pack is close, but one more cleanup pass should remove wasted bytes or close missing seed coverage before publishing.",
      stop: "Do not publish this hidden search-term field yet; it is still too weak, too repetitive, or too loose to trust.",
    }),
    missingItems: [
      input.includedCount === 0 ? "Usable backend keyword terms" : "",
      input.coveredSeedCount === 0 ? "Seed-term coverage" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${backendOwner} should own the first move: ${moveNow.toLowerCase()}.`,
      "Paste the packed string only after a final duplication check against live copy.",
      "Freeze the visible copy version before updating backend terms so you can tell which layer changed discoverability.",
      "Reserve backend bytes for incremental terms, not repetition.",
      "Refresh the field after major copy or keyword-pool changes.",
    ],
    evidence: backendKeywordsEvidence,
  } satisfies ToolEvaluation;
}

export function evaluateReturnReduction(input: {
  reasonCount: number;
  topReasonShare: number;
  complaintThemeCount: number;
  packagingIssueCount: number;
  clarityIssueCount: number;
  qualityIssueCount: number;
}) {
  const alerts: string[] = [];
  let firstReturnStep = "Fix the single biggest return cause first.";
  let firstReturnReason = "A concentrated return mix usually improves faster with one focused operational fix.";

  if (input.topReasonShare >= 0.35) {
    alerts.push("One return cause dominates the mix, so a focused fix could materially lower returns.");
  }
  if (input.packagingIssueCount > 0) {
    alerts.push("Packaging or transit-damage signals are present in the current return mix.");
  }
  if (input.qualityIssueCount > 0) {
    alerts.push("Quality or defect signals appear in the current data and may need sourcing or QC fixes.");
  }
  if (input.clarityIssueCount > 0) {
    alerts.push("Expectation mismatch is showing up in the return mix, which usually points to listing clarity issues.");
  }
  if (input.topReasonShare >= 0.5 && input.reasonCount <= 2) {
    alerts.push("The return profile is highly concentrated, so one operational fix likely matters more than broad cleanup.");
  }

  if (input.packagingIssueCount > 0 && input.packagingIssueCount >= input.clarityIssueCount && input.packagingIssueCount >= input.qualityIssueCount) {
    firstReturnStep = "Strengthen packaging protection and transit testing first.";
    firstReturnReason = "Packaging damage is the loudest operational signal in the current return mix.";
  } else if (input.qualityIssueCount > 0 && input.qualityIssueCount >= input.clarityIssueCount) {
    firstReturnStep = "Send the strongest defect themes back to factory or QC first.";
    firstReturnReason = "Quality-led returns usually need upstream fixes more than listing edits.";
  } else if (input.clarityIssueCount > 0) {
    firstReturnStep = "Tighten listing expectations and setup clarity first.";
    firstReturnReason = "Expectation mismatch is currently a bigger drag than physical failure signals.";
  } else if (input.reasonCount === 0) {
    firstReturnStep = "Collect a usable batch of return reasons or complaint evidence first.";
    firstReturnReason = "Without return signals, any fix plan is still guesswork.";
  }

  const returnReductionScore = Math.max(
    0,
    100 -
      input.topReasonShare * 40 -
      input.packagingIssueCount * 8 -
      input.qualityIssueCount * 10 -
      input.clarityIssueCount * 6,
  );
  const commercialCall =
    input.reasonCount === 0
      ? "Collect usable return evidence before shipping fixes"
      : input.packagingIssueCount > 0 && input.packagingIssueCount >= input.clarityIssueCount && input.packagingIssueCount >= input.qualityIssueCount
        ? "Fix packaging before touching listing or QC work"
        : input.qualityIssueCount > 0 && input.qualityIssueCount >= input.clarityIssueCount
          ? "Repair product quality before broad merchandising changes"
          : input.clarityIssueCount > 0
            ? "Fix listing expectations before escalating physical changes"
            : input.topReasonShare >= 0.35
              ? "Put one owner on the dominant return cause before broad cleanup"
              : "Ship one narrow return-reduction fix and keep the rest closed";
  const decisionOwner =
    input.reasonCount === 0
      ? "CX diagnostics lead"
      : input.packagingIssueCount > 0 && input.packagingIssueCount >= input.clarityIssueCount && input.packagingIssueCount >= input.qualityIssueCount
        ? "Packaging lead"
        : input.qualityIssueCount > 0 && input.qualityIssueCount >= input.clarityIssueCount
          ? "Quality lead"
          : input.clarityIssueCount > 0
            ? "Listing clarity lead"
            : input.topReasonShare >= 0.35
              ? "Return reduction owner"
              : "Operations owner";
  const moveNow =
    input.reasonCount === 0
      ? "Collect return reasons and complaint evidence before assigning fixes"
      : input.packagingIssueCount > 0 && input.packagingIssueCount >= input.clarityIssueCount && input.packagingIssueCount >= input.qualityIssueCount
        ? "Strengthen packaging protection first and keep copy and QC changes frozen"
        : input.qualityIssueCount > 0 && input.qualityIssueCount >= input.clarityIssueCount
          ? "Send the strongest defect themes into factory or QC before broad listing edits"
          : input.clarityIssueCount > 0
            ? "Tighten buyer expectations first and keep physical changes closed"
            : input.topReasonShare >= 0.35
              ? "Assign the dominant return cause to one owner and measure the next batch"
              : "Ship one narrow fix and keep other teams closed until the next batch arrives";
  const doNotCrossLine =
    input.reasonCount === 0
      ? "Do not ship a return-reduction plan from intuition alone"
      : input.packagingIssueCount > 0 && input.packagingIssueCount >= input.clarityIssueCount && input.packagingIssueCount >= input.qualityIssueCount
        ? "Do not start with copy edits when packaging is the loudest failure"
        : input.qualityIssueCount > 0 && input.qualityIssueCount >= input.clarityIssueCount
          ? "Do not bury defect signals under merchandising work"
          : input.clarityIssueCount > 0
            ? "Do not escalate physical fixes before expectation mismatch is corrected"
            : input.topReasonShare >= 0.35
              ? "Do not let multiple teams attack the same concentrated problem at once"
              : "Do not launch broad fixes before the diagnosis is stable";
  const returnRiskBrief =
    input.reasonCount === 0
      ? "There is still no usable return dataset behind the plan."
      : input.packagingIssueCount > 0 && input.packagingIssueCount >= input.clarityIssueCount && input.packagingIssueCount >= input.qualityIssueCount
        ? `${input.packagingIssueCount} packaging signals are the loudest operational failure in the current mix.`
        : input.qualityIssueCount > 0 && input.qualityIssueCount >= input.clarityIssueCount
          ? `${input.qualityIssueCount} quality signals outweigh the current clarity issues.`
          : input.clarityIssueCount > 0
            ? `${input.clarityIssueCount} expectation-mismatch signals are still leading the current mix.`
            : input.topReasonShare >= 0.35
              ? `${round(input.topReasonShare * 100, 1)}% of returns still sit in one dominant cause.`
              : "The return mix is stable enough for one controlled fix lane.";

  return {
    headline:
      input.reasonCount === 0
        ? `${commercialCall} - evidence is the first broken gate`
        : input.packagingIssueCount > 0 && input.packagingIssueCount >= input.clarityIssueCount && input.packagingIssueCount >= input.qualityIssueCount
          ? `${commercialCall} - packaging is the first broken gate`
          : input.qualityIssueCount > 0 && input.qualityIssueCount >= input.clarityIssueCount
            ? `${commercialCall} - product quality is the first broken gate`
            : input.clarityIssueCount > 0
              ? `${commercialCall} - expectation clarity is the first broken gate`
              : input.topReasonShare >= 0.35
                ? `${commercialCall} - concentration is the first broken gate`
                : `${commercialCall} - the return-reduction lane is actionable`,
    summary:
      "This return read decides which root cause should be fixed first, who owns the next move, and which other teams must stay closed so the next return batch actually teaches something.",
    metrics: [
      {
        label: "Commercial call",
        value: commercialCall,
        detail: `${moveNow}. ${decisionOwner} owns the first return lane.`,
      },
      {
        label: "Open lane",
        value: moveNow,
        detail: returnRiskBrief,
      },
      {
        label: "Reason clusters",
        value: `${input.reasonCount}`,
        detail: "Distinct causes grouped from the current return data",
      },
      {
        label: "Top-cause share",
        value: `${round(input.topReasonShare * 100, 1)}%`,
        detail: "Share of the most common return cause",
      },
      {
        label: "Packaging signals",
        value: `${input.packagingIssueCount}`,
        detail: "Damage, box, transit, or packaging-related signals",
      },
      {
        label: "Clarity signals",
        value: `${input.clarityIssueCount}`,
        detail: "Description, photo, size, or expectation issues",
      },
      {
        label: "Quality signals",
        value: `${input.qualityIssueCount}`,
        detail: "Defect, durability, or build-quality issues",
      },
      {
        label: "Owner split",
        value: `${input.packagingIssueCount}/${input.clarityIssueCount}/${input.qualityIssueCount}`,
        detail: "Packaging / clarity / quality issue counts",
      },
      {
        label: "First return step",
        value: firstReturnStep,
        detail: firstReturnReason,
      },
      {
        label: "Decision owner",
        value: decisionOwner,
        detail: doNotCrossLine,
      },
      {
        label: "Wrong move",
        value: doNotCrossLine,
        detail: "Keep one return-fix lane open so you can tell whether packaging, quality, or clarity changed the next batch.",
      },
    ],
    recommendations: [
      input.packagingIssueCount > 0
        ? "Do not start with copy edits alone. Strengthen packaging protection and transit testing first."
        : "Packaging is not the main lever in the current batch.",
      input.clarityIssueCount > 0
        ? "Tighten listing photos, dimensions, and setup expectations where buyers are misunderstanding the offer."
        : "Expectation mismatch is not the loudest return driver right now.",
      input.qualityIssueCount > 0
        ? "Do not bury defect signals under merchandising work. Send the strongest themes back to factory, supplier, or QC owners."
        : "Product-quality failure is not dominating the current mix.",
      input.topReasonShare >= 0.35
        ? "Put one owner on the top return cause and force a before-and-after check on the next batch."
        : "The mix is fragmented, so rank fixes by cost, speed, and owner clarity before touching multiple areas at once.",
      input.reasonCount === 0
        ? "Do not ship a return-reduction plan from intuition alone. Collect usable return or complaint evidence first."
        : "Keep the first fix narrow enough that the next batch can actually confirm whether returns moved.",
      `Re-run only when this same lane changes state: ${moveNow.toLowerCase()}.`,
    ],
    alerts,
    status: buildStatus(
      returnReductionScore,
      78,
      58,
      {
        good: "Return profile looks manageable",
        warning: "Return reduction work is needed",
        critical: "Return pressure is material",
      },
    ),
    actionStance: buildActionStance(returnReductionScore, {
      goAt: 78,
      cautionAt: 58,
    }, {
      go: "Ship the first fix",
      caution: "Tighten the diagnosis first",
      stop: "Do not roll out broad fixes yet",
    }, {
      go: "The return pattern is clear enough to assign one primary fix owner and start reducing returns immediately.",
      caution: "The problem shape is directionally clear, but the diagnosis should tighten before broader changes are rolled out.",
      stop: "The current evidence is too thin or too noisy to justify a broad return-reduction response.",
    }),
    missingItems: [
      input.reasonCount === 0 ? "Return reason rows or complaint signals" : "",
    ].filter(Boolean),
    riskItems: alerts,
    nextSteps: [
      `${decisionOwner} should own the first move: ${moveNow.toLowerCase()}.`,
      "Separate packaging, quality, and listing fixes by owner and due date.",
      "Measure whether the top-cause share actually falls after the first fix rather than launching broad cleanup.",
      "Re-run after the next return batch or listing change.",
    ],
    evidence: returnReductionEvidence,
  } satisfies ToolEvaluation;
}
