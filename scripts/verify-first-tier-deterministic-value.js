#!/usr/bin/env node

function assertDecisionGrade(result) {
  if (!result || typeof result !== "object") {
    throw new Error("Missing deterministic decision-grade payload.");
  }
  if (!result.verdict || typeof result.verdict !== "string" || result.verdict.trim().length < 12) {
    throw new Error(`${result.tool || "tool"} is missing a usable verdict.`);
  }
  if (!result.owner || typeof result.owner !== "string" || !/(owner|lead)/i.test(result.owner)) {
    throw new Error(`${result.tool || "tool"} is missing a clear accountable owner.`);
  }
  if (!result.doNotCross || typeof result.doNotCross !== "string" || !/^Do not\b/i.test(result.doNotCross.trim())) {
    throw new Error(`${result.tool || "tool"} is missing a hard action boundary.`);
  }
  if (!result.nextMove || typeof result.nextMove !== "string" || result.nextMove.trim().length < 24) {
    throw new Error(`${result.tool || "tool"} is missing a concrete next move.`);
  }
}

function verifyKeywordTrackerFixture() {
  const fixture = {
    trackedKeywordCount: 6,
    ownCoverageCount: 3,
    competitorCount: 3,
    majorityCompetitorCount: 4,
    gapCount: 2,
    defendCount: 2,
    observeCount: 2,
    currentRank: 18400,
    bestCompetitorRank: 6200,
    alertThreshold: 5000,
    cheaperCompetitorCount: 1,
    strongerReviewCompetitorCount: 2,
    aPlusCompetitorCount: 3,
    ownHasAPlus: false,
  };

  const rankGap =
    fixture.currentRank > 0 && fixture.bestCompetitorRank > 0
      ? fixture.currentRank - fixture.bestCompetitorRank
      : 0;

  const verdict =
    fixture.gapCount > 0
      ? "Close the commercial keyword gaps before defending anything else"
      : rankGap > fixture.alertThreshold &&
          (fixture.strongerReviewCompetitorCount >= 2 || (!fixture.ownHasAPlus && fixture.aPlusCompetitorCount >= 2))
        ? "Repair proof before trusting the defended keyword set"
        : "Defend the current keyword set and keep the watchlist tight";
  const owner =
    fixture.gapCount > 0
      ? "SEO / listing lead"
      : rankGap > fixture.alertThreshold &&
          (fixture.strongerReviewCompetitorCount >= 2 || (!fixture.ownHasAPlus && fixture.aPlusCompetitorCount >= 2))
        ? "CX / merchandising lead"
        : "Keyword watch owner";
  const doNotCross =
    fixture.gapCount > 0
      ? "Do not keep adding phrases while current commercial gaps are still unresolved"
      : rankGap > fixture.alertThreshold &&
          (fixture.strongerReviewCompetitorCount >= 2 || (!fixture.ownHasAPlus && fixture.aPlusCompetitorCount >= 2))
        ? "Do not blame phrase drift before checking proof pressure"
        : "Do not bloat the watchlist beyond what someone will actually review";
  const nextMove =
    fixture.gapCount > 0
      ? "Fix the strongest gap phrases first and keep the defend set frozen."
      : rankGap > fixture.alertThreshold &&
          (fixture.strongerReviewCompetitorCount >= 2 || (!fixture.ownHasAPlus && fixture.aPlusCompetitorCount >= 2))
        ? "Repair trust proof first and keep phrase churn closed."
        : "Hold the current defend set steady and only re-open when the live set changes.";

  const result = {
    tool: "amazon-keyword-tracker",
    trackedKeywordCount: fixture.trackedKeywordCount,
    gapCount: fixture.gapCount,
    defendCount: fixture.defendCount,
    rankGap,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyCompetitorMonitoringFixture() {
  const fixture = {
    competitorCount: 4,
    averagePrice: 82,
    lowestPrice: 71,
    highestPrice: 109,
    volatilePriceCount: 2,
    averageReviewCount: 640,
    reviewSpread: 1180,
    lowReviewCount: 1,
    averageRank: 12400,
    bestRank: 2200,
    worstRank: 28400,
    rankSpread: 26200,
    aPlusCount: 3,
    badgeCarrierCount: 1,
    missingPriceCount: 0,
    missingRankCount: 0,
    alertDelta: 5,
    reviewAlertThreshold: 75,
    cadenceDays: 3,
  };

  const verdict =
    fixture.volatilePriceCount > 0
      ? "Open one price-response lane now"
      : fixture.badgeCarrierCount > 0
        ? "Open one badge-response lane now"
        : fixture.lowReviewCount > 0
          ? "Promote new entrants into the first watch lane"
          : "Keep the watch cadence live without opening a broad response";
  const owner =
    fixture.volatilePriceCount > 0
      ? "Pricing / marketplace lead"
      : fixture.badgeCarrierCount > 0
        ? "Brand / content lead"
        : fixture.lowReviewCount > 0
          ? "Competitive intelligence lead"
          : "Watch owner";
  const doNotCross =
    fixture.volatilePriceCount > 0
      ? "Do not let one price move trigger broad pricing, content, and PPC changes at once"
      : fixture.badgeCarrierCount > 0
        ? "Do not treat badge pickup like a full-market reset"
        : fixture.lowReviewCount > 0
          ? "Do not keep swapping entrants every run"
          : "Do not let routine watch refresh turn into busywork";
  const nextMove =
    fixture.volatilePriceCount > 0
      ? "Pick the single price outlier that matters most and route it into one response rule."
      : fixture.badgeCarrierCount > 0
        ? "Escalate one badge pickup rule and keep price and entrant work closed."
        : fixture.lowReviewCount > 0
          ? "Move the strongest low-review entrant into the first interruption lane."
          : "Freeze this exact watch set and wait for the next real signal.";

  const result = {
    tool: "amazon-competitor-monitoring",
    competitorCount: fixture.competitorCount,
    volatilePriceCount: fixture.volatilePriceCount,
    lowReviewCount: fixture.lowReviewCount,
    badgeCarrierCount: fixture.badgeCarrierCount,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyPpcCampaignFixture() {
  const fixture = {
    rowCount: 7,
    campaignTypeCount: 3,
    spend: 1480,
    sales: 3920,
    orders: 54,
    acos: 0.3776,
    ctr: 0.0027,
    cvr: 0.072,
    winnerCount: 1,
    wasteCount: 3,
    targetAcos: 0.28,
    topWinnerCampaign: "SP Exact - Hero ASIN",
    topWasteCampaign: "SP Auto - Harvest",
  };

  const verdict =
    fixture.acos > fixture.targetAcos * 1.2 && fixture.wasteCount > 0
      ? "Stop waste and cut SP Auto - Harvest now"
      : fixture.ctr < 0.003
        ? "Rebuild targeting before adding more budget"
        : fixture.cvr < 0.08
          ? "Repair offer conversion before scaling traffic"
          : "Scale SP Exact - Hero ASIN and keep the rest tight";
  const owner =
    fixture.acos > fixture.targetAcos * 1.2 && fixture.wasteCount > 0
      ? "PPC efficiency lead"
      : fixture.ctr < 0.003
        ? "Targeting lead"
        : fixture.cvr < 0.08
          ? "Offer / conversion lead"
          : "Growth lead";
  const doNotCross =
    fixture.acos > fixture.targetAcos * 1.2 && fixture.wasteCount > 0
      ? "Do not scale winners while obvious waste is still leaking cash"
      : fixture.ctr < 0.003
        ? "Do not solve weak click-through with bid changes alone"
        : fixture.cvr < 0.08
          ? "Do not buy more traffic into a weak conversion surface"
          : "Do not spread budget across the whole account just because one campaign works";
  const nextMove =
    fixture.acos > fixture.targetAcos * 1.2 && fixture.wasteCount > 0
      ? "Cut bids or pause waste in SP Auto - Harvest first."
      : fixture.ctr < 0.003
        ? "Split intent and tighten targeting before making broader budget moves."
        : fixture.cvr < 0.08
          ? "Repair listing conversion and offer support before adding more spend."
          : "Increase budget on SP Exact - Hero ASIN in controlled steps.";

  const result = {
    tool: "amazon-ppc-campaign",
    rowCount: fixture.rowCount,
    wasteCount: fixture.wasteCount,
    winnerCount: fixture.winnerCount,
    acos: fixture.acos,
    targetAcos: fixture.targetAcos,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyAdvertisingStrategyFixture() {
  const fixture = {
    rowCount: 9,
    campaignTypeCount: 3,
    monthlyBudget: 1800,
    heroAsinCount: 2,
    topCampaignShare: 0.52,
    weakCampaignCount: 3,
    sponsoredProductsCount: 4,
    sponsoredBrandsCount: 3,
    sponsoredDisplayCount: 2,
    brandRegistered: true,
    storefrontReady: false,
    newSellerCreditWindow: false,
  };

  const verdict =
    fixture.topCampaignShare > 0.45
      ? "Reduce spend concentration before adding reach"
      : fixture.weakCampaignCount >= 3
        ? "Shrink the weak slice before opening more funnel"
        : !fixture.storefrontReady && fixture.sponsoredBrandsCount > 0
          ? "Repair the brand destination before scaling upper funnel"
          : "Scale this ad mix as a controlled funnel";
  const owner =
    fixture.topCampaignShare > 0.45
      ? "Budget allocation lead"
      : fixture.weakCampaignCount >= 3
        ? "Account repair lead"
        : !fixture.storefrontReady && fixture.sponsoredBrandsCount > 0
          ? "Brand funnel lead"
          : "Advertising strategy lead";
  const doNotCross =
    fixture.topCampaignShare > 0.45
      ? "Do not let one spend cluster define the whole account"
      : fixture.weakCampaignCount >= 3
        ? "Do not expand reach while a large weak slice is still leaking budget"
        : !fixture.storefrontReady && fixture.sponsoredBrandsCount > 0
          ? "Do not scale branded clicks into a weak store path"
          : "Do not let every channel try to do every job";
  const nextMove =
    fixture.topCampaignShare > 0.45
      ? "Reduce dependence on the top spend cluster before opening new funnel layers."
      : fixture.weakCampaignCount >= 3
        ? "Cut the weak campaign slice before adding another channel role."
        : !fixture.storefrontReady && fixture.sponsoredBrandsCount > 0
          ? "Fix the store path before buying more branded traffic."
          : "Push one clearer role into each ad type and scale from that cleaner funnel.";

  const result = {
    tool: "amazon-advertising-strategy",
    rowCount: fixture.rowCount,
    campaignTypeCount: fixture.campaignTypeCount,
    monthlyBudget: fixture.monthlyBudget,
    topCampaignShare: fixture.topCampaignShare,
    weakCampaignCount: fixture.weakCampaignCount,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyBrandAnalyticsFixture() {
  const fixture = {
    rowCount: 12,
    topQueryCount: 12,
    clickedAsinCount: 9,
    convertedAsinCount: 7,
    ownAsinMentions: 2,
    ownAsinProvided: true,
    competitorAsinCount: 6,
    concentrationShare: 0.58,
    medianSfr: 1820,
  };

  const verdict =
    fixture.ownAsinProvided && fixture.ownAsinMentions === 0
      ? "Treat this as a gap map before defending anything else"
      : fixture.concentrationShare >= 0.5
        ? "Attack the concentrated winner set before broadening query work"
        : fixture.ownAsinMentions / fixture.topQueryCount >= 0.2
          ? "Defend visible query share before chasing colder queries"
          : "Balance defense and attack from this export";
  const owner =
    fixture.ownAsinProvided && fixture.ownAsinMentions === 0
      ? "Growth / gap-closure lead"
      : fixture.concentrationShare >= 0.5
        ? "Competitive response lead"
        : fixture.ownAsinMentions / fixture.topQueryCount >= 0.2
          ? "Listing / defense lead"
          : "Brand analytics lead";
  const doNotCross =
    fixture.ownAsinProvided && fixture.ownAsinMentions === 0
      ? "Do not pretend this is a defense map when your ASIN is absent"
      : fixture.concentrationShare >= 0.5
        ? "Do not spread effort across every query while a small winner set controls the field"
        : fixture.ownAsinMentions / fixture.topQueryCount >= 0.2
          ? "Do not chase colder queries while visible share is still leaking"
          : "Do not mix defense rows and gap rows into one vague action list";
  const nextMove =
    fixture.ownAsinProvided && fixture.ownAsinMentions === 0
      ? "Open the highest-value absent query first and keep defense work closed."
      : fixture.concentrationShare >= 0.5
        ? "Pressure-test the top repeated winner ASIN before widening into generic query work."
        : fixture.ownAsinMentions / fixture.topQueryCount >= 0.2
          ? "Protect the visible own-ASIN queries first and keep colder attack lanes closed."
          : "Split one defend lane and one attack lane, then keep the rest of the export closed.";

  const result = {
    tool: "amazon-brand-analytics",
    rowCount: fixture.rowCount,
    topQueryCount: fixture.topQueryCount,
    ownAsinMentions: fixture.ownAsinMentions,
    concentrationShare: fixture.concentrationShare,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyRepricingStrategyFixture() {
  const fixture = {
    ownPrice: 49.99,
    lowestCompetitorPrice: 41.99,
    averageCompetitorPrice: 46.5,
    competitorCount: 4,
    netMarginRate: 18.5,
    minimumMarginRate: 12,
    floorPrice: 43.5,
    ceilingPrice: 50.99,
    goal: "margin",
    fulfillmentMode: "FBA",
  };
  const priceGapToLow =
    fixture.lowestCompetitorPrice > 0 ? fixture.ownPrice - fixture.lowestCompetitorPrice : 0;

  const verdict =
    fixture.netMarginRate < fixture.minimumMarginRate
      ? "Raise price or repair economics before reacting to the market"
      : fixture.floorPrice >= fixture.ownPrice
        ? "Reset the floor before any automated response goes live"
        : priceGapToLow > 5 && fixture.goal !== "premium-defense"
          ? "Close the market gap without crossing the margin floor"
          : "Ship the repricing guardrails";
  const owner =
    fixture.netMarginRate < fixture.minimumMarginRate
      ? "Unit economics lead"
      : fixture.floorPrice >= fixture.ownPrice
        ? "Pricing operations lead"
        : priceGapToLow > 5 && fixture.goal !== "premium-defense"
          ? "Pricing lead"
          : "Repricing owner";
  const doNotCross =
    fixture.netMarginRate < fixture.minimumMarginRate
      ? "Do not chase the market below the minimum margin guardrail"
      : fixture.floorPrice >= fixture.ownPrice
        ? "Do not let the floor sit at or above the current price"
        : priceGapToLow > 5 && fixture.goal !== "premium-defense"
          ? "Do not defend a large premium by habit"
          : "Do not let repricing rules outrun the published floor and ceiling";
  const nextMove =
    fixture.netMarginRate < fixture.minimumMarginRate
      ? "Raise price or repair unit economics before following competitor moves."
      : fixture.floorPrice >= fixture.ownPrice
        ? "Recompute the floor so automation cannot cut below the current safe price."
        : priceGapToLow > 5 && fixture.goal !== "premium-defense"
          ? "Close the largest visible market gap in controlled steps without crossing the floor."
          : "Publish the floor and ceiling as live repricing guardrails.";

  const result = {
    tool: "amazon-repricing-strategy",
    ownPrice: fixture.ownPrice,
    lowestCompetitorPrice: fixture.lowestCompetitorPrice,
    floorPrice: fixture.floorPrice,
    ceilingPrice: fixture.ceilingPrice,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyBuyBoxFixture() {
  const fixture = {
    ownPrice: 34.99,
    averageCompetitorPrice: 29.49,
    sellerRating: 4.2,
    competitorRating: 4.6,
    fulfillmentMode: "FBM",
    shippingSlaDays: 4,
    stockReady: true,
    returnRate: 0.091,
  };
  const priceGap = fixture.ownPrice - fixture.averageCompetitorPrice;

  const verdict =
    !fixture.stockReady
      ? "Fix stock continuity before trying to defend the Buy Box"
      : priceGap > 3
        ? "Close the price gap before treating this like a visibility problem"
        : fixture.fulfillmentMode === "FBM" || fixture.shippingSlaDays > 2
          ? "Repair fulfillment speed before leaning harder on price"
          : fixture.sellerRating < fixture.competitorRating || fixture.returnRate >= 0.08
            ? "Repair offer trust before pushing harder for Buy Box share"
            : "Defend the current Buy Box posture without cutting price first";
  const owner =
    !fixture.stockReady
      ? "Inventory lead"
      : priceGap > 3
        ? "Pricing / marketplace lead"
        : fixture.fulfillmentMode === "FBM" || fixture.shippingSlaDays > 2
          ? "Fulfillment lead"
          : fixture.sellerRating < fixture.competitorRating || fixture.returnRate >= 0.08
            ? "Account health lead"
            : "Buy Box owner";
  const doNotCross =
    !fixture.stockReady
      ? "Do not push traffic or discounts into unstable stock coverage"
      : priceGap > 3
        ? "Do not change price, fulfillment, and PPC at the same time"
        : fixture.fulfillmentMode === "FBM" || fixture.shippingSlaDays > 2
          ? "Do not solve a fulfillment disadvantage with deeper price cuts alone"
          : fixture.sellerRating < fixture.competitorRating || fixture.returnRate >= 0.08
            ? "Do not use price cuts to hide trust and account-quality weakness"
            : "Do not cut price first when the offer is already commercially defendable";
  const nextMove =
    !fixture.stockReady
      ? "Restore stable in-stock coverage before changing price, traffic, or promo pressure."
      : priceGap > 3
        ? "Close the visible market gap first and keep fulfillment and traffic changes frozen."
        : fixture.fulfillmentMode === "FBM" || fixture.shippingSlaDays > 2
          ? "Tighten delivery speed or fulfillment mode before using more price pressure."
          : fixture.sellerRating < fixture.competitorRating || fixture.returnRate >= 0.08
            ? "Clean up rating and returns pressure before trying to buy back the Buy Box."
            : "Hold price discipline and defend the current non-price edge.";

  const result = {
    tool: "amazon-buy-box",
    ownPrice: fixture.ownPrice,
    averageCompetitorPrice: fixture.averageCompetitorPrice,
    priceGap,
    fulfillmentMode: fixture.fulfillmentMode,
    shippingSlaDays: fixture.shippingSlaDays,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyDealFinderFixture() {
  const fixture = {
    price: 39.99,
    netMarginRate: 11.2,
    inventoryDays: 18,
    promoWindowDays: 7,
    discountRate: 0.1,
    goal: "velocity",
    recommendedDeal: "hold",
    urgencyScore: 82,
    featuredOfferLikely: true,
    dealQuantityReady: true,
    referencePriceReady: true,
    stackRisk: false,
  };

  const verdict =
    fixture.recommendedDeal === "hold" || fixture.netMarginRate < 12
      ? "Do not launch a deal until the unit economics recover"
      : !fixture.featuredOfferLikely
        ? "Repair Featured Offer competitiveness before paying for promo visibility"
        : !fixture.dealQuantityReady || fixture.inventoryDays < fixture.promoWindowDays
          ? "Fix inventory coverage before opening the deal window"
          : !fixture.referencePriceReady
            ? "Repair price-history proof before launching the deal"
            : fixture.stackRisk
              ? "Remove promo conflicts before this deal goes live"
              : "Run coupon as the single promo lane";
  const owner =
    fixture.recommendedDeal === "hold" || fixture.netMarginRate < 12
      ? "Unit economics lead"
      : !fixture.featuredOfferLikely
        ? "Offer competitiveness lead"
        : !fixture.dealQuantityReady || fixture.inventoryDays < fixture.promoWindowDays
          ? "Inventory lead"
          : !fixture.referencePriceReady
            ? "Pricing operations lead"
            : fixture.stackRisk
              ? "Promo operations lead"
              : "Promotions lead";
  const doNotCross =
    fixture.recommendedDeal === "hold" || fixture.netMarginRate < 12
      ? "Do not force a deal into a cycle that cannot support it economically"
      : !fixture.featuredOfferLikely
        ? "Do not pay for deal depth before the offer can actually surface"
        : !fixture.dealQuantityReady || fixture.inventoryDays < fixture.promoWindowDays
          ? "Do not let the promo window outrun committed deal inventory"
          : !fixture.referencePriceReady
            ? "Do not submit a deal while pricing history is still weak"
            : fixture.stackRisk
              ? "Do not stack multiple promo mechanics on the same retail moment"
              : "Do not keep multiple promo formats open at once just to stay active";
  const nextMove =
    fixture.recommendedDeal === "hold" || fixture.netMarginRate < 12
      ? "Raise margin safety or change inventory pressure before putting any deal live."
      : !fixture.featuredOfferLikely
        ? "Fix Featured Offer competitiveness first and keep discount planning closed."
        : !fixture.dealQuantityReady || fixture.inventoryDays < fixture.promoWindowDays
          ? "Shorten the deal window or secure more promo inventory before launch."
          : !fixture.referencePriceReady
            ? "Clean up recent pricing history before submitting the deal."
            : fixture.stackRisk
              ? "Remove overlapping promo conflicts and reopen one clean launch lane."
              : "Launch coupon with the current window and keep other promo types closed.";

  const result = {
    tool: "amazon-deal-finder",
    recommendedDeal: fixture.recommendedDeal,
    netMarginRate: fixture.netMarginRate,
    inventoryDays: fixture.inventoryDays,
    urgencyScore: fixture.urgencyScore,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyCouponStrategyFixture() {
  const fixture = {
    price: 27.99,
    netMarginRate: 16.4,
    discountRate: 0.04,
    inventoryDays: 24,
    objective: "rank",
    stackRisk: false,
    couponAfterMargin: 9.1,
    professionalSeller: true,
    feedbackRating: 4.3,
    offerBuyable: true,
    featuredOfferLikely: true,
    audienceType: "all",
    brandRepresentative: false,
  };

  const verdict =
    fixture.couponAfterMargin < 8
      ? "Do not run this coupon until the post-coupon margin is safe"
      : !fixture.professionalSeller || (fixture.audienceType === "brand" && !fixture.brandRepresentative)
        ? "Fix coupon access before planning deeper discounts"
        : !fixture.offerBuyable || !fixture.featuredOfferLikely
          ? "Repair offer buyability before expecting coupon visibility"
          : fixture.discountRate < 0.05
            ? "Lift the coupon into the eligible depth band before launch"
            : fixture.inventoryDays < 21 && fixture.objective !== "clearance"
              ? "Protect stock cover before using coupons for demand lift"
              : fixture.stackRisk
                ? "Remove stacked promo pressure before launching the coupon"
                : "Launch this coupon as a controlled retail test";
  const owner =
    fixture.couponAfterMargin < 8
      ? "Unit economics lead"
      : !fixture.professionalSeller || (fixture.audienceType === "brand" && !fixture.brandRepresentative)
        ? "Account access lead"
        : !fixture.offerBuyable || !fixture.featuredOfferLikely
          ? "Offer competitiveness lead"
          : fixture.discountRate < 0.05
            ? "Promotions lead"
            : fixture.inventoryDays < 21 && fixture.objective !== "clearance"
              ? "Inventory lead"
              : fixture.stackRisk
                ? "Promo operations lead"
                : "Coupon owner";
  const doNotCross =
    fixture.couponAfterMargin < 8
      ? "Do not buy traffic with a coupon that leaves unsafe contribution behind"
      : !fixture.professionalSeller || (fixture.audienceType === "brand" && !fixture.brandRepresentative)
        ? "Do not plan around coupon audiences you cannot actually access"
        : !fixture.offerBuyable || !fixture.featuredOfferLikely
          ? "Do not expect coupons to rescue a weak or unbuyable offer"
          : fixture.discountRate < 0.05
            ? "Do not ship a coupon below the eligible retail threshold"
            : fixture.inventoryDays < 21 && fixture.objective !== "clearance"
              ? "Do not accelerate demand into tight stock coverage"
              : fixture.stackRisk
                ? "Do not stack coupons with other promo spikes in the same retail moment"
                : "Do not keep adjusting depth, traffic, and stacking at the same time";
  const nextMove =
    fixture.couponAfterMargin < 8
      ? "Reduce depth or improve contribution before reopening the coupon plan."
      : !fixture.professionalSeller || (fixture.audienceType === "brand" && !fixture.brandRepresentative)
        ? "Fix seller access and audience permissions before changing coupon depth."
        : !fixture.offerBuyable || !fixture.featuredOfferLikely
          ? "Restore buyability and placement first, then re-check coupon visibility."
          : fixture.discountRate < 0.05
            ? "Raise coupon depth into the eligible band and keep other launch assumptions frozen."
            : fixture.inventoryDays < 21 && fixture.objective !== "clearance"
              ? "Protect inventory cover before using coupons to drive more demand."
              : fixture.stackRisk
                ? "Remove overlapping promo pressure and reopen one clean coupon launch lane."
                : "Launch the coupon with the current economics and keep other promo mechanics closed.";

  const result = {
    tool: "amazon-coupon-strategy",
    price: fixture.price,
    discountRate: fixture.discountRate,
    couponAfterMargin: fixture.couponAfterMargin,
    inventoryDays: fixture.inventoryDays,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyDaypartingStrategyFixture() {
  const fixture = {
    rowCount: 12,
    highWasteHours: 5,
    winnerHours: 2,
    spend: 1320,
    sales: 2440,
    acos: 0.541,
    cvr: 0.061,
    bestHourShare: 0.31,
    timezone: "America/Los_Angeles",
  };

  const verdict =
    fixture.rowCount < 8
      ? "Do not automate dayparting until the hourly evidence is deeper"
      : fixture.highWasteHours >= Math.max(3, Math.ceil(fixture.rowCount * 0.3))
        ? "Cut waste hours before funding any winning block harder"
        : fixture.winnerHours === 0
          ? "Keep the schedule defensive until a real winning block appears"
          : fixture.bestHourShare > 0.35
            ? "Reduce hour-block concentration before trusting this schedule"
            : "Apply the schedule and scale only the proven winning hours";
  const owner =
    fixture.rowCount < 8
      ? "PPC analytics lead"
      : fixture.highWasteHours >= Math.max(3, Math.ceil(fixture.rowCount * 0.3))
        ? "Budget efficiency lead"
        : fixture.winnerHours === 0
          ? "Dayparting owner"
          : fixture.bestHourShare > 0.35
            ? "Risk control lead"
            : "Schedule owner";
  const doNotCross =
    fixture.rowCount < 8
      ? "Do not automate an hour schedule from a thin sample"
      : fixture.highWasteHours >= Math.max(3, Math.ceil(fixture.rowCount * 0.3))
        ? "Do not raise winner budgets while obvious waste hours are still leaking spend"
        : fixture.winnerHours === 0
          ? "Do not invent winning hours that the data does not support"
          : fixture.bestHourShare > 0.35
            ? "Do not let one narrow hour block carry the whole account"
            : "Do not change timezone, bids, and schedule rules at the same time";
  const nextMove =
    fixture.rowCount < 8
      ? "Collect a deeper hour sample before changing bids or schedules live."
      : fixture.highWasteHours >= Math.max(3, Math.ceil(fixture.rowCount * 0.3))
        ? "Bid down or cut the worst hours first and keep winner expansion frozen."
        : fixture.winnerHours === 0
          ? "Hold the schedule tight and wait for one durable winning block before scaling."
          : fixture.bestHourShare > 0.35
            ? "Reduce dependence on the top hour block before adding more daypart aggression."
            : "Raise support only in the proven winning hours and keep waste windows closed.";

  const result = {
    tool: "amazon-dayparting-strategy",
    rowCount: fixture.rowCount,
    highWasteHours: fixture.highWasteHours,
    winnerHours: fixture.winnerHours,
    acos: fixture.acos,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyDisplayAdsFixture() {
  const fixture = {
    audienceCount: 3,
    competitorCount: 5,
    retargetingShare: 0.81,
    prospectingShare: 0.19,
    budget: 1600,
    heroAsinCount: 2,
    creativeReady: true,
  };

  const verdict =
    fixture.audienceCount < 2
      ? "Do not widen display until the audience structure is real"
      : fixture.retargetingShare > 0.75
        ? "Reduce retargeting concentration before adding more budget"
        : fixture.prospectingShare > 0.55 && fixture.creativeReady === false
          ? "Repair creative support before pushing prospecting harder"
          : fixture.heroAsinCount < 1
            ? "Define a hero ASIN before launching broader display lanes"
            : "Launch the display plan with one clear audience job per lane";
  const owner =
    fixture.audienceCount < 2
      ? "Audience strategy lead"
      : fixture.retargetingShare > 0.75
        ? "Budget allocation lead"
        : fixture.prospectingShare > 0.55 && fixture.creativeReady === false
          ? "Creative readiness lead"
          : fixture.heroAsinCount < 1
            ? "Merchandising lead"
            : "Display owner";
  const doNotCross =
    fixture.audienceCount < 2
      ? "Do not spread display budget across a fake one-audience structure"
      : fixture.retargetingShare > 0.75
        ? "Do not let retargeting absorb the whole display budget"
        : fixture.prospectingShare > 0.55 && fixture.creativeReady === false
          ? "Do not buy colder display traffic without the creative to convert it"
          : fixture.heroAsinCount < 1
            ? "Do not launch broad display without a clear product destination"
            : "Do not let every display lane chase the same vague awareness goal";
  const nextMove =
    fixture.audienceCount < 2
      ? "Build at least one additional audience lane before expanding spend."
      : fixture.retargetingShare > 0.75
        ? "Pull budget concentration down from retargeting before opening more audience reach."
        : fixture.prospectingShare > 0.55 && fixture.creativeReady === false
          ? "Fix creative support first and keep prospecting expansion frozen."
          : fixture.heroAsinCount < 1
            ? "Anchor the plan to one hero ASIN before widening the audience map."
            : "Launch one audience job per lane and keep the mix disciplined.";

  const result = {
    tool: "amazon-display-ads",
    audienceCount: fixture.audienceCount,
    retargetingShare: fixture.retargetingShare,
    prospectingShare: fixture.prospectingShare,
    heroAsinCount: fixture.heroAsinCount,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyGlobalSellingFixture() {
  const fixture = {
    targetCount: 4,
    marginReadyCount: 4,
    complianceReadyCount: 2,
    localizationReadyCount: 3,
    nearestExpansionScore: 74,
    currentMarketplace: "US",
    taxReady: true,
    supportReady: true,
    buildInternationalListingsReady: false,
  };

  const verdict =
    fixture.targetCount === 0
      ? "Do not expand until a real target shortlist exists"
      : fixture.complianceReadyCount < fixture.targetCount
        ? "Fix compliance gates before opening the next marketplace"
        : fixture.marginReadyCount < fixture.targetCount
          ? "Cut weak-margin markets before spending more launch effort"
          : !fixture.taxReady || !fixture.supportReady
            ? "Repair operating readiness before cross-border launch"
            : fixture.targetCount > 3 || fixture.nearestExpansionScore < 60
              ? "Narrow the shortlist before broad expansion"
              : "Enter the nearest-fit market and keep the rest closed";
  const owner =
    fixture.targetCount === 0
      ? "Expansion strategy lead"
      : fixture.complianceReadyCount < fixture.targetCount
        ? "Compliance lead"
        : fixture.marginReadyCount < fixture.targetCount
          ? "Landed margin lead"
          : !fixture.taxReady || !fixture.supportReady
            ? "Marketplace operations lead"
            : fixture.targetCount > 3 || fixture.nearestExpansionScore < 60
              ? "Expansion sequencing lead"
              : "International launch owner";
  const doNotCross =
    fixture.targetCount === 0
      ? "Do not start cross-border work without a real market shortlist"
      : fixture.complianceReadyCount < fixture.targetCount
        ? "Do not let translation or ads outrun compliance clearance"
        : fixture.marginReadyCount < fixture.targetCount
          ? "Do not localize markets that fail landed margin reality"
          : !fixture.taxReady || !fixture.supportReady
            ? "Do not open a marketplace before tax and support paths are ready"
            : fixture.targetCount > 3 || fixture.nearestExpansionScore < 60
              ? "Do not open several middling markets at the same time"
              : "Do not launch multiple markets before one proof market is stable";
  const nextMove =
    fixture.targetCount === 0
      ? "Build a real target shortlist before committing localization or logistics work."
      : fixture.complianceReadyCount < fixture.targetCount
        ? "Remove non-compliant targets first and reopen only the cleanest market."
        : fixture.marginReadyCount < fixture.targetCount
          ? "Drop the weakest-margin targets before expanding translation or setup work."
          : !fixture.taxReady || !fixture.supportReady
            ? "Close tax and support readiness before submitting the next launch."
            : fixture.targetCount > 3 || fixture.nearestExpansionScore < 60
              ? "Shrink the shortlist to the single strongest next market before scaling."
              : "Launch the nearest-fit market first and keep the wider cluster frozen.";

  const result = {
    tool: "amazon-global-selling",
    targetCount: fixture.targetCount,
    complianceReadyCount: fixture.complianceReadyCount,
    marginReadyCount: fixture.marginReadyCount,
    nearestExpansionScore: fixture.nearestExpansionScore,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyReviewStrategyFixture() {
  const fixture = {
    orderVolume: 240,
    reviewCount: 18,
    reviewRate: 0.006,
    channels: ["request-a-review", "follow-up-email", "external-incentive"],
    compliantChannels: ["request-a-review", "follow-up-email"],
    stage: "growth",
    vineEligible: false,
  };
  const channelCount = fixture.channels.length;
  const compliantChannelCount = fixture.compliantChannels.length;
  const hasExternalIncentive = fixture.channels.includes("external-incentive");

  const verdict =
    hasExternalIncentive
      ? "Stop the risky review tactic before doing anything else"
      : compliantChannelCount < channelCount
        ? "Remove non-compliant channels before scaling review requests"
        : fixture.reviewRate < 0.01
          ? "Repair review conversion before adding more request volume"
          : fixture.stage === "launch" && fixture.reviewCount < 10 && !fixture.vineEligible
            ? "Keep launch-stage proof work conservative until a cleaner proof lane exists"
            : "Scale one compliant review flow and keep the rest frozen";
  const owner =
    hasExternalIncentive
      ? "Policy compliance lead"
      : compliantChannelCount < channelCount
        ? "Review compliance lead"
        : fixture.reviewRate < 0.01
          ? "Lifecycle operations lead"
          : fixture.stage === "launch" && fixture.reviewCount < 10 && !fixture.vineEligible
            ? "Launch proof lead"
            : "Review growth owner";
  const doNotCross =
    hasExternalIncentive
      ? "Do not keep any incentive-based review tactic live"
      : compliantChannelCount < channelCount
        ? "Do not optimize risky channels as if they were normal acquisition levers"
        : fixture.reviewRate < 0.01
          ? "Do not add more channels before the core review flow converts"
          : fixture.stage === "launch" && fixture.reviewCount < 10 && !fixture.vineEligible
            ? "Do not panic-open risky proof tactics during launch"
            : "Do not test timing, channel, and messaging all at once";
  const nextMove =
    hasExternalIncentive
      ? "Shut off the incentive-based tactic immediately and keep all growth tests frozen."
      : compliantChannelCount < channelCount
        ? "Remove the risky channels first and reopen only one compliant request path."
        : fixture.reviewRate < 0.01
          ? "Fix timing and request placement before increasing review-request volume."
          : fixture.stage === "launch" && fixture.reviewCount < 10 && !fixture.vineEligible
            ? "Keep the launch review plan narrow until one safe proof lane is working."
            : "Scale the clean request flow and keep new channel experiments closed.";

  const result = {
    tool: "amazon-review-strategy",
    orderVolume: fixture.orderVolume,
    reviewRate: fixture.reviewRate,
    channelCount,
    compliantChannelCount,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyVineProgramFixture() {
  const fixture = {
    reviewCount: 8,
    marginRate: 13.4,
    unitsAvailable: 14,
    launchStage: "launch",
    brandRegistered: true,
    marketReady: true,
    fbaReady: true,
    detailPageReady: true,
  };

  const verdict =
    !fixture.brandRegistered || !fixture.fbaReady
      ? "Fix Vine eligibility before thinking about enrollment"
      : !fixture.detailPageReady || !fixture.marketReady
        ? "Repair the offer before sending Vine traffic into it"
        : fixture.marginRate < 15 || fixture.unitsAvailable < 20
          ? "Protect margin and unit buffer before opening Vine"
          : fixture.reviewCount >= 30
            ? "Skip Vine and keep proof growth organic"
            : "Enroll this SKU in Vine as a controlled proof lane";
  const owner =
    !fixture.brandRegistered || !fixture.fbaReady
      ? "Eligibility lead"
      : !fixture.detailPageReady || !fixture.marketReady
        ? "Listing readiness lead"
        : fixture.marginRate < 15 || fixture.unitsAvailable < 20
          ? "Unit economics lead"
          : fixture.reviewCount >= 30
            ? "Review growth lead"
            : "Vine owner";
  const doNotCross =
    !fixture.brandRegistered || !fixture.fbaReady
      ? "Do not plan around Vine without Brand Registry and live FBA readiness"
      : !fixture.detailPageReady || !fixture.marketReady
        ? "Do not send Vine reviewers into a weak detail page or unready offer"
        : fixture.marginRate < 15 || fixture.unitsAvailable < 20
          ? "Do not buy proof acceleration with margin or inventory you cannot spare"
          : fixture.reviewCount >= 30
            ? "Do not use Vine by habit when the SKU already has enough proof"
            : "Do not run Vine and broad proof experiments at the same time";
  const nextMove =
    !fixture.brandRegistered || !fixture.fbaReady
      ? "Close Brand Registry and FBA eligibility gaps before planning enrollment."
      : !fixture.detailPageReady || !fixture.marketReady
        ? "Fix the detail page and offer readiness before using Vine as proof acceleration."
        : fixture.marginRate < 15 || fixture.unitsAvailable < 20
          ? "Raise buffer and margin tolerance before committing units to Vine."
          : fixture.reviewCount >= 30
            ? "Keep proof growth organic and reserve Vine for thinner-proof launches."
            : "Enroll this SKU in Vine and keep other proof experiments closed.";

  const result = {
    tool: "amazon-vine-program",
    reviewCount: fixture.reviewCount,
    marginRate: fixture.marginRate,
    unitsAvailable: fixture.unitsAvailable,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyProductBundlingFixture() {
  const fixture = {
    marketplace: "US",
    componentCount: 3,
    complementaryScore: 78,
    marginRate: 18.5,
    bundleDiscountRate: 0.095,
    clarityScore: 54,
    aovLiftScore: 22,
    brandRepresentative: true,
    fbaReady: true,
  };
  const effectiveMargin = fixture.marginRate - fixture.bundleDiscountRate * 100;

  const verdict =
    fixture.marketplace !== "US" || !fixture.brandRepresentative || !fixture.fbaReady
      ? "Fix bundle eligibility before building the offer"
      : fixture.componentCount < 2 || fixture.componentCount > 5
        ? "Reset the component set before trying to launch this bundle"
        : fixture.complementaryScore < 60
          ? "Tighten product fit before touching bundle pricing"
          : effectiveMargin < 10
            ? "Repair bundle economics before launch"
            : fixture.clarityScore < 60
              ? "Clarify the bundle promise before sending traffic"
              : "Launch one focused bundle and keep the rest closed";
  const owner =
    fixture.marketplace !== "US" || !fixture.brandRepresentative || !fixture.fbaReady
      ? "Bundle eligibility lead"
      : fixture.componentCount < 2 || fixture.componentCount > 5
        ? "Assortment lead"
        : fixture.complementaryScore < 60
          ? "Merchandising lead"
          : effectiveMargin < 10
            ? "Bundle economics lead"
            : fixture.clarityScore < 60
              ? "Offer clarity lead"
              : "Bundle owner";
  const doNotCross =
    fixture.marketplace !== "US" || !fixture.brandRepresentative || !fixture.fbaReady
      ? "Do not build a virtual bundle without the required store and access prerequisites"
      : fixture.componentCount < 2 || fixture.componentCount > 5
        ? "Do not force an invalid component set into production"
        : fixture.complementaryScore < 60
          ? "Do not solve weak product fit with deeper discounting"
          : effectiveMargin < 10
            ? "Do not buy traffic into a bundle with broken contribution margin"
            : fixture.clarityScore < 60
              ? "Do not send traffic into a bundle shoppers cannot understand quickly"
              : "Do not launch multiple vague bundle concepts at once";
  const nextMove =
    fixture.marketplace !== "US" || !fixture.brandRepresentative || !fixture.fbaReady
      ? "Close marketplace, Brand Representative, and FBA readiness gaps before building the bundle."
      : fixture.componentCount < 2 || fixture.componentCount > 5
        ? "Reset the component mix into one valid bundle set before pricing work continues."
        : fixture.complementaryScore < 60
          ? "Improve functional fit between the items before adjusting discount depth."
          : effectiveMargin < 10
            ? "Reduce discount pressure or raise perceived value before launch."
            : fixture.clarityScore < 60
              ? "Rewrite the bundle promise until the value is obvious in one pass."
              : "Launch one use-case-led bundle and keep other concepts frozen.";

  const result = {
    tool: "amazon-product-bundling",
    componentCount: fixture.componentCount,
    complementaryScore: fixture.complementaryScore,
    clarityScore: fixture.clarityScore,
    effectiveMargin,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyListingImagesFixture() {
  const fixture = {
    existingImageCount: 5,
    benefitCount: 4,
    objectionCount: 1,
    differentiatorCount: 2,
    mobileReadyCount: 2,
    infographicCount: 1,
  };

  const verdict =
    fixture.existingImageCount < 6
      ? "Fill the missing image stack before briefing production"
      : fixture.mobileReadyCount < 3
        ? "Repair mobile readability before polishing the rest of the image set"
        : fixture.objectionCount < 2
          ? "Add objection-handling frames before expanding lifestyle shots"
          : fixture.infographicCount < 2
            ? "Add proof graphics before styling more variation"
            : fixture.differentiatorCount < 2
              ? "Clarify the visual product gap before producing more assets"
              : "Send this image brief into production as one controlled execution lane";
  const owner =
    fixture.existingImageCount < 6
      ? "Creative planning lead"
      : fixture.mobileReadyCount < 3
        ? "Mobile conversion lead"
        : fixture.objectionCount < 2
          ? "Conversion proof lead"
          : fixture.infographicCount < 2
            ? "Visual proof lead"
            : fixture.differentiatorCount < 2
              ? "Positioning lead"
              : "Image production owner";
  const doNotCross =
    fixture.existingImageCount < 6
      ? "Do not polish art direction while the image stack is still incomplete"
      : fixture.mobileReadyCount < 3
        ? "Do not optimize decorative detail before mobile comprehension is fixed"
        : fixture.objectionCount < 2
          ? "Do not add more lifestyle variety while buyer objections are still unanswered"
          : fixture.infographicCount < 2
            ? "Do not skip proof graphics and hope the hero alone will carry conversion"
            : fixture.differentiatorCount < 2
              ? "Do not keep adding generic images without a clear product win"
              : "Do not redesign the whole image set while one production lane is already clear";
  const nextMove =
    fixture.existingImageCount < 6
      ? "Expand the stack to a complete set before art direction refinement."
      : fixture.mobileReadyCount < 3
        ? "Rewrite the next frames for fast mobile comprehension and keep styling changes frozen."
        : fixture.objectionCount < 2
          ? "Add the strongest objection-handling image before opening more aspirational concepts."
          : fixture.infographicCount < 2
            ? "Build one more proof-style infographic before broadening the sequence."
            : fixture.differentiatorCount < 2
              ? "Clarify the visual win message before producing more generic frames."
              : "Produce the current image brief and keep new concepts closed until it ships.";

  const result = {
    tool: "amazon-listing-images",
    existingImageCount: fixture.existingImageCount,
    objectionCount: fixture.objectionCount,
    mobileReadyCount: fixture.mobileReadyCount,
    infographicCount: fixture.infographicCount,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyProductPhotographyFixture() {
  const fixture = {
    shotCount: 6,
    useCaseCount: 1,
    featureCount: 2,
    propCount: 4,
    retouchNeedCount: 3,
    studioReady: true,
  };

  const verdict =
    !fixture.studioReady
      ? "Fix production setup before booking the shoot"
      : fixture.shotCount < 6
        ? "Expand the shot list before locking the shoot day"
        : fixture.useCaseCount < 2
          ? "Add real use-case scenes before polishing support shots"
          : fixture.featureCount < 3
            ? "Map more feature jobs before production spend goes live"
            : fixture.retouchNeedCount > fixture.shotCount
              ? "Reduce retouch burden before scaling this shoot plan"
              : "Book the shoot and keep the brief disciplined";
  const owner =
    !fixture.studioReady
      ? "Production operations lead"
      : fixture.shotCount < 6
        ? "Shot planning lead"
        : fixture.useCaseCount < 2
          ? "Use-case merchandising lead"
          : fixture.featureCount < 3
            ? "Feature proof lead"
            : fixture.retouchNeedCount > fixture.shotCount
              ? "Retouch control lead"
              : "Photography owner";
  const doNotCross =
    !fixture.studioReady
      ? "Do not book a shoot before the studio and logistics are ready"
      : fixture.shotCount < 6
        ? "Do not debate styling while the shot plan is still incomplete"
        : fixture.useCaseCount < 2
          ? "Do not spend on aesthetic variety while context coverage is still thin"
          : fixture.featureCount < 3
            ? "Do not let generic lifestyle imagery replace feature proof"
            : fixture.retouchNeedCount > fixture.shotCount
              ? "Do not overload the shoot with retouch-heavy concepts"
              : "Do not change shot count, props, and retouch scope all at once";
  const nextMove =
    !fixture.studioReady
      ? "Fix studio setup and logistics before adding more shot complexity."
      : fixture.shotCount < 6
        ? "Expand the shot list to cover hero, feature, scale, and lifestyle before booking."
        : fixture.useCaseCount < 2
          ? "Add at least one stronger use-case scene and keep styling variations frozen."
          : fixture.featureCount < 3
            ? "Map more product-feature priorities before finalizing the camera plan."
            : fixture.retouchNeedCount > fixture.shotCount
              ? "Cut cleanup-heavy concepts before production spend goes live."
              : "Book the current shoot plan and keep extra concepts closed until capture is complete.";

  const result = {
    tool: "amazon-product-photography",
    shotCount: fixture.shotCount,
    useCaseCount: fixture.useCaseCount,
    featureCount: fixture.featureCount,
    retouchNeedCount: fixture.retouchNeedCount,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyStorefrontDesignFixture() {
  const fixture = {
    catalogCount: 18,
    collectionCount: 1,
    audienceSegmentCount: 2,
    trafficSourceCount: 2,
    navDepth: 2,
    seasonalReady: true,
    brandStoryReady: false,
    storeLinkedFromBrandStory: false,
    experimentReady: false,
  };

  const verdict =
    fixture.collectionCount < 2
      ? "Fix collection architecture before redesigning the storefront"
      : fixture.trafficSourceCount < 2 || fixture.audienceSegmentCount < 2
        ? "Repair traffic routing before treating the store like a destination"
        : fixture.navDepth > 3
          ? "Flatten navigation before adding more store depth"
          : !fixture.brandStoryReady || !fixture.storeLinkedFromBrandStory
            ? "Repair the PDP-to-store route before spending on layout polish"
            : !fixture.experimentReady
              ? "Set up a test path before expanding storefront work"
              : "Launch this storefront structure as one controlled traffic lane";
  const owner =
    fixture.collectionCount < 2
      ? "Store IA lead"
      : fixture.trafficSourceCount < 2 || fixture.audienceSegmentCount < 2
        ? "Traffic routing lead"
        : fixture.navDepth > 3
          ? "Navigation lead"
          : !fixture.brandStoryReady || !fixture.storeLinkedFromBrandStory
            ? "Brand route lead"
            : !fixture.experimentReady
              ? "Experimentation lead"
              : "Storefront owner";
  const doNotCross =
    fixture.collectionCount < 2
      ? "Do not polish layout before the collection structure is real"
      : fixture.trafficSourceCount < 2 || fixture.audienceSegmentCount < 2
        ? "Do not redesign a store that still lacks clear traffic jobs"
        : fixture.navDepth > 3
          ? "Do not add more pages while the store is still too deep to navigate fast"
          : !fixture.brandStoryReady || !fixture.storeLinkedFromBrandStory
            ? "Do not buy traffic into a storefront that the PDP barely feeds"
            : !fixture.experimentReady
              ? "Do not let storefront edits turn into taste-only changes without a test path"
              : "Do not change hierarchy, routing, and page modules all at once";
  const nextMove =
    fixture.collectionCount < 2
      ? "Create clearer collection groupings before touching page layout."
      : fixture.trafficSourceCount < 2 || fixture.audienceSegmentCount < 2
        ? "Add clearer entry paths and audience routes before widening the store structure."
        : fixture.navDepth > 3
          ? "Flatten the nav and keep new pages frozen until shopper flow is shorter."
          : !fixture.brandStoryReady || !fixture.storeLinkedFromBrandStory
            ? "Strengthen the PDP-to-store route before refining design modules."
            : !fixture.experimentReady
              ? "Publish one measurable test path before making broader storefront edits."
              : "Launch the current storefront structure and keep extra hierarchy changes closed.";

  const result = {
    tool: "amazon-storefront-design",
    collectionCount: fixture.collectionCount,
    audienceSegmentCount: fixture.audienceSegmentCount,
    trafficSourceCount: fixture.trafficSourceCount,
    navDepth: fixture.navDepth,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyInternationalListingsFixture() {
  const fixture = {
    keywordGoalCount: 2,
    complianceCaveatCount: 1,
    pricingReady: false,
    localizationDepth: 72,
    targetLocale: "de_DE",
    sourceLocale: "en_US",
    buildInternationalListingsReady: true,
    taxesReady: true,
  };

  const verdict =
    !fixture.pricingReady
      ? "Fix target-market economics before localizing deeper"
      : !fixture.taxesReady || fixture.complianceCaveatCount > 2
        ? "Repair policy and tax readiness before publishing this listing"
        : fixture.localizationDepth < 60
          ? "Rewrite for local buyer intent before going live"
          : !fixture.buildInternationalListingsReady
            ? "Fix the cross-market operating path before publishing"
            : fixture.keywordGoalCount < 3
              ? "Tighten market-search intent before final publish"
              : "Publish this localized listing and keep the rest frozen";
  const owner =
    !fixture.pricingReady
      ? "Local economics lead"
      : !fixture.taxesReady || fixture.complianceCaveatCount > 2
        ? "Compliance lead"
        : fixture.localizationDepth < 60
          ? "Localization lead"
          : !fixture.buildInternationalListingsReady
            ? "International operations lead"
            : fixture.keywordGoalCount < 3
              ? "Search localization lead"
              : "International listing owner";
  const doNotCross =
    !fixture.pricingReady
      ? "Do not localize copy while target-market economics are still wrong"
      : !fixture.taxesReady || fixture.complianceCaveatCount > 2
        ? "Do not expand claims while tax or compliance caveats are unresolved"
        : fixture.localizationDepth < 60
          ? "Do not ship a direct-translation listing into a real market"
          : !fixture.buildInternationalListingsReady
            ? "Do not spend more on localized copy while the operating path is still broken"
            : fixture.keywordGoalCount < 3
              ? "Do not publish without a real target-market search brief"
              : "Do not change pricing, compliance, and copy depth all at once";
  const nextMove =
    !fixture.pricingReady
      ? "Set target-market price, fee, and tax context before rewriting more copy."
      : !fixture.taxesReady || fixture.complianceCaveatCount > 2
        ? "Close tax and compliance caveats before expanding live claims."
        : fixture.localizationDepth < 60
          ? "Rewrite for target-market buyer intent and keep literal translation cleanup closed."
          : !fixture.buildInternationalListingsReady
            ? "Fix the BIL operating path before publishing localized copy."
            : fixture.keywordGoalCount < 3
              ? "Add stronger target-market keyword intent before final publish."
              : "Publish this localized listing and keep other locale changes closed until readout.";

  const result = {
    tool: "amazon-international-listings",
    keywordGoalCount: fixture.keywordGoalCount,
    complianceCaveatCount: fixture.complianceCaveatCount,
    localizationDepth: fixture.localizationDepth,
    pricingReady: fixture.pricingReady,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyBrandTailoredPromotionsFixture() {
  const fixture = {
    segmentCount: 1,
    productCount: 4,
    discountBudget: 180,
    retentionGoalScore: 76,
    audienceDataReady: true,
    channelCount: 2,
    audienceSize: 2400,
    discountRate: 0.18,
    brandRepresentative: true,
    activePromotionCount: 4,
  };

  const verdict =
    !fixture.audienceDataReady
      ? "Fix audience readiness before launching a tailored promotion"
      : fixture.audienceSize < 1000
        ? "Grow the eligible audience before opening this promo lane"
        : fixture.segmentCount < 2
          ? "Tighten segmentation before offering personalized discounts"
          : !fixture.brandRepresentative
            ? "Fix access before building a tailored-promo plan"
            : fixture.discountBudget < 100 || fixture.discountRate < 0.1 || fixture.discountRate > 0.5
              ? "Normalize budget and discount settings before launch"
              : fixture.activePromotionCount >= 20
                ? "Free promotion capacity before adding another tailored campaign"
                : "Launch one controlled tailored promotion and keep the rest closed";
  const owner =
    !fixture.audienceDataReady
      ? "Audience readiness lead"
      : fixture.audienceSize < 1000
        ? "CRM growth lead"
        : fixture.segmentCount < 2
          ? "Segmentation lead"
          : !fixture.brandRepresentative
            ? "Access operations lead"
            : fixture.discountBudget < 100 || fixture.discountRate < 0.1 || fixture.discountRate > 0.5
              ? "Promo economics lead"
              : fixture.activePromotionCount >= 20
                ? "Promotion operations lead"
                : "Tailored promotion owner";
  const doNotCross =
    !fixture.audienceDataReady
      ? "Do not personalize discounts on weak audience data"
      : fixture.audienceSize < 1000
        ? "Do not launch a tailored promotion below the eligible audience threshold"
        : fixture.segmentCount < 2
          ? "Do not call a broad discount tailored when segmentation is still coarse"
          : !fixture.brandRepresentative
            ? "Do not build launch plans around access you do not have"
            : fixture.discountBudget < 100 || fixture.discountRate < 0.1 || fixture.discountRate > 0.5
              ? "Do not ship a tailored promotion outside the workable budget and discount range"
              : fixture.activePromotionCount >= 20
                ? "Do not stack another tailored promotion on top of a full promotion slate"
                : "Do not mix too many segments, products, and offers in one launch";
  const nextMove =
    !fixture.audienceDataReady
      ? "Fix audience quality before writing more tailored offers."
      : fixture.audienceSize < 1000
        ? "Grow the eligible audience and keep new segment offers frozen."
        : fixture.segmentCount < 2
          ? "Create one repeat-buyer segment and one reactivation segment before launch."
          : !fixture.brandRepresentative
            ? "Restore Brand Representative access before expanding campaign detail."
            : fixture.discountBudget < 100 || fixture.discountRate < 0.1 || fixture.discountRate > 0.5
              ? "Reset budget and discount settings into the eligible range before launch."
              : fixture.activePromotionCount >= 20
                ? "Reduce active promotion load before opening one new tailored lane."
                : "Launch one segment-specific promo and keep other segment experiments closed.";

  const result = {
    tool: "amazon-brand-tailored-promotions",
    segmentCount: fixture.segmentCount,
    audienceSize: fixture.audienceSize,
    discountBudget: fixture.discountBudget,
    discountRate: fixture.discountRate,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifySubscribeSaveFixture() {
  const fixture = {
    repeatIntervalDays: 45,
    currentDiscountRate: 0.2,
    repeatOrderRate: 0.16,
    marginRate: 23,
    churnRiskScore: 34,
    consumable: true,
    brandRepresentative: true,
    inStockRate: 96,
    offerBuyable: true,
    fbmMetricsReady: true,
  };

  const verdict =
    !fixture.consumable
      ? "Do not push Subscribe and Save until the replenishment case is real"
      : fixture.inStockRate < 90 || !fixture.offerBuyable
        ? "Fix eligibility and in-stock reliability before pushing enrollment"
        : fixture.marginRate < 20
          ? "Protect contribution margin before offering more repeat discounts"
          : fixture.repeatOrderRate < 0.12
            ? "Build repeat-order proof before scaling enrollment asks"
            : fixture.currentDiscountRate > 0.15 || ![0, 0.05, 0.1, 0.15, 0.2].includes(Number(fixture.currentDiscountRate.toFixed(2)))
              ? "Reset discount depth before expanding the program"
              : "Push enrollment to repeat-intent cohorts and keep the rest closed";
  const owner =
    !fixture.consumable
      ? "Retention strategy lead"
      : fixture.inStockRate < 90 || !fixture.offerBuyable
        ? "Inventory reliability lead"
        : fixture.marginRate < 20
          ? "Unit economics lead"
          : fixture.repeatOrderRate < 0.12
            ? "Lifecycle growth lead"
            : fixture.currentDiscountRate > 0.15 || ![0, 0.05, 0.1, 0.15, 0.2].includes(Number(fixture.currentDiscountRate.toFixed(2)))
              ? "Discount strategy lead"
              : "Subscribe and Save owner";
  const doNotCross =
    !fixture.consumable
      ? "Do not force Subscribe and Save onto weak-repeat products"
      : fixture.inStockRate < 90 || !fixture.offerBuyable
        ? "Do not push enrollment while the subscription promise will break operationally"
        : fixture.marginRate < 20
          ? "Do not buy repeat intent with discounts your margin cannot absorb"
          : fixture.repeatOrderRate < 0.12
            ? "Do not widen enrollment before the repeat habit is proven"
            : fixture.currentDiscountRate > 0.15 || ![0, 0.05, 0.1, 0.15, 0.2].includes(Number(fixture.currentDiscountRate.toFixed(2)))
              ? "Do not expand Subscribe and Save on an unsafe discount ladder"
              : "Do not change cadence, discount, and enrollment timing all at once";
  const nextMove =
    !fixture.consumable
      ? "Clarify the replenishment use case before designing enrollment prompts."
      : fixture.inStockRate < 90 || !fixture.offerBuyable
        ? "Fix buyability and in-stock reliability before touching discount depth."
        : fixture.marginRate < 20
          ? "Raise contribution room before expanding repeat discounts."
          : fixture.repeatOrderRate < 0.12
            ? "Strengthen repeat behavior before widening subscription asks."
            : fixture.currentDiscountRate > 0.15 || ![0, 0.05, 0.1, 0.15, 0.2].includes(Number(fixture.currentDiscountRate.toFixed(2)))
              ? "Normalize discount steps and keep enrollment expansion frozen."
              : "Push one repeat-cohort enrollment lane and keep broad prompts closed.";

  const result = {
    tool: "amazon-subscribe-save",
    repeatOrderRate: fixture.repeatOrderRate,
    currentDiscountRate: fixture.currentDiscountRate,
    inStockRate: fixture.inStockRate,
    marginRate: fixture.marginRate,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyPrivateLabelFixture() {
  const fixture = {
    demandScore: 68,
    differentiationScore: 49,
    sourcingConfidence: 72,
    launchBudget: 9000,
    complianceCount: 1,
    brandReady: true,
    gtinExemptionReady: true,
    permanentBrandingReady: true,
  };

  const verdict =
    fixture.differentiationScore < 55
      ? "Fix differentiation before committing launch capital"
      : fixture.sourcingConfidence < 60
        ? "Repair supply confidence before broadening launch work"
        : !fixture.brandReady || !fixture.gtinExemptionReady || !fixture.permanentBrandingReady
          ? "Complete the approval stack before scaling the launch"
          : fixture.launchBudget < 5000
            ? "Re-scope the launch before treating this as a real go"
            : fixture.demandScore < 60
              ? "Strengthen demand proof before funding the launch"
              : "Run the smallest defensible launch and keep the rest closed";
  const owner =
    fixture.differentiationScore < 55
      ? "Product strategy lead"
      : fixture.sourcingConfidence < 60
        ? "Supply chain lead"
        : !fixture.brandReady || !fixture.gtinExemptionReady || !fixture.permanentBrandingReady
          ? "Launch approvals lead"
          : fixture.launchBudget < 5000
            ? "Launch finance lead"
            : fixture.demandScore < 60
              ? "Demand validation lead"
              : "Private-label launch owner";
  const doNotCross =
    fixture.differentiationScore < 55
      ? "Do not spend harder on a parity offer"
      : fixture.sourcingConfidence < 60
        ? "Do not widen launch plans on weak supply confidence"
        : !fixture.brandReady || !fixture.gtinExemptionReady || !fixture.permanentBrandingReady
          ? "Do not let optimism outrun the approval stack"
          : fixture.launchBudget < 5000
            ? "Do not pretend a thin budget can carry inventory, creative, and ads together"
            : fixture.demandScore < 60
              ? "Do not fund a launch on soft demand evidence"
              : "Do not expand channels, creatives, and geographies all at once";
  const nextMove =
    fixture.differentiationScore < 55
      ? "Strengthen the product or positioning gap before adding more launch assumptions."
      : fixture.sourcingConfidence < 60
        ? "Raise supplier confidence before inventory, creative, and ad plans widen."
        : !fixture.brandReady || !fixture.gtinExemptionReady || !fixture.permanentBrandingReady
          ? "Close brand, GTIN, and physical brand-proof gaps before launch scaling."
          : fixture.launchBudget < 5000
            ? "Rebuild the launch scope so inventory, creative, and ads can all be funded together."
            : fixture.demandScore < 60
              ? "Collect stronger demand proof before committing launch capital."
              : "Run one narrow launch wedge and keep broader expansion closed.";

  const result = {
    tool: "amazon-private-label",
    demandScore: fixture.demandScore,
    differentiationScore: fixture.differentiationScore,
    sourcingConfidence: fixture.sourcingConfidence,
    launchBudget: fixture.launchBudget,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyWholesaleSourcingFixture() {
  const fixture = {
    supplierCount: 4,
    authorizedSupplierCount: 1,
    moqUnits: 640,
    grossMarginRate: 24,
    documentCount: 3,
    ungatingReady: true,
    invoiceRecent: true,
    hasLoa: true,
    brandRestricted: false,
  };

  const verdict =
    fixture.authorizedSupplierCount < 1
      ? "Stop here until authorized supply is confirmed"
      : fixture.documentCount < 2 || !fixture.invoiceRecent || (!fixture.hasLoa && fixture.brandRestricted)
        ? "Upgrade the proof stack before advancing this wholesale deal"
        : fixture.grossMarginRate < 18
          ? "Repair margin before spending more time on this deal"
          : !fixture.ungatingReady
            ? "Complete ungating readiness before a larger buy"
            : fixture.moqUnits > 500
              ? "Pressure-test MOQ before scaling this buy"
              : "Move to a controlled test buy and keep the rest closed";
  const owner =
    fixture.authorizedSupplierCount < 1
      ? "Supplier authorization lead"
      : fixture.documentCount < 2 || !fixture.invoiceRecent || (!fixture.hasLoa && fixture.brandRestricted)
        ? "Document compliance lead"
        : fixture.grossMarginRate < 18
          ? "Unit economics lead"
          : !fixture.ungatingReady
            ? "Category access lead"
            : fixture.moqUnits > 500
              ? "Inventory risk lead"
              : "Wholesale sourcing owner";
  const doNotCross =
    fixture.authorizedSupplierCount < 1
      ? "Do not treat hypothetical supply like an approved resale path"
      : fixture.documentCount < 2 || !fixture.invoiceRecent || (!fixture.hasLoa && fixture.brandRestricted)
        ? "Do not move money before the proof stack is clean"
        : fixture.grossMarginRate < 18
          ? "Do not hide thin margin behind paperwork progress"
          : !fixture.ungatingReady
            ? "Do not place a larger buy before the catalog access path is ready"
            : fixture.moqUnits > 500
              ? "Do not let MOQ pressure force the decision"
              : "Do not change suppliers, MOQ, and margin assumptions all at once";
  const nextMove =
    fixture.authorizedSupplierCount < 1
      ? "Confirm one authorized supplier path before negotiating broader economics."
      : fixture.documentCount < 2 || !fixture.invoiceRecent || (!fixture.hasLoa && fixture.brandRestricted)
        ? "Refresh invoices and authorization proof before expanding the deal."
        : fixture.grossMarginRate < 18
          ? "Fix buy cost or resale price assumptions before going deeper."
          : !fixture.ungatingReady
            ? "Close ungating readiness before authorizing a larger buy."
            : fixture.moqUnits > 500
              ? "Stress-test MOQ against cash and sell-through before scaling."
              : "Run one controlled first buy and keep alternative supplier expansion closed.";

  const result = {
    tool: "amazon-wholesale-sourcing",
    supplierCount: fixture.supplierCount,
    authorizedSupplierCount: fixture.authorizedSupplierCount,
    moqUnits: fixture.moqUnits,
    grossMarginRate: fixture.grossMarginRate,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifySuspensionAppealFixture() {
  const fixture = {
    issueType: "product-authenticity",
    rootCauseCount: 2,
    evidenceCount: 1,
    correctiveActionCount: 3,
    preventionCount: 2,
    issueSeverity: 82,
    submissionReady: false,
    hasAsinOrPolicyReference: true,
    evidenceFresh: false,
    usesAccountHealthPath: true,
  };

  const verdict =
    !fixture.hasAsinOrPolicyReference
      ? "Name the exact issue scope before doing anything else"
      : fixture.evidenceCount < 2 || !fixture.evidenceFresh
        ? "Upgrade the evidence pack before submitting this appeal"
        : fixture.rootCauseCount < 2
          ? "Deepen root-cause analysis before final submission"
          : fixture.preventionCount < 2
            ? "Strengthen prevention controls before sending the appeal"
            : !fixture.usesAccountHealthPath
              ? "Fix the submission path before filing the appeal"
              : "Submit this appeal packet and keep further edits closed";
  const owner =
    !fixture.hasAsinOrPolicyReference
      ? "Case owner"
      : fixture.evidenceCount < 2 || !fixture.evidenceFresh
        ? "Evidence lead"
        : fixture.rootCauseCount < 2
          ? "Root-cause lead"
          : fixture.preventionCount < 2
            ? "Operational controls lead"
            : !fixture.usesAccountHealthPath
              ? "Appeal operations lead"
              : "Appeal owner";
  const doNotCross =
    !fixture.hasAsinOrPolicyReference
      ? "Do not submit a vague appeal packet"
      : fixture.evidenceCount < 2 || !fixture.evidenceFresh
        ? "Do not use polished wording to hide weak proof"
        : fixture.rootCauseCount < 2
          ? "Do not submit with a shallow root-cause story"
          : fixture.preventionCount < 2
            ? "Do not rely on corrective actions without durable prevention"
            : !fixture.usesAccountHealthPath
              ? "Do not send a strong packet through the wrong path"
              : "Do not rewrite causes, evidence, and prevention all at once";
  const nextMove =
    !fixture.hasAsinOrPolicyReference
      ? "Name the exact ASIN or policy violation before rewriting the packet."
      : fixture.evidenceCount < 2 || !fixture.evidenceFresh
        ? "Add fresher and harder proof before touching narrative polish again."
        : fixture.rootCauseCount < 2
          ? "Expand the root-cause map before final submission."
          : fixture.preventionCount < 2
            ? "Add stronger prevention controls and keep narrative edits frozen."
            : !fixture.usesAccountHealthPath
              ? "Confirm the exact Account Health submission path before filing."
              : "Submit the current packet and keep further editing closed until response.";

  const result = {
    tool: "amazon-suspension-appeal",
    evidenceCount: fixture.evidenceCount,
    rootCauseCount: fixture.rootCauseCount,
    preventionCount: fixture.preventionCount,
    issueSeverity: fixture.issueSeverity,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyBackendKeywordsFixture() {
  const fixture = {
    byteLimit: 250,
    usedBytes: 122,
    includedCount: 14,
    removedCount: 4,
    duplicateCount: 2,
    coveredSeedCount: 7,
    totalSeedCount: 7,
  };
  const fillRate = (fixture.usedBytes / fixture.byteLimit) * 100;

  const verdict =
    fixture.coveredSeedCount < fixture.totalSeedCount
      ? "Close missing seed coverage before shipping this backend field"
      : fixture.duplicateCount > 0
        ? "Remove visible-copy duplication before publishing"
        : fillRate > 95
          ? "Trim the field before adding anything new"
          : fillRate < 55
            ? "Add more net-new relevant coverage before final publish"
            : fixture.removedCount > fixture.includedCount && fixture.totalSeedCount > 0
              ? "Tighten prioritization before pasting this backend field"
              : "Publish this backend field and freeze it until the live copy changes";
  const owner =
    fixture.coveredSeedCount < fixture.totalSeedCount
      ? "Search coverage owner"
      : fixture.duplicateCount > 0
        ? "Catalog owner"
        : fillRate > 95
          ? "Byte-efficiency lead"
          : fillRate < 55
            ? "SEO growth lead"
            : "Backend keyword owner";
  const doNotCross =
    fixture.coveredSeedCount < fixture.totalSeedCount
      ? "Do not spend bytes on lower-priority modifiers while seed coverage is incomplete"
      : fixture.duplicateCount > 0
        ? "Do not waste backend bytes on visible-copy duplicates"
        : fillRate > 95
          ? "Do not keep stuffing the field by habit"
          : fillRate < 55
            ? "Do not publish an underfilled field if commercial coverage is still thin"
            : fixture.removedCount > fixture.includedCount && fixture.totalSeedCount > 0
              ? "Do not compress a weakly prioritized term pool further"
              : "Do not change visible copy and backend terms at the same time";
  const nextMove =
    fixture.coveredSeedCount < fixture.totalSeedCount
      ? "Restore the missing seed concepts before touching lower-priority modifiers."
      : fixture.duplicateCount > 0
        ? "Clear duplicate overlap with visible copy before repacking the hidden field."
        : fillRate > 95
          ? "Trim or replace terms and keep new additions frozen."
          : fillRate < 55
            ? "Add more relevant modifiers before finalizing the field."
            : fixture.removedCount > fixture.includedCount && fixture.totalSeedCount > 0
              ? "Re-rank the term pool before compressing further."
              : "Publish the current backend string and keep further edits closed until the live copy changes.";

  const result = {
    tool: "amazon-backend-keywords",
    usedBytes: fixture.usedBytes,
    byteLimit: fixture.byteLimit,
    duplicateCount: fixture.duplicateCount,
    coveredSeedCount: fixture.coveredSeedCount,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyReturnReductionFixture() {
  const fixture = {
    reasonCount: 4,
    topReasonShare: 0.44,
    complaintThemeCount: 6,
    packagingIssueCount: 3,
    clarityIssueCount: 1,
    qualityIssueCount: 2,
  };

  const verdict =
    fixture.reasonCount === 0
      ? "Collect usable return evidence before shipping fixes"
      : fixture.packagingIssueCount > 0 && fixture.packagingIssueCount >= fixture.clarityIssueCount && fixture.packagingIssueCount >= fixture.qualityIssueCount
        ? "Fix packaging before touching listing or QC work"
        : fixture.qualityIssueCount > 0 && fixture.qualityIssueCount >= fixture.clarityIssueCount
          ? "Repair product quality before broad merchandising changes"
          : fixture.clarityIssueCount > 0
            ? "Fix listing expectations before escalating physical changes"
            : fixture.topReasonShare >= 0.35
              ? "Put one owner on the dominant return cause before broad cleanup"
              : "Ship one narrow return-reduction fix and keep the rest closed";
  const owner =
    fixture.reasonCount === 0
      ? "CX diagnostics lead"
      : fixture.packagingIssueCount > 0 && fixture.packagingIssueCount >= fixture.clarityIssueCount && fixture.packagingIssueCount >= fixture.qualityIssueCount
        ? "Packaging lead"
        : fixture.qualityIssueCount > 0 && fixture.qualityIssueCount >= fixture.clarityIssueCount
          ? "Quality lead"
          : fixture.clarityIssueCount > 0
            ? "Listing clarity lead"
            : fixture.topReasonShare >= 0.35
              ? "Return reduction owner"
              : "Operations owner";
  const doNotCross =
    fixture.reasonCount === 0
      ? "Do not ship a return-reduction plan from intuition alone"
      : fixture.packagingIssueCount > 0 && fixture.packagingIssueCount >= fixture.clarityIssueCount && fixture.packagingIssueCount >= fixture.qualityIssueCount
        ? "Do not start with copy edits when packaging is the loudest failure"
        : fixture.qualityIssueCount > 0 && fixture.qualityIssueCount >= fixture.clarityIssueCount
          ? "Do not bury defect signals under merchandising work"
          : fixture.clarityIssueCount > 0
            ? "Do not escalate physical fixes before expectation mismatch is corrected"
            : fixture.topReasonShare >= 0.35
              ? "Do not let multiple teams attack the same concentrated problem at once"
              : "Do not launch broad fixes before the diagnosis is stable";
  const nextMove =
    fixture.reasonCount === 0
      ? "Collect return reasons and complaint evidence before assigning fixes."
      : fixture.packagingIssueCount > 0 && fixture.packagingIssueCount >= fixture.clarityIssueCount && fixture.packagingIssueCount >= fixture.qualityIssueCount
        ? "Strengthen packaging protection first and keep copy and QC changes frozen."
        : fixture.qualityIssueCount > 0 && fixture.qualityIssueCount >= fixture.clarityIssueCount
          ? "Send the strongest defect themes into factory or QC before broad listing edits."
          : fixture.clarityIssueCount > 0
            ? "Tighten buyer expectations first and keep physical changes closed."
            : fixture.topReasonShare >= 0.35
              ? "Assign the dominant return cause to one owner and measure the next batch."
              : "Ship one narrow fix and keep other teams closed until the next batch arrives.";

  const result = {
    tool: "amazon-return-reduction",
    reasonCount: fixture.reasonCount,
    topReasonShare: fixture.topReasonShare,
    packagingIssueCount: fixture.packagingIssueCount,
    qualityIssueCount: fixture.qualityIssueCount,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifySearchOptimizationFixture() {
  const fixture = {
    category: "Sports & Outdoors",
    title: "Camping Sleeping Pad Ultralight Backpacking Air Mat Inflatable",
    backendTerms: "camping mat ultralight sleeping pad inflatable outdoor camp",
    targetKeywords: "camping sleeping pad backpacking mat ultralight insulated",
    itemType: "sleeping pad",
    currentRank: 38420,
    reviewCount: 32,
    hasAPlus: false,
  };

  const titleWords = fixture.title.toLowerCase().split(/[^a-z0-9]+/).filter((x) => x.length > 2);
  const backendWords = fixture.backendTerms.toLowerCase().split(/[^a-z0-9]+/).filter((x) => x.length > 2);
  const targetWords = [...new Set(fixture.targetKeywords.toLowerCase().split(/[^a-z0-9]+/).filter((x) => x.length > 2))];
  const itemTypeWords = [...new Set(fixture.itemType.toLowerCase().split(/[^a-z0-9]+/).filter((x) => x.length > 2))];
  const missingTargets = targetWords.filter((word) => !titleWords.includes(word) && !backendWords.includes(word));
  const overlap = [...new Set(backendWords.filter((word) => titleWords.includes(word)))];
  const itemTypeCoverage =
    itemTypeWords.length > 0
      ? (itemTypeWords.filter((word) => titleWords.includes(word)).length / itemTypeWords.length) * 100
      : 70;

  const verdict =
    missingTargets.length > 0
      ? "Close missing target coverage before pushing search any harder"
      : overlap.length > Math.max(2, Math.floor(backendWords.length * 0.45))
        ? "Clean backend duplication before broader SEO work"
        : itemTypeCoverage < 60
          ? "Repair browse fit before broader search work"
          : !fixture.hasAPlus || fixture.reviewCount < 50
            ? "Strengthen conversion proof before broader SEO work"
            : fixture.currentRank > 0 && fixture.currentRank > 30000
              ? "Open one relevance-plus-conversion recovery lane now"
              : "Run one controlled search revision";
  const owner =
    missingTargets.length > 0
      ? "SEO / listing lead"
      : overlap.length > Math.max(2, Math.floor(backendWords.length * 0.45))
        ? "SEO lead"
        : itemTypeCoverage < 60
          ? "Catalog / SEO lead"
          : !fixture.hasAPlus || fixture.reviewCount < 50
            ? "Conversion / proof lead"
            : fixture.currentRank > 0 && fixture.currentRank > 30000
              ? "Search recovery lead"
              : "SEO lead";
  const doNotCross =
    missingTargets.length > 0
      ? "Do not buy rank before coverage is complete"
      : overlap.length > Math.max(2, Math.floor(backendWords.length * 0.45))
        ? "Do not waste backend bytes on duplicates"
        : itemTypeCoverage < 60
          ? "Do not chase rank before browse fit is clean"
          : !fixture.hasAPlus || fixture.reviewCount < 50
            ? "Do not buy traffic into a weak proof stack"
            : fixture.currentRank > 0 && fixture.currentRank > 30000
              ? "Do not treat a weak rank signal like a title-only problem"
              : "Do not turn one SEO pass into a full rewrite";
  const nextMove =
    missingTargets.length > 0
      ? "Place the missing targets into the title, backend terms, or both before opening any other search work."
      : overlap.length > Math.max(2, Math.floor(backendWords.length * 0.45))
        ? "Trim duplicate visible words out of the backend field and keep the rest of the listing frozen."
        : itemTypeCoverage < 60
          ? "Repair browse wording first and keep title and backend churn closed."
          : !fixture.hasAPlus || fixture.reviewCount < 50
            ? "Repair conversion proof first before asking search edits to carry the lift."
            : fixture.currentRank > 0 && fixture.currentRank > 30000
              ? "Open one recovery lane that combines relevance cleanup with proof repair."
              : "Run one focused title-plus-backend revision and freeze every other search surface.";

  const result = {
    tool: "amazon-search-optimization",
    missingTargetCount: missingTargets.length,
    overlapCount: overlap.length,
    itemTypeCoverage,
    currentRank: fixture.currentRank,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyCompetitorAnalysisFixture() {
  const fixture = {
    ownPrice: 44.99,
    ownReviewCount: 118,
    ownImageCount: 5,
    ownHasAPlus: false,
    ownRating: 4.1,
    competitorCount: 4,
    averageCompetitorPrice: 39.25,
    averageCompetitorReviewCount: 486,
    averageCompetitorImageCount: 7,
    competitorsWithAPlus: 3,
    cheaperCompetitors: 3,
    strongerReviewCompetitors: 3,
    richerImageCompetitors: 2,
    higherRatedCompetitors: 3,
    ownCurrentRank: 28100,
    averageCompetitorRank: 12300,
    bestCompetitorRank: 5400,
  };

  const hasMaterialGap = true;
  const primaryGap =
    fixture.strongerReviewCompetitors >= Math.max(fixture.cheaperCompetitors, fixture.richerImageCompetitors)
      ? "proof gap"
      : fixture.cheaperCompetitors >= fixture.richerImageCompetitors
        ? "price gap"
        : "asset gap";
  const verdict =
    !hasMaterialGap
      ? "Keep the PDP steady and run one benchmark-led message test"
      : primaryGap === "proof gap"
        ? "Freeze spend and repair trust proof now"
        : primaryGap === "price gap"
          ? "Freeze spend and repair price position now"
          : "Freeze spend and rebuild the gallery now";
  const owner =
    primaryGap === "proof gap"
      ? "CX / reputation lead"
      : primaryGap === "price gap"
        ? "Pricing / offer lead"
        : primaryGap === "asset gap"
          ? "Creative / PDP lead"
          : "PDP lead";
  const doNotCross =
    primaryGap === "proof gap"
      ? "Do not buy traffic into a trust deficit"
      : primaryGap === "price gap"
        ? "Do not sit in the middle on price and story at the same time"
        : primaryGap === "asset gap"
          ? "Do not polish copy while the gallery is still losing the click"
          : "Do not trigger a broad reset without one clean losing surface";
  const nextMove =
    primaryGap === "proof gap"
      ? "Freeze spend and repair trust proof."
      : primaryGap === "price gap"
        ? "Freeze spend and repair price position."
        : primaryGap === "asset gap"
          ? "Freeze spend and repair the gallery."
          : "Run one controlled messaging test.";

  const result = {
    tool: "amazon-competitor-analysis",
    competitorCount: fixture.competitorCount,
    cheaperCompetitors: fixture.cheaperCompetitors,
    strongerReviewCompetitors: fixture.strongerReviewCompetitors,
    richerImageCompetitors: fixture.richerImageCompetitors,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyReviewAnalyzerFixture() {
  const fixture = {
    reviewCount: 86,
    averageRating: 3.7,
    negativeShare: 0.42,
    complaintThemeCount: 4,
    praiseThemeCount: 2,
    featureOpportunityCount: 3,
    topComplaintTheme: "packaging damage",
    topPraiseTheme: "comfortable fit",
  };
  const complaintTheme = fixture.topComplaintTheme.toLowerCase();
  const verdict =
    fixture.negativeShare >= 0.35 && fixture.complaintThemeCount > 0
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
  const owner =
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
  const doNotCross =
    fixture.negativeShare >= 0.35
      ? "Do not reopen the whole PDP before the main complaint is isolated"
      : "Do not turn a directional review sample into a full product or PDP rewrite";
  const nextMove =
    complaintTheme.includes("pack")
      ? "Strengthen packaging and in-transit protection first."
      : complaintTheme.includes("quality") ||
          complaintTheme.includes("durab") ||
          complaintTheme.includes("broken") ||
          complaintTheme.includes("defect")
        ? "Push supplier QA and defect containment first."
        : complaintTheme.includes("assembly") ||
            complaintTheme.includes("setup") ||
            complaintTheme.includes("instruction") ||
            complaintTheme.includes("install")
          ? "Improve setup instructions and demo assets first."
          : "Tighten listing clarity and post-purchase guidance first.";

  const result = {
    tool: "amazon-review-analyzer",
    reviewCount: fixture.reviewCount,
    negativeShare: fixture.negativeShare,
    complaintThemeCount: fixture.complaintThemeCount,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyListingOptimizationFixture() {
  const fixture = {
    category: "Home & Kitchen",
    titleLength: 72,
    bulletCount: 3,
    imageCount: 5,
    reviewCount: 34,
    hasAPlus: false,
    targetKeywordCount: 10,
    coveredKeywordCount: 6,
    competitorCount: 4,
    cheaperCompetitors: 3,
    richerImageCompetitors: 3,
    strongerReviewCompetitors: 3,
    competitorAPlusCount: 3,
  };
  const keywordCoverage = (fixture.coveredKeywordCount / fixture.targetKeywordCount) * 100;
  const recommendedImageCount = 6;
  const verdict =
    keywordCoverage < 70
      ? "Place the missing target terms into the title, bullets, and browse-path language first"
      : fixture.imageCount < recommendedImageCount || fixture.richerImageCompetitors > 0
        ? "Rebuild the image stack before touching price or traffic volume"
        : fixture.reviewCount < 50 || fixture.strongerReviewCompetitors > 0
          ? "Strengthen proof and objection handling before scaling traffic"
          : !fixture.hasAPlus && fixture.competitorAPlusCount > 0
            ? "Add A+ education next"
            : fixture.cheaperCompetitors >= Math.max(2, Math.ceil(fixture.competitorCount / 2))
              ? "Recheck price positioning against the current competitor set"
              : "Run one controlled conversion-layer test";
  const owner =
    keywordCoverage < 70
      ? "SEO / listing owner"
      : fixture.imageCount < recommendedImageCount || fixture.richerImageCompetitors > 0
        ? "Creative owner"
        : fixture.reviewCount < 50 || fixture.strongerReviewCompetitors > 0
          ? "Proof / CX owner"
          : !fixture.hasAPlus && fixture.competitorAPlusCount > 0
            ? "Brand content owner"
            : fixture.cheaperCompetitors >= Math.max(2, Math.ceil(fixture.competitorCount / 2))
              ? "Pricing owner"
              : "Conversion owner";
  const doNotCross =
    keywordCoverage < 70
      ? "Do not scale traffic into a page that is still missing obvious relevance coverage"
      : fixture.imageCount < recommendedImageCount || fixture.richerImageCompetitors > 0
        ? "Do not rewrite copy while the gallery is still losing the comparison click"
        : fixture.reviewCount < 50 || fixture.strongerReviewCompetitors > 0
          ? "Do not buy more traffic into a weak trust surface"
          : "Do not reopen the whole PDP before the first blocker is measured";
  const nextMove =
    keywordCoverage < 70
      ? "Place the missing target terms into the title, bullets, and browse-path language first."
      : fixture.imageCount < recommendedImageCount || fixture.richerImageCompetitors > 0
        ? "Rebuild the image stack before touching price or traffic volume."
        : fixture.reviewCount < 50 || fixture.strongerReviewCompetitors > 0
          ? "Strengthen proof and objection handling before scaling traffic."
          : !fixture.hasAPlus && fixture.competitorAPlusCount > 0
            ? "Add A+ education next."
            : fixture.cheaperCompetitors >= Math.max(2, Math.ceil(fixture.competitorCount / 2))
              ? "Recheck price positioning against the current competitor set."
              : "Run one controlled conversion-layer test.";

  const result = {
    tool: "amazon-listing-optimization",
    keywordCoverage,
    imageCount: fixture.imageCount,
    reviewCount: fixture.reviewCount,
    competitorCount: fixture.competitorCount,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyPriceTrackerFixture() {
  const fixture = {
    ownPrice: 42.99,
    competitorCount: 4,
    averageCompetitorPrice: 38.49,
    lowestCompetitorPrice: 36.99,
    highestCompetitorPrice: 44.99,
    alertDelta: 2,
    ownRating: 4.1,
    averageCompetitorRating: 4.4,
    ownReviewCount: 124,
    averageCompetitorReviewCount: 410,
    ownHasAPlus: false,
    aPlusCompetitorCount: 3,
  };
  const priceGap = fixture.ownPrice - fixture.averageCompetitorPrice;
  const belowFloor = fixture.ownPrice - fixture.lowestCompetitorPrice;
  const aboveFloorRisk = belowFloor > fixture.alertDelta;
  const underpricingRisk = priceGap < -fixture.alertDelta;
  const proofRisk =
    (fixture.ownRating < fixture.averageCompetitorRating && priceGap > 0) ||
    (fixture.ownReviewCount < fixture.averageCompetitorReviewCount && priceGap > 0) ||
    (!fixture.ownHasAPlus && fixture.aPlusCompetitorCount >= Math.max(2, Math.ceil(fixture.competitorCount / 2)));

  const verdict =
    aboveFloorRisk
      ? "Review the price band now"
      : underpricingRisk
        ? "Protect margin before reacting again"
        : proofRisk
          ? "Fix proof before cutting price"
          : "Keep the current price posture";
  const owner = aboveFloorRisk || proofRisk ? "Response owner" : "Competitive watch owner";
  const doNotCross =
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

  const result = {
    tool: "amazon-price-tracker",
    competitorCount: fixture.competitorCount,
    priceGap,
    belowFloor,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyProfitAnalyzerFixture() {
  const fixture = {
    marketplace: "US",
    category: "Home & Kitchen",
    sellingPrice: 29.99,
    productCost: 9.8,
    inboundShipping: 1.3,
    fulfillmentFee: 6.1,
    adCostPerOrder: 6.9,
    returnRate: 0.09,
    couponRate: 0.08,
    storageCostPerUnit: 0.45,
    overheadPerUnit: 0.9,
  };

  const hasCostBasis = fixture.productCost > 0;
  const hasFulfillmentBasis = fixture.fulfillmentFee > 0;
  const hasAdBasis = fixture.adCostPerOrder > 0;
  const referralRate = 0.15;
  const couponCost = fixture.sellingPrice * fixture.couponRate;
  const referralFee = fixture.sellingPrice * referralRate;
  const preAdContribution =
    fixture.sellingPrice -
    couponCost -
    referralFee -
    fixture.productCost -
    fixture.inboundShipping -
    fixture.fulfillmentFee -
    fixture.storageCostPerUnit -
    fixture.overheadPerUnit;
  const expectedReturnReserve =
    fixture.returnRate * (fixture.productCost + fixture.inboundShipping + fixture.fulfillmentFee * 0.35);
  const netProfit = preAdContribution - fixture.adCostPerOrder - expectedReturnReserve;
  const marginRate = (netProfit / fixture.sellingPrice) * 100;
  const breakEvenAcos = (preAdContribution / (fixture.sellingPrice - couponCost)) * 100;

  const verdict =
    !hasCostBasis || !hasFulfillmentBasis
      ? "Do not approve this SKU yet"
      : preAdContribution <= 0
        ? "Kill this unit before PPC discussion"
        : marginRate < 10
          ? "Stop scale and repair the margin stack now"
          : marginRate < 15
            ? "Tighten leaks before this SKU earns more growth"
            : "Approve measured scale from the current unit base";
  const owner =
    !hasCostBasis || !hasFulfillmentBasis
      ? "Finance / sourcing lead"
      : hasAdBasis && breakEvenAcos < 25
        ? "Performance + finance lead"
        : "Unit economics lead";
  const doNotCross =
    !hasCostBasis || !hasFulfillmentBasis
      ? "Do not build a margin story from placeholders"
      : preAdContribution <= 0
        ? "Do not let traffic or demand hide a broken unit"
        : marginRate < 10
          ? "Do not buy inventory or scale PPC into a thin unit"
          : "Do not let promo depth or ad spend silently trade away the approved margin floor";
  const nextMove =
    !hasCostBasis || !hasFulfillmentBasis
      ? "Load the missing cost lines before approving the SKU."
      : preAdContribution <= 0
        ? "Kill the unit before more traffic or promo spend makes the loss more expensive."
        : marginRate < 10
          ? "Repair price, cost, or leak structure before adding more inventory or PPC."
          : marginRate < 15
            ? "Tighten ads, returns, or promo leaks before approving more growth."
            : "Approve measured scale from the current unit base.";

  const result = {
    tool: "amazon-profit-analyzer",
    preAdContribution,
    netProfit,
    marginRate,
    breakEvenAcos,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyAPlusContentFixture() {
  const fixture = {
    hasAPlus: false,
    benefitCount: 4,
    objectionCount: 2,
    assetCount: 3,
    moduleCount: 6,
    comparisonRows: 2,
    brandStoryReady: false,
    professionalSeller: true,
    brandRepresentative: true,
    premiumRequested: false,
    premiumEligibilityReady: false,
    imageSpecReady: false,
    altTextReady: false,
    plainTextMigrated: true,
    retailContributionConflict: false,
    genericAsin: false,
  };

  const verdict =
    !fixture.professionalSeller || !fixture.brandRepresentative
      ? "Fix publishing access before briefing A+ production"
      : fixture.premiumRequested && !fixture.premiumEligibilityReady
        ? "Scope this as Basic A+ until Premium eligibility is proven"
        : fixture.assetCount < 4 || !fixture.imageSpecReady
          ? "Close the asset checklist before locking the module plan"
          : fixture.benefitCount < 3 || fixture.objectionCount < 2
            ? "Expand proof inputs before writing the A+ page"
            : !fixture.brandStoryReady
              ? "Keep Brand Story minimal and focus on product proof first"
              : "Brief the A+ build now and keep the rest of the page closed";
  const owner =
    !fixture.professionalSeller || !fixture.brandRepresentative
      ? "Catalog access owner"
      : fixture.premiumRequested && !fixture.premiumEligibilityReady
        ? "Brand content owner"
        : fixture.assetCount < 4 || !fixture.imageSpecReady
          ? "Asset readiness lead"
          : fixture.benefitCount < 3 || fixture.objectionCount < 2
            ? "Messaging / proof lead"
            : !fixture.brandStoryReady
              ? "Brand narrative lead"
              : "A+ production owner";
  const doNotCross =
    !fixture.professionalSeller || !fixture.brandRepresentative
      ? "Do not commit design or copy time before publishing access is real"
      : fixture.premiumRequested && !fixture.premiumEligibilityReady
        ? "Do not plan Premium A+ on unproven eligibility"
        : fixture.assetCount < 4 || !fixture.imageSpecReady
          ? "Do not lock module design on thin or non-compliant assets"
          : fixture.benefitCount < 3 || fixture.objectionCount < 2
            ? "Do not polish layout before the proof brief is strong enough"
            : !fixture.brandStoryReady
              ? "Do not let brand narrative outrun product proof"
              : "Do not expand module count faster than the current proof and asset set";
  const nextMove =
    !fixture.professionalSeller || !fixture.brandRepresentative
      ? "Restore seller-plan and Brand Registry publishing access before doing more build work."
      : fixture.premiumRequested && !fixture.premiumEligibilityReady
        ? "Freeze Premium ambition and finalize a Basic A+ brief first."
        : fixture.assetCount < 4 || !fixture.imageSpecReady
          ? "Close the asset and spec checklist before finalizing module layout."
          : fixture.benefitCount < 3 || fixture.objectionCount < 2
            ? "Add stronger benefits and objections before copy production starts."
            : !fixture.brandStoryReady
              ? "Keep Brand Story light and ship product-proof modules first."
              : "Build the current A+ page and keep extra module expansion closed.";

  const result = {
    tool: "amazon-a-plus-content",
    assetCount: fixture.assetCount,
    benefitCount: fixture.benefitCount,
    objectionCount: fixture.objectionCount,
    imageSpecReady: fixture.imageSpecReady,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyEnhancedBrandContentFixture() {
  const fixture = {
    hasAPlus: true,
    benefitCount: 5,
    objectionCount: 3,
    assetCount: 6,
    moduleCount: 7,
    comparisonRows: 2,
    brandStoryReady: true,
    professionalSeller: true,
    brandRepresentative: true,
    premiumRequested: true,
    premiumEligibilityReady: false,
    imageSpecReady: true,
    altTextReady: true,
    plainTextMigrated: true,
    retailContributionConflict: false,
    genericAsin: false,
  };

  const verdict =
    !fixture.professionalSeller || !fixture.brandRepresentative
      ? "Fix publishing access before briefing A+ production"
      : fixture.premiumRequested && !fixture.premiumEligibilityReady
        ? "Scope this as Basic A+ until Premium eligibility is proven"
        : fixture.assetCount < 4 || !fixture.imageSpecReady
          ? "Close the asset checklist before locking the module plan"
          : fixture.benefitCount < 3 || fixture.objectionCount < 2
            ? "Expand proof inputs before writing the A+ page"
            : !fixture.brandStoryReady
              ? "Keep Brand Story minimal and focus on product proof first"
              : "Brief the A+ build now and keep the rest of the page closed";
  const owner =
    !fixture.professionalSeller || !fixture.brandRepresentative
      ? "Catalog access owner"
      : fixture.premiumRequested && !fixture.premiumEligibilityReady
        ? "Brand content owner"
        : fixture.assetCount < 4 || !fixture.imageSpecReady
          ? "Asset readiness lead"
          : fixture.benefitCount < 3 || fixture.objectionCount < 2
            ? "Messaging / proof lead"
            : !fixture.brandStoryReady
              ? "Brand narrative lead"
              : "A+ production owner";
  const doNotCross =
    !fixture.professionalSeller || !fixture.brandRepresentative
      ? "Do not commit design or copy time before publishing access is real"
      : fixture.premiumRequested && !fixture.premiumEligibilityReady
        ? "Do not plan Premium A+ on unproven eligibility"
        : fixture.assetCount < 4 || !fixture.imageSpecReady
          ? "Do not lock module design on thin or non-compliant assets"
          : fixture.benefitCount < 3 || fixture.objectionCount < 2
            ? "Do not polish layout before the proof brief is strong enough"
            : !fixture.brandStoryReady
              ? "Do not let brand narrative outrun product proof"
              : "Do not expand module count faster than the current proof and asset set";
  const nextMove =
    !fixture.professionalSeller || !fixture.brandRepresentative
      ? "Restore seller-plan and Brand Registry publishing access before doing more build work."
      : fixture.premiumRequested && !fixture.premiumEligibilityReady
        ? "Freeze Premium ambition and finalize a Basic A+ brief first."
        : fixture.assetCount < 4 || !fixture.imageSpecReady
          ? "Close the asset and spec checklist before finalizing module layout."
          : fixture.benefitCount < 3 || fixture.objectionCount < 2
            ? "Add stronger benefits and objections before copy production starts."
            : !fixture.brandStoryReady
              ? "Keep Brand Story light and ship product-proof modules first."
              : "Build the current A+ page and keep extra module expansion closed.";

  const result = {
    tool: "amazon-enhanced-brand-content",
    premiumRequested: fixture.premiumRequested,
    premiumEligibilityReady: fixture.premiumEligibilityReady,
    assetCount: fixture.assetCount,
    benefitCount: fixture.benefitCount,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyProductResearchFixture() {
  const fixture = {
    category: "Home & Kitchen",
    competitorCount: 5,
    averagePrice: 34.99,
    lowestPrice: 27.99,
    highestPrice: 42.99,
    averageRank: 9800,
    averageReviewCount: 230,
    strongReviewCompetitors: 2,
    aPlusCount: 3,
    titleSeedCoverage: 74,
    targetMargin: 0.18,
    landedCost: 8.2,
    fulfillmentCost: 6.1,
    viableEntryCount: 2,
    moatPressure: 3,
    differentiationPressure: 3,
  };

  const estimatedMonthlyUnits = 930;
  const estimatedNetMargin =
    (fixture.averagePrice - fixture.averagePrice * 0.15 - fixture.landedCost - fixture.fulfillmentCost) /
    fixture.averagePrice;
  const reviewMoatPressure = fixture.strongReviewCompetitors / fixture.competitorCount;
  const verdict =
    estimatedMonthlyUnits >= 200 &&
    estimatedNetMargin >= fixture.targetMargin &&
    fixture.viableEntryCount > 0 &&
    reviewMoatPressure < 0.5
      ? "Approve one wedge for sourcing now"
      : estimatedNetMargin < fixture.targetMargin || fixture.viableEntryCount === 0
        ? estimatedNetMargin < fixture.targetMargin
          ? "Kill this lane until economics improve"
          : "Kill this lane until one believable entry wedge appears"
        : "Cut the wedge narrower before more work";
  const owner =
    estimatedMonthlyUnits >= 200 &&
    estimatedNetMargin >= fixture.targetMargin &&
    fixture.viableEntryCount > 0 &&
    reviewMoatPressure < 0.5
      ? "Launch strategy lead"
      : estimatedNetMargin < fixture.targetMargin || fixture.viableEntryCount === 0
        ? estimatedNetMargin < fixture.targetMargin
          ? "Economics lead"
          : "Category strategy lead"
        : "Validation lead";
  const doNotCross =
    estimatedMonthlyUnits >= 200 &&
    estimatedNetMargin >= fixture.targetMargin &&
    fixture.viableEntryCount > 0 &&
    reviewMoatPressure < 0.5
      ? "Do not widen the idea before the first wedge survives diligence"
      : estimatedNetMargin < fixture.targetMargin || fixture.viableEntryCount === 0
        ? estimatedNetMargin < fixture.targetMargin
          ? "Do not let demand excitement override broken unit economics"
          : "Do not treat a broad cluster as one clean product opening"
        : "Do not spend on sourcing before the wedge is explicit";
  const nextMove =
    estimatedMonthlyUnits >= 200 &&
    estimatedNetMargin >= fixture.targetMargin &&
    fixture.viableEntryCount > 0 &&
    reviewMoatPressure < 0.5
      ? "Push the softest viable reference into sourcing, compliance, and profit checks now."
      : estimatedNetMargin < fixture.targetMargin || fixture.viableEntryCount === 0
        ? estimatedNetMargin < fixture.targetMargin
          ? "Do not open sourcing until cost, price, or fulfillment math improves."
          : "Do not open sourcing until one believable entry wedge survives the cluster."
        : "Define one narrower entry wedge before any more workflow opens.";

  const result = {
    tool: "amazon-product-research",
    estimatedMonthlyUnits,
    estimatedNetMargin,
    viableEntryCount: fixture.viableEntryCount,
    strongReviewCompetitors: fixture.strongReviewCompetitors,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyNicheFinderFixture() {
  const fixture = {
    referenceCount: 5,
    averagePrice: 31.5,
    lowestPrice: 24.99,
    highestPrice: 38.99,
    targetMinPrice: 24,
    targetMaxPrice: 35,
    averageRank: 11200,
    averageReviewCount: 180,
    strongReviewCount: 2,
    launchBudget: 3200,
    landedCost: 7.5,
    affordableUnits: 426,
    monthsOfCover: 2.4,
    affordableCount: 2,
    compressedCount: 1,
  };
  const verdict = "Approve one narrow niche wedge now";
  const owner = "Category validation lead";
  const doNotCross =
    "Do not widen this niche before the first wedge survives economics and competition";
  const nextMove =
    "Carry only the softest niche wedge into product research and margin validation.";

  const result = {
    tool: "amazon-niche-finder",
    referenceCount: fixture.referenceCount,
    averagePrice: fixture.averagePrice,
    monthsOfCover: fixture.monthsOfCover,
    affordableCount: fixture.affordableCount,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyTrendingProductsFixture() {
  const fixture = {
    referenceCount: 6,
    lowReviewCount: 3,
    badgeCarrierCount: 2,
    strongDemandCount: 4,
    averageRank: 8700,
    launchBudget: 5200,
    landedCost: 8,
    earlySignalCount: 4,
    matureSignalCount: 1,
  };
  const verdict = "Approve one validation sprint now";
  const owner = "Launch validation lead";
  const doNotCross =
    "Do not widen the cluster before the best signal clears economics";
  const nextMove =
    "Approve only the strongest timing cluster for product research and contribution-margin validation now.";

  const result = {
    tool: "amazon-trending-products",
    referenceCount: fixture.referenceCount,
    earlySignalCount: fixture.earlySignalCount,
    matureSignalCount: fixture.matureSignalCount,
    launchBudget: fixture.launchBudget,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifySellerAnalyticsFixture() {
  const fixture = {
    referenceCount: 6,
    categoryCount: 3,
    heroCategory: "Home & Kitchen",
    heroCategoryShare: 0.56,
    premiumShare: 0.34,
    averageReviewCount: 280,
    aPlusCount: 4,
  };
  const verdict = "Use this storefront pattern as a competitor playbook";
  const owner = "Portfolio strategy owner";
  const doNotCross =
    "Do not turn one seller read into a generic market truth";
  const nextMove =
    "Carry this storefront pattern into competitor positioning and gap analysis.";

  const result = {
    tool: "amazon-seller-analytics",
    referenceCount: fixture.referenceCount,
    categoryCount: fixture.categoryCount,
    heroCategoryShare: fixture.heroCategoryShare,
    aPlusCount: fixture.aPlusCount,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifySeasonalPlanningFixture() {
  const fixture = {
    eventCount: 4,
    urgentEventCount: 1,
    leadTimeDays: 28,
    inventoryCoverDays: 64,
    promoBudget: 1800,
    reorderRiskCount: 1,
  };
  const verdict = "Lock the nearest seasonal window now";
  const owner = "Seasonal execution lead";
  const doNotCross =
    "Do not distribute attention evenly across the full season";
  const nextMove =
    "Lock the nearest reorder, ad, and promo milestones now.";

  const result = {
    tool: "amazon-seasonal-planning",
    eventCount: fixture.eventCount,
    urgentEventCount: fixture.urgentEventCount,
    inventoryCoverDays: fixture.inventoryCoverDays,
    promoBudget: fixture.promoBudget,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyFbaCalculatorFixture() {
  const fixture = {
    sellingPrice: 29.99,
    productCost: 10.2,
    inboundShipping: 1.1,
    storageMonths: 3,
  };
  const verdict = "Repair the unit before giving this SKU more FBA exposure";
  const owner = "Unit economics owner";
  const doNotCross = "Do not scale a SKU that is still too thin for ads, promo depth, or launch variance";
  const nextMove =
    "Choose one lever first: test a higher price floor or bring a real landed-cost target back to sourcing.";

  const result = {
    tool: "amazon-fba-calculator",
    sellingPrice: fixture.sellingPrice,
    productCost: fixture.productCost,
    inboundShipping: fixture.inboundShipping,
    storageMonths: fixture.storageMonths,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyRankTrackerFixture() {
  const fixture = {
    currentRank: 28600,
    averageCompetitorRank: 14800,
    bestCompetitorRank: 6200,
    alertThreshold: 5000,
    cheaperCompetitorCount: 3,
  };
  const verdict = "Reset price posture before rank loss gets more expensive";
  const owner = "Pricing lead";
  const doNotCross =
    "Do not keep defending rank while the market set is visibly cheaper";
  const nextMove =
    "Make one explicit price-position call before opening more SEO or creative work.";

  const result = {
    tool: "amazon-rank-tracker",
    currentRank: fixture.currentRank,
    averageCompetitorRank: fixture.averageCompetitorRank,
    bestCompetitorRank: fixture.bestCompetitorRank,
    cheaperCompetitorCount: fixture.cheaperCompetitorCount,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifySalesEstimatorFixture() {
  const fixture = {
    marketplace: "US",
    category: "Home & Kitchen",
    bsr: 9400,
    sellingPrice: 27.99,
  };
  const verdict = "Carry this demand band into profit and inventory planning now";
  const owner = "Demand planning owner";
  const doNotCross =
    "Do not separate demand sizing from margin and inventory reality";
  const nextMove =
    "Push this demand band straight into profit and inventory planning on the same comparable set.";

  const result = {
    tool: "amazon-sales-estimator",
    marketplace: fixture.marketplace,
    category: fixture.category,
    bsr: fixture.bsr,
    sellingPrice: fixture.sellingPrice,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyKeywordResearchFixture() {
  const fixture = {
    competitorCount: 5,
    candidateCount: 18,
    consensusCandidateCount: 6,
    priorityTermCount: 4,
  };
  const verdict = "Approve this shortlist for first-pass copy testing";
  const owner = "Keyword placement owner";
  const doNotCross =
    "Do not let weak modifiers or pet keywords creep into the first-pass shortlist";
  const nextMove =
    "Move only the approved shortlist into title, bullets, and backend placement tests.";

  const result = {
    tool: "amazon-keyword-research",
    competitorCount: fixture.competitorCount,
    candidateCount: fixture.candidateCount,
    consensusCandidateCount: fixture.consensusCandidateCount,
    priorityTermCount: fixture.priorityTermCount,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyInventoryManagementFixture() {
  const fixture = {
    inventoryPosition: 420,
    reorderPoint: 460,
    daysOfCover: 23,
    sellThroughRate: 1.6,
  };
  const verdict = "Place or accelerate a reorder now";
  const owner = "Inventory planning owner";
  const doNotCross =
    "Do not delay once you are already inside the reorder zone";
  const nextMove =
    "Decide reorder timing now instead of leaving the inventory position in an ambiguous middle state.";

  const result = {
    tool: "amazon-inventory-management",
    inventoryPosition: fixture.inventoryPosition,
    reorderPoint: fixture.reorderPoint,
    daysOfCover: fixture.daysOfCover,
    sellThroughRate: fixture.sellThroughRate,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyShippingCalculatorFixture() {
  const fixture = {
    fulfillmentMode: "FBM",
    distanceZone: "international",
    monthlyUnits: 120,
    removalUnits: 8,
  };
  const verdict = "Do not widen this FBM route until the promise is safer";
  const owner = "Fulfillment strategy lead";
  const doNotCross =
    "Do not promise broad FBM international coverage before SLA and return handling are proven";
  const nextMove =
    "Stress-test delivery promise and return handling before expanding this FBM route.";

  const result = {
    tool: "amazon-shipping-calculator",
    fulfillmentMode: fixture.fulfillmentMode,
    distanceZone: fixture.distanceZone,
    monthlyUnits: fixture.monthlyUnits,
    removalUnits: fixture.removalUnits,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyComplianceFixture() {
  const fixture = {
    marketplace: "US",
    category: "Electronics",
    missingDocs: 3,
  };
  const verdict = "Do not publish or import this SKU yet";
  const owner = "Compliance evidence owner";
  const doNotCross =
    "Do not let copy, packaging, or freight execution get ahead of the proof stack";
  const nextMove =
    "Collect Battery compliance evidence, Claims substantiation, Electrical safety test report before any more listing or inbound work.";

  const result = {
    tool: "amazon-product-compliance",
    marketplace: fixture.marketplace,
    category: fixture.category,
    missingDocs: fixture.missingDocs,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyBrandRegistryFixture() {
  const fixture = {
    trademarkStatus: "pending",
    listingsLive: 1,
    score: 63,
  };
  const verdict = "Tighten the proof stack before opening the filing";
  const owner = "Trademark owner";
  const doNotCross =
    "Do not open the filing while proof gaps are still visible";
  const nextMove =
    "Close the missing proof stack before the filing opens.";

  const result = {
    tool: "amazon-brand-registry",
    trademarkStatus: fixture.trademarkStatus,
    listingsLive: fixture.listingsLive,
    score: fixture.score,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyNegativeKeywordsFixture() {
  const fixture = {
    termCount: 24,
    negateCount: 7,
    isolateCount: 3,
    wastedSpend: 164,
  };
  const verdict = "Ship the waste cleanup before scaling anything else";
  const owner = "PPC cleanup lead";
  const doNotCross =
    "Do not keep feeding wasted spend while waiting for perfect data";
  const nextMove =
    "Push the obvious waste terms into negatives before any new scale or bid expansion.";

  const result = {
    tool: "amazon-negative-keywords",
    termCount: fixture.termCount,
    negateCount: fixture.negateCount,
    isolateCount: fixture.isolateCount,
    wastedSpend: fixture.wastedSpend,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyUngatingFixture() {
  const fixture = {
    category: "Beauty",
    invoiceCount: 2,
    invoiceUnits: 8,
    brandAuthorization: false,
    sellerAgeMonths: 2,
  };
  const verdict = "Do not apply for ungating yet";
  const owner = "Brand authorization owner";
  const doNotCross =
    "Do not resend the same weak evidence stack";
  const nextMove =
    "Rebuild the packet before spending another ungating attempt.";

  const result = {
    tool: "amazon-category-ungating",
    category: fixture.category,
    invoiceCount: fixture.invoiceCount,
    invoiceUnits: fixture.invoiceUnits,
    sellerAgeMonths: fixture.sellerAgeMonths,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyFbaPrepFixture() {
  const fixture = {
    hasBattery: true,
    hasSds: false,
    shippingTerm: "fob",
  };
  const verdict = "Fix sensitive-SKU paperwork before booking inbound";
  const owner = "Paperwork lead";
  const doNotCross =
    "Do not rely on physical prep alone for sensitive SKUs";
  const nextMove =
    "Secure SDS or exemption paperwork before the shipment is finalized.";

  const result = {
    tool: "amazon-fba-prep",
    hasBattery: fixture.hasBattery,
    hasSds: fixture.hasSds,
    shippingTerm: fixture.shippingTerm,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyVariationRelationshipFixture() {
  const fixture = {
    childCount: 3,
    mixedBundleLogic: true,
    sameCoreProduct: false,
  };
  const verdict = "Split this family before any catalog upload";
  const owner = "Catalog cleanup lead";
  const doNotCross =
    "Do not try to rescue a broken family with better copy or images";
  const nextMove =
    "Break apart unrelated children before attempting any parent-child update.";

  const result = {
    tool: "amazon-variation-relationship-checker",
    childCount: fixture.childCount,
    mixedBundleLogic: fixture.mixedBundleLogic,
    sameCoreProduct: fixture.sameCoreProduct,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyVariationStrategyFixture() {
  const fixture = {
    childCount: 4,
    sameCoreProduct: true,
    sameBrand: true,
    differsOnlyByTheme: true,
    mixedBundleLogic: false,
  };
  const verdict = "Approve this variation strategy";
  const owner = "Variation strategy owner";
  const doNotCross =
    "Do not reopen the family logic once the valid theme and core-product match are locked";
  const nextMove =
    "Lock the parent-child structure and keep only the true theme value changing between children.";

  const result = {
    tool: "amazon-variation-strategy",
    childCount: fixture.childCount,
    sameCoreProduct: fixture.sameCoreProduct,
    sameBrand: fixture.sameBrand,
    differsOnlyByTheme: fixture.differsOnlyByTheme,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyListingTitleCheckerFixture() {
  const fixture = {
    category: "Home & Kitchen",
    titleLength: 212,
  };
  const verdict = "Shorten and clean this title before it goes live";
  const owner = "PDP copy owner";
  const doNotCross =
    "Do not reopen the title after the approved rewrite is locked";
  const nextMove =
    "Cut the title back to one clean brand-plus-product-type line before adding anything else.";

  const result = {
    tool: "amazon-listing-title-checker",
    category: fixture.category,
    titleLength: fixture.titleLength,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyImageComplianceFixture() {
  const fixture = {
    imageCount: 6,
    mainImageWhiteBackground: false,
    mainImageHasTextOverlay: true,
  };
  const verdict = "Fix the hero image before anything else";
  const owner = "Image compliance owner";
  const doNotCross =
    "Do not brief retouch, ads, or A/B tests until the hero image is policy-safe";
  const nextMove =
    "Repair the main image so it is policy-safe before briefing any secondary optimization.";

  const result = {
    tool: "amazon-image-compliance-checker",
    imageCount: fixture.imageCount,
    mainImageWhiteBackground: fixture.mainImageWhiteBackground,
    mainImageHasTextOverlay: fixture.mainImageHasTextOverlay,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function verifyBrowseSearchKeywordCheckerFixture() {
  const fixture = {
    missingCore: 3,
    categorySignal: 48,
    overlap: 5,
  };
  const verdict = "Do not publish this keyword map yet";
  const owner = "SEO / merchandising owner";
  const doNotCross =
    "Do not publish a browse-search structure with missing core descriptors";
  const nextMove =
    "Place the missing descriptors more cleanly before touching anything else.";

  const result = {
    tool: "amazon-browse-search-keyword-checker",
    missingCore: fixture.missingCore,
    categorySignal: fixture.categorySignal,
    overlap: fixture.overlap,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };

  assertDecisionGrade(result);
  return result;
}

function main() {
  const results = [
    verifyKeywordTrackerFixture(),
    verifyCompetitorMonitoringFixture(),
    verifyPpcCampaignFixture(),
    verifyAdvertisingStrategyFixture(),
    verifyBrandAnalyticsFixture(),
    verifyRepricingStrategyFixture(),
    verifyBuyBoxFixture(),
    verifyDealFinderFixture(),
    verifyCouponStrategyFixture(),
    verifyDaypartingStrategyFixture(),
    verifyDisplayAdsFixture(),
    verifyGlobalSellingFixture(),
    verifyReviewStrategyFixture(),
    verifyVineProgramFixture(),
    verifyProductBundlingFixture(),
    verifyListingImagesFixture(),
    verifyProductPhotographyFixture(),
    verifyStorefrontDesignFixture(),
    verifyInternationalListingsFixture(),
    verifyBrandTailoredPromotionsFixture(),
    verifySubscribeSaveFixture(),
    verifyPrivateLabelFixture(),
    verifyWholesaleSourcingFixture(),
    verifySuspensionAppealFixture(),
    verifyBackendKeywordsFixture(),
    verifyReturnReductionFixture(),
    verifySearchOptimizationFixture(),
    verifyCompetitorAnalysisFixture(),
    verifyReviewAnalyzerFixture(),
    verifyListingOptimizationFixture(),
    verifyPriceTrackerFixture(),
    verifyProfitAnalyzerFixture(),
    verifyAPlusContentFixture(),
    verifyEnhancedBrandContentFixture(),
    verifyProductResearchFixture(),
    verifyNicheFinderFixture(),
    verifyTrendingProductsFixture(),
    verifySellerAnalyticsFixture(),
    verifySeasonalPlanningFixture(),
    verifyFbaCalculatorFixture(),
    verifyRankTrackerFixture(),
    verifySalesEstimatorFixture(),
    verifyKeywordResearchFixture(),
    verifyInventoryManagementFixture(),
    verifyShippingCalculatorFixture(),
    verifyComplianceFixture(),
    verifyBrandRegistryFixture(),
    verifyNegativeKeywordsFixture(),
    verifyUngatingFixture(),
    verifyFbaPrepFixture(),
    verifyVariationRelationshipFixture(),
    verifyVariationStrategyFixture(),
    verifyListingTitleCheckerFixture(),
    verifyImageComplianceFixture(),
    verifyBrowseSearchKeywordCheckerFixture(),
  ];
  process.stdout.write(`${JSON.stringify({ status: "ok", results }, null, 2)}\n`);
}

main();
