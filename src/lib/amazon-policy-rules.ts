export type AmazonPolicyEvidence = {
  label: string;
  detail: string;
  source: string;
};

function getBucket(categoryValue: string) {
  return categoryValue.split("__")[0];
}

function normalizeCategoryBucket(value: string) {
  const bucket = getBucket(value);
  const mapping: Record<string, string> = {
    "arts-crafts": "home",
    automotive: "automotive",
    baby: "baby",
    beauty: "beauty",
    books: "books",
    electronics: "electronics",
    fashion: "fashion",
    garden: "home",
    grocery: "grocery",
    health: "health",
    home: "home",
    industrial: "industrial",
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

function uniqueEvidence(items: AmazonPolicyEvidence[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = `${item.label}-${item.source}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getCompliancePolicyEvidence(input: {
  category: string;
  marketplace: string;
  materialProfile: string;
  claimsProfile: string;
  ageGroup: string;
}) {
  const items: AmazonPolicyEvidence[] = [
    {
      label: "Product safety baseline",
      detail:
        "Amazon expects category-appropriate safety and compliance records before the listing and fulfillment flow are treated as stable.",
      source: "GUH6FA4XSJ2LZFLY - Product safety and compliance",
    },
    {
      label: "Restricted-product fallback",
      detail:
        "If the offer falls into a restricted or prohibited lane, listing quality will not override the restriction.",
      source: "G200164330 - Restricted products",
    },
  ];

  const normalizedCategory = normalizeCategoryBucket(input.category);
  const material = input.materialProfile.toLowerCase();
  const claims = input.claimsProfile.toLowerCase();

  if (
    material.includes("battery") ||
    material.includes("chemical") ||
    material.includes("aerosol") ||
    material.includes("cleaner") ||
    material.includes("alcohol")
  ) {
    items.push({
      label: "Hazmat classification trigger",
      detail:
        "Potential dangerous goods need a correct classification and often require an SDS or exemption sheet before FBA handling is approved.",
      source: "G201003400 - Dangerous goods identification guide (hazmat)",
    });
  }

  if (["beauty", "grocery", "health", "jewelry", "watches"].includes(normalizedCategory)) {
    items.push({
      label: "Approval-sensitive category",
      detail:
        "Some categories need extra approval or category-specific proof before they can be sold cleanly.",
      source: "G200333160 - Categories and products that require approval",
    });
  }

  if (
    input.ageGroup === "children" ||
    claims.includes("medical") ||
    claims.includes("therapeutic") ||
    claims.includes("fda")
  ) {
    items.push({
      label: "Higher enforcement sensitivity",
      detail:
        "Child-directed, medical-adjacent, and strongly regulated claims attract stricter document review and higher enforcement risk.",
      source: "G200164330 - Restricted products",
    });
  }

  if (["DE", "FR", "IT", "ES", "NL", "SE", "PL", "UK"].includes(input.marketplace)) {
    items.push({
      label: "Marketplace-specific proof",
      detail:
        "EU and UK listings often need marketplace-specific declarations, responsible-person data, and final label consistency.",
      source: "GUH6FA4XSJ2LZFLY - Product safety and compliance",
    });
  }

  return uniqueEvidence(items);
}

export function getBrandRegistryPolicyEvidence(input: {
  targetMarketplace: string;
  trademarkStatus: "none" | "pending" | "registered";
  exactBrandMatch: boolean;
  genericBrandRuleOk: boolean;
}) {
  const items: AmazonPolicyEvidence[] = [
    {
      label: "Exact brand spelling",
      detail:
        "The requested brand value must match the intended brand exactly, including spacing and characters, or the same error can recur.",
      source: "G4LKBB2T7Q78CJRU - Brand name approval requirements and issue resolution",
    },
    {
      label: "Permanent affix proof",
      detail:
        "Brand approval expects real-world images where the brand is permanently affixed to the product, packaging, or both.",
      source: "G4LKBB2T7Q78CJRU - Brand name approval requirements and issue resolution",
    },
  ];

  if (!input.genericBrandRuleOk) {
    items.push({
      label: "Generic-brand rule",
      detail:
        "If the product is truly unbranded, the brand value should be generic rather than a compatibility or descriptive term.",
      source: "G4LKBB2T7Q78CJRU - Brand name approval requirements and issue resolution",
    });
  }

  if (input.trademarkStatus !== "registered") {
    items.push({
      label: "Trademark leverage",
      detail:
        "Registered marks remain the strongest posture; pending marks can help but are not equivalent proof in every market.",
      source: "G4LKBB2T7Q78CJRU - Brand name approval requirements and issue resolution",
    });
  }

  if (["UK", "DE", "FR", "IT", "ES", "NL", "SE", "PL"].includes(input.targetMarketplace)) {
    items.push({
      label: "Cross-country brand approval",
      detail:
        "Amazon states that brand approval applies across countries, but the underlying brand proof still needs to be exact and defensible.",
      source: "G4LKBB2T7Q78CJRU - Brand name approval requirements and issue resolution",
    });
  }

  return uniqueEvidence(items);
}

export function getUngatingPolicyEvidence(input: {
  category: string;
  marketplace: string;
  restrictionLevel?: string;
  priorRejection?: boolean;
}) {
  const items: AmazonPolicyEvidence[] = [
    {
      label: "Approval gate reality",
      detail:
        "Some categories and product types require extra approval before the offer can sell, regardless of listing completeness.",
      source: "G200333160 - Categories and products that require approval",
    },
    {
      label: "Invoice quality standard",
      detail:
        "Invoice-based reviews look for recent supplier invoices and quantities that make sense relative to the cited ASIN sales and inventory.",
      source: "GDQ9K277NYP6WNEW - Invoice requirements for appealing a policy violation",
    },
  ];

  const normalizedCategory = normalizeCategoryBucket(input.category);
  if (["beauty", "grocery", "health", "jewelry", "watches"].includes(normalizedCategory)) {
    items.push({
      label: "High-control category review",
      detail:
        "High-control categories often need more than baseline invoices and can trigger added safety or compliance proof.",
      source: "G200333160 - Categories and products that require approval",
    });
  }

  if (input.restrictionLevel === "brand" || input.restrictionLevel === "asin") {
    items.push({
      label: "Exact restriction scope",
      detail:
        "Brand-level and ASIN-level restrictions often need exact authorization or ASIN-specific proof, not only generic category documents.",
      source: "G200164330 - Restricted products",
    });
  }

  if (input.priorRejection) {
    items.push({
      label: "Second-attempt burden",
      detail:
        "After a rejection, the next application usually needs cleaner, more explicit documentation rather than the same packet resubmitted.",
      source: "GDQ9K277NYP6WNEW - Invoice requirements for appealing a policy violation",
    });
  }

  if (["DE", "FR", "IT", "ES", "UK"].includes(input.marketplace)) {
    items.push({
      label: "Market-specific compliance overlay",
      detail:
        "Europe-leaning marketplaces can add compliance review on top of the category approval process.",
      source: "G200333160 - Categories and products that require approval",
    });
  }

  return uniqueEvidence(items);
}

export function getSuspensionAppealPolicyEvidence(input: {
  issueType: string;
  hasAsinOrPolicyReference: boolean;
  evidenceFresh: boolean;
  usesAccountHealthPath: boolean;
}) {
  const items: AmazonPolicyEvidence[] = [
    {
      label: "Four-part POA expectation",
      detail:
        "Amazon expects a viable appeal to identify the violation, explain the root cause, describe reactive fixes, and define preventive controls.",
      source: "G201567350 - Create, implement, and submit an appeal for restricted product violations",
    },
    {
      label: "Factual and direct appeal tone",
      detail:
        "Appeals should stay factual, direct, and accurate, rather than trying to tell the whole business story.",
      source: "G201567350 - Create, implement, and submit an appeal for restricted product violations",
    },
  ];

  if (!input.usesAccountHealthPath) {
    items.push({
      label: "Submission channel",
      detail:
        "Policy-violation appeals are generally expected to be submitted through Account Health or the path shown in the notification.",
      source: "G201567350 - Create, implement, and submit an appeal for restricted product violations",
    });
  }

  if (!input.hasAsinOrPolicyReference) {
    items.push({
      label: "Specific violation scope",
      detail:
        "Amazon expects the appeal to name the ASIN or product type and the policy tied to the violation.",
      source: "G201567350 - Create, implement, and submit an appeal for restricted product violations",
    });
  }

  if (!input.evidenceFresh || input.issueType === "inauthentic" || input.issueType === "account-health") {
    items.push({
      label: "Invoice or authorization proof",
      detail:
        "For many policy violations, invoices or letters of authorization are used to prove legitimate sourcing and selling rights.",
      source: "GDQ9K277NYP6WNEW - Invoice requirements for appealing a policy violation",
    });
  }

  items.push({
    label: "Account Health guidance",
    detail:
      "Each violation flow can have different appeal requirements, and Amazon points sellers back to Account Health for the issue-specific path.",
    source: "GQ53DXVX2D2TPCPQ - How to address an intellectual property policy violation",
  });

  return uniqueEvidence(items);
}

export function getReviewStrategyPolicyEvidence(input: {
  channels: string[];
  compliantChannels: string[];
  vineEligible: boolean;
  reviewCount: number;
}) {
  const items: AmazonPolicyEvidence[] = [
    {
      label: "Neutral review requests only",
      detail:
        "Amazon allows neutral review requests, but sellers cannot ask only happy customers, or ask buyers to change or remove reviews.",
      source: "GYRKB5RU3FS5TURN - Customer product reviews policies",
    },
    {
      label: "No incentives or refunds for reviews",
      detail:
        "Discounts, free products, reimbursements, and other compensation tied to reviews are treated as review manipulation.",
      source: "GE8SYAZUBGVFBHCH - Inappropriate product reviews",
    },
    {
      label: "No review influence through follow-up",
      detail:
        "Amazon's seller code of conduct bars attempts to influence ratings, feedback, and reviews.",
      source: "G1801 - Selling policies and seller code of conduct",
    },
  ];

  if (input.channels.includes("external-incentive")) {
    items.push({
      label: "Third-party review service risk",
      detail:
        "Third-party review clubs, discounted-product programs, and social review exchanges are explicitly prohibited.",
      source: "GYRKB5RU3FS5TURN - Customer product reviews policies",
    });
  }

  if (input.channels.includes("insert-card-safe")) {
    items.push({
      label: "Insert-card scrutiny",
      detail:
        "Package inserts become high risk when they ask for positive reviews or offer any reward tied to review behavior.",
      source: "GE8SYAZUBGVFBHCH - Inappropriate product reviews",
    });
  }

  if (input.compliantChannels.length < input.channels.length) {
    items.push({
      label: "Policy enforcement posture",
      detail:
        "Amazon states review-policy violations can lead to account action, review removal, and product delisting.",
      source: "GYRKB5RU3FS5TURN - Customer product reviews policies",
    });
  }

  if (input.vineEligible && input.reviewCount < 30) {
    items.push({
      label: "Vine as the approved launch path",
      detail:
        "For low-review ASINs that meet Vine requirements, Vine is Amazon's built-in route for compliant early review generation.",
      source: "G92T8UV339NZ98TN - Amazon Vine",
    });
  }

  return uniqueEvidence(items);
}

export function getVinePolicyEvidence(input: {
  brandRegistered: boolean;
  reviewCount: number;
  fbaReady: boolean;
  detailPageReady: boolean;
}) {
  const items: AmazonPolicyEvidence[] = [
    {
      label: "Eligibility floor",
      detail:
        "Vine requires a Professional selling account, a Brand Representative or Reseller role in Brand Registry, and an active FBA listing.",
      source: "GMWK4XNWMHTTUQSD - Amazon Vine Selling Partner eligibility",
    },
    {
      label: "Product-level requirements",
      detail:
        "Eligible ASINs must have fewer than 30 reviews, plus an image and description on the detail page.",
      source: "G92T8UV339NZ98TN - Amazon Vine",
    },
    {
      label: "Enrollment guardrails",
      detail:
        "Vine enrollment is done per ASIN and supports 1 to 30 units. After submission, quantity and selected variations cannot be freely edited.",
      source: "GSTY2Q2TD5E84RXJ - Enroll a product in Amazon Vine",
    },
  ];

  if (!input.brandRegistered) {
    items.push({
      label: "Brand Registry dependency",
      detail:
        "Without Brand Registry access, the seller usually cannot unlock Vine eligibility at all.",
      source: "GMWK4XNWMHTTUQSD - Amazon Vine Selling Partner eligibility",
    });
  }

  if (input.reviewCount >= 30) {
    items.push({
      label: "Review-count cutoff",
      detail:
        "When a product reaches 30 reviews, it is outside the strongest Vine eligibility range and Vine can stop offering it.",
      source: "GFW53X4JYHRCU9YH - Amazon Vine errors",
    });
  }

  if (!input.fbaReady || !input.detailPageReady) {
    items.push({
      label: "Operational readiness requirement",
      detail:
        "Vine cannot compensate for a missing FBA listing or an incomplete detail page; those are prerequisite conditions.",
      source: "G92T8UV339NZ98TN - Amazon Vine",
    });
  }

  return uniqueEvidence(items);
}

export function getGlobalSellingPolicyEvidence(input: {
  targetCount: number;
  currentMarketplace: string;
  localizationReadyCount: number;
  complianceReadyCount: number;
  taxReady: boolean;
  supportReady: boolean;
  buildInternationalListingsReady: boolean;
}) {
  const items: AmazonPolicyEvidence[] = [
    {
      label: "Regional expansion path",
      detail:
        "Amazon Global Selling is structured by store and region, and sellers can launch additional stores through the global selling dashboard.",
      source: "G201062890 - Amazon Global Selling",
    },
    {
      label: "Marketplace-language listing rule",
      detail:
        "Listings need to be written in the language of the target marketplace, not just copied from the source store.",
      source: "G201468480 - Listing Creation for Global Accounts",
    },
    {
      label: "Cross-border cost reality",
      detail:
        "Global pricing has to account for shipping, returns, translation, customer support, taxes, and duties before margin is considered real.",
      source: "G202140360 - How to price globally",
    },
  ];

  if (!input.taxReady) {
    items.push({
      label: "Tax and duty readiness",
      detail:
        "Tax and duty work is part of the global-selling setup, so expansion should not move ahead on translation alone.",
      source: "G202140360 - How to price globally",
    });
  }

  if (!input.supportReady) {
    items.push({
      label: "Local-language support burden",
      detail:
        "International sales can require local-language customer support and returns handling, which should be planned before launch.",
      source: "G202140360 - How to price globally",
    });
  }

  if (!input.buildInternationalListingsReady && input.targetCount > 1) {
    items.push({
      label: "BIL operating leverage",
      detail:
        "Build International Listings is Amazon's native way to synchronize listings and pricing across marketplaces from a source store.",
      source: "G201468480 - Listing Creation for Global Accounts",
    });
  }

  if (input.localizationReadyCount < input.complianceReadyCount) {
    items.push({
      label: "Localization lag",
      detail:
        "Store expansion still needs per-marketplace copy, image, and keyword adaptation even after compliance is addressed.",
      source: "G201468480 - Listing Creation for Global Accounts",
    });
  }

  return uniqueEvidence(items);
}

export function getPrivateLabelPolicyEvidence(input: {
  brandReady: boolean;
  gtinExemptionReady: boolean;
  permanentBrandingReady: boolean;
  complianceCount: number;
}) {
  const items: AmazonPolicyEvidence[] = [
    {
      label: "Accurate brand value",
      detail:
        "Amazon expects the listing brand value to match the real brand shown on the product or packaging, not a product description.",
      source: "G2N3GKE5SGSHWYRZ - Amazon Brand Name policy",
    },
    {
      label: "Per-store GTIN logic",
      detail:
        "Private-label and generic products can use GTIN exemption only in eligible categories and only per store and category.",
      source: "G200426310 - List products that do not have a product ID (UPC, EAN, JAN, or ISBN)",
    },
    {
      label: "Category-level GTIN differences",
      detail:
        "Amazon's product-ID requirement changes by category, and some categories or major-brand cases still require a UPC.",
      source: "G200317520 - Product ID (GTIN) requirements by category",
    },
  ];

  if (!input.brandReady) {
    items.push({
      label: "Brand setup gap",
      detail:
        "If the product is meant to be branded, the brand identity has to be consistent before listing or approval work becomes stable.",
      source: "G2N3GKE5SGSHWYRZ - Amazon Brand Name policy",
    });
  }

  if (!input.gtinExemptionReady) {
    items.push({
      label: "GTIN exemption dependency",
      detail:
        "Unbranded or private-label launches without an approved identifier path can stall at listing creation even when the product idea looks good.",
      source: "G200426310 - List products that do not have a product ID (UPC, EAN, JAN, or ISBN)",
    });
  }

  if (!input.permanentBrandingReady) {
    items.push({
      label: "Permanent brand affix proof",
      detail:
        "Amazon rejects branding that is digitally altered, removable, or inconsistent across product and packaging images.",
      source: "G200426310 - List products that do not have a product ID (UPC, EAN, JAN, or ISBN)",
    });
  }

  if (input.complianceCount > 2) {
    items.push({
      label: "Compliance load",
      detail:
        "Private-label launches with multiple compliance burdens need more than idea validation; they need an evidence plan before launch.",
      source: "G200317520 - Product ID (GTIN) requirements by category",
    });
  }

  return uniqueEvidence(items);
}

export function getWholesaleSourcingPolicyEvidence(input: {
  authorizedSupplierCount: number;
  documentCount: number;
  invoiceRecent: boolean;
  hasLoa: boolean;
  brandRestricted: boolean;
}) {
  const items: AmazonPolicyEvidence[] = [
    {
      label: "Authorized source requirement",
      detail:
        "Amazon expects sellers to prove a legitimate relationship with the brand owner, manufacturer, or authorized distributor.",
      source: "G8XTDLCH3MXMYLF2 - Error 18077",
    },
    {
      label: "Document quality standard",
      detail:
        "Invoice-based reviews look for recent, clean supplier invoices that support authenticity and resale rights.",
      source: "GDQ9K277NYP6WNEW - Invoice requirements for appealing a policy violation",
    },
    {
      label: "Appeal and authorization overlap",
      detail:
        "For authenticity and IP disputes, Amazon regularly asks for invoices or letters of authorization to prove the right to sell.",
      source: "GQ53DXVX2D2TPCPQ - How to address an intellectual property policy violation",
    },
  ];

  if (!input.invoiceRecent) {
    items.push({
      label: "Invoice recency",
      detail:
        "Older invoices weaken resale proof because Amazon's documentation reviews favor recent evidence.",
      source: "GDQ9K277NYP6WNEW - Invoice requirements for appealing a policy violation",
    });
  }

  if (!input.hasLoa && input.brandRestricted) {
    items.push({
      label: "Restricted-brand authorization",
      detail:
        "When a brand is restricted, invoices alone may not be enough without letters of authorization or distribution agreements.",
      source: "G8XTDLCH3MXMYLF2 - Error 18077",
    });
  }

  if (input.authorizedSupplierCount < 1 || input.documentCount < 2) {
    items.push({
      label: "Weak proof stack",
      detail:
        "A thin documentation set raises the risk that the deal works on paper but fails under Amazon review or appeal.",
      source: "GDQ9K277NYP6WNEW - Invoice requirements for appealing a policy violation",
    });
  }

  return uniqueEvidence(items);
}

export function getProductBundlingPolicyEvidence(input: {
  marketplace: string;
  brandRepresentative: boolean;
  fbaReady: boolean;
  componentCount: number;
}) {
  const items: AmazonPolicyEvidence[] = [
    {
      label: "Bundle availability scope",
      detail:
        "Amazon's virtual product bundles tool is a US-store feature for eligible Brand Registry sellers with FBA inventory.",
      source: "G87HAE6PMKKM23Z7 - Virtual product bundles",
    },
    {
      label: "Bundle structure rule",
      detail:
        "Virtual bundles must contain two to five complementary ASINs, and each component ASIN must be buyable on its own.",
      source: "G87HAE6PMKKM23Z7 - Virtual product bundles",
    },
    {
      label: "Operational edit limits",
      detail:
        "After creation, bundle components, main component, and SKU are not freely editable, so bundle structure should be finalized before launch.",
      source: "G87HAE6PMKKM23Z7 - Virtual product bundles",
    },
  ];

  if (!input.brandRepresentative) {
    items.push({
      label: "Brand Representative dependency",
      detail:
        "If the seller is not identified as a Brand Representative, the bundle tool itself may not be accessible.",
      source: "G2BTQWUUDS3RV7WB - Troubleshooting FAQ for virtual product bundles",
    });
  }

  if (!input.fbaReady) {
    items.push({
      label: "FBA inventory requirement",
      detail:
        "Bundle components need active, buyable FBA inventory in New condition or the bundle may not be buildable or stay in stock.",
      source: "G2BTQWUUDS3RV7WB - Troubleshooting FAQ for virtual product bundles",
    });
  }

  if (input.marketplace !== "US") {
    items.push({
      label: "US-store limitation",
      detail:
        "Virtual product bundles can be created only in the US Amazon store, so cross-market expansion needs another structure.",
      source: "G87HAE6PMKKM23Z7 - Virtual product bundles",
    });
  }

  if (input.componentCount > 5) {
    items.push({
      label: "Component ceiling",
      detail:
        "Amazon's bundle tool caps bundles at five component ASINs, so larger set concepts need to be simplified.",
      source: "G87HAE6PMKKM23Z7 - Virtual product bundles",
    });
  }

  return uniqueEvidence(items);
}

export function getInternationalListingsPolicyEvidence(input: {
  pricingReady: boolean;
  localizationDepth: number;
  buildInternationalListingsReady: boolean;
  taxesReady: boolean;
}) {
  const items: AmazonPolicyEvidence[] = [
    {
      label: "Target-market language rule",
      detail:
        "Listings need to be written in the language of the target marketplace, not just copied from the source marketplace.",
      source: "G201468480 - Listing Creation for Global Accounts",
    },
    {
      label: "BIL operating model",
      detail:
        "Build International Listings is Amazon's native way to create and synchronize listings across connected marketplaces.",
      source: "G201468480 - Listing Creation for Global Accounts",
    },
    {
      label: "Cross-border cost set",
      detail:
        "Global selling profitability needs to account for shipping, returns, translation, customer support, taxes, and duties.",
      source: "G202140360 - How to price globally",
    },
  ];

  if (!input.pricingReady) {
    items.push({
      label: "Pricing before translation",
      detail:
        "Amazon explicitly calls out additional cross-border costs, so pricing readiness needs to be settled before localization polish.",
      source: "G202140360 - How to price globally",
    });
  }

  if (input.localizationDepth < 60) {
    items.push({
      label: "Literal-translation risk",
      detail:
        "Localized listings need adaptation of titles, bullets, images, and search terms to marketplace conventions, not direct translation only.",
      source: "G201468480 - Listing Creation for Global Accounts",
    });
  }

  if (!input.buildInternationalListingsReady) {
    items.push({
      label: "Manual duplication overhead",
      detail:
        "Without Build International Listings, repeated listing updates and pricing synchronization become materially heavier.",
      source: "G201468480 - Listing Creation for Global Accounts",
    });
  }

  if (!input.taxesReady) {
    items.push({
      label: "Tax and regulation overlay",
      detail:
        "Tax and regulation preparation is part of the Amazon Global Selling flow, so expansion should not move on copy alone.",
      source: "G201468380 - Taxes and regulations for Amazon Global Selling",
    });
  }

  return uniqueEvidence(items);
}

export function getInventoryPlannerPolicyEvidence(input: {
  professionalSeller: boolean;
  daysOfCover: number;
  sellThroughRate: number;
  hasStrandedInventory: boolean;
  storageUtilizationWeeks: number;
  newSellerWithin365Days: boolean;
  awdWaiverEligible: boolean;
}) {
  const items: AmazonPolicyEvidence[] = [
    {
      label: "Minimum inventory recommendation",
      detail:
        "Amazon's FBA inventory guidance ties healthy replenishment to recommended minimum levels, days of supply, current inventory, open shipments, and lead time.",
      source: "GTMXYZN64UJL7TT6 - FBA Inventory overview",
    },
    {
      label: "IPI inventory balance",
      detail:
        "Amazon's IPI framework pushes sellers to balance excess and scarce inventory rather than simply maximize days of cover.",
      source: "GZJF4DY2W6MERBAL - IPI frequently asked questions",
    },
    {
      label: "Minimum inventory level fallback",
      detail:
        "For products without recommendations, Amazon explicitly says to plan for at least 28 days of cover based on the sales forecast.",
      source: "G9BYNYF4FAXXBPJZ - Minimum Inventory Level overview",
    },
  ];

  if (input.daysOfCover < 28) {
    items.push({
      label: "Low-inventory fee risk",
      detail:
        "Amazon can apply a low-inventory-level fee when inventory falls below 28 days of supply relative to customer demand.",
      source: "GABBX6GZPA8MSZGW - FBA fee overview",
    });
  }

  if (input.daysOfCover > 90 || input.sellThroughRate < 1) {
    items.push({
      label: "Excess inventory pressure",
      detail:
        "Amazon treats inventory above roughly 90 days of supply as excess in IPI logic and expects sellers to improve sell-through or remove unproductive stock.",
      source: "GZJF4DY2W6MERBAL - IPI frequently asked questions",
    });
  }

  if (input.hasStrandedInventory) {
    items.push({
      label: "Stranded inventory drag",
      detail:
        "Sellable units without an active listing can hurt IPI because they incur fees without being available for purchase.",
      source: "GZJF4DY2W6MERBAL - IPI frequently asked questions",
    });
  }

  if (
    input.professionalSeller &&
    input.storageUtilizationWeeks > 22 &&
    !input.newSellerWithin365Days &&
    !input.awdWaiverEligible
  ) {
    items.push({
      label: "Storage utilization surcharge",
      detail:
        "Professional sellers above a 22-week storage utilization ratio can incur a storage utilization surcharge on inventory aged above 30 days.",
      source: "G3EDYEF6KUCFQTNM - Monthly inventory storage fees and storage utilization surcharge",
    });
  }

  if (input.newSellerWithin365Days) {
    items.push({
      label: "New-seller surcharge exemption",
      detail:
        "New sellers are exempt from the storage utilization surcharge during the first 365 days after the first FBA inventory-received date.",
      source: "GXMJ38VA95GUN5XU - New Seller Incentives",
    });
  }

  if (input.awdWaiverEligible) {
    items.push({
      label: "AWD waiver path",
      detail:
        "Products auto-replenished by AWD can qualify for a storage utilization surcharge waiver when the auto-replenishment ratio threshold is met.",
      source: "G3EDYEF6KUCFQTNM - Monthly inventory storage fees and storage utilization surcharge",
    });
  }

  return uniqueEvidence(items);
}

export function getBrandTailoredPromotionPolicyEvidence(input: {
  audienceSize: number;
  discountRate: number;
  brandRepresentative: boolean;
  activePromotionCount: number;
}) {
  const items: AmazonPolicyEvidence[] = [
    {
      label: "Brand Registry requirement",
      detail:
        "Brand Tailored promotions are limited to sellers with a Brand Representative role assigned in Brand Registry.",
      source: "GFM3F4GG5EYCC5XC - Brand Tailored promotions",
    },
    {
      label: "Audience eligibility floor",
      detail:
        "Tailored promotions can be created only when the eligible audience size is at least 1,000 customers.",
      source: "GFM3F4GG5EYCC5XC - Brand Tailored promotions",
    },
    {
      label: "Discount and budget guardrails",
      detail:
        "Tailored promotions require 10% to 50% discounting and at least a $100 budget, with the promo taken offline around 80% budget consumption.",
      source: "G9TK2DS9YV88KKCD - Create a Brand Tailored promotion",
    },
  ];

  if (!input.brandRepresentative) {
    items.push({
      label: "Access dependency",
      detail:
        "If the seller is not the Brand Representative, the eligible brands will not even appear in the tailored-promotion setup flow.",
      source: "G9TK2DS9YV88KKCD - Create a Brand Tailored promotion",
    });
  }

  if (input.activePromotionCount >= 20) {
    items.push({
      label: "Active-promotion cap",
      detail:
        "Amazon caps active or scheduled tailored promotions at 20, so overlapping promo ideas may need consolidation.",
      source: "GFM3F4GG5EYCC5XC - Brand Tailored promotions",
    });
  }

  if (input.discountRate > 0.3) {
    items.push({
      label: "Budget overspend risk",
      detail:
        "Amazon warns that low budgets paired with deeper discounts can burn out quickly, especially during high-traffic periods or when promotions overlap.",
      source: "GFM3F4GG5EYCC5XC - Brand Tailored promotions",
    });
  }

  return uniqueEvidence(items);
}

export function getSubscribeSavePolicyEvidence(input: {
  brandRepresentative: boolean;
  inStockRate: number;
  offerBuyable: boolean;
  fbmMetricsReady: boolean;
  currentDiscountRate: number;
}) {
  const items: AmazonPolicyEvidence[] = [
    {
      label: "Program eligibility floor",
      detail:
        "Subscribe and Save requires a selling account in good standing plus a Brand Representative role assigned in Brand Registry.",
      source: "G201620110 - Subscribe & Save for sellers",
    },
    {
      label: "Offer-level eligibility",
      detail:
        "Amazon checks that the item is replenishable, buyable, not restricted, and above a 90% trailing 28-day in-stock rate.",
      source: "G201620110 - Subscribe & Save for sellers",
    },
    {
      label: "Discount funding ladder",
      detail:
        "Seller-funded Subscribe and Save discounts are structured around 0%, 5%, 10%, 15%, or 20%, with Amazon adding the tiered 5% benefit.",
      source: "G201620110 - Subscribe & Save for sellers",
    },
  ];

  if (!input.brandRepresentative) {
    items.push({
      label: "Brand role dependency",
      detail:
        "Without the required Brand Registry role, the seller may not be able to participate even if the product is replenishable.",
      source: "G201620110 - Subscribe & Save for sellers",
    });
  }

  if (input.inStockRate < 90) {
    items.push({
      label: "In-stock threshold",
      detail:
        "Subscribe and Save eligibility expects trailing 28-day in-stock performance above 90%, and weak availability can trigger removal later.",
      source: "G201620110 - Subscribe & Save for sellers",
    });
  }

  if (!input.offerBuyable) {
    items.push({
      label: "Buyable-offer requirement",
      detail:
        "Products that are not buyable cannot stay in the Subscribe and Save program regardless of discount appetite.",
      source: "G201620110 - Subscribe & Save for sellers",
    });
  }

  if (!input.fbmMetricsReady) {
    items.push({
      label: "FBM service-metric gate",
      detail:
        "FBM offers need sustained shipping, tracking, cancellation, defect, and delivery-performance compliance for eligibility.",
      source: "G201620110 - Subscribe & Save for sellers",
    });
  }

  if (![0, 0.05, 0.1, 0.15, 0.2].includes(Number(input.currentDiscountRate.toFixed(2)))) {
    items.push({
      label: "Non-standard funding level",
      detail:
        "Amazon's seller-funded discount options are offered in fixed steps, so custom discount values are weaker planning assumptions.",
      source: "G201620110 - Subscribe & Save for sellers",
    });
  }

  return uniqueEvidence(items);
}

export function getCouponStrategyPolicyEvidence(input: {
  professionalSeller: boolean;
  feedbackRating: number;
  offerBuyable: boolean;
  featuredOfferLikely: boolean;
  audienceType: string;
  brandRepresentative: boolean;
  discountRate: number;
  stackRisk: boolean;
}) {
  const items: AmazonPolicyEvidence[] = [
    {
      label: "Coupon seller eligibility",
      detail:
        "Coupons require a Professional seller account and at least a 3.5 seller feedback rating, unless the account has no feedback yet.",
      source: "GJHCPEFJ5JJQD52D - Coupon eligibility criteria",
    },
    {
      label: "Coupon discount floor",
      detail:
        "Amazon coupon discounts must be at least 5% below the Was Price or List Price, and percentage coupons can run from 5% to 50%.",
      source: "GJHCPEFJ5JJQD52D - Coupon eligibility criteria",
    },
    {
      label: "Budget and overlap behavior",
      detail:
        "Coupon budgets go offline around 80% utilization, while clipped coupons can still redeem for a short post-shutoff window.",
      source: "G202189370 - How do coupon budgets work?",
    },
  ];

  if (!input.offerBuyable || !input.featuredOfferLikely) {
    items.push({
      label: "Visibility dependency",
      detail:
        "Coupons may not display on the detail page if the offer is not buyable or is not the Featured Offer.",
      source: "G202189350 - Create a coupon",
    });
  }

  if (input.audienceType === "brand" && !input.brandRepresentative) {
    items.push({
      label: "Brand-audience access",
      detail:
        "Brand-tailored coupon audiences are accessible only to Brand Representatives for brands registered in Brand Registry.",
      source: "G202189390 - Select audience for coupons",
    });
  }

  if (input.stackRisk) {
    items.push({
      label: "Promotion stacking",
      detail:
        "Coupons can overlap with deals and other promotions, and stacking decisions can materially increase redemption pressure.",
      source: "G202189350 - Create a coupon",
    });
  }

  if (input.discountRate > 0.3) {
    items.push({
      label: "High-discount budget burn",
      detail:
        "Deeper coupon discounts with low budgets can expire quickly and may still overspend because already-clipped coupons can keep redeeming briefly.",
      source: "G202189370 - How do coupon budgets work?",
    });
  }

  return uniqueEvidence(items);
}

export function getDealFinderPolicyEvidence(input: {
  featuredOfferLikely: boolean;
  dealQuantityReady: boolean;
  referencePriceReady: boolean;
  stackRisk: boolean;
  goal: string;
}) {
  const items: AmazonPolicyEvidence[] = [
    {
      label: "Deal visibility dependency",
      detail:
        "Running a deal does not guarantee detail-page visibility if the offer does not win the Featured Offer.",
      source: "GKN9A84DGTYWYHWY - Troubleshoot suppressed and active deals",
    },
    {
      label: "Suppression triggers",
      detail:
        "Deals can be suppressed if the deal price is above Amazon's maximum allowed deal price or if quantity falls below the minimum deal quantity.",
      source: "GKN9A84DGTYWYHWY - Troubleshoot suppressed and active deals",
    },
    {
      label: "Reference-price sensitivity",
      detail:
        "Amazon's deal pricing checks consider reference prices, recent promotions, sales history, and competing new-condition offers.",
      source: "GKN9A84DGTYWYHWY - Troubleshoot suppressed and active deals",
    },
  ];

  if (!input.featuredOfferLikely) {
    items.push({
      label: "Featured Offer hurdle",
      detail:
        "If another seller wins the Featured Offer, the deal may stay active in dashboard terms but fail to show as expected on the product page.",
      source: "GKN9A84DGTYWYHWY - Troubleshoot suppressed and active deals",
    });
  }

  if (!input.dealQuantityReady) {
    items.push({
      label: "Deal quantity threshold",
      detail:
        "Minimum deal quantity matters operationally; if inventory allocated to the deal is too low, the deal can be suppressed or canceled.",
      source: "GKN9A84DGTYWYHWY - Troubleshoot suppressed and active deals",
    });
  }

  if (input.stackRisk) {
    items.push({
      label: "Cross-promo interaction",
      detail:
        "Claim-code and coupon stacking choices can alter effective discount depth at checkout, which changes the real deal outcome.",
      source: "G2ZCMMUXK7VP3K6S - Stacked promotions",
    });
  }

  if (input.goal === "clearance") {
    items.push({
      label: "Deal as sell-through tool",
      detail:
        "Deals are primarily framed by Amazon as sales-driving promotional events, so they fit clearance and event-driven urgency more naturally than gentle margin defense.",
      source: "G202043110 - Amazon deals",
    });
  }

  if (!input.referencePriceReady) {
    items.push({
      label: "Reference-price mismatch risk",
      detail:
        "If recent pricing history is not clean, the intended deal price may fail Amazon's internal maximum-deal-price checks.",
      source: "GKN9A84DGTYWYHWY - Troubleshoot suppressed and active deals",
    });
  }

  return uniqueEvidence(items);
}

export function getAdvertisingPolicyEvidence(input: {
  brandRegistered: boolean;
  storefrontReady: boolean;
  campaignTypeCount: number;
  sponsoredProductsCount: number;
  sponsoredBrandsCount: number;
  sponsoredDisplayCount: number;
  newSellerCreditWindow: boolean;
}) {
  const items: AmazonPolicyEvidence[] = [
    {
      label: "Sponsored Products baseline",
      detail:
        "Sponsored Products is Amazon's core CPC format for search and product-page demand capture, so it should usually be the first stable ad layer.",
      source: "G43381 - Programs and features to help increase sales",
    },
    {
      label: "Brand-building ad stack",
      detail:
        "Amazon explicitly points sellers to Sponsored Products and Sponsored Brands as the main advertising formats for visibility and brand growth in the store.",
      source: "GFG4VRQK7CQLGRTM - Programs and tools for growth",
    },
    {
      label: "Advertiser support path",
      detail:
        "Campaign performance, budget optimization, and Sponsored Products, Sponsored Brands, or Sponsored Display troubleshooting route through Advertiser Support.",
      source: "G200663330 - Get help with Amazon Ads",
    },
  ];

  if (!input.brandRegistered && input.sponsoredBrandsCount > 0) {
    items.push({
      label: "Brand-led format dependency",
      detail:
        "Sponsored Brands and other brand-led traffic plays become less stable when the brand foundation is not fully established.",
      source: "GFG4VRQK7CQLGRTM - Programs and tools for growth",
    });
  }

  if (!input.storefrontReady && input.sponsoredBrandsCount > 0) {
    items.push({
      label: "Branded traffic destination",
      detail:
        "When running branded traffic formats, the store destination and brand story path should be ready so traffic does not land in a weak branded journey.",
      source: "GS6TQLG64JYD4LSY - Brand content display and optimization",
    });
  }

  if (input.campaignTypeCount < 2 || input.sponsoredProductsCount < 1) {
    items.push({
      label: "Narrow funnel risk",
      detail:
        "A single ad layer can capture some demand, but Amazon's own guidance points sellers toward combining ad and merchandising tools as the account grows.",
      source: "GEANBS97BNTWSBJB - Business Advisor goals and recommendations",
    });
  }

  if (input.newSellerCreditWindow) {
    items.push({
      label: "New seller ad-credit window",
      detail:
        "Professional sellers can qualify for Sponsored Products promotional click credits when campaigns launch within the incentive window after the first buyable ASIN.",
      source: "GXMJ38VA95GUN5XU - New Seller Incentives",
    });
  }

  if (input.sponsoredDisplayCount > 0 && input.campaignTypeCount < 2) {
    items.push({
      label: "Retargeting before baseline",
      detail:
        "Display-style retargeting is more useful after search capture and branded routing are already in place than as the only layer in the account.",
      source: "GEANBS97BNTWSBJB - Business Advisor goals and recommendations",
    });
  }

  return uniqueEvidence(items);
}

export function getStorefrontPolicyEvidence(input: {
  brandStoryReady: boolean;
  storeLinkedFromBrandStory: boolean;
  experimentReady: boolean;
  seasonalReady: boolean;
  collectionCount: number;
  trafficSourceCount: number;
}) {
  const items: AmazonPolicyEvidence[] = [
    {
      label: "Brand Story to Store linkage",
      detail:
        "Amazon states that A+ Brand Story can link shoppers to other products and to your Amazon brand store, making the store part of the branded PDP journey.",
      source: "G202102930 - A+ content",
    },
    {
      label: "Store as brand signal",
      detail:
        "Amazon recommends strengthening the brand through Brand Stores, A+ Brand Story, Sponsored Brands, and other brand tools rather than relying only on a product page.",
      source: "GS6TQLG64JYD4LSY - Brand content display and optimization",
    },
    {
      label: "Seasonal refresh expectation",
      detail:
        "Amazon's guidance for branded content explicitly calls out refreshing A+ content and the brand storefront with timely seasonal content.",
      source: "GFJTFMCXPRQ5GHUK - Prepare seasonal branded content",
    },
  ];

  if (!input.brandStoryReady) {
    items.push({
      label: "Brand Story dependency",
      detail:
        "If Brand Story is not published, the store loses an important native path from the PDP's From the brand section.",
      source: "G202102930 - A+ content",
    });
  }

  if (!input.storeLinkedFromBrandStory) {
    items.push({
      label: "Missing store entry point",
      detail:
        "A store without Brand Story or other branded linking points is harder to route into from the PDP and brand-led traffic placements.",
      source: "G202102930 - A+ content",
    });
  }

  if (!input.experimentReady) {
    items.push({
      label: "Experiment readiness",
      detail:
        "Amazon notes that Brand Story experiments require published content on the ASIN set and enough traffic to support meaningful testing.",
      source: "GVP453K5XRBJS7Y9 - Manage Your Experiments",
    });
  }

  if (!input.seasonalReady) {
    items.push({
      label: "Static branded journey",
      detail:
        "A store that never rotates seasonal or event content misses one of the explicit branded-content refresh patterns Amazon calls out.",
      source: "GFJTFMCXPRQ5GHUK - Prepare seasonal branded content",
    });
  }

  if (input.collectionCount < 2 || input.trafficSourceCount < 2) {
    items.push({
      label: "Thin store architecture",
      detail:
        "A store with only one collection or one traffic lane usually behaves more like a static brand page than a routing tool for discovery and cross-sell.",
      source: "GS6TQLG64JYD4LSY - Brand content display and optimization",
    });
  }

  return uniqueEvidence(items);
}

export function getAPlusPolicyEvidence(input: {
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
  const items: AmazonPolicyEvidence[] = [
    {
      label: "A+ access requirement",
      detail:
        "A+ Content is for Professional sellers with Brand Representative or Reseller access on the brand through Brand Registry.",
      source: "G202102930 - A+ content",
    },
    {
      label: "Technical asset rules",
      detail:
        "A+ images must use supported formats, RGB color space, stay under 2MB, and avoid GIFs, watermarks, QR codes, and unreadable text.",
      source: "GGW8U76SSNTRTBX7 - A+ content guidelines",
    },
    {
      label: "Content restriction baseline",
      detail:
        "A+ rejects promotional copy, competitor comparisons, off-Amazon contact details, pricing, shipping language, and unsupported claims.",
      source: "GGW8U76SSNTRTBX7 - A+ content guidelines",
    },
  ];

  if (input.premiumRequested) {
    items.push({
      label: "Premium A+ eligibility",
      detail:
        "Premium A+ eligibility expects Brand Story published across owned catalog ASINs and at least five approved A+ projects in the last 12 months.",
      source: "G202102930 - A+ content",
    });
  }

  if (!input.altTextReady) {
    items.push({
      label: "Alt-text submission",
      detail:
        "Alt-text is required and should describe the image in a way that helps customers using screen readers.",
      source: "G202134820 - Create A+ content",
    });
  }

  if (!input.plainTextMigrated) {
    items.push({
      label: "Plain-text description migration",
      detail:
        "Seller-submitted A+ hides the plain-text description, so the key product details should be carried into the A+ build.",
      source: "G202102930 - A+ content",
    });
  }

  if (input.retailContributionConflict) {
    items.push({
      label: "Retail contribution conflict",
      detail:
        "If the ASIN already has retail-vendor A+ contribution, seller-submitted A+ may be blocked or deprioritized.",
      source: "G202102960 - A+ content FAQ & troubleshooting",
    });
  }

  if (input.genericAsin) {
    items.push({
      label: "Generic ASIN scope",
      detail:
        "Generic ASIN access is limited to Basic A+ and does not extend to the broader premium/brand-story assumptions.",
      source: "G202102930 - A+ content",
    });
  }

  return uniqueEvidence(items);
}
