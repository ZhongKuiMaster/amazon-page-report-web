export type ToolCategory =
  | "Calculator"
  | "Advertising"
  | "Compliance"
  | "Growth"
  | "Listing"
  | "Operations"
  | "Eligibility"
  | "Research";

export type ToolDefaultExecutionMode = "zero-token" | "live-data-zero-token";
export type ToolLiveDataMode = "none" | "amazon-listing-fetch" | "paste-or-upload";
export type ToolAiEscalationMode = "disabled" | "optional-low-token";

export type ToolExecutionProfile = {
  defaultMode: ToolDefaultExecutionMode;
  liveDataMode: ToolLiveDataMode;
  aiEscalation: ToolAiEscalationMode;
  targetInputTokens: number;
  targetOutputTokens: number;
  hardCapTokens: number;
  rationale: string;
};

export type ToolDefinition = {
  slug: string;
  name: string;
  platform: "amazon" | "tiktok-shop" | "shopify";
  category: ToolCategory;
  sourceSkillSlug?: string;
  sourceSkillType?: "canonical-skill" | "derived-companion";
  indexPriority?: "primary" | "secondary" | "internal";
  summary: string;
  seoTitle: string;
  seoDescription: string;
  intent: string;
  noAiReason: string;
  idealFor: string[];
  requiredInputs: string[];
  outputs: string[];
  methodology: string[];
  faqs: { question: string; answer: string }[];
  related: string[];
};

const liveDataZeroTokenSlugs = [
  "amazon-listing-title-checker",
  "amazon-image-compliance-checker",
  "amazon-variation-relationship-checker",
  "amazon-browse-search-keyword-checker",
  "amazon-brand-registry",
  "amazon-category-ungating",
  "amazon-profit-analyzer",
  "amazon-sales-estimator",
  "amazon-competitor-analysis",
  "amazon-search-optimization",
  "amazon-price-tracker",
  "amazon-rank-tracker",
  "amazon-competitor-monitoring",
  "amazon-product-research",
  "amazon-keyword-tracker",
  "amazon-niche-finder",
  "amazon-trending-products",
  "amazon-seller-analytics",
  "amazon-repricing-strategy",
  "amazon-buy-box",
  "amazon-listing-images",
  "amazon-product-photography",
  "amazon-storefront-design",
  "amazon-international-listings",
  "amazon-listing-optimization",
] as const;

const uploadOrPasteRuntimeSlugs = [
  "amazon-negative-keywords",
  "amazon-review-analyzer",
  "amazon-brand-analytics",
  "amazon-ppc-campaign",
  "amazon-return-reduction",
] as const;

const lowTokenOptionalSlugs = [
  "amazon-listing-optimization",
  "amazon-a-plus-content",
  "amazon-enhanced-brand-content",
  "amazon-international-listings",
  "amazon-ppc-campaign",
  "amazon-advertising-strategy",
  "amazon-review-analyzer",
  "amazon-brand-analytics",
  "amazon-suspension-appeal",
  "amazon-product-photography",
  "amazon-storefront-design",
] as const;

const liveDataZeroTokenSet = new Set<string>(liveDataZeroTokenSlugs);
const uploadOrPasteRuntimeSet = new Set<string>(uploadOrPasteRuntimeSlugs);
const lowTokenOptionalSet = new Set<string>(lowTokenOptionalSlugs);

const ultraLeanLowTokenProfiles: Record<
  string,
  Pick<
    ToolExecutionProfile,
    "targetInputTokens" | "targetOutputTokens" | "hardCapTokens" | "rationale"
  >
> = {
  "amazon-review-analyzer": {
    targetInputTokens: 180,
    targetOutputTokens: 120,
    hardCapTokens: 320,
    rationale:
      "Use the model only for a very short synthesis of already-clustered review themes.",
  },
  "amazon-brand-analytics": {
    targetInputTokens: 180,
    targetOutputTokens: 120,
    hardCapTokens: 320,
    rationale:
      "Use the model only to compress parsed Brand Analytics signals into a short operator readout.",
  },
  "amazon-ppc-campaign": {
    targetInputTokens: 180,
    targetOutputTokens: 120,
    hardCapTokens: 320,
    rationale:
      "Keep the model to a brief polish layer after deterministic PPC scoring and waste detection.",
  },
  "amazon-advertising-strategy": {
    targetInputTokens: 220,
    targetOutputTokens: 140,
    hardCapTokens: 420,
    rationale:
      "Limit the model to concise budget and funnel framing after rule-based allocation is already computed.",
  },
  "amazon-listing-optimization": {
    targetInputTokens: 220,
    targetOutputTokens: 140,
    hardCapTokens: 420,
    rationale:
      "Use the model only to rephrase deterministic keyword and competitor gaps into short listing guidance.",
  },
  "amazon-international-listings": {
    targetInputTokens: 220,
    targetOutputTokens: 140,
    hardCapTokens: 420,
    rationale:
      "Restrict the model to a short localization brief built from existing compliance and keyword checks.",
  },
  "amazon-product-photography": {
    targetInputTokens: 220,
    targetOutputTokens: 140,
    hardCapTokens: 420,
    rationale:
      "Use the model only for a concise shot-priority polish after the deterministic shot list is prepared.",
  },
  "amazon-storefront-design": {
    targetInputTokens: 220,
    targetOutputTokens: 140,
    hardCapTokens: 420,
    rationale:
      "Use the model only to summarize a deterministic storefront structure into short operator guidance.",
  },
  "amazon-a-plus-content": {
    targetInputTokens: 260,
    targetOutputTokens: 160,
    hardCapTokens: 520,
    rationale:
      "Allow a slightly larger cap only for concise A+ positioning polish after module scoring is complete.",
  },
  "amazon-enhanced-brand-content": {
    targetInputTokens: 260,
    targetOutputTokens: 160,
    hardCapTokens: 520,
    rationale:
      "Allow a slightly larger cap only for concise Premium A+ or Brand Story framing after readiness checks.",
  },
  "amazon-suspension-appeal": {
    targetInputTokens: 260,
    targetOutputTokens: 160,
    hardCapTokens: 520,
    rationale:
      "Use the model only for a short POA polish layer after the deterministic appeal structure is already scored.",
  },
};

export function getToolExecutionProfile(slug: string): ToolExecutionProfile {
  const isLiveData = liveDataZeroTokenSet.has(slug);
  const isUploadTool = uploadOrPasteRuntimeSet.has(slug);
  const usesOptionalLowToken = lowTokenOptionalSet.has(slug);

  if (usesOptionalLowToken) {
    const profile = ultraLeanLowTokenProfiles[slug] ?? {
      targetInputTokens: 220,
      targetOutputTokens: 140,
      hardCapTokens: 420,
      rationale:
        "Default to deterministic scoring first. Only use the model for a very short rewrite, summary, or drafting layer after the rule engine has already structured the answer.",
    };

    return {
      defaultMode: isLiveData ? "live-data-zero-token" : "zero-token",
      liveDataMode: isLiveData
        ? "amazon-listing-fetch"
        : isUploadTool
          ? "paste-or-upload"
          : "none",
      aiEscalation: "optional-low-token",
      targetInputTokens: profile.targetInputTokens,
      targetOutputTokens: profile.targetOutputTokens,
      hardCapTokens: profile.hardCapTokens,
      rationale: profile.rationale,
    };
  }

  return {
    defaultMode: isLiveData ? "live-data-zero-token" : "zero-token",
    liveDataMode: isLiveData
      ? "amazon-listing-fetch"
      : isUploadTool
        ? "paste-or-upload"
        : "none",
    aiEscalation: "disabled",
    targetInputTokens: 0,
    targetOutputTokens: 0,
    hardCapTokens: 0,
    rationale:
      isLiveData
        ? "Fetch live Amazon listing data when needed, then compute the result locally with deterministic logic."
        : isUploadTool
          ? "Keep analysis on pasted or uploaded seller data inside deterministic scoring logic to avoid unnecessary token cost."
          : "Use browser-side or server-side deterministic rules only. No model call is needed for the default output.",
  };
}

function buildGenericTool(def: {
  slug: string;
  name: string;
  platform?: ToolDefinition["platform"];
  category: ToolCategory;
  summary: string;
  requiredInputs: string[];
  outputs: string[];
  related?: string[];
}) {
  const isTiktokShop = (def.platform ?? "amazon") === "tiktok-shop";
  const isShopify = (def.platform ?? "amazon") === "shopify";
  const isAmazon = (def.platform ?? "amazon") === "amazon";
  const shopifySeoOverrides: Record<
    string,
    { title: string; description: string }
  > = {
    "shopify-product-page-audit": {
      title: "Shopify Product Page Audit | Conversion Problem and Fix Summary",
      description:
        "Review a Shopify product page, find the first real conversion problem, and leave with a clear fix summary and the next page fix to make.",
    },
    "shopify-offer-positioning": {
      title: "Shopify Offer Positioning | Offer Line and Proof Plan",
      description:
        "Turn buyer tension, proof, and product truth into a sharper offer line, a clearer buy-now reason, and the next page approach to use.",
    },
    "shopify-landing-page-angle-builder": {
      title: "Shopify Landing Page Angle Builder | Above-the-Fold Conversion Plan",
      description:
        "Turn traffic source, buyer tension, and proof into a sharper above-the-fold story, hero draft, and landing-page plan your team can ship next.",
    },
    "shopify-bundle-offer-designer": {
      title: "Shopify Bundle Offer Designer | AOV and Merchandising Plan",
      description:
        "Turn product economics and buyer behavior into one bundle path, price ladder, and rollout plan built to lift AOV without muddying the offer.",
    },
    "shopify-subscription-planner": {
      title: "Shopify Subscription Planner | Repeat Purchase and Cadence Decision",
      description:
        "Decide whether a product deserves a repeat lane, then leave with a cadence plan, discount limits, and a subscription rollout plan the team can act on.",
    },
    "shopify-quiz-planner": {
      title: "Shopify Quiz and Capture Planner | Segmented Lead Capture Path",
      description:
        "Turn buyer segments and capture goals into one production-ready quiz or popup path, clearer branch logic, and a capture plan that improves lead quality.",
    },
    "shopify-collection-page-audit": {
      title: "Shopify Collection Page Audit | Merchandising and Filter Fix Plan",
      description:
        "Audit a Shopify collection page for assortment clarity, filter friction, and buying-path gaps, then leave with a merchandising fix plan the team can execute next.",
    },
    "shopify-creative-testing-matrix": {
      title: "Shopify Creative Testing Matrix | First-Test Hooks and Proof Plan",
      description:
        "Turn offer, proof, and audience tension into one controlled first-test family, a clearer kill rule, and a creative test plan worth running next.",
    },
    "shopify-pricing-test-planner": {
      title: "Shopify Pricing Test Planner | Price Ladder and Discount Test Plan",
      description:
        "Turn price point, discount pressure, and margin constraints into one controlled pricing test plan, clear limits, and a rollout plan worth using.",
    },
    "shopify-pdp-copy-assembler": {
      title: "Shopify PDP Copy Assembler | Hero, Proof, and CTA Rewrite Plan",
      description:
        "Turn angles, objections, and proof into a production-ready PDP copy plan with hero copy, trust-building proof order, and CTA guidance the team can ship next.",
    },
    "shopify-post-purchase-flow-planner": {
      title: "Shopify Post-Purchase Flow Planner | Activation and Second-Order Plan",
      description:
        "Turn product education, delivery expectations, and reorder timing into one post-purchase flow plan with activation, retention, and second-order priorities.",
    },
    "shopify-returns-friction-audit": {
      title: "Shopify Returns Friction Audit | Expectation Gap and Profit Leak Summary",
      description:
        "Turn return reasons, promise gaps, and service friction into one repair plan that cuts avoidable returns before they burn contribution margin.",
    },
    "shopify-faq-objection-builder": {
      title: "Shopify FAQ and Objection Builder | FAQ Plan and Conversion Objection Stack",
      description:
        "Turn recurring objections, proof gaps, and support questions into one FAQ and objection-handling plan your PDP, landing page, and support team can use next.",
    },
    "shopify-reorder-reminder-planner": {
      title: "Shopify Reorder Reminder Planner | Refill Cadence and Repeat Revenue Plan",
      description:
        "Turn usage pace, reorder timing, and repeat-buy behavior into one refill reminder plan with cadence, timing, and limits worth shipping next.",
    },
    "shopify-promo-calendar-planner": {
      title: "Shopify Promo Calendar Planner | Campaign Cadence and Margin Limit Plan",
      description:
        "Turn inventory pressure, margin limits, and campaign timing into one promo calendar plan with clean sequencing, channel roles, and stop-loss rules.",
    },
    "shopify-merchandising-priority-mapper": {
      title: "Shopify Merchandising Priority Mapper | Hero SKU and Traffic Destination Plan",
      description:
        "Turn catalog sprawl, page roles, and buyer intent into one merchandising priority plan that decides what gets hero placement, traffic, and support next.",
    },
    "shopify-launch-readiness-scorecard": {
      title: "Shopify Launch Readiness Scorecard | Go Live, Hold, or Fix Summary",
      description:
        "Turn offer clarity, proof coverage, operations readiness, and channel fit into one launch readiness check that tells the team whether to go live, hold, or fix first.",
    },
    "shopify-channel-landing-router": {
      title: "Shopify Channel Landing Router | Traffic Destination and Page Role Plan",
      description:
        "Turn channel intent, page strengths, and buyer readiness into one routing plan that decides where each traffic source should land next.",
    },
  };
  const shopifySeoOverride = isShopify ? shopifySeoOverrides[def.slug] : undefined;

  return {
    slug: def.slug,
    name: def.name,
    platform: def.platform ?? ("amazon" as const),
    category: def.category,
    sourceSkillSlug: def.slug,
    sourceSkillType: "canonical-skill" as const,
    indexPriority: "primary" as const,
    summary: def.summary,
    seoTitle: isTiktokShop
      ? `${def.name} | ${(def.outputs[0] ?? "TikTok Shop tool result").replace(/\s+$/, "")}`
      : isAmazon
        ? `${def.name} | ${(def.outputs[0] ?? "Amazon tool result").replace(/\s+$/, "")}`
      : shopifySeoOverride?.title ??
        `${def.name} | ${isShopify ? "Shopify Tool" : "Amazon tool"}`,
    seoDescription: isTiktokShop
      ? `${def.summary} Enter the core inputs, get a fast result, and move into the next TikTok Shop action.`
      : isAmazon
        ? `${def.summary} Enter the core inputs, get a fast result, and move into the next Amazon action.`
      : shopifySeoOverride?.description ?? def.summary,
    intent:
      def.category === "Calculator" || def.category === "Research" || def.category === "Advertising"
        ? "Commercial investigation"
        : "Problem solving",
    noAiReason:
      "This tool can start with deterministic scoring and structured inputs before deeper AI layers are added.",
    idealFor: [
      `${isTiktokShop ? "TikTok Shop" : isShopify ? "Shopify" : "Amazon"} teams who need a fast first answer`,
      "Agencies packaging repeatable seller services",
      "Teams turning fuzzy requests into clear next steps",
    ],
    requiredInputs: def.requiredInputs,
    outputs: def.outputs,
    methodology: [
      "Start with a structured intake so the seller can scope the task cleanly.",
      "Keep the first output actionable instead of purely descriptive.",
      "Leave room to layer live data, uploads, and automation behind the same landing page later.",
    ],
    faqs: [
      {
        question: `Is this already connected to every ${(def.platform ?? "amazon") === "tiktok-shop" ? "TikTok Shop" : "Amazon"} backend data source?`,
        answer:
          "No. The current page focuses on a usable input and result flow first, then expands into deeper automation where the data layer is stable enough.",
      },
      {
        question: "Why launch this as a tool page before full automation exists?",
        answer:
          "Because the page can already solve a real user problem and provide a usable result before the heavier service layer is complete.",
      },
    ],
    related: def.related ?? [],
  } satisfies ToolDefinition;
}

export const firstBatchTools: ToolDefinition[] = [
  {
    slug: "amazon-fba-calculator",
    name: "Amazon FBA Calculator",
    platform: "amazon",
    category: "Calculator",
    summary:
      "Estimate fulfillment fees, referral fees, margin, and ROI before you commit inventory.",
    seoTitle: "Amazon FBA Calculator for Sellers | Fee, Margin, and ROI Estimator",
    seoDescription:
      "Rule-based Amazon FBA calculator landing page with required inputs, fee methodology, margin outputs, and seller-ready setup guidance.",
    intent: "Commercial investigation",
    noAiReason: "FBA fee math and margin logic can be computed deterministically.",
    idealFor: [
      "Private-label sellers validating a new SKU",
      "Wholesale operators checking margin before reorders",
      "Agencies needing a clean client-ready input checklist",
    ],
    requiredInputs: [
      "Marketplace",
      "Product dimensions and weight",
      "Selling price",
      "Product cost",
      "Inbound shipping cost",
      "Category",
    ],
    outputs: [
      "Estimated referral fee",
      "Estimated fulfillment fee",
      "Unit margin and margin rate",
      "ROI estimate",
      "Packaging and pricing pressure signals",
    ],
    methodology: [
      "Use seller-provided product attributes instead of guessed marketplace data.",
      "Separate deterministic fee logic from commentary so the math remains auditable.",
      "Show missing inputs clearly to reduce false confidence.",
    ],
    faqs: [
      {
        question: "Is this page already using Amazon live fee APIs?",
        answer:
          "No. This first version is positioned as a structured landing page and readiness system. The fee engine can be added behind the same URL later.",
      },
      {
        question: "Why start with FBA Calculator first?",
        answer:
          "The keyword has stable demand, clear commercial intent, and the product can be validated with deterministic logic rather than subjective model output.",
      },
    ],
    related: ["amazon-shipping-calculator", "tariff-calculator-amazon", "amazon-inventory-management"],
  },
  {
    slug: "tariff-calculator-amazon",
    name: "Amazon Tariff Calculator",
    platform: "amazon",
    category: "Calculator",
    summary:
      "Estimate landed cost, import duties, VAT or GST, and route-level cost pressure before sourcing.",
    seoTitle: "Amazon Tariff Calculator | Landed Cost and Import Duty Planning",
    seoDescription:
      "SEO-first tariff calculator landing page for Amazon sellers covering landed cost inputs, customs logic, and route planning requirements.",
    intent: "Commercial investigation",
    noAiReason: "Tariff and landed-cost decisions are rules-first and audit-friendly.",
    idealFor: [
      "Cross-border Amazon sellers sourcing from China or Southeast Asia",
      "Operators comparing routes before placing POs",
      "Brands expanding into new tax jurisdictions",
    ],
    requiredInputs: [
      "Origin country",
      "Destination country",
      "HS code or product type",
      "Declared product value",
      "Freight or shipping estimate",
      "Quantity or shipment size",
    ],
    outputs: [
      "Estimated duty burden",
      "Estimated landed cost per unit",
      "Route-level margin pressure",
      "Customs documentation checklist",
      "Risk notes for tax-sensitive launches",
    ],
    methodology: [
      "Keep customs assumptions explicit so users can challenge them.",
      "Treat tariff logic and VAT logic as separate blocks to simplify audits.",
      "Position the page as planning support, not legal or tax advice.",
    ],
    faqs: [
      {
        question: "Does this replace a customs broker?",
        answer:
          "No. The product page should help a seller scope cost exposure and required inputs before they speak with a broker or logistics partner.",
      },
      {
        question: "Why is this a strong SEO page?",
        answer:
          "The intent is specific, evergreen, and close to purchase decisions, which makes it a better first-batch traffic page than broad strategy content.",
      },
    ],
    related: ["amazon-fba-calculator", "amazon-shipping-calculator", "amazon-product-compliance"],
  },
  {
    slug: "amazon-shipping-calculator",
    name: "Amazon Shipping Calculator",
    platform: "amazon",
    category: "Calculator",
    summary:
      "Estimate FBA and FBM shipping burden, storage exposure, and dimensional cost risk before launch.",
    seoTitle: "Amazon Shipping Calculator | FBA, FBM, Storage, and Fulfillment Cost Guide",
    seoDescription:
      "Amazon shipping calculator landing page with fulfillment inputs, storage cost structure, and non-AI execution path for first-batch traffic acquisition.",
    intent: "Commercial investigation",
    noAiReason: "Shipping, storage, and dimensional weight calculations are formula-driven.",
    idealFor: [
      "Sellers comparing FBA and FBM",
      "Brands redesigning packaging to protect contribution margin",
      "Operators trying to forecast storage and removal fees",
    ],
    requiredInputs: [
      "Fulfillment mode",
      "Dimensions and weight",
      "Inventory duration",
      "Origin and destination",
      "Units per shipment",
      "Optional removal or return assumptions",
    ],
    outputs: [
      "Estimated fulfillment burden",
      "Storage pressure signal",
      "Dimensional weight warning",
      "Potential packaging improvement areas",
      "Suggested next calculators to run",
    ],
    methodology: [
      "Collect operational inputs first, then explain cost pressure in plain English.",
      "Surface the highest-impact shipping variables before introducing advanced assumptions.",
      "Use internal links to adjacent tools so the page can rank and also retain traffic.",
    ],
    faqs: [
      {
        question: "Is this page meant to be a full operational simulator?",
        answer:
          "Not in phase one. It is designed to acquire traffic and convert visitors into a deeper tool flow once the full calculator layer is live.",
      },
      {
        question: "Who benefits from this page most?",
        answer:
          "Sellers with bulky products, seasonal storage risk, or uncertain FBA versus FBM economics.",
      },
    ],
    related: ["amazon-fba-calculator", "tariff-calculator-amazon", "amazon-fba-prep"],
  },
  {
    slug: "amazon-product-compliance",
    name: "Amazon Product Compliance Checker",
    platform: "amazon",
    category: "Compliance",
    summary:
      "Map likely certifications, labels, and documentation needs before a product hits review or suppression risk.",
    seoTitle: "Amazon Product Compliance Checker | Certification and Listing Readiness",
    seoDescription:
      "Compliance-first landing page for Amazon sellers covering category risk, documentation inputs, and EEAT-friendly decision support.",
    intent: "Problem solving",
    noAiReason: "The first useful layer is a market-plus-category requirements matrix.",
    idealFor: [
      "Importers launching in regulated categories",
      "Agencies auditing risky listings before scale",
      "Brands entering the EU or US with new claims",
    ],
    requiredInputs: [
      "Product category",
      "Target marketplace or country",
      "Materials or ingredients",
      "Target age group",
      "Claims made on packaging or listing",
      "Available certifications or test reports",
    ],
    outputs: [
      "Likely documentation checklist",
      "Potential certification gaps",
      "Market-specific risk flags",
      "Pre-launch evidence checklist",
      "Escalation note when specialist review is needed",
    ],
    methodology: [
      "Do not present the checker as legal advice.",
      "Bias toward missing-evidence detection rather than false certainty.",
      "Use plain English around documents sellers actually need to gather.",
    ],
    faqs: [
      {
        question: "Can a compliance checker page rank well without a full backend tool?",
        answer:
          "Yes, if it targets a sharp query, answers the checklist question directly, and includes clear methodology, disclaimers, and related guidance.",
      },
      {
        question: "Why keep AI out of the first version?",
        answer:
          "Because a hallucinated compliance answer is more dangerous than a structured checklist that clearly states its limits.",
      },
    ],
    related: ["amazon-category-ungating", "amazon-brand-registry", "amazon-fba-prep"],
  },
  {
    slug: "amazon-listing-title-checker",
    name: "Amazon Listing Title Checker",
    platform: "amazon",
    category: "Listing",
    summary:
      "Review title length, structure, keyword repetition, and style-guide fit before a listing goes live.",
    seoTitle: "Amazon Listing Title Checker | Title Length, Structure, and Compliance Review",
    seoDescription:
      "Rule-based Amazon title checker for sellers who need title length review, repetition detection, brand placement checks, and category-style evidence.",
    intent: "Problem solving",
    noAiReason: "Title hygiene, repetition, and style-guide checks are deterministic first-pass rules.",
    idealFor: [
      "Catalog teams preparing new listings",
      "Agencies reviewing title rewrites before upload",
      "Sellers cleaning titles after suppression or browse-quality issues",
    ],
    requiredInputs: [
      "Product category",
      "Marketplace",
      "Brand name",
      "Draft listing title",
      "Core attributes or must-keep keywords",
    ],
    outputs: [
      "Title length and readability signal",
      "Repeated-word and banned-phrase warnings",
      "Brand placement and attribute coverage review",
      "Category-specific style-guide evidence",
      "Priority rewrite actions",
    ],
    methodology: [
      "Score the title on auditable structure rules before any subjective copy advice.",
      "Use category style-guide evidence as the basis for title warnings and recommendations.",
      "Keep the output rewrite-oriented so sellers can fix the title in one pass.",
    ],
    faqs: [
      {
        question: "Does this tool generate a replacement title?",
        answer:
          "Not in this version. It diagnoses the draft title so the seller can fix structure, repetition, and category-rule gaps with more confidence.",
      },
      {
        question: "Why make title review deterministic first?",
        answer:
          "Because sellers need an auditable first-pass filter before they trust generative title suggestions.",
      },
    ],
    related: ["amazon-browse-search-keyword-checker", "amazon-image-compliance-checker", "amazon-product-compliance"],
  },
  {
    slug: "amazon-image-compliance-checker",
    name: "Amazon Image Compliance Checker",
    platform: "amazon",
    category: "Listing",
    summary:
      "Check whether a product image set covers white-background, detail, lifestyle, and variation-safe requirements.",
    seoTitle: "Amazon Image Compliance Checker | Main Image, Lifestyle, and Detail Review",
    seoDescription:
      "Amazon image compliance checker for main-image rules, white background, lifestyle coverage, detail shots, and category-specific style-guide expectations.",
    intent: "Problem solving",
    noAiReason: "Image-set completeness and main-image rule checks are rules-first review tasks.",
    idealFor: [
      "Brands preparing launch assets",
      "Studios QA-checking deliverables before upload",
      "Operators trying to prevent image-based suppression or weak conversion",
    ],
    requiredInputs: [
      "Product category",
      "Marketplace",
      "Total image count",
      "Main image background and text status",
      "Lifestyle, detail, and infographic counts",
    ],
    outputs: [
      "Image-set completeness score",
      "Main-image compliance warnings",
      "Coverage gaps for lifestyle, scale, or detail shots",
      "Category-specific style-guide evidence",
      "Next image actions before upload",
    ],
    methodology: [
      "Treat the main image as a hard gate and the supporting image set as a conversion-readiness layer.",
      "Separate white-background and no-overlay checks from broader storytelling recommendations.",
      "Use category style-guide evidence to avoid one-size-fits-all image advice.",
    ],
    faqs: [
      {
        question: "Does the tool inspect actual uploaded images yet?",
        answer:
          "No. This version evaluates the declared image set structure and compliance conditions the team is preparing to upload.",
      },
      {
        question: "Why is image count not enough on its own?",
        answer:
          "Because Amazon image quality is about role coverage too: main, detail, scale, lifestyle, and variation-safe usage.",
      },
    ],
    related: ["amazon-listing-title-checker", "amazon-browse-search-keyword-checker", "amazon-product-compliance"],
  },
  {
    slug: "amazon-variation-relationship-checker",
    name: "Amazon Variation Relationship Checker",
    platform: "amazon",
    category: "Listing",
    summary:
      "Evaluate whether parent-child variation setup is coherent, theme-safe, and aligned with style-guide expectations.",
    seoTitle: "Amazon Variation Relationship Checker | Parent Child Theme Review",
    seoDescription:
      "Amazon variation checker for parent-child structure, allowed variation themes, mixed-bundle warnings, and title consistency review.",
    intent: "Problem solving",
    noAiReason: "Variation structure, theme alignment, and consistency checks are rules-led workflows.",
    idealFor: [
      "Catalog teams building parent-child families",
      "Sellers cleaning up duplicated child ASINs",
      "Agencies reviewing variation requests before flat-file upload",
    ],
    requiredInputs: [
      "Product category",
      "Variation theme",
      "Child ASIN count",
      "Whether children differ only by the variation theme",
      "Brand and core-product consistency",
    ],
    outputs: [
      "Variation readiness score",
      "Invalid mixed-family warnings",
      "Theme and title consistency review",
      "Category-specific style-guide evidence",
      "Recommended cleanup actions",
    ],
    methodology: [
      "Focus on whether the parent-child family represents one core product with valid attribute changes.",
      "Warn early when bundles, accessories, or brand mismatches are being forced into one family.",
      "Use category style-guide evidence because variation expectations differ by vertical.",
    ],
    faqs: [
      {
        question: "Can this guarantee Amazon will accept the variation family?",
        answer:
          "No. It is a preflight checker that reduces obvious structural mistakes before the data reaches Seller Central.",
      },
      {
        question: "What is the main failure mode this tool catches?",
        answer:
          "Teams often combine different products, mixed bundle logic, or inconsistent titles under one parent when only a true attribute change is allowed.",
      },
    ],
    related: ["amazon-listing-title-checker", "amazon-browse-search-keyword-checker", "amazon-category-ungating"],
  },
  {
    slug: "amazon-browse-search-keyword-checker",
    name: "Amazon Browse & Search Keyword Checker",
    platform: "amazon",
    category: "Listing",
    summary:
      "Check browse-path fit, title-keyword coverage, backend search-term overlap, and stuffing risk before publishing.",
    seoTitle: "Amazon Browse and Search Keyword Checker | Browse Path and Keyword Fit",
    seoDescription:
      "Amazon browse and search keyword checker for category-path fit, core keyword coverage, title overlap, missing descriptors, and stuffing risk.",
    intent: "Problem solving",
    noAiReason: "Browse placement and keyword-overlap checks can be scored with deterministic rules and category mapping.",
    idealFor: [
      "Sellers rebuilding a weak listing before relaunch",
      "Teams reviewing SEO inputs before flat-file upload",
      "Agencies trying to catch browse-path and search-term mismatches early",
    ],
    requiredInputs: [
      "Product category or browse path",
      "Draft title",
      "Backend search terms",
      "Core target keywords",
      "Optional item type or product type wording",
    ],
    outputs: [
      "Keyword coverage score",
      "Missing descriptor and stuffing warnings",
      "Title-to-backend overlap review",
      "Category-specific browse-and-search evidence",
      "Priority optimization actions",
    ],
    methodology: [
      "Start with category and browse-path alignment before looking at keyword density.",
      "Penalize repetition and duplicate backend terms because discoverability depends on cleaner coverage, not stuffing.",
      "Use style-guide browse-and-search evidence to keep suggestions grounded in Amazon category rules.",
    ],
    faqs: [
      {
        question: "Does this replace keyword research?",
        answer:
          "No. It checks whether the keywords you already chose are distributed and de-duplicated sensibly inside the listing structure.",
      },
      {
        question: "Why combine browse and search in one page?",
        answer:
          "Because many Amazon listing issues come from the interaction between category path, item type, and keyword placement rather than from keyword volume alone.",
      },
    ],
    related: ["amazon-listing-title-checker", "amazon-variation-relationship-checker", "amazon-image-compliance-checker"],
  },
  {
    slug: "amazon-brand-registry",
    name: "Amazon Brand Registry Readiness Checker",
    platform: "amazon",
    category: "Eligibility",
    summary:
      "Help sellers see whether they are ready to apply for Brand Registry and what they still need to gather.",
    seoTitle: "Amazon Brand Registry Checker | Trademark and Application Readiness",
    seoDescription:
      "Amazon Brand Registry readiness page with trademark, brand asset, and documentation requirements for first-batch SEO traffic.",
    intent: "Commercial investigation",
    noAiReason: "Brand Registry is primarily a structured readiness and documentation workflow.",
    idealFor: [
      "New private-label sellers",
      "Growing catalog brands preparing A+ content access",
      "Operators planning defensive brand protection steps",
    ],
    requiredInputs: [
      "Brand name",
      "Trademark status",
      "Selling region",
      "Product category",
      "Product or packaging images",
      "Existing seller account context",
    ],
    outputs: [
      "Application readiness score",
      "Missing document list",
      "Priority next steps",
      "Common blockers before submission",
      "Related post-registry opportunities",
    ],
    methodology: [
      "Keep the page tied to exact seller milestones instead of abstract brand advice.",
      "Make missing evidence obvious because that is the real user friction.",
      "Link registry readiness to downstream benefits like A+ and brand analytics.",
    ],
    faqs: [
      {
        question: "Why is this a better first-batch page than A+ content generation?",
        answer:
          "The intent is narrower, the workflow is more deterministic, and the user can self-qualify without needing generated copy.",
      },
      {
        question: "What makes this page EEAT-friendly?",
        answer:
          "It states the inputs, the process, the limitations, and the downstream decisions instead of pretending to be an official Amazon source.",
      },
    ],
    related: ["amazon-category-ungating", "amazon-product-compliance", "amazon-brand-analytics"],
  },
  {
    slug: "amazon-category-ungating",
    name: "Amazon Category Ungating Checker",
    platform: "amazon",
    category: "Eligibility",
    summary:
      "Screen restricted categories, document expectations, and likely approval blockers before you source inventory.",
    seoTitle: "Amazon Category Ungating Checker | Approval Requirements and Readiness",
    seoDescription:
      "Amazon ungating readiness page covering category restrictions, invoices, brand proof, and next-step guidance for sellers.",
    intent: "Problem solving",
    noAiReason: "Ungating can start as a decision tree around category, proof, and invoices.",
    idealFor: [
      "New sellers testing gated categories",
      "Wholesale operators needing invoice checks before sourcing",
      "Agencies handling approval prep for clients",
    ],
    requiredInputs: [
      "Target category",
      "Marketplace",
      "Supplier invoice status",
      "Brand authorization status",
      "Seller account age or health notes",
      "Any prior rejection context",
    ],
    outputs: [
      "Likely approval path",
      "Documentation gaps",
      "Possible rejection risks",
      "Supplier proof checklist",
      "Related compliance pages to review",
    ],
    methodology: [
      "Treat ungating as evidence readiness, not motivational copy.",
      "Use category-specific questions to reduce broad, thin content.",
      "Keep internal links strong because sellers usually branch into compliance or registry next.",
    ],
    faqs: [
      {
        question: "Can this page become a real tool later without changing URL structure?",
        answer:
          "Yes. The first version can be a strong readiness workflow, then grow into a more dynamic document scoring tool behind the same slug.",
      },
      {
        question: "What is the key SEO angle here?",
        answer:
          "Specific approval-intent queries tend to convert because the searcher already has a sourcing or launch task in motion.",
      },
    ],
    related: ["amazon-brand-registry", "amazon-product-compliance", "amazon-fba-prep"],
  },
  {
    slug: "amazon-fba-prep",
    name: "Amazon FBA Prep Checklist",
    platform: "amazon",
    category: "Operations",
    summary:
      "Turn packaging, labeling, and fulfillment-center prep rules into a simple shipment readiness workflow.",
    seoTitle: "Amazon FBA Prep Checklist | Packaging, Labeling, and Shipment Readiness",
    seoDescription:
      "FBA prep landing page for sellers covering packaging inputs, labeling requirements, shipment readiness, and first-batch SEO structure.",
    intent: "Problem solving",
    noAiReason: "Prep and labeling requirements are SOP and checklist heavy.",
    idealFor: [
      "Sellers sending their first FBA shipment",
      "3PL teams building prep SOPs",
      "Operators trying to reduce FC rejection risk",
    ],
    requiredInputs: [
      "Product type",
      "Packaging format",
      "Labeling approach",
      "Prep provider or in-house prep",
      "Fragile or special-handling notes",
      "Target marketplace",
    ],
    outputs: [
      "Prep checklist by shipment type",
      "Label and packaging gaps",
      "Likely rejection points",
      "Hand-off notes for warehouse or prep center",
      "Related cost calculators to run next",
    ],
    methodology: [
      "Keep the page operational and concrete, not inspirational.",
      "Structure content around real shipment tasks so it earns save and revisit behavior.",
      "Support SEO with exact procedural language sellers already use.",
    ],
    faqs: [
      {
        question: "Why is a checklist page worth building first?",
        answer:
          "Because shipment and prep intent is persistent, practical, and less dependent on speculative AI value than content-generation tools.",
      },
      {
        question: "Can this page drive organic traffic on its own?",
        answer:
          "Yes, if it is specific, procedural, and connected to adjacent calculators and preparation tasks.",
      },
    ],
    related: ["amazon-shipping-calculator", "amazon-fba-calculator", "amazon-product-compliance"],
  },
  {
    slug: "amazon-inventory-management",
    name: "Amazon Inventory Planner",
    platform: "amazon",
    category: "Operations",
    summary:
      "Help sellers scope reorder timing, stockout risk, and lead-time pressure before inventory becomes a ranking problem.",
    seoTitle: "Amazon Inventory Planner | Restock Timing, Lead Time, and Stockout Risk",
    seoDescription:
      "Inventory planning landing page for Amazon sellers with velocity, lead-time, and safety-stock inputs designed for SEO and future tool expansion.",
    intent: "Commercial investigation",
    noAiReason: "The first version can be built on lead time, stock, and velocity rules.",
    idealFor: [
      "Brands with long supplier lead times",
      "Operators approaching Prime Day or Q4",
      "Teams trying to reduce stranded inventory and stockouts",
    ],
    requiredInputs: [
      "Current inventory units",
      "Average sales velocity",
      "Supplier lead time",
      "Inbound shipment timing",
      "Seasonality or event context",
      "Optional IPI or storage constraints",
    ],
    outputs: [
      "Restock urgency signal",
      "Safety stock planning notes",
      "Event-risk warning",
      "Reorder timing checklist",
      "Links to freight and fee pages for deeper planning",
    ],
    methodology: [
      "Keep the page centered on inputs sellers already know.",
      "Use time-to-stockout framing because it matches real operator questions.",
      "Separate evergreen process advice from event-driven planning blocks.",
    ],
    faqs: [
      {
        question: "Why include inventory management in the first batch?",
        answer:
          "It maps to durable operational search intent and supports later product expansion into saved dashboards and alerting.",
      },
      {
        question: "Does this page need live Amazon inventory APIs on day one?",
        answer:
          "No. It can earn traffic first with strong planning content and a structured input workflow, then layer in saved calculations later.",
      },
    ],
    related: ["amazon-fba-calculator", "amazon-shipping-calculator", "amazon-seasonal-planning"],
  },
];

export const additionalAmazonSkillTools: ToolDefinition[] = [
  buildGenericTool({
    slug: "amazon-profit-analyzer",
    name: "Amazon Profit Analyzer",
    category: "Calculator",
    summary: "Break down real SKU margin after ads, returns, discounts, storage, and hidden operating costs.",
    requiredInputs: ["ASIN or SKU", "Sell price", "COGS", "Ad spend", "Return rate", "Fulfillment costs"],
    outputs: ["True margin breakdown", "Hidden cost leaks", "Break-even ACoS", "First margin fixes"],
    related: ["amazon-fba-calculator", "amazon-shipping-calculator", "amazon-repricing-strategy"],
  }),
  buildGenericTool({
    slug: "amazon-repricing-strategy",
    name: "Amazon Repricing Strategy",
    category: "Growth",
    summary: "Turn price, margin, and Buy Box goals into repricing rules and a response path.",
    requiredInputs: ["Current price", "Minimum margin", "Competitor price band", "Fulfillment method", "Goal"],
    outputs: ["Pricing rules", "Price floor and ceiling", "Buy Box tradeoffs", "Alert thresholds"],
    related: ["amazon-buy-box", "amazon-price-tracker", "amazon-profit-analyzer"],
  }),
  buildGenericTool({
    slug: "amazon-buy-box",
    name: "Amazon Buy Box Optimizer",
    category: "Growth",
    summary: "Check what is weakening Buy Box share and what to fix first.",
    requiredInputs: ["ASIN", "Current price", "Fulfillment model", "Seller rating", "Shipping SLA"],
    outputs: ["Buy Box risk", "Price and fulfillment gaps", "First fixes to make", "Competitor pressure"],
    related: ["amazon-repricing-strategy", "amazon-price-tracker", "amazon-profit-analyzer"],
  }),
  buildGenericTool({
    slug: "amazon-deal-finder",
    name: "Amazon Deal Finder",
    category: "Growth",
    summary: "Compare promo formats like coupons, deals, and Prime discounts against margin and inventory reality.",
    requiredInputs: ["ASIN", "Current price", "Margin", "Inventory", "Promo window", "Goal"],
    outputs: ["Best promo type", "Margin-safe discount band", "Inventory fit", "Best campaign timing"],
    related: ["amazon-coupon-strategy", "amazon-dayparting-strategy", "amazon-profit-analyzer"],
  }),
  buildGenericTool({
    slug: "amazon-ppc-campaign",
    name: "Amazon PPC Campaign Builder",
    category: "Advertising",
    summary: "Show which campaign parts are wasting spend, which are working, and what to change first.",
    requiredInputs: ["Campaign export", "Target ACoS", "Campaign mode"],
    outputs: ["Campaign efficiency map", "Waste flags", "Winners vs cleanup", "Next actions"],
    related: ["amazon-negative-keywords", "amazon-advertising-strategy", "amazon-dayparting-strategy"],
  }),
  buildGenericTool({
    slug: "amazon-advertising-strategy",
    name: "Amazon Advertising Strategy",
    category: "Advertising",
    summary: "Show how budget should be split across ad types and where spend should move next.",
    requiredInputs: ["Campaign export", "Monthly budget", "Hero ASIN count", "Primary goal", "Brand readiness"],
    outputs: ["Channel allocation", "Mix concentration", "Budget focus signals", "Next actions"],
    related: ["amazon-ppc-campaign", "amazon-display-ads", "amazon-brand-tailored-promotions"],
  }),
  buildGenericTool({
    slug: "amazon-negative-keywords",
    name: "Amazon Negative Keywords Tool",
    category: "Advertising",
    summary: "Turn wasted search terms into keep, test, negate, and isolate actions.",
    requiredInputs: ["Search term report", "Spend", "Clicks", "Orders", "Campaign context"],
    outputs: ["Negative list", "Isolation candidates", "Waste map", "Cleanup priorities"],
    related: ["amazon-ppc-campaign", "amazon-dayparting-strategy", "amazon-display-ads"],
  }),
  buildGenericTool({
    slug: "amazon-display-ads",
    name: "Amazon Display Ads Planner",
    category: "Advertising",
    summary: "Choose the best audience, retargeting path, and product targets for the next display push.",
    requiredInputs: ["ASIN", "Audience goal", "Budget", "Traffic sources", "Competitor set"],
    outputs: ["Audience structure", "Retargeting setup", "Targeting matrix", "Creative direction"],
    related: ["amazon-advertising-strategy", "amazon-brand-tailored-promotions", "amazon-competitor-monitoring"],
  }),
  buildGenericTool({
    slug: "amazon-coupon-strategy",
    name: "Amazon Coupon Strategy",
    category: "Advertising",
    summary: "Choose a coupon move that helps conversion without creating a margin or inventory mess.",
    requiredInputs: ["ASIN", "Price", "Margin", "Promo window", "Inventory", "Objective"],
    outputs: ["Coupon setup", "Best discount depth", "Stacking warnings", "Best timing"],
    related: ["amazon-deal-finder", "amazon-dayparting-strategy", "amazon-profit-analyzer"],
  }),
  buildGenericTool({
    slug: "amazon-dayparting-strategy",
    name: "Amazon Dayparting Strategy",
    category: "Advertising",
    summary: "Find the hours and weekdays where budget should be pushed, cut, or protected.",
    requiredInputs: ["Hourly performance data", "Timezone", "Budget", "ACoS history", "Conversion data"],
    outputs: ["Daypart schedule", "Bid multipliers", "Budget shifts", "High-waste windows"],
    related: ["amazon-ppc-campaign", "amazon-negative-keywords", "amazon-coupon-strategy"],
  }),
  buildGenericTool({
    slug: "amazon-listing-optimization",
    name: "Amazon Listing Optimization",
    category: "Listing",
    summary: "Show what the listing should rewrite first to improve discovery and conversion.",
    requiredInputs: ["ASIN or product details", "Marketplace", "Keyword list", "Current listing", "Competitor ASINs"],
    outputs: ["Title rewrite", "Bullet rewrites", "Description updates", "First fixes to make"],
    related: ["amazon-backend-keywords", "amazon-search-optimization", "amazon-a-plus-content"],
  }),
  buildGenericTool({
    slug: "amazon-a-plus-content",
    name: "Amazon A+ Content Planner",
    category: "Listing",
    summary: "Turn product proof into the A+ sections, copy, and visuals worth building first.",
    requiredInputs: ["Brand tone", "Product benefits", "Audience", "Existing assets", "Competitor references"],
    outputs: ["Module layout", "Copy direction", "Image direction", "Comparison section ideas"],
    related: ["amazon-enhanced-brand-content", "amazon-listing-images", "amazon-storefront-design"],
  }),
  buildGenericTool({
    slug: "amazon-enhanced-brand-content",
    name: "Amazon Enhanced Brand Content Planner",
    category: "Listing",
    summary: "Show how Premium A+ or Brand Story should explain the product and earn trust faster.",
    requiredInputs: ["Brand story", "Product family", "Audience", "Assets", "Desired sections"],
    outputs: ["Premium A+ structure", "Brand Story outline", "Asset direction", "Trust-building points"],
    related: ["amazon-a-plus-content", "amazon-storefront-design", "amazon-brand-registry"],
  }),
  buildGenericTool({
    slug: "amazon-backend-keywords",
    name: "Amazon Backend Keywords Tool",
    category: "Listing",
    summary: "Compress, deduplicate, and prioritize backend search terms under byte limits.",
    requiredInputs: ["Marketplace", "Current title", "Bullets", "Keyword pool", "Competitor keywords"],
    outputs: ["Backend term set", "Priority terms", "Byte-safe structure", "Coverage gaps"],
    related: ["amazon-search-optimization", "amazon-listing-optimization", "amazon-keyword-research"],
  }),
  buildGenericTool({
    slug: "amazon-search-optimization",
    name: "Amazon Search Optimization",
    category: "Listing",
    summary: "Show why a listing is not climbing for target keywords and what to fix first.",
    requiredInputs: ["ASIN or URL", "Target keywords", "Marketplace", "Current rank if known"],
    outputs: ["Ranking blockers", "Relevance gaps", "Conversion support gaps", "First fixes to make"],
    related: ["amazon-backend-keywords", "amazon-keyword-research", "amazon-rank-tracker"],
  }),
  buildGenericTool({
    slug: "amazon-listing-images",
    name: "Amazon Listing Images Planner",
    category: "Listing",
    summary: "Turn claims, objections, and buyer doubts into a structured image-by-image plan.",
    requiredInputs: ["Category", "Benefits", "Differentiators", "Target customer", "Existing media", "Competitor links"],
    outputs: ["Image sequence", "Infographic ideas", "Mobile-first order", "Testing ideas"],
    related: ["amazon-image-compliance-checker", "amazon-product-photography", "amazon-a-plus-content"],
  }),
  buildGenericTool({
    slug: "amazon-product-photography",
    name: "Amazon Product Photography Planner",
    category: "Listing",
    summary: "Convert conversion gaps into a production-ready shot list, props list, and post-production plan.",
    requiredInputs: ["Product use case", "Features", "Audience", "Brand tone", "Current image gaps"],
    outputs: ["Shot list", "Prop and angle list", "Retouching steps", "Priority photo gaps"],
    related: ["amazon-listing-images", "amazon-image-compliance-checker", "amazon-a-plus-content"],
  }),
  buildGenericTool({
    slug: "amazon-storefront-design",
    name: "Amazon Storefront Design Planner",
    category: "Listing",
    summary: "Show how the storefront should guide traffic, page order, and shopper flow.",
    requiredInputs: ["Catalog", "Hero collections", "Audience segments", "Traffic plan"],
    outputs: ["Store structure", "Page structure", "Module layout", "Traffic flow plan"],
    related: ["amazon-a-plus-content", "amazon-enhanced-brand-content", "amazon-brand-analytics"],
  }),
  buildGenericTool({
    slug: "amazon-international-listings",
    name: "Amazon International Listings",
    category: "Listing",
    summary: "Adapt listings for new marketplaces with localization, not just direct translation.",
    requiredInputs: ["Original listing", "Source locale", "Target locale", "Pricing", "Compliance caveats", "Keyword goals"],
    outputs: ["Localized listing", "Messaging shifts", "Pricing updates", "Localization risks"],
    related: ["amazon-global-selling", "amazon-listing-optimization", "amazon-product-compliance"],
  }),
  buildGenericTool({
    slug: "amazon-variation-strategy",
    name: "Amazon Variation Strategy",
    category: "Listing",
    summary: "Decide when to merge, split, or preserve parent-child structures for ranking and conversion.",
    requiredInputs: ["Catalog structure", "Variation attributes", "ASIN family data", "Reviews", "Sales mix"],
    outputs: ["Merge or split call", "Variation tradeoffs", "Conversion clarity", "Execution path"],
    related: ["amazon-variation-relationship-checker", "amazon-listing-optimization", "amazon-category-ungating"],
  }),
  buildGenericTool({
    slug: "amazon-keyword-research",
    name: "Amazon Keyword Research",
    category: "Research",
    summary: "Find the search terms worth targeting first instead of chasing a bloated keyword list.",
    requiredInputs: ["Seed keyword", "Marketplace", "Competitor ASINs", "Target price band"],
    outputs: ["Priority keywords", "Intent groups", "Opportunity shortlist", "What to test first"],
    related: ["amazon-search-optimization", "amazon-backend-keywords", "amazon-rank-tracker"],
  }),
  buildGenericTool({
    slug: "amazon-trending-products",
    name: "Amazon Trending Products",
    category: "Research",
    summary: "Find product ideas gaining momentum before they become crowded and expensive.",
    requiredInputs: ["Marketplace", "Category or keyword", "Time horizon", "Budget constraints"],
    outputs: ["Trend shortlist", "Season timing", "Risk flags", "What to validate next"],
    related: ["amazon-product-research", "amazon-niche-finder", "amazon-seasonal-planning"],
  }),
  buildGenericTool({
    slug: "amazon-product-research",
    name: "Amazon Product Research",
    category: "Research",
    summary: "Check whether a product idea is worth entering on Amazon before you spend more time on it.",
    requiredInputs: ["Product idea or keyword", "Marketplace", "Target margin", "Sourcing assumptions"],
    outputs: ["Demand and competition view", "Entry barriers", "Go or no-go call", "Next validation steps"],
    related: ["amazon-niche-finder", "amazon-trending-products", "amazon-profit-analyzer"],
  }),
  buildGenericTool({
    slug: "amazon-niche-finder",
    name: "Amazon Niche Finder",
    category: "Research",
    summary: "Find niches with enough demand and enough room left to be worth entering.",
    requiredInputs: ["Broad category", "Budget", "Target price range", "Marketplace", "Risk tolerance"],
    outputs: ["Niche shortlist", "Competition pressure", "Margin potential", "Best niches to test"],
    related: ["amazon-product-research", "amazon-keyword-research", "amazon-trending-products"],
  }),
  buildGenericTool({
    slug: "amazon-seller-analytics",
    name: "Amazon Seller Analytics",
    category: "Research",
    summary: "Read a seller catalog to spot assortment patterns, price ladders, and the gaps worth reacting to.",
    requiredInputs: ["Storefront URL or portfolio ASINs", "Marketplace", "Benchmark targets"],
    outputs: ["Catalog patterns", "Price tier map", "Assortment gaps", "What to react to first"],
    related: ["amazon-competitor-analysis", "amazon-brand-analytics", "amazon-seller-analytics"],
  }),
  buildGenericTool({
    slug: "amazon-sales-estimator",
    name: "Amazon Sales Estimator",
    category: "Research",
    summary: "Estimate monthly sales from BSR, ASIN, or keyword context and interpret what the estimate means.",
    requiredInputs: ["BSR or ASIN or keyword", "Marketplace", "Category", "Price"],
    outputs: ["Sales estimate", "Confidence level", "Category read", "Next step"],
    related: ["amazon-keyword-research", "amazon-product-research", "amazon-rank-tracker"],
  }),
  buildGenericTool({
    slug: "amazon-rank-tracker",
    name: "Amazon Rank Tracker",
    category: "Research",
    summary: "Track the keyword positions that matter and show which drops need action first.",
    requiredInputs: ["ASIN", "Target keywords", "Marketplace", "Baseline ranks", "Competitor ASINs"],
    outputs: ["Tracking setup", "Priority keywords", "Alert rules", "When to react"],
    related: ["amazon-keyword-tracker", "amazon-search-optimization", "amazon-keyword-research"],
  }),
  buildGenericTool({
    slug: "amazon-keyword-tracker",
    name: "Amazon Keyword Tracker",
    category: "Research",
    summary: "Monitor keyword movement and surface which terms need protection, recovery, or expansion.",
    requiredInputs: ["ASINs", "Target keywords", "Competitors", "Marketplace", "Alert threshold"],
    outputs: ["Keyword watchlist", "Alert conditions", "Main keyword shifts", "What to do next"],
    related: ["amazon-rank-tracker", "amazon-search-optimization", "amazon-price-tracker"],
  }),
  buildGenericTool({
    slug: "amazon-price-tracker",
    name: "Amazon Price Tracker",
    category: "Research",
    summary: "Watch pricing moves and show when a change is worth matching, holding, or ignoring.",
    requiredInputs: ["ASIN or keyword set", "Marketplace", "Competitor targets", "Alert conditions"],
    outputs: ["Price watch setup", "Response rules", "Critical price thresholds", "Hold or react"],
    related: ["amazon-repricing-strategy", "amazon-buy-box", "amazon-competitor-monitoring"],
  }),
  buildGenericTool({
    slug: "amazon-competitor-analysis",
    name: "Amazon Competitor Analysis",
    category: "Research",
    summary: "Compare your ASIN against competitors across positioning, reviews, price, and listing quality.",
    requiredInputs: ["Your ASIN", "Competitor ASINs", "Marketplace", "Business goal"],
    outputs: ["Competitor comparison", "Main gaps", "Best gap to attack", "What to do first"],
    related: ["amazon-competitor-monitoring", "amazon-review-analyzer", "amazon-search-optimization"],
  }),
  buildGenericTool({
    slug: "amazon-competitor-monitoring",
    name: "Amazon Competitor Monitoring",
    category: "Research",
    summary: "Keep a live watchlist on competitor changes so the team knows what is noise and what needs action.",
    requiredInputs: ["Competitor ASINs", "Marketplace", "Alert preferences", "Cadence"],
    outputs: ["Competitor watchlist", "Alert thresholds", "What to ignore", "What to react to first"],
    related: ["amazon-price-tracker", "amazon-competitor-analysis", "amazon-rank-tracker"],
  }),
  buildGenericTool({
    slug: "amazon-review-analyzer",
    name: "Amazon Review Analyzer",
    category: "Research",
    summary: "Turn review text into the complaints, praise, and product fixes that matter most.",
    requiredInputs: ["Review text or TSV/CSV paste", "Visible rating values where available"],
    outputs: ["Complaint themes", "Praise themes", "Product and message gaps", "What to fix first"],
    related: ["amazon-return-reduction", "amazon-listing-optimization", "amazon-product-research"],
  }),
  buildGenericTool({
    slug: "amazon-brand-analytics",
    name: "Amazon Brand Analytics Interpreter",
    category: "Research",
    summary: "Turn Brand Analytics exports into a clear read on winning queries, basket overlap, and competitive gaps.",
    requiredInputs: ["Brand Analytics export", "Marketplace", "Own ASIN (optional)"],
    outputs: ["Winning queries", "Repeated winner ASINs", "Presence rate", "Protect or fix actions"],
    related: ["amazon-seller-analytics", "amazon-keyword-research", "amazon-storefront-design"],
  }),
  buildGenericTool({
    slug: "amazon-brand-tailored-promotions",
    name: "Amazon Brand Tailored Promotions",
    category: "Growth",
    summary: "Plan audience-specific promotions for repeat buyers, win-back flows, and basket expansion.",
    requiredInputs: ["Audience segment", "Target products", "Discount budget", "Retention goal"],
    outputs: ["Promo structure", "Segment offers", "Budget limits", "Retention moves"],
    related: ["amazon-subscribe-save", "amazon-advertising-strategy", "amazon-coupon-strategy"],
  }),
  buildGenericTool({
    slug: "amazon-global-selling",
    name: "Amazon Global Selling Planner",
    category: "Growth",
    summary: "Assess which marketplaces to enter next and what the launch sequence should look like.",
    requiredInputs: ["Current marketplace", "Target countries", "Category", "Margin assumptions", "Compliance readiness"],
    outputs: ["Expansion shortlist", "Launch order", "Localization updates", "Risk flags"],
    related: ["amazon-international-listings", "amazon-product-compliance", "amazon-global-selling"],
  }),
  buildGenericTool({
    slug: "amazon-subscribe-save",
    name: "Amazon Subscribe & Save Optimizer",
    category: "Growth",
    summary: "Improve repeat purchase adoption, discount ladders, and replenishment economics.",
    requiredInputs: ["Product type", "Repeat interval", "Current discount", "Repeat-order data"],
    outputs: ["Enrollment setup", "Discount ladder", "Retention risks", "Repeat-purchase actions"],
    related: ["amazon-brand-tailored-promotions", "amazon-review-strategy", "amazon-return-reduction"],
  }),
  buildGenericTool({
    slug: "amazon-review-strategy",
    name: "Amazon Review Strategy",
    category: "Growth",
    summary: "Show the safest way to grow reviews through timing, order flow, and allowed channels.",
    requiredInputs: ["Product stage", "Order volume", "Current review count", "Allowed channels", "Marketplace"],
    outputs: ["Review growth plan", "Best timing", "Channels to use", "Compliance limits"],
    related: ["amazon-vine-program", "amazon-brand-tailored-promotions", "amazon-return-reduction"],
  }),
  buildGenericTool({
    slug: "amazon-vine-program",
    name: "Amazon Vine Program Planner",
    category: "Growth",
    summary: "Decide if Vine fits the SKU, when to enroll, and what review-quality tradeoffs to expect.",
    requiredInputs: ["Product status", "Review count", "Margin", "Launch stage", "Marketplace"],
    outputs: ["Vine fit", "Enrollment timing", "SKU selection", "What to expect"],
    related: ["amazon-review-strategy", "amazon-product-research", "amazon-brand-registry"],
  }),
  buildGenericTool({
    slug: "amazon-return-reduction",
    name: "Amazon Return Reduction",
    category: "Growth",
    summary: "Group return causes and turn them into listing, packaging, and product-level fixes.",
    requiredInputs: ["Return reason data", "Reviews", "Category", "Packaging notes", "Listing copy"],
    outputs: ["Root-cause clusters", "Return reduction actions", "Listing fixes", "Packaging improvements"],
    related: ["amazon-review-analyzer", "amazon-product-compliance", "amazon-listing-optimization"],
  }),
  buildGenericTool({
    slug: "amazon-seasonal-planning",
    name: "Amazon Seasonal Planning",
    category: "Growth",
    summary: "Map the selling calendar so inventory, ads, and promo timing line up with the next big window.",
    requiredInputs: ["Marketplace", "Events", "Lead times", "Inventory constraints", "Promo budget"],
    outputs: ["Seasonal timeline", "Inventory checkpoints", "Ad milestones", "Promo calendar"],
    related: ["amazon-inventory-management", "amazon-dayparting-strategy", "amazon-trending-products"],
  }),
  buildGenericTool({
    slug: "amazon-product-bundling",
    name: "Amazon Product Bundling",
    category: "Growth",
    summary: "Design bundle concepts that raise AOV without destroying margin or offer clarity.",
    requiredInputs: ["Catalog", "Complementary items", "Price target", "Margin constraints"],
    outputs: ["Bundle ideas", "Pricing bands", "Bundle fit notes", "Execution checklist"],
    related: ["amazon-variation-strategy", "amazon-profit-analyzer", "amazon-listing-optimization"],
  }),
  buildGenericTool({
    slug: "amazon-private-label",
    name: "Amazon Private Label Planner",
    category: "Growth",
    summary: "Check whether the private-label idea is strong enough and what to validate before launch.",
    requiredInputs: ["Product idea", "Budget", "Sourcing country", "Differentiation angle", "Target market"],
    outputs: ["Launch roadmap", "Differentiation points", "Main risks", "Next validation actions"],
    related: ["amazon-product-research", "amazon-wholesale-sourcing", "amazon-brand-registry"],
  }),
  buildGenericTool({
    slug: "amazon-wholesale-sourcing",
    name: "Amazon Wholesale Sourcing",
    category: "Growth",
    summary: "Check suppliers, MOQ pressure, and resale margin before chasing the deal further.",
    requiredInputs: ["Category", "Target brands", "MOQ range", "Target margin", "Logistics assumptions"],
    outputs: ["Supplier screening", "MOQ tradeoffs", "Margin limits", "Negotiation checklist"],
    related: ["amazon-category-ungating", "amazon-profit-analyzer", "amazon-global-selling"],
  }),
  buildGenericTool({
    slug: "amazon-suspension-appeal",
    name: "Amazon Suspension Appeal",
    category: "Compliance",
    summary: "Turn a policy notice into a clear appeal draft with root cause, fixes, and prevention steps.",
    requiredInputs: ["Suspension notice", "Policy reason", "Timeline", "Actions taken", "Evidence"],
    outputs: ["POA structure", "Root cause", "Corrective actions", "Prevention steps"],
    related: ["amazon-product-compliance", "amazon-category-ungating", "amazon-brand-registry"],
  }),
];

export const firstBatchTiktokShopTools: ToolDefinition[] = [
  buildGenericTool({
    slug: "tiktok-shop-seller-intake",
    name: "TikTok Shop Seller Intake",
    platform: "tiktok-shop",
    category: "Operations",
    summary:
      "Clarify your TikTok Shop starting point, main limits, and the next move worth making.",
    requiredInputs: [
      "Seller type",
      "Primary market",
      "Category or niche",
      "Current account or shop status",
      "Budget and content capacity",
      "Near-term business goal",
    ],
    outputs: ["Seller setup", "Main constraints", "Best starting path", "Related tools to open next"],
    related: [
      "tiktok-shop-product-research",
      "tiktok-shop-hook-writing",
      "tiktok-shop-short-video-brief",
    ],
  }),
  buildGenericTool({
    slug: "tiktok-shop-product-research",
    name: "TikTok Shop Product Research",
    platform: "tiktok-shop",
    category: "Research",
    summary:
      "Compare product ideas and show which one is worth testing first based on demand, content fit, and margin reality.",
    requiredInputs: [
      "Category or lane",
      "Target buyer",
      "Budget range",
      "Price band",
      "Sourcing assumptions",
      "Fulfillment constraints",
    ],
    outputs: [
      "Product shortlist",
      "Why these products fit",
      "Content fit clues",
      "Main risk and next step",
    ],
    related: [
      "tiktok-shop-seller-intake",
      "tiktok-shop-hook-writing",
      "tiktok-shop-short-video-brief",
    ],
  }),
  buildGenericTool({
    slug: "tiktok-shop-hook-writing",
    name: "TikTok Shop Hook Writing",
    platform: "tiktok-shop",
    category: "Growth",
    summary:
      "Turn product angle and proof into opening hooks the team can test next.",
    requiredInputs: [
      "Product",
      "Audience",
      "Primary pain point or desire",
      "Content angle",
      "Proof or demonstration asset",
    ],
    outputs: [
      "Hook ideas",
      "Hook variations",
      "Opening-line options",
      "First hooks to test",
    ],
    related: [
      "tiktok-shop-seller-intake",
      "tiktok-shop-product-research",
      "tiktok-shop-short-video-brief",
    ],
  }),
  buildGenericTool({
    slug: "tiktok-shop-short-video-brief",
    name: "TikTok Shop Short Video Plan",
    platform: "tiktok-shop",
    category: "Growth",
    summary:
      "Turn the chosen hook into a short-video outline with scene order, proof beats, CTA, and shot guidance.",
    requiredInputs: [
      "Product",
      "Offer or CTA",
      "Chosen hook",
      "Creator style or lane",
      "Available proof assets",
    ],
    outputs: ["Video outline", "Scene sequence", "Proof shots", "Shot list"],
    related: [
      "tiktok-shop-seller-intake",
      "tiktok-shop-product-research",
      "tiktok-shop-hook-writing",
    ],
  }),
  buildGenericTool({
    slug: "tiktok-shop-product-performance",
    name: "TikTok Shop Product Performance",
    platform: "tiktok-shop",
    category: "Operations",
    summary:
      "Show whether a SKU should keep running, reset, or stop based on demand, conversion, and margin.",
    requiredInputs: [
      "Product or SKU",
      "Traffic quality",
      "Conversion rate",
      "Margin reality",
      "Refund pressure",
      "Content output or test volume",
    ],
    outputs: [
      "Scale or hold call",
      "Main risk",
      "Next move",
      "What to do now",
    ],
    related: [
      "tiktok-shop-product-research",
      "tiktok-shop-kill-rules",
      "tiktok-shop-content-strategy",
    ],
  }),
  buildGenericTool({
    slug: "tiktok-shop-kill-rules",
    name: "TikTok Shop Kill Rules",
    platform: "tiktok-shop",
    category: "Operations",
    summary:
      "Set clear stop, extend, or retry rules before a weak SKU burns more time and budget.",
    requiredInputs: [
      "Product or test lane",
      "Content rounds completed",
      "Current conversion signal",
      "Margin or spend pressure",
      "Refund or complaint pressure",
      "Recovery confidence",
    ],
    outputs: [
      "Kill or extend call",
      "Retry conditions",
      "Budget stop line",
      "What to test next",
    ],
    related: [
      "tiktok-shop-product-performance",
      "tiktok-shop-product-research",
      "tiktok-shop-content-strategy",
    ],
  }),
  buildGenericTool({
    slug: "tiktok-shop-creator-research",
    name: "TikTok Shop Creator Research",
    platform: "tiktok-shop",
    category: "Research",
    summary:
      "Find the creator type and reference examples most worth studying first.",
    requiredInputs: [
      "Product or niche",
      "Target buyer",
      "Creator lane goal",
      "Budget reality",
      "Proof requirement",
    ],
    outputs: [
      "Creator type to target",
      "Reference creators",
      "Content gaps",
      "Who to scout next",
    ],
    related: [
      "tiktok-shop-product-research",
      "tiktok-shop-content-strategy",
      "tiktok-shop-hook-writing",
    ],
  }),
  buildGenericTool({
    slug: "tiktok-shop-content-strategy",
    name: "TikTok Shop Content Strategy",
    platform: "tiktok-shop",
    category: "Growth",
    summary:
      "Choose the content mix and publishing rhythm the team can actually keep up each week.",
    requiredInputs: [
      "Product lane",
      "Primary growth goal",
      "Creator or content lane",
      "Weekly content capacity",
      "Offer pressure",
    ],
    outputs: ["Content mix", "Publishing schedule", "Best format to lean on", "30-day publishing schedule"],
    related: [
      "tiktok-shop-creator-research",
      "tiktok-shop-hook-writing",
      "tiktok-shop-short-video-brief",
    ],
  }),
];

export const firstBatchShopifyTools: ToolDefinition[] = [
  buildGenericTool({
    slug: "shopify-product-page-audit",
    name: "Shopify Product Page Audit",
    platform: "shopify",
    category: "Listing",
    summary:
      "Show what is hurting conversion on the product page, what can wait, and what to fix first.",
    requiredInputs: [
      "Product page URL",
      "Primary product and hero offer",
      "Current price point or discount setup",
      "Traffic source mix",
      "Target buyer and buying intent",
      "Known conversion or refund concern",
    ],
    outputs: [
      "Primary conversion problem",
      "Trust and structure gaps",
      "Leave-alone-for-now list",
      "Next page fix",
    ],
    related: [
      "shopify-pdp-copy-assembler",
      "shopify-returns-friction-audit",
      "shopify-launch-readiness-scorecard",
    ],
  }),
  buildGenericTool({
    slug: "shopify-review-mining",
    name: "Shopify Review Mining",
    platform: "shopify",
    category: "Research",
    summary:
      "Turn customer reviews into message angles, objection handling, and product fixes the team can actually use.",
    requiredInputs: [
      "Review export or pasted review text",
      "Product or collection",
      "Target buyer",
      "Known conversion problem",
    ],
    outputs: [
      "Pain-point clusters",
      "Benefit and proof lines",
      "Objection map",
      "Messaging priorities",
    ],
    related: [
      "shopify-product-page-audit",
      "shopify-pricing-test-planner",
      "shopify-channel-landing-router",
    ],
  }),
  buildGenericTool({
    slug: "shopify-competitor-teardown",
    name: "Shopify Competitor Teardown",
    platform: "shopify",
    category: "Research",
    summary:
      "Compare your store or PDP against competitors and surface the positioning, offer, and conversion gaps worth fixing first.",
    requiredInputs: [
      "Your store or PDP URL",
      "1 to 3 competitor URLs",
      "Core product category",
      "Primary growth goal",
    ],
    outputs: [
      "Competitor gap map",
      "Positioning differences to note",
      "Offer and trust comparison",
      "First fixes to make",
    ],
    related: [
      "shopify-product-page-audit",
      "shopify-pdp-copy-assembler",
      "shopify-launch-readiness-scorecard",
    ],
  }),
  buildGenericTool({
    slug: "shopify-offer-positioning",
    name: "Shopify Offer Positioning",
    platform: "shopify",
    category: "Growth",
    summary:
      "Turn product truth and buyer tension into the one offer angle your pages should share.",
    requiredInputs: [
      "Product",
      "Target buyer and purchase trigger",
      "Main benefit or transformation",
      "Current offer and discount setup",
      "Available proof and trust assets",
      "What is not converting today",
    ],
    outputs: [
      "Offer line to use",
      "Buy-now angle",
      "Proof order for page and pricing",
      "Next page fix",
    ],
    related: [
      "shopify-pricing-test-planner",
      "shopify-pdp-copy-assembler",
      "shopify-launch-readiness-scorecard",
    ],
  }),
  buildGenericTool({
    slug: "shopify-email-flow-planner",
    name: "Shopify Email Flow Planner",
    platform: "shopify",
    category: "Growth",
    summary:
      "Lay out the first email flow your team should build, including triggers, message order, and build order.",
    requiredInputs: [
      "Store stage",
      "Lifecycle goal",
      "Existing email setup",
      "Average order pattern",
      "Promo setup",
    ],
    outputs: [
      "Flow build order",
      "Trigger map",
      "Message sequence",
      "Next build priority",
    ],
    related: [
      "shopify-post-purchase-flow-planner",
      "shopify-reorder-reminder-planner",
      "shopify-promo-calendar-planner",
    ],
  }),
  buildGenericTool({
    slug: "shopify-ugc-brief-builder",
    name: "Shopify UGC Plan Builder",
    platform: "shopify",
    category: "Growth",
    summary:
      "Turn audience tension and proof into a UGC outline with scenes, proof moments, and CTA guidance.",
    requiredInputs: [
      "Product",
      "Audience",
      "Offer angle",
      "Primary objection",
      "Available proof assets",
    ],
    outputs: ["UGC outline", "Scene order", "Proof shots", "CTA guidance"],
    related: [
      "shopify-pricing-test-planner",
      "shopify-pdp-copy-assembler",
      "shopify-faq-objection-builder",
    ],
  }),
  buildGenericTool({
    slug: "shopify-landing-page-angle-builder",
    name: "Shopify Landing Page Angle Builder",
    platform: "shopify",
    category: "Growth",
    summary:
      "Choose the landing-page angle that should guide the rewrite and traffic path.",
    requiredInputs: [
      "Landing page URL or draft angle",
      "Traffic source",
      "Target buyer and awareness level",
      "Primary offer",
      "Available proof",
      "Current bounce or conversion concern",
    ],
    outputs: [
      "Landing-page angle to use",
      "Hero and bridge structure",
      "Proof order for cold traffic",
      "Rewrite plan",
    ],
    related: [
      "shopify-channel-landing-router",
      "shopify-pdp-copy-assembler",
      "shopify-launch-readiness-scorecard",
    ],
  }),
  buildGenericTool({
    slug: "shopify-bundle-offer-designer",
    name: "Shopify Bundle Offer Designer",
    platform: "shopify",
    category: "Growth",
    summary:
      "Design a bundle that can lift AOV without making the offer harder to understand.",
    requiredInputs: [
      "Primary product",
      "Bundle goal",
      "Current offer",
      "Price ladder",
      "Margin constraints",
    ],
    outputs: [
      "Bundle concept",
      "Price architecture",
      "How it lifts average order value",
      "Next offer test",
    ],
    related: [
      "shopify-offer-positioning",
      "shopify-product-page-audit",
      "shopify-pricing-test-planner",
    ],
  }),
  buildGenericTool({
    slug: "shopify-subscription-planner",
    name: "Shopify Subscription Planner",
    platform: "shopify",
    category: "Growth",
    summary:
      "Turn repeat-purchase behavior, replenishment timing, and retention friction into a subscription setup worth launching next.",
    requiredInputs: [
      "Product type",
      "Repeat interval",
      "Current retention setup",
      "Discount setup",
      "Operational constraints",
    ],
    outputs: [
      "Subscription fit",
      "Cadence structure",
      "Discount limits",
      "Next launch step",
    ],
    related: [
      "shopify-post-purchase-flow-planner",
      "shopify-bundle-offer-designer",
      "shopify-offer-positioning",
    ],
  }),
  buildGenericTool({
    slug: "shopify-quiz-planner",
    name: "Shopify Quiz and Capture Planner",
    platform: "shopify",
    category: "Growth",
    summary:
      "Create a quiz or lead-capture flow that improves email and SMS lead quality.",
    requiredInputs: [
      "Capture goal",
      "Buyer segments",
      "Offer setup",
      "Current pop-up or quiz setup",
      "Follow-up channel",
    ],
    outputs: [
      "Best capture path",
      "Question order",
      "Segment logic",
      "Follow-up flow",
    ],
    related: [
      "shopify-email-flow-planner",
      "shopify-offer-positioning",
      "shopify-landing-page-angle-builder",
    ],
  }),
  buildGenericTool({
    slug: "shopify-collection-page-audit",
    name: "Shopify Collection Page Audit",
    platform: "shopify",
    category: "Listing",
    summary:
      "Audit a collection page for assortment clarity, filter friction, and the fixes worth making first.",
    requiredInputs: [
      "Collection page URL",
      "Collection goal",
      "Traffic source mix",
      "Catalog size",
      "Primary buyer intent",
    ],
    outputs: [
      "Collection friction map",
      "Merchandising gaps to fix",
      "Filter and sort issues",
      "First fixes to make",
    ],
    related: [
      "shopify-landing-page-angle-builder",
      "shopify-product-page-audit",
      "shopify-merchandising-priority-mapper",
    ],
  }),
  buildGenericTool({
    slug: "shopify-creative-testing-matrix",
    name: "Shopify Creative Testing Matrix",
    platform: "shopify",
    category: "Growth",
    summary:
      "Build a creative test setup with the hooks, claims, and proof variations worth testing first.",
    requiredInputs: [
      "Primary offer",
      "Audience tension",
      "Proof assets",
      "Current creative angles",
      "Channel priority",
    ],
    outputs: [
      "Creative test plan",
      "Hooks to test first",
      "Proof variations",
      "First tests to run",
    ],
    related: [
      "shopify-pdp-copy-assembler",
      "shopify-landing-page-angle-builder",
      "shopify-offer-positioning",
    ],
  }),
  buildGenericTool({
    slug: "shopify-pricing-test-planner",
    name: "Shopify Pricing Test Planner",
    platform: "shopify",
    category: "Growth",
    summary:
      "Set up a pricing test that protects profit and shows what buyers will actually accept.",
    requiredInputs: [
      "Core product or bundle",
      "Current price and discount setup",
      "Gross margin floor",
      "Traffic source quality",
      "Primary conversion problem",
    ],
    outputs: ["Price test setup", "Control and challenger setup", "Margin limits", "Win and kill rules"],
    related: [
      "shopify-offer-positioning",
      "shopify-pdp-copy-assembler",
      "shopify-launch-readiness-scorecard",
    ],
  }),
  buildGenericTool({
    slug: "shopify-pdp-copy-assembler",
    name: "Shopify PDP Copy Assembler",
    platform: "shopify",
    category: "Listing",
    summary:
      "Turn your angle, proof, and objections into a rewrite outline for hero copy, proof order, benefit structure, and CTA language.",
    requiredInputs: [
      "Product and target buyer",
      "Chosen offer angle",
      "Key proof assets",
      "Main objections",
      "Current PDP weakness",
    ],
    outputs: ["PDP copy outline", "Hero rewrite", "Proof order", "CTA guidance"],
    related: [
      "shopify-product-page-audit",
      "shopify-offer-positioning",
      "shopify-faq-objection-builder",
    ],
  }),
  buildGenericTool({
    slug: "shopify-post-purchase-flow-planner",
    name: "Shopify Post-Purchase Flow Planner",
    platform: "shopify",
    category: "Growth",
    summary:
      "Lay out the post-purchase sequence worth building next around education, delivery expectations, and the next sale.",
    requiredInputs: [
      "Product type",
      "Fulfillment and delivery expectation",
      "Activation or usage risk",
      "Second-order goal",
      "Current post-purchase setup",
    ],
    outputs: ["Post-purchase flow", "Message timing", "Activation priorities", "Next-sale follow-up"],
    related: [
      "shopify-returns-friction-audit",
      "shopify-reorder-reminder-planner",
      "shopify-launch-readiness-scorecard",
    ],
  }),
  buildGenericTool({
    slug: "shopify-returns-friction-audit",
    name: "Shopify Returns Friction Audit",
    platform: "shopify",
    category: "Operations",
    summary:
      "Turn return reasons, promise gaps, and service friction into a repair path that cuts avoidable returns.",
    requiredInputs: [
      "Product or category",
      "Main return reasons",
      "Current promise and PDP expectation",
      "Support or fulfillment friction",
      "Margin pressure",
    ],
    outputs: [
      "Returns risk",
      "Expectation gap map",
      "Content and service fixes",
      "Fix-first actions",
    ],
    related: [
      "shopify-product-page-audit",
      "shopify-pdp-copy-assembler",
      "shopify-post-purchase-flow-planner",
    ],
  }),
  buildGenericTool({
    slug: "shopify-faq-objection-builder",
    name: "Shopify FAQ and Objection Builder",
    platform: "shopify",
    category: "Listing",
    summary:
      "Turn recurring objections, support questions, and proof gaps into a FAQ and objection flow that removes hesitation.",
    requiredInputs: [
      "Product or offer",
      "Top buyer objections",
      "Current FAQ or support questions",
      "Proof assets available",
      "Where hesitation shows up most",
    ],
    outputs: ["FAQ outline", "Objection ladder", "Missing proof points", "Placement priorities"],
    related: [
      "shopify-product-page-audit",
      "shopify-pdp-copy-assembler",
      "shopify-returns-friction-audit",
    ],
  }),
  buildGenericTool({
    slug: "shopify-reorder-reminder-planner",
    name: "Shopify Reorder Reminder Planner",
    platform: "shopify",
    category: "Growth",
    summary:
      "Set up reorder reminders around usage pace, refill timing, and repeat-buy behavior without forcing a discount-first habit.",
    requiredInputs: [
      "Product type",
      "Typical usage window",
      "Current repeat-buy behavior",
      "Channel mix",
      "Discount and margin limits",
    ],
    outputs: ["Refill reminder flow", "Cadence map", "Trigger windows", "Offer limits"],
    related: [
      "shopify-post-purchase-flow-planner",
      "shopify-promo-calendar-planner",
      "shopify-launch-readiness-scorecard",
    ],
  }),
  buildGenericTool({
    slug: "shopify-promo-calendar-planner",
    name: "Shopify Promo Calendar Planner",
    platform: "shopify",
    category: "Growth",
    summary:
      "Turn the sales goal into a clear promo schedule with timing, channel roles, and discount limits.",
    requiredInputs: [
      "Approved sales goal or launch focus",
      "Current inventory or demand pressure",
      "Margin and discount limits",
      "Channel mix",
      "Upcoming launch or promo windows",
      "Current campaign constraint or risk",
    ],
    outputs: ["30 to 60 day promo calendar", "Campaign sequence", "Channel roles", "Margin and inventory limits"],
    related: [
      "shopify-pricing-test-planner",
      "shopify-launch-readiness-scorecard",
      "shopify-reorder-reminder-planner",
    ],
  }),
  buildGenericTool({
    slug: "shopify-merchandising-priority-mapper",
    name: "Shopify Merchandising Priority Mapper",
    platform: "shopify",
    category: "Listing",
    summary:
      "Show which products deserve hero placement, traffic, and support slots next.",
    requiredInputs: [
      "Catalog or collection scope",
      "Current hero products",
      "Traffic destinations",
      "Buyer intent split",
      "Commercial constraints",
      "Current SKU or page conflict",
    ],
    outputs: ["Merchandising order", "Hero and support SKU map", "Traffic destinations", "Placement conflict fixes"],
    related: [
      "shopify-channel-landing-router",
      "shopify-launch-readiness-scorecard",
      "shopify-pdp-copy-assembler",
    ],
  }),
  buildGenericTool({
    slug: "shopify-launch-readiness-scorecard",
    name: "Shopify Launch Readiness Scorecard",
    platform: "shopify",
    category: "Operations",
    summary:
      "Show whether the launch is ready now or should wait for the next fix.",
    requiredInputs: [
      "Offer and product focus",
      "Current proof and page state",
      "Operational readiness",
      "Traffic plan",
      "Known launch risks",
    ],
    outputs: [
      "Launch readiness",
      "Go or hold call",
      "Critical fix list",
      "Who should fix it first",
    ],
    related: [
      "shopify-product-page-audit",
      "shopify-promo-calendar-planner",
      "shopify-channel-landing-router",
    ],
  }),
  buildGenericTool({
    slug: "shopify-channel-landing-router",
    name: "Shopify Channel Landing Router",
    platform: "shopify",
    category: "Growth",
    summary:
      "Show which channels should send traffic to PDPs, landing pages, quizzes, or collections.",
    requiredInputs: [
      "Traffic channels",
      "Current destination pages",
      "Buyer intent split",
      "Offer or hero path",
      "Page weaknesses",
    ],
    outputs: ["Traffic routing", "Destination map", "What each destination should do", "Fix-before-send list"],
    related: [
      "shopify-landing-page-angle-builder",
      "shopify-merchandising-priority-mapper",
      "shopify-launch-readiness-scorecard",
    ],
  }),
];

export const allTools: ToolDefinition[] = [
  ...firstBatchTools,
  ...additionalAmazonSkillTools,
  ...firstBatchTiktokShopTools,
  ...firstBatchShopifyTools,
];

const derivedCompanionSourceMap: Record<string, string> = {
  "amazon-listing-title-checker": "amazon-listing-optimization",
  "amazon-image-compliance-checker": "amazon-listing-images",
  "amazon-variation-relationship-checker": "amazon-variation-strategy",
  "amazon-browse-search-keyword-checker": "amazon-search-optimization",
};

const amazonOperatorRelatedOverrides: Record<string, string[]> = {
  "amazon-fba-calculator": [
    "amazon-profit-analyzer",
    "tariff-calculator-amazon",
    "amazon-shipping-calculator",
  ],
  "tariff-calculator-amazon": [
    "amazon-fba-calculator",
    "amazon-profit-analyzer",
    "amazon-product-compliance",
  ],
  "amazon-shipping-calculator": [
    "amazon-fba-calculator",
    "amazon-profit-analyzer",
    "amazon-fba-prep",
  ],
  "amazon-profit-analyzer": [
    "amazon-fba-calculator",
    "amazon-price-tracker",
    "amazon-listing-optimization",
  ],
  "amazon-sales-estimator": [
    "amazon-product-research",
    "amazon-keyword-research",
    "amazon-profit-analyzer",
  ],
  "amazon-price-tracker": [
    "amazon-profit-analyzer",
    "amazon-buy-box",
    "amazon-competitor-monitoring",
  ],
  "amazon-buy-box": [
    "amazon-price-tracker",
    "amazon-repricing-strategy",
    "amazon-profit-analyzer",
  ],
  "amazon-rank-tracker": [
    "amazon-keyword-tracker",
    "amazon-search-optimization",
    "amazon-keyword-research",
  ],
  "amazon-keyword-tracker": [
    "amazon-rank-tracker",
    "amazon-search-optimization",
    "amazon-listing-optimization",
  ],
  "amazon-competitor-monitoring": [
    "amazon-price-tracker",
    "amazon-competitor-analysis",
    "amazon-profit-analyzer",
  ],
  "amazon-competitor-analysis": [
    "amazon-product-research",
    "amazon-search-optimization",
    "amazon-price-tracker",
  ],
  "amazon-product-compliance": [
    "amazon-category-ungating",
    "amazon-brand-registry",
    "amazon-fba-prep",
  ],
  "amazon-listing-title-checker": [
    "amazon-listing-optimization",
    "amazon-browse-search-keyword-checker",
    "amazon-image-compliance-checker",
  ],
  "amazon-image-compliance-checker": [
    "amazon-listing-images",
    "amazon-product-compliance",
    "amazon-listing-optimization",
  ],
  "amazon-browse-search-keyword-checker": [
    "amazon-search-optimization",
    "amazon-keyword-research",
    "amazon-listing-optimization",
  ],
  "amazon-category-ungating": [
    "amazon-product-compliance",
    "amazon-brand-registry",
    "amazon-fba-prep",
  ],
  "amazon-listing-optimization": [
    "amazon-search-optimization",
    "amazon-backend-keywords",
    "amazon-a-plus-content",
  ],
  "amazon-review-analyzer": [
    "amazon-return-reduction",
    "amazon-listing-optimization",
    "amazon-review-strategy",
  ],
  "amazon-negative-keywords": [
    "amazon-ppc-campaign",
    "amazon-advertising-strategy",
    "amazon-dayparting-strategy",
  ],
  "amazon-a-plus-content": [
    "amazon-listing-images",
    "amazon-enhanced-brand-content",
    "amazon-storefront-design",
  ],
  "amazon-enhanced-brand-content": [
    "amazon-a-plus-content",
    "amazon-storefront-design",
    "amazon-brand-registry",
  ],
  "amazon-search-optimization": [
    "amazon-keyword-research",
    "amazon-keyword-tracker",
    "amazon-rank-tracker",
  ],
  "amazon-listing-images": [
    "amazon-image-compliance-checker",
    "amazon-product-photography",
    "amazon-a-plus-content",
  ],
  "amazon-storefront-design": [
    "amazon-brand-analytics",
    "amazon-a-plus-content",
    "amazon-enhanced-brand-content",
  ],
  "amazon-keyword-research": [
    "amazon-search-optimization",
    "amazon-sales-estimator",
    "amazon-listing-optimization",
  ],
  "amazon-trending-products": [
    "amazon-product-research",
    "amazon-niche-finder",
    "amazon-profit-analyzer",
  ],
  "amazon-product-research": [
    "amazon-niche-finder",
    "amazon-sales-estimator",
    "amazon-profit-analyzer",
  ],
  "amazon-niche-finder": [
    "amazon-product-research",
    "amazon-keyword-research",
    "amazon-sales-estimator",
  ],
  "amazon-seller-analytics": [
    "amazon-brand-analytics",
    "amazon-competitor-analysis",
    "amazon-price-tracker",
  ],
  "amazon-brand-analytics": [
    "amazon-seller-analytics",
    "amazon-keyword-research",
    "amazon-storefront-design",
  ],
  "amazon-coupon-strategy": [
    "amazon-profit-analyzer",
    "amazon-dayparting-strategy",
    "amazon-deal-finder",
  ],
  "amazon-backend-keywords": [
    "amazon-search-optimization",
    "amazon-keyword-research",
    "amazon-listing-optimization",
  ],
};

for (const tool of allTools) {
  if (derivedCompanionSourceMap[tool.slug]) {
    tool.sourceSkillSlug = derivedCompanionSourceMap[tool.slug];
    tool.sourceSkillType = "derived-companion";
    tool.indexPriority =
      tool.slug === "amazon-image-compliance-checker" ||
      tool.slug === "amazon-variation-relationship-checker"
        ? "secondary"
        : "internal";
    continue;
  }

  tool.sourceSkillSlug ??= tool.slug;
  tool.sourceSkillType ??= "canonical-skill";
  tool.indexPriority ??= "primary";

  if (amazonOperatorRelatedOverrides[tool.slug]) {
    tool.related = amazonOperatorRelatedOverrides[tool.slug];
  }
}

export const allNonAiCandidates = [
  "amazon-fba-calculator",
  "tariff-calculator-amazon",
  "amazon-shipping-calculator",
  "amazon-fba-prep",
  "amazon-brand-registry",
  "amazon-category-ungating",
  "amazon-product-compliance",
  "amazon-listing-title-checker",
  "amazon-image-compliance-checker",
  "amazon-variation-relationship-checker",
  "amazon-browse-search-keyword-checker",
  "amazon-inventory-management",
  "amazon-seasonal-planning",
  "amazon-vine-program",
  "amazon-coupon-strategy",
  "amazon-dayparting-strategy",
  "amazon-variation-strategy",
  "amazon-product-bundling",
  "amazon-review-strategy",
  "amazon-subscribe-save",
  "amazon-brand-tailored-promotions",
  "amazon-global-selling",
  "amazon-buy-box",
  "amazon-deal-finder",
  "amazon-repricing-strategy",
  "amazon-suspension-appeal",
] as const;

export const amazonLiveAuditCompanionSlugs = [
  "amazon-listing-title-checker",
  "amazon-image-compliance-checker",
  "amazon-variation-relationship-checker",
  "amazon-browse-search-keyword-checker",
] as const;

export const amazonLiveAuditCompanionCount = amazonLiveAuditCompanionSlugs.length;
export const amazonCoreSkillCount = allTools.length - amazonLiveAuditCompanionCount;

export function getToolBySlug(slug: string) {
  return allTools.find((tool) => tool.slug === slug);
}

export function isDerivedCompanionTool(slug: string) {
  return amazonLiveAuditCompanionSlugs.includes(slug as (typeof amazonLiveAuditCompanionSlugs)[number]);
}

export function getCanonicalTools() {
  return allTools.filter((tool) => tool.sourceSkillType !== "derived-companion");
}

export function getDerivedCompanionTools() {
  return allTools.filter((tool) => tool.sourceSkillType === "derived-companion");
}

export function getIndexableCompanionTools() {
  return allTools.filter(
    (tool) => tool.sourceSkillType === "derived-companion" && tool.indexPriority === "secondary",
  );
}
