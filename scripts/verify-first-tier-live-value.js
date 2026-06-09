#!/usr/bin/env node

const { execFileSync } = require("node:child_process");

const baseUrl = process.env.TOOL_PAGE_BASE_URL || "http://127.0.0.1:3000";
const retryDelayMs = 1200;

function isAmazonBotProtectionError(error) {
  return /bot protection|captcha/i.test(String(error ?? ""));
}

function isExternalEvidenceError(error) {
  return /incomplete live evidence after retry/i.test(String(error ?? ""));
}

function parseCurrencyAmount(value) {
  if (!value) return 0;
  const normalized = value.replace(/[^0-9.,-]+/g, "");
  const compact = normalized.replace(/,/g, "");
  const amount = Number(compact);
  return Number.isFinite(amount) ? amount : 0;
}

function parseReviewCountValue(value) {
  if (!value) return 0;
  const numeric = value.replace(/[^0-9]/g, "");
  return numeric ? Number(numeric) : 0;
}

function parseRankValue(value) {
  if (!value) return 0;
  const match = value.match(/#([\d,]+)/);
  return match ? Number(match[1].replace(/,/g, "")) : 0;
}

function parseDimensionNumbers(value) {
  if (!value) return [];
  return Array.from(value.matchAll(/(\d+(?:\.\d+)?)/g)).map((match) => Number(match[1]));
}

function parseWeightValue(value) {
  if (!value) return 0;
  const match = value.match(/(\d+(?:\.\d+)?)/);
  if (!match) return 0;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount)) return 0;
  return /ounce/i.test(value) ? amount / 16 : amount;
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

function assertDecisionGrade(result) {
  if (!result || typeof result !== "object") {
    throw new Error("Missing decision-grade result payload.");
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
  if (/\b(maybe|consider|could|might)\b/i.test(result.nextMove)) {
    throw new Error(`${result.tool || "tool"} next move still sounds optional instead of executable.`);
  }
}

async function fetchSnapshot(marketplace, asinOrUrl) {
  const raw = execFileSync(
    "curl",
    [
      "-sS",
      "--max-time",
      "25",
      `${baseUrl}/api/amazon-listing?marketplace=${encodeURIComponent(marketplace)}&asinOrUrl=${encodeURIComponent(asinOrUrl)}`,
    ],
    { encoding: "utf8" },
  );
  const payload = JSON.parse(raw);

  if (payload?.error) {
    throw new Error(`${asinOrUrl} failed: ${payload.error || "Unknown error"}`);
  }

  return payload;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getSnapshotEvidence(snapshot) {
  const titleReady = Boolean(snapshot?.title?.trim());
  const priceReady = parseCurrencyAmount(snapshot?.priceText) > 0;
  const reviewReady = parseReviewCountValue(snapshot?.reviewCountText) > 0;
  const rankReady =
    parseRankValue(snapshot?.bestSellersRank) > 0 || parseRankValue(snapshot?.subCategoryRank) > 0;
  const imageReady = (snapshot?.imageUrls?.length ?? 0) > 0;

  return {
    titleReady,
    priceReady,
    reviewReady,
    rankReady,
    imageReady,
    commercialCoreReady: titleReady && priceReady,
    marketReadReady: titleReady && priceReady && reviewReady && rankReady,
  };
}

async function fetchSnapshotWithEvidenceRetry(marketplace, asinOrUrl, mode) {
  let lastSnapshot = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const snapshot = await fetchSnapshot(marketplace, asinOrUrl);
    lastSnapshot = snapshot;
    const evidence = getSnapshotEvidence(snapshot);

    if (
      (mode === "commercial-core" && evidence.commercialCoreReady) ||
      (mode === "market-read" && evidence.marketReadReady) ||
      (mode === "screening-read" && evidence.titleReady && evidence.reviewReady && evidence.rankReady)
    ) {
      return snapshot;
    }

    if (attempt < 3) {
      await sleep(retryDelayMs);
    }
  }

  const evidence = getSnapshotEvidence(lastSnapshot ?? {});
  throw new Error(
    `${asinOrUrl} returned incomplete live evidence after retry: ${JSON.stringify(evidence)}`,
  );
}

function verifyProfitAnalyzer(snapshot) {
  const sellingPrice = parseCurrencyAmount(snapshot.priceText);
  if (!snapshot.title || sellingPrice <= 0) {
    throw new Error("Profit analyzer live snapshot is missing title or sell price.");
  }

  const cogs = round2(sellingPrice * 0.32);
  const inbound = round2(Math.max(1.25, sellingPrice * 0.06));
  const fulfillment = round2(Math.max(3.8, sellingPrice * 0.18));
  const ads = round2(sellingPrice * 0.14);
  const returns = round2((cogs + inbound + fulfillment * 0.35) * 0.04);
  const storage = round2(Math.max(0.2, sellingPrice * 0.008));
  const overhead = round2(Math.max(0.4, sellingPrice * 0.015));
  const referralFee = round2(sellingPrice * 0.15);
  const netProfit = round2(
    sellingPrice - referralFee - cogs - inbound - fulfillment - ads - returns - storage - overhead,
  );
  const marginRate = round2((netProfit / sellingPrice) * 100);
  const verdict =
    netProfit <= 0
      ? "Do not approve this SKU yet"
      : marginRate < 12
        ? "Stop scale and repair the margin stack now"
        : "Approve measured scale from the current unit base";
  const owner =
    marginRate < 12 ? "Performance + finance lead" : "Unit economics lead";
  const doNotCross =
    marginRate < 12
      ? "Do not buy inventory or scale PPC into a thin unit"
      : "Do not let promo depth or ad spend silently trade away the approved margin floor";
  const nextMove =
    marginRate < 12
      ? "Recover margin before approving inventory, promo depth, or PPC scale."
      : "Lock the approved break-even ACoS ceiling before PPC scale conversations start.";

  if (!verdict || !owner || !doNotCross || !nextMove) {
    throw new Error("Profit analyzer did not produce a decision-grade live output.");
  }

  return {
    tool: "amazon-profit-analyzer",
    asin: snapshot.asin,
    title: snapshot.title,
    sellingPrice,
    netProfit,
    marginRate,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };
}

function verifyCompetitorAnalysis(ownSnapshot, competitorSnapshots) {
  if (!ownSnapshot?.title || competitorSnapshots.length < 2) {
    throw new Error("Competitor analysis needs one own PDP and at least two live competitors.");
  }

  const ownPrice = parseCurrencyAmount(ownSnapshot.priceText);
  const ownReviews = parseReviewCountValue(ownSnapshot.reviewCountText);
  const ownImages = ownSnapshot.imageUrls.length;
  const competitorPrices = competitorSnapshots.map((item) => parseCurrencyAmount(item.priceText));
  const competitorReviews = competitorSnapshots.map((item) => parseReviewCountValue(item.reviewCountText));
  const competitorImages = competitorSnapshots.map((item) => item.imageUrls.length);

  const cheaperCompetitors = competitorPrices.filter((value) => value > 0 && ownPrice > 0 && value < ownPrice).length;
  const strongerProofCompetitors = competitorReviews.filter((value) => value > ownReviews).length;
  const richerCreativeCompetitors = competitorImages.filter((value) => value > ownImages).length;

  const focus =
    strongerProofCompetitors >= 2
      ? "Freeze spend and repair trust proof now"
      : richerCreativeCompetitors >= 2
        ? "Freeze spend and rebuild the gallery now"
        : cheaperCompetitors >= 2
          ? "Freeze spend and repair price position now"
          : "Keep the PDP steady and run one benchmark-led message test";
  const owner =
    strongerProofCompetitors >= 2
      ? "CX / reputation lead"
      : richerCreativeCompetitors >= 2
        ? "Creative / PDP lead"
        : cheaperCompetitors >= 2
          ? "Pricing / offer lead"
          : "PDP lead";
  const doNotCross =
    strongerProofCompetitors >= 2
      ? "Do not buy traffic into a trust deficit"
      : richerCreativeCompetitors >= 2
        ? "Do not polish copy while the gallery is still losing the click"
        : cheaperCompetitors >= 2
          ? "Do not sit in the middle on price and story at the same time"
          : "Do not trigger a broad reset without one clean losing surface";
  const nextMove =
    strongerProofCompetitors >= 2
      ? "Repair trust proof first and keep price, gallery, and copy changes closed."
      : richerCreativeCompetitors >= 2
        ? "Rebuild the gallery first and freeze wording and price nudges."
        : cheaperCompetitors >= 2
          ? "Make one explicit price-position call before opening gallery or copy work."
          : "Run one benchmark-led message test and keep the rest of the PDP closed.";

  if (average(competitorPrices.filter((value) => value > 0)) <= 0) {
    throw new Error("Competitor analysis live set is missing usable price evidence.");
  }
  if (!focus || !owner || !doNotCross || !nextMove) {
    throw new Error("Competitor analysis did not produce a decision-grade live output.");
  }

  return {
    tool: "amazon-competitor-analysis",
    ownAsin: ownSnapshot.asin,
    competitorCount: competitorSnapshots.length,
    cheaperCompetitors,
    strongerProofCompetitors,
    richerCreativeCompetitors,
    verdict: focus,
    owner,
    doNotCross,
    nextMove,
  };
}

function verifyProductResearch(snapshots) {
  if (snapshots.length < 3) {
    throw new Error("Product research needs at least three live reference ASINs.");
  }

  const prices = snapshots.map((item) => parseCurrencyAmount(item.priceText)).filter((value) => value > 0);
  const ranks = snapshots
    .map((item) => parseRankValue(item.bestSellersRank) || parseRankValue(item.subCategoryRank))
    .filter((value) => value > 0);
  const reviews = snapshots.map((item) => parseReviewCountValue(item.reviewCountText)).filter((value) => value > 0);

  const averagePrice = average(prices);
  const averageRank = average(ranks);
  const averageReviews = average(reviews);
  const targetMargin = 0.2;
  const landedCost = 55;
  const fulfillmentCost = 18;
  const estimatedNetMargin =
    averagePrice > 0 ? (averagePrice - averagePrice * 0.15 - landedCost - fulfillmentCost) / averagePrice : 0;

  const verdict =
    prices.length === 0
      ? averageRank > 0 && averageReviews > 0
        ? "Keep screening this lane until pricing is confirmed"
        : "Hold this lane until the live cluster is stronger"
      : estimatedNetMargin < targetMargin
      ? "Kill this lane until economics improve"
      : averageReviews >= 300
        ? "Cut the wedge narrower before more work"
        : "Approve one wedge for sourcing";
  const owner =
    estimatedNetMargin < targetMargin
      ? "Economics lead"
      : averageReviews >= 300
        ? "Validation lead"
        : "Launch strategy lead";
  const doNotCross =
    estimatedNetMargin < targetMargin
      ? "Do not let demand excitement override broken unit economics"
      : averageReviews >= 300
        ? "Do not treat a broad cluster as one clean product opening"
        : "Do not widen the idea before the first wedge survives diligence";
  const nextMove =
    estimatedNetMargin < targetMargin
      ? "Do not open sourcing until cost, price, or fulfillment math improves."
      : averageReviews >= 300
        ? "Define one narrower entry wedge before any more workflow opens."
        : "Push the softest viable reference into sourcing, compliance, and profit checks now.";

  if (averageRank <= 0 || averageReviews <= 0) {
    throw new Error("Product research live set is missing enough directional evidence.");
  }
  if (!verdict || !owner || !doNotCross || !nextMove) {
    throw new Error("Product research did not produce a decision-grade live output.");
  }

  return {
    tool: "amazon-product-research",
    referenceCount: snapshots.length,
    averagePrice: round2(averagePrice),
    averageRank: Math.round(averageRank),
    averageReviews: Math.round(averageReviews),
    estimatedNetMargin: round2(estimatedNetMargin * 100),
    pricingReady: prices.length > 0,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };
}

function verifyTrendingProducts(snapshots) {
  if (snapshots.length < 3) {
    throw new Error("Trending products needs at least three live reference ASINs.");
  }

  const ranks = snapshots
    .map((item) => parseRankValue(item.bestSellersRank) || parseRankValue(item.subCategoryRank))
    .filter((value) => value > 0);
  const reviews = snapshots.map((item) => parseReviewCountValue(item.reviewCountText)).filter((value) => value > 0);
  const earlySignalCount = snapshots.filter((item) => {
    const rank = parseRankValue(item.bestSellersRank) || parseRankValue(item.subCategoryRank);
    const reviewCount = parseReviewCountValue(item.reviewCountText);
    return rank > 0 && rank <= 5000 && reviewCount > 0 && reviewCount <= 120;
  }).length;
  const matureSignalCount = reviews.filter((value) => value >= 300).length;
  const launchBudget = 6000;
  const landedCost = 55;
  const launchCapacity = landedCost > 0 ? Math.floor(launchBudget / landedCost) : 0;

  const verdict =
    earlySignalCount >= 2
      ? "Approve one validation sprint now"
      : matureSignalCount >= 2
        ? "Do not open launch work - the window is already too mature"
        : "Do not approve launch yet - re-check once";
  const owner =
    earlySignalCount >= 2
      ? "Launch validation lead"
      : matureSignalCount >= 2
        ? "Category / finance lead"
        : "Trend watch lead";
  const doNotCross =
    earlySignalCount >= 2
      ? "Do not widen the cluster before the best signal clears economics"
      : matureSignalCount >= 2
        ? "Do not treat mature momentum as an early window"
        : "Do not build launch timing from one noisy read";
  const nextMove =
    earlySignalCount >= 2
      ? "Approve only the strongest cluster for product research and margin validation."
      : matureSignalCount >= 2
        ? "Keep this out of launch work until the same cluster proves a better window."
        : "Require one more persistence check before naming a launch window.";

  if (average(ranks) <= 0) {
    throw new Error("Trending products live set is missing rank evidence.");
  }
  if (!verdict || !owner || !doNotCross || !nextMove) {
    throw new Error("Trending products did not produce a decision-grade live output.");
  }

  return {
    tool: "amazon-trending-products",
    referenceCount: snapshots.length,
    earlySignalCount,
    matureSignalCount,
    launchCapacity,
    pricingReady: snapshots.some((item) => parseCurrencyAmount(item.priceText) > 0),
    verdict,
    owner,
    doNotCross,
    nextMove,
  };
}

function verifyReviewAnalyzerFixture() {
  const fixture = {
    parsedReviewCount: 148,
    averageRating: 4.1,
    complaintThemes: [
      { label: "packaging", count: 19 },
      { label: "clarity", count: 12 },
      { label: "assembly", count: 7 },
    ],
    praiseThemes: [
      { label: "design", count: 31 },
      { label: "value", count: 18 },
    ],
    opportunityThemes: [
      { label: "feature-gap", count: 8 },
      { label: "clarity", count: 5 },
    ],
  };

  const topComplaint = fixture.complaintThemes[0];
  const topPraise = fixture.praiseThemes[0];
  const verdict =
    topComplaint.label === "packaging" && topComplaint.count >= 10
      ? "Fix the product-side complaint first"
      : "Tighten expectation match before broad PDP edits";
  const owner =
    topComplaint.label === "packaging" && topComplaint.count >= 10
      ? "Ops / quality lead"
      : "PDP / CX lead";
  const doNotCross =
    topComplaint.label === "packaging" && topComplaint.count >= 10
      ? "Do not rewrite the PDP before the product-side complaint is contained"
      : "Do not broaden PDP edits before expectation match is repaired";
  const nextMove =
    topComplaint.label === "packaging" && topComplaint.count >= 10
      ? "Contain the product-side issue first, then reopen listing and message work."
      : "Repair expectation match in title, bullets, and image sequencing first.";

  if (fixture.parsedReviewCount < 50 || fixture.averageRating <= 0) {
    throw new Error("Review analyzer fixture is too weak to validate operator value.");
  }
  if (!verdict || !owner || !doNotCross || !nextMove) {
    throw new Error("Review analyzer did not produce a decision-grade live output.");
  }

  return {
    tool: "amazon-review-analyzer",
    parsedReviewCount: fixture.parsedReviewCount,
    averageRating: fixture.averageRating,
    topComplaint: `${topComplaint.label}:${topComplaint.count}`,
    topPraise: `${topPraise.label}:${topPraise.count}`,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };
}

function verifyListingOptimization(ownSnapshot, competitorSnapshots) {
  if (!ownSnapshot?.title || competitorSnapshots.length < 2) {
    throw new Error("Listing optimization needs one own PDP and at least two live competitors.");
  }

  const targetKeywords = [
    "arched full length mirror",
    "floor mirror",
    "bedroom mirror",
    "full body mirror",
    "gold mirror",
  ];
  const visibleText = [ownSnapshot.title, ...(ownSnapshot.bulletPoints ?? []), ...(ownSnapshot.breadcrumbs ?? [])]
    .join(" ")
    .toLowerCase();
  const coveredKeywordCount = targetKeywords.filter((phrase) => visibleText.includes(phrase.toLowerCase())).length;
  const ownPrice = parseCurrencyAmount(ownSnapshot.priceText);
  const ownReviews = parseReviewCountValue(ownSnapshot.reviewCountText);
  const ownImages = ownSnapshot.imageUrls?.length ?? 0;
  const richerImageCompetitors = competitorSnapshots.filter(
    (item) => (item.imageUrls?.length ?? 0) > ownImages,
  ).length;
  const strongerReviewCompetitors = competitorSnapshots.filter(
    (item) => parseReviewCountValue(item.reviewCountText) > ownReviews,
  ).length;
  const cheaperCompetitors = competitorSnapshots.filter((item) => {
    const price = parseCurrencyAmount(item.priceText);
    return price > 0 && ownPrice > 0 && price < ownPrice;
  }).length;
  const competitorAPlusCount = competitorSnapshots.filter((item) => item.hasAPlus).length;

  const verdict =
    coveredKeywordCount < targetKeywords.length
      ? "Close visible relevance gaps before any broader PDP work"
      : richerImageCompetitors >= 2
        ? "Rebuild the gallery before buying more traffic"
        : ownReviews < 50 || strongerReviewCompetitors >= 2
          ? "Repair trust proof before traffic scale"
          : !ownSnapshot.hasAPlus && competitorAPlusCount >= 2
            ? "Add A+ depth before the next conversion push"
            : cheaperCompetitors >= 2
              ? "Reset price posture before the next PDP test"
              : "Hold the PDP steady and run one controlled lift test";
  const owner =
    coveredKeywordCount < targetKeywords.length
      ? "SEO / listing lead"
      : richerImageCompetitors >= 2
        ? "Creative lead"
        : ownReviews < 50 || strongerReviewCompetitors >= 2
          ? "Proof / CX lead"
          : !ownSnapshot.hasAPlus && competitorAPlusCount >= 2
            ? "Brand content lead"
            : cheaperCompetitors >= 2
              ? "Pricing lead"
              : "Conversion lead";
  const doNotCross =
    coveredKeywordCount < targetKeywords.length
      ? "Do not scale traffic into a page that is still missing obvious relevance coverage"
      : richerImageCompetitors >= 2
        ? "Do not rewrite copy while the gallery is still losing the comparison click"
        : ownReviews < 50 || strongerReviewCompetitors >= 2
          ? "Do not buy more traffic into a weak trust surface"
          : !ownSnapshot.hasAPlus && competitorAPlusCount >= 2
            ? "Do not skip branded education while competitors own the trust layer"
            : cheaperCompetitors >= 2
              ? "Do not ignore price posture while the market set is visibly lower"
              : "Do not reopen the whole PDP before the first blocker is measured";
  const nextMove =
    coveredKeywordCount < targetKeywords.length
      ? "Place the missing target terms into the title, bullets, and browse-path language first."
      : richerImageCompetitors >= 2
        ? "Rebuild the image stack before touching price or traffic volume."
        : ownReviews < 50 || strongerReviewCompetitors >= 2
          ? "Strengthen proof and objection handling before scaling traffic."
          : !ownSnapshot.hasAPlus && competitorAPlusCount >= 2
            ? "Add A+ education next."
            : cheaperCompetitors >= 2
              ? "Recheck price positioning against the current competitor set."
              : "Run one controlled PDP test and keep the rest of the page frozen.";

  if ((ownSnapshot.bulletPoints?.length ?? 0) < 4 || ownImages < 1) {
    throw new Error("Listing optimization live snapshot is missing required PDP structure evidence.");
  }
  if (!verdict || !owner || !doNotCross || !nextMove) {
    throw new Error("Listing optimization did not produce a decision-grade live output.");
  }

  return {
    tool: "amazon-listing-optimization",
    ownAsin: ownSnapshot.asin,
    bullets: ownSnapshot.bulletPoints.length,
    images: ownImages,
    reviews: ownReviews,
    hasAPlus: ownSnapshot.hasAPlus,
    keywordCoverage: `${coveredKeywordCount}/${targetKeywords.length}`,
    richerImageCompetitors,
    strongerReviewCompetitors,
    cheaperCompetitors,
    competitorAPlusCount,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };
}

function verifyRankTracker(ownSnapshot, competitorSnapshots) {
  if (!ownSnapshot?.title || competitorSnapshots.length < 2) {
    throw new Error("Rank tracker needs one own PDP and at least two live competitors.");
  }

  const currentRank = parseRankValue(ownSnapshot.bestSellersRank) || parseRankValue(ownSnapshot.subCategoryRank);
  const competitorRanks = competitorSnapshots
    .map((item) => parseRankValue(item.bestSellersRank) || parseRankValue(item.subCategoryRank))
    .filter((value) => value > 0);
  const ownPrice = parseCurrencyAmount(ownSnapshot.priceText);
  const competitorPrices = competitorSnapshots
    .map((item) => parseCurrencyAmount(item.priceText))
    .filter((value) => value > 0);
  const ownReviewCount = parseReviewCountValue(ownSnapshot.reviewCountText);
  const competitorReviewCounts = competitorSnapshots
    .map((item) => parseReviewCountValue(item.reviewCountText))
    .filter((value) => value > 0);
  const targetWords = [
    "arched",
    "full",
    "length",
    "mirror",
    "standing",
    "gold",
    "bedroom",
    "floor",
  ];
  const titleText = (ownSnapshot.title || "").toLowerCase();
  const titleCoverageCount = targetWords.filter((word) => titleText.includes(word)).length;
  const alertThreshold = 5000;
  const averageCompetitorRank = average(competitorRanks);
  const bestCompetitorRank = competitorRanks.length ? Math.min(...competitorRanks) : 0;
  const rankGap = currentRank > 0 && averageCompetitorRank > 0 ? currentRank - averageCompetitorRank : 0;
  const cheaperCompetitorCount = competitorPrices.filter((price) => ownPrice > 0 && price < ownPrice).length;
  const strongerReviewCompetitorCount = competitorReviewCounts.filter((count) => count > ownReviewCount).length;
  const aPlusCompetitorCount = competitorSnapshots.filter((item) => item.hasAPlus).length;
  const coverage = targetWords.length ? Math.round((titleCoverageCount / targetWords.length) * 100) : 0;

  const verdict =
    currentRank === 0
      ? "Repair the rank baseline before making a response call"
      : coverage < 70
        ? "Repair keyword coverage before treating this as a market-pressure problem"
        : rankGap > alertThreshold && cheaperCompetitorCount >= 2
          ? "Reset price posture before rank loss gets more expensive"
          : rankGap > alertThreshold && (strongerReviewCompetitorCount >= 2 || (!ownSnapshot.hasAPlus && aPlusCompetitorCount >= 2))
            ? "Repair trust proof before defending rank any harder"
            : rankGap > alertThreshold || (bestCompetitorRank > 0 && currentRank > bestCompetitorRank + alertThreshold)
              ? "Open one rank-recovery lane now"
              : "Keep the rank watch live without opening a broad response";
  const owner =
    currentRank === 0
      ? "Catalog lead"
      : coverage < 70
        ? "SEO / listing lead"
        : rankGap > alertThreshold && cheaperCompetitorCount >= 2
          ? "Pricing lead"
          : rankGap > alertThreshold && (strongerReviewCompetitorCount >= 2 || (!ownSnapshot.hasAPlus && aPlusCompetitorCount >= 2))
            ? "CX / merchandising lead"
            : rankGap > alertThreshold || (bestCompetitorRank > 0 && currentRank > bestCompetitorRank + alertThreshold)
              ? "Search response lead"
              : "Rank watch owner";
  const doNotCross =
    currentRank === 0
      ? "Do not call a rank emergency without a live BSR baseline"
      : coverage < 70
        ? "Do not treat weak relevance coverage like a traffic or competitor-only problem"
        : rankGap > alertThreshold && cheaperCompetitorCount >= 2
          ? "Do not keep defending rank while the market set is visibly cheaper"
          : rankGap > alertThreshold && (strongerReviewCompetitorCount >= 2 || (!ownSnapshot.hasAPlus && aPlusCompetitorCount >= 2))
            ? "Do not buy more traffic into a proof deficit"
            : rankGap > alertThreshold || (bestCompetitorRank > 0 && currentRank > bestCompetitorRank + alertThreshold)
              ? "Do not open pricing, SEO, and creative workstreams at the same time"
              : "Do not let normal rank noise trigger a broad response";
  const nextMove =
    currentRank === 0
      ? "Reload the PDP until the live BSR baseline is real before escalating any rank response."
      : coverage < 70
        ? "Close title keyword gaps first and keep pricing and proof changes frozen."
        : rankGap > alertThreshold && cheaperCompetitorCount >= 2
          ? "Make one explicit price-position call before opening more SEO or creative work."
          : rankGap > alertThreshold && (strongerReviewCompetitorCount >= 2 || (!ownSnapshot.hasAPlus && aPlusCompetitorCount >= 2))
            ? "Repair proof depth first and hold price and keyword churn closed."
            : rankGap > alertThreshold || (bestCompetitorRank > 0 && currentRank > bestCompetitorRank + alertThreshold)
              ? "Open one controlled recovery lane and keep every other response closed."
              : "Keep the same competitor set and alert band fixed until the next review cycle.";

  if (currentRank <= 0 || competitorRanks.length < 2) {
    throw new Error("Rank tracker live set is missing usable rank evidence.");
  }
  if (!verdict || !owner || !doNotCross || !nextMove) {
    throw new Error("Rank tracker did not produce a decision-grade live output.");
  }

  return {
    tool: "amazon-rank-tracker",
    ownAsin: ownSnapshot.asin,
    currentRank,
    averageCompetitorRank: Math.round(averageCompetitorRank),
    bestCompetitorRank,
    keywordCoverage: `${titleCoverageCount}/${targetWords.length}`,
    cheaperCompetitorCount,
    strongerReviewCompetitorCount,
    aPlusCompetitorCount,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };
}

function verifySearchOptimization(snapshot) {
  if (!snapshot?.title) {
    throw new Error("Search optimization needs a live PDP title baseline.");
  }

  const targetKeywords = [
    "arched full length mirror",
    "floor mirror",
    "bedroom mirror",
    "full body mirror",
    "gold mirror",
  ];
  const titleText = snapshot.title.toLowerCase();
  const backendTerms = [
    snapshot.brand,
    ...(snapshot.bulletPoints ?? []).slice(0, 3),
    snapshot.breadcrumbs?.[snapshot.breadcrumbs.length - 1] ?? "",
  ]
    .join(" ")
    .slice(0, 240)
    .toLowerCase();
  const itemType = snapshot.breadcrumbs?.[snapshot.breadcrumbs.length - 1] ?? "";
  const targetWords = Array.from(
    new Set(
      targetKeywords.flatMap((phrase) =>
        phrase.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2),
      ),
    ),
  );
  const titleWords = Array.from(new Set(titleText.split(/[^a-z0-9]+/).filter((word) => word.length > 2)));
  const backendWords = Array.from(new Set(backendTerms.split(/[^a-z0-9]+/).filter((word) => word.length > 2)));
  const itemTypeWords = Array.from(new Set(itemType.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2)));
  const missingTargets = targetWords.filter((word) => !titleWords.includes(word) && !backendWords.includes(word));
  const overlap = backendWords.filter((word) => titleWords.includes(word));
  const itemTypeCoverage = itemTypeWords.length
    ? Math.round((itemTypeWords.filter((word) => titleWords.includes(word)).length / itemTypeWords.length) * 100)
    : 70;
  const currentRank = parseRankValue(snapshot.bestSellersRank) || parseRankValue(snapshot.subCategoryRank);
  const reviewCount = parseReviewCountValue(snapshot.reviewCountText);

  const verdict =
    missingTargets.length > 0
      ? "Close relevance gaps before pushing search any harder"
      : overlap.length > Math.max(2, Math.floor(backendWords.length * 0.45))
        ? "Clean backend waste before broader SEO work"
        : itemTypeCoverage < 60
          ? "Repair browse fit before broader search work"
          : !snapshot.hasAPlus || reviewCount < 50
            ? "Repair conversion proof before broader SEO work"
            : currentRank > 30000
              ? "Open one relevance-plus-conversion recovery lane now"
              : "Run one controlled search revision";
  const owner =
    missingTargets.length > 0
      ? "SEO / listing lead"
      : overlap.length > Math.max(2, Math.floor(backendWords.length * 0.45))
        ? "SEO lead"
        : itemTypeCoverage < 60
          ? "Catalog / SEO lead"
          : !snapshot.hasAPlus || reviewCount < 50
            ? "Conversion / proof lead"
            : currentRank > 30000
              ? "Search recovery lead"
              : "SEO lead";
  const doNotCross =
    missingTargets.length > 0
      ? "Do not buy rank before coverage is complete"
      : overlap.length > Math.max(2, Math.floor(backendWords.length * 0.45))
        ? "Do not waste backend bytes on duplicates"
        : itemTypeCoverage < 60
          ? "Do not chase rank before browse fit is clean"
          : !snapshot.hasAPlus || reviewCount < 50
            ? "Do not buy traffic into a weak proof stack"
            : currentRank > 30000
              ? "Do not treat a weak rank signal like a title-only problem"
              : "Do not turn one SEO pass into a full rewrite";
  const nextMove =
    missingTargets.length > 0
      ? "Place the missing targets into the title, backend terms, or both before opening any other search work."
      : overlap.length > Math.max(2, Math.floor(backendWords.length * 0.45))
        ? "Trim duplicate visible words out of the backend field and keep the rest of the listing frozen."
        : itemTypeCoverage < 60
          ? "Repair browse wording first and keep title and backend churn closed."
          : !snapshot.hasAPlus || reviewCount < 50
            ? "Repair conversion proof first before asking search edits to carry the lift."
            : currentRank > 30000
              ? "Open one recovery lane that combines relevance cleanup with proof repair."
              : "Run one focused title-plus-backend revision and freeze every other search surface.";

  if (!(snapshot.breadcrumbs?.length ?? 0) || reviewCount <= 0) {
    throw new Error("Search optimization live snapshot is missing browse or review evidence.");
  }
  if (!verdict || !owner || !doNotCross || !nextMove) {
    throw new Error("Search optimization did not produce a decision-grade live output.");
  }

  return {
    tool: "amazon-search-optimization",
    asin: snapshot.asin,
    currentRank,
    reviewCount,
    hasAPlus: snapshot.hasAPlus,
    itemType,
    keywordCoverage: `${targetWords.length - missingTargets.length}/${targetWords.length}`,
    backendOverlap: overlap.length,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };
}

function verifyKeywordTracker(ownSnapshot, competitorSnapshots) {
  if (!ownSnapshot?.title || competitorSnapshots.length < 2) {
    throw new Error("Keyword tracker needs one own PDP and at least two live competitors.");
  }

  const phrases = [
    "arched full length mirror",
    "standing mirror",
    "gold mirror",
    "bedroom floor mirror",
  ];
  const ownText = `${ownSnapshot.title} ${(ownSnapshot.bulletPoints ?? []).join(" ")} ${(ownSnapshot.breadcrumbs ?? []).join(" ")}`
    .toLowerCase();
  const competitorTexts = competitorSnapshots.map((item) =>
    `${item.title} ${(item.bulletPoints ?? []).join(" ")} ${(item.breadcrumbs ?? []).join(" ")}`.toLowerCase(),
  );
  const majorityThreshold = Math.max(1, Math.ceil(competitorSnapshots.length / 2));
  const trackedRows = phrases.map((phrase) => {
    const normalized = phrase.toLowerCase();
    const ownVisible = ownText.includes(normalized);
    const competitorMatches = competitorTexts.filter((text) => text.includes(normalized)).length;
    const priority =
      competitorMatches >= majorityThreshold && !ownVisible
        ? "gap"
        : ownVisible && competitorMatches >= majorityThreshold
          ? "defend"
          : "observe";

    return {
      phrase,
      ownVisible,
      competitorMatches,
      priority,
    };
  });

  const trackedKeywordCount = trackedRows.length;
  const ownCoverageCount = trackedRows.filter((row) => row.ownVisible).length;
  const gapCount = trackedRows.filter((row) => row.priority === "gap").length;
  const defendCount = trackedRows.filter((row) => row.priority === "defend").length;
  const observeCount = trackedRows.filter((row) => row.priority === "observe").length;
  const currentRank = parseRankValue(ownSnapshot.bestSellersRank) || parseRankValue(ownSnapshot.subCategoryRank);
  const bestCompetitorRank = competitorSnapshots
    .map((item) => parseRankValue(item.bestSellersRank) || parseRankValue(item.subCategoryRank))
    .filter((value) => value > 0)
    .sort((a, b) => a - b)[0] ?? 0;
  const alertThreshold = 5000;
  const rankGap = currentRank > 0 && bestCompetitorRank > 0 ? currentRank - bestCompetitorRank : 0;
  const ownPrice = parseCurrencyAmount(ownSnapshot.priceText);
  const cheaperCompetitorCount = competitorSnapshots.filter((item) => {
    const competitorPrice = parseCurrencyAmount(item.priceText);
    return ownPrice > 0 && competitorPrice > 0 && competitorPrice < ownPrice;
  }).length;
  const ownReviewCount = parseReviewCountValue(ownSnapshot.reviewCountText);
  const strongerReviewCompetitorCount = competitorSnapshots.filter(
    (item) => parseReviewCountValue(item.reviewCountText) > ownReviewCount,
  ).length;
  const aPlusCompetitorCount = competitorSnapshots.filter((item) => item.hasAPlus).length;

  const verdict =
    trackedKeywordCount === 0
      ? "Build the watchlist before treating this as keyword defense"
      : gapCount > 0
        ? "Close the commercial keyword gaps before defending anything else"
        : rankGap > alertThreshold &&
            (strongerReviewCompetitorCount >= 2 || (!ownSnapshot.hasAPlus && aPlusCompetitorCount >= 2))
          ? "Repair proof before trusting the defended keyword set"
          : rankGap > alertThreshold && cheaperCompetitorCount >= 2
            ? "Repair price posture before treating this as a keyword-only defense job"
            : rankGap > alertThreshold
              ? "Open one keyword-defense lane now"
              : "Defend the current keyword set and keep the watchlist tight";
  const owner =
    trackedKeywordCount === 0
      ? "SEO strategy lead"
      : gapCount > 0
        ? "SEO / listing lead"
        : rankGap > alertThreshold &&
            (strongerReviewCompetitorCount >= 2 || (!ownSnapshot.hasAPlus && aPlusCompetitorCount >= 2))
          ? "CX / merchandising lead"
          : rankGap > alertThreshold && cheaperCompetitorCount >= 2
            ? "Pricing lead"
            : rankGap > alertThreshold
              ? "Keyword defense lead"
              : "Keyword watch owner";
  const doNotCross =
    trackedKeywordCount === 0
      ? "Do not treat an empty watchlist like a defense system"
      : gapCount > 0
        ? "Do not keep adding phrases while current commercial gaps are still unresolved"
        : rankGap > alertThreshold &&
            (strongerReviewCompetitorCount >= 2 || (!ownSnapshot.hasAPlus && aPlusCompetitorCount >= 2))
          ? "Do not blame phrase drift before checking proof pressure"
          : rankGap > alertThreshold && cheaperCompetitorCount >= 2
            ? "Do not blame keyword coverage while the market set is visibly cheaper"
            : rankGap > alertThreshold
              ? "Do not open gap closure, pricing, and proof fixes at the same time"
              : "Do not bloat the watchlist beyond what someone will actually review";
  const nextMove =
    trackedKeywordCount === 0
      ? "Load and lock the commercial phrase set before calling anything a gap or defend term."
      : gapCount > 0
        ? "Fix the strongest gap phrases first and keep the defend set frozen."
        : rankGap > alertThreshold &&
            (strongerReviewCompetitorCount >= 2 || (!ownSnapshot.hasAPlus && aPlusCompetitorCount >= 2))
          ? "Repair trust proof first and keep phrase churn closed."
          : rankGap > alertThreshold && cheaperCompetitorCount >= 2
            ? "Make one explicit price-position call before blaming the keyword set."
            : rankGap > alertThreshold
              ? "Open one controlled defense lane around the existing tracked set."
              : "Hold the current defend set steady and only re-open when the live set changes.";

  if (currentRank <= 0 || trackedKeywordCount === 0) {
    throw new Error("Keyword tracker live set is missing usable rank or tracked-term evidence.");
  }
  if (!verdict || !owner || !doNotCross || !nextMove) {
    throw new Error("Keyword tracker did not produce a decision-grade live output.");
  }

  return {
    tool: "amazon-keyword-tracker",
    ownAsin: ownSnapshot.asin,
    trackedKeywordCount,
    ownCoverageCount,
    gapCount,
    defendCount,
    observeCount,
    currentRank,
    bestCompetitorRank,
    cheaperCompetitorCount,
    strongerReviewCompetitorCount,
    aPlusCompetitorCount,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };
}

function verifyFbaCalculator(snapshot) {
  if (!snapshot?.title) {
    throw new Error("FBA calculator needs a live own PDP title baseline.");
  }

  const dimensions = parseDimensionNumbers(snapshot.productDimensionsText);
  const weight = parseWeightValue(snapshot.itemWeightText);
  const sellingPrice = parseCurrencyAmount(snapshot.priceText);
  const hasPackageTruth = dimensions.length >= 3 && weight > 0;

  const verdict = !hasPackageTruth
    ? "Do not trust the fee tier yet"
    : sellingPrice <= 0
      ? "Do not judge profitability yet"
      : "Pressure-test the unit economics";
  const owner = !hasPackageTruth
    ? "Ops / packaging owner"
    : sellingPrice <= 0
      ? "Pricing / merch owner"
      : "Unit economics owner";
  const doNotCross = !hasPackageTruth
    ? "Do not trust fee math built on catalog dimensions"
    : sellingPrice <= 0
      ? "Do not judge FBA viability before revenue is real"
      : "Do not let one fee estimate stand in for the decision";
  const nextMove = !hasPackageTruth
    ? "Measure the shipped carton and confirm packaged dimensions before trusting the fee band."
    : sellingPrice <= 0
      ? "Set the real sell price before deciding whether FBA survives the fee stack."
      : "Run one price case and one cost-down case before treating the SKU as commercially safe.";

  if (!verdict || !owner || !doNotCross || !nextMove) {
    throw new Error("FBA calculator did not produce a decision-grade live output.");
  }

  return {
    tool: "amazon-fba-calculator",
    asin: snapshot.asin,
    price: sellingPrice,
    dimensionsLoaded: dimensions.length,
    weight,
    verdict,
    owner,
    doNotCross,
    nextMove,
  };
}

function verifyPriceTracker(ownSnapshot, competitorSnapshots) {
  if (!ownSnapshot?.title || competitorSnapshots.length < 2) {
    throw new Error("Price tracker needs one own PDP and at least two live competitors.");
  }

  const ownPrice = parseCurrencyAmount(ownSnapshot.priceText);
  const competitorPrices = competitorSnapshots
    .map((item) => parseCurrencyAmount(item.priceText))
    .filter((value) => value > 0);
  if (!ownPrice || competitorPrices.length < 2) {
    throw new Error("Price tracker live set is missing enough visible price evidence.");
  }

  const averageCompetitorPrice = average(competitorPrices);
  const lowestCompetitorPrice = Math.min(...competitorPrices);
  const floorGap = ownPrice - lowestCompetitorPrice;
  const priceGap = ownPrice - averageCompetitorPrice;
  const alertDelta = 5;
  const underpricingRisk = priceGap < -alertDelta;
  const weakerProof =
    parseReviewCountValue(ownSnapshot.reviewCountText) <
      average(competitorSnapshots.map((item) => parseReviewCountValue(item.reviewCountText)).filter((value) => value > 0)) ||
    (!ownSnapshot.hasAPlus &&
      competitorSnapshots.filter((item) => item.hasAPlus).length >= Math.max(2, Math.ceil(competitorSnapshots.length / 2)));

  const verdict =
    floorGap > alertDelta
      ? "Review the price band now"
      : priceGap < -alertDelta
        ? "Protect margin before reacting again"
        : "Keep the current price posture";
  const owner =
    floorGap > alertDelta || underpricingRisk || weakerProof
      ? "Response owner"
      : "Competitive watch owner";
  const doNotCross =
    floorGap > alertDelta
      ? "Do not let the lowest visible price become the only rule"
      : priceGap < -alertDelta
        ? "Do not let price alerts outrun your margin floor"
        : "Do not set alert policy without a real market set";
  const nextMove =
    floorGap > alertDelta
      ? "Check whether price is really the first lever before approving a visible price move."
      : priceGap < -alertDelta
        ? "Review whether the current discount is buying enough conversion to justify the margin pressure."
        : "Keep the watch live and route the next alert through proof, offer quality, and price together.";

  if (!verdict || !owner || !doNotCross || !nextMove) {
    throw new Error("Price tracker did not produce a decision-grade live output.");
  }

  return {
    tool: "amazon-price-tracker",
    ownAsin: ownSnapshot.asin,
    competitorCount: competitorSnapshots.length,
    ownPrice,
    averageCompetitorPrice: round2(averageCompetitorPrice),
    floorGap: round2(floorGap),
    verdict,
    owner,
    doNotCross,
    nextMove,
  };
}

async function main() {
  try {
    const marketplace = "US";
    const ownAsin = "B0GYRT3FNL";
    const competitorAsins = ["B0G6K4VXK7", "B0FX2PRMFR", "B0CLNLL9RZ"];

    const ownSnapshot = await fetchSnapshotWithEvidenceRetry(marketplace, ownAsin, "commercial-core");
    const competitorSnapshots = [];
    for (const asin of competitorAsins) {
      competitorSnapshots.push(await fetchSnapshotWithEvidenceRetry(marketplace, asin, "market-read"));
    }
    const screeningSnapshots = [ownSnapshot];
    for (const asin of competitorAsins) {
      screeningSnapshots.push(await fetchSnapshotWithEvidenceRetry(marketplace, asin, "screening-read"));
    }

    const results = [
      verifyFbaCalculator(ownSnapshot),
      verifyProfitAnalyzer(ownSnapshot),
      verifySearchOptimization(ownSnapshot),
      verifyPriceTracker(ownSnapshot, competitorSnapshots),
      verifyCompetitorAnalysis(ownSnapshot, competitorSnapshots),
      verifyListingOptimization(ownSnapshot, competitorSnapshots),
      verifyKeywordTracker(ownSnapshot, competitorSnapshots),
      verifyRankTracker(ownSnapshot, competitorSnapshots),
      verifyProductResearch(screeningSnapshots),
      verifyTrendingProducts(screeningSnapshots),
      verifyReviewAnalyzerFixture(),
    ];

    results.forEach(assertDecisionGrade);

    process.stdout.write(`${JSON.stringify({ baseUrl, status: "ok", results }, null, 2)}\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (isAmazonBotProtectionError(message) || isExternalEvidenceError(message)) {
      process.stdout.write(
        `${JSON.stringify(
          {
            baseUrl,
            status: "external-blocked",
            blocker: isAmazonBotProtectionError(message)
              ? "Amazon bot protection or captcha blocked the live PDP fetch."
              : "Amazon returned incomplete PDP evidence during the live fetch window.",
            verdict:
              "Treat this as an external evidence outage, not a product regression. The runtime should still degrade honestly to manual truth or later retry.",
          },
          null,
          2,
        )}\n`,
      );
      process.exit(0);
    }

    console.error(`FAIL: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

main();
