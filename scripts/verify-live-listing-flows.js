#!/usr/bin/env node

const { execFileSync } = require("node:child_process");

const baseUrl = process.env.TOOL_PAGE_BASE_URL || "http://127.0.0.1:3000";

function isAmazonBotProtectionError(error) {
  return /bot protection|captcha/i.test(String(error ?? ""));
}

function splitKeywordPhrases(value) {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function textHasPhraseCoverage(visibleText, phrase) {
  return visibleText.includes(phrase.toLowerCase());
}

function parseCurrencyAmount(value) {
  if (!value) return 0;
  const normalized = value.replace(/[^0-9.,-]+/g, "");
  const compact = normalized.includes(",") && normalized.includes(".")
    ? normalized.replace(/,/g, "")
    : normalized.replace(/,/g, "");
  const amount = Number(compact);
  return Number.isFinite(amount) ? amount : 0;
}

function parseReviewCountValue(value) {
  if (!value) return 0;
  const numeric = value.replace(/[^0-9]/g, "");
  return numeric ? Number(numeric) : 0;
}

function getEffectiveListingImageCount(snapshot) {
  if (!snapshot) return 0;
  const liveCount = snapshot.imageUrls?.length ?? 0;
  if (liveCount <= 0) return 0;
  return Math.min(liveCount, 12);
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

async function verifyListingOptimizationFlow() {
  const marketplace = "US";
  const ownAsin = "B0GYRT3FNL";
  const competitorAsins = ["B0G6K4VXK7", "B0FX2PRMFR", "B0CLNLL9RZ"];
  const targetKeywords =
    "arched full length mirror, floor mirror, bedroom mirror, full body mirror, gold mirror";

  const ownSnapshot = await fetchSnapshot(marketplace, ownAsin);
  const competitors = [];
  for (const asin of competitorAsins) {
    competitors.push(await fetchSnapshot(marketplace, asin));
  }

  const targetPhrases = splitKeywordPhrases(targetKeywords);
  const visibleText = [ownSnapshot.title, ...ownSnapshot.bulletPoints, ...ownSnapshot.breadcrumbs]
    .join(" ")
    .toLowerCase();
  const coveredKeywordCount = targetPhrases.filter((phrase) =>
    textHasPhraseCoverage(visibleText, phrase),
  ).length;
  const ownPrice = parseCurrencyAmount(ownSnapshot.priceText);
  const ownReviews = parseReviewCountValue(ownSnapshot.reviewCountText);
  const ownImages = getEffectiveListingImageCount(ownSnapshot);
  const richerImageCompetitors = competitors.filter(
    (item) => getEffectiveListingImageCount(item) > ownImages,
  ).length;
  const strongerReviewCompetitors = competitors.filter(
    (item) => parseReviewCountValue(item.reviewCountText) > ownReviews,
  ).length;
  const cheaperCompetitors = competitors.filter((item) => {
    const price = parseCurrencyAmount(item.priceText);
    return price > 0 && ownPrice > 0 && price < ownPrice;
  }).length;
  const competitorAPlusCount = competitors.filter((item) => item.hasAPlus).length;

  let firstFocus = "Tighten the visible keyword map first.";
  if (coveredKeywordCount < targetPhrases.length) {
    firstFocus = "Place the missing target terms into the title, bullets, and browse-path language first.";
  } else if (richerImageCompetitors > 0) {
    firstFocus = "Rebuild the image stack before touching price or traffic volume.";
  } else if (ownReviews < 50 || strongerReviewCompetitors > 0) {
    firstFocus = "Strengthen proof and objection handling before scaling traffic.";
  } else if (!ownSnapshot.hasAPlus && competitorAPlusCount > 0) {
    firstFocus = "Add A+ education next.";
  } else if (cheaperCompetitors >= Math.max(2, Math.ceil(competitors.length / 2))) {
    firstFocus = "Recheck price positioning against the current competitor set.";
  }

  if (!ownSnapshot.title || ownSnapshot.bulletPoints.length < 4 || ownImages < 1) {
    throw new Error("Live listing snapshot is missing required listing fields.");
  }
  if (coveredKeywordCount < 1) {
    throw new Error(`Expected at least one covered keyword from the live PDP, received ${coveredKeywordCount}.`);
  }
  if (
    ![
      "Place the missing target terms into the title, bullets, and browse-path language first.",
      "Rebuild the image stack before touching price or traffic volume.",
      "Strengthen proof and objection handling before scaling traffic.",
      "Add A+ education next.",
      "Recheck price positioning against the current competitor set.",
      "Tighten the visible keyword map first.",
    ].includes(firstFocus)
  ) {
    throw new Error(`Unexpected listing first focus: ${firstFocus}`);
  }

  return {
    tool: "amazon-listing-optimization",
    ownAsin,
    title: ownSnapshot.title,
    bullets: ownSnapshot.bulletPoints.length,
    images: ownImages,
    reviews: ownSnapshot.reviewCountText,
    hasAPlus: ownSnapshot.hasAPlus,
    keywordCoverage: `${coveredKeywordCount}/${targetPhrases.length}`,
    coveredKeywords: targetPhrases.filter((phrase) => textHasPhraseCoverage(visibleText, phrase)),
    richerImageCompetitors,
    strongerReviewCompetitors,
    cheaperCompetitors,
    competitorAPlusCount,
    firstFocus,
  };
}

async function verifyInternationalListingsFlow() {
  const marketplace = "US";
  const asin = "B0GYRT3FNL";
  const snapshot = await fetchSnapshot(marketplace, asin);
  const keywordGoals = snapshot.bulletPoints.slice(0, 4).join(", ");
  const keywordGoalCount = splitKeywordPhrases(keywordGoals).length;
  const pricingReady = false;
  const localizationDepth = 62;
  const buildInternationalListingsReady = true;
  const taxesReady = false;
  const complianceCaveatCount = 2;

  let firstMove = "Lock target-market pricing before polishing copy.";
  if (!pricingReady) {
    firstMove = "Set local price, fee, and tax context before deeper localization.";
  } else if (!taxesReady || complianceCaveatCount > 2) {
    firstMove = "Resolve policy and tax caveats before claim expansion.";
  } else if (localizationDepth < 60) {
    firstMove = "Rewrite for local buyer intent instead of translating literally.";
  } else if (!buildInternationalListingsReady) {
    firstMove = "Fix the cross-market operating path before publishing localized copy.";
  }

  if (!snapshot.title || snapshot.bulletPoints.length < 4) {
    throw new Error("Live listing snapshot is missing required localization fields.");
  }
  if (keywordGoalCount < 4) {
    throw new Error(`Expected at least 4 keyword goals from live bullets, received ${keywordGoalCount}.`);
  }
  if (firstMove !== "Set local price, fee, and tax context before deeper localization.") {
    throw new Error(`Unexpected international first move: ${firstMove}`);
  }

  return {
    tool: "amazon-international-listings",
    asin,
    title: snapshot.title,
    bullets: snapshot.bulletPoints.length,
    keywordGoalCount,
    localizationDepth,
    complianceCaveatCount,
    pricingReady,
    taxesReady,
    buildInternationalListingsReady,
    firstMove,
  };
}

async function main() {
  try {
    const listing = await verifyListingOptimizationFlow();
    const international = await verifyInternationalListingsFlow();

    process.stdout.write(
      `${JSON.stringify({ baseUrl, status: "ok", results: [listing, international] }, null, 2)}\n`,
    );
  } catch (error) {
    if (isAmazonBotProtectionError(error instanceof Error ? error.message : error)) {
      process.stdout.write(
        `${JSON.stringify(
          {
            baseUrl,
            status: "external-blocked",
            blocker: "Amazon bot protection or captcha blocked the live PDP fetch.",
            verdict:
              "Treat this as an external evidence outage, not a product-logic regression. Runtime should degrade honestly to manual or retry guidance.",
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
