#!/usr/bin/env node

const baseUrl = process.env.TOOL_PAGE_BASE_URL || "http://127.0.0.1:3001";

function tokenizeWords(value) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter(Boolean);
}

function uniqueWords(words) {
  return Array.from(new Set(words));
}

function buildLiveKeywordSeed(snapshot) {
  const phraseSet = new Set();
  const titlePhrases = snapshot.title
    .split(/[,:|]+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 8);
  const bulletPhrases = snapshot.bulletPoints
    .slice(0, 2)
    .map((item) => item.trim())
    .filter((item) => item.length >= 8);
  const browsePhrase = snapshot.breadcrumbs[snapshot.breadcrumbs.length - 1]?.trim();

  for (const phrase of [...titlePhrases, ...bulletPhrases, browsePhrase]) {
    if (!phrase) continue;
    const normalized = phrase.replace(/\s+/g, " ").replace(/[^\w\s&/-]+/g, "").trim();
    if (normalized.length >= 4) {
      phraseSet.add(normalized);
    }
    if (phraseSet.size >= 5) break;
  }

  return Array.from(phraseSet).slice(0, 5).join(", ");
}

function inferCategory(snapshot) {
  const breadcrumbText = snapshot.breadcrumbs.join(" / ").toLowerCase();
  const matchers = [
    ["beauty", "beauty__root-beauty", "Beauty"],
    ["pet supplies", "pet__root-pet-supplies", "Pet Supplies"],
    ["mirrors", "home__root-home-kitchen-tth", "Home & Kitchen"],
    ["candles", "home__root-home-kitchen-tth", "Home & Kitchen"],
    ["clothing", "fashion__root-clothing-shoes-jewelry", "Clothing, Shoes & Jewelry"],
  ];

  for (const [needle, value, label] of matchers) {
    if (breadcrumbText.includes(needle)) {
      return { value, label };
    }
  }

  return { value: "home__root-home-kitchen-tth", label: "Home & Kitchen" };
}

function verifyTitleTool(snapshot) {
  const category = inferCategory(snapshot);
  const normalizedTitle = snapshot.title.toLowerCase();
  const titleWords = tokenizeWords(snapshot.title);
  const brandWords = tokenizeWords(snapshot.brand || "");
  const repeated = Array.from(
    titleWords.reduce((map, word) => {
      map.set(word, (map.get(word) ?? 0) + 1);
      return map;
    }, new Map()),
  )
    .filter(([word, count]) => count > 1 && word.length > 2 && !brandWords.includes(word))
    .sort((a, b) => b[1] - a[1]);
  const coreAttributes = snapshot.bulletPoints.slice(0, 3).join(", ").slice(0, 260);
  const attributeTerms = uniqueWords(
    coreAttributes
      .split(/[,\n/]+/)
      .map((item) => item.trim().toLowerCase())
      .filter((item) => item.length >= 4)
      .flatMap((item) => {
        const phraseTokens = item.split(/[^a-z0-9]+/).filter((token) => token.length > 2);
        const collapsed = phraseTokens.slice(0, 3).join(" ").trim();
        return collapsed ? [collapsed] : [];
      }),
  );
  const covered = attributeTerms.filter((term) => normalizedTitle.includes(term));
  const missing = attributeTerms.filter((term) => !covered.includes(term));
  const firstMove = repeated.length
    ? "Strip repetition"
    : missing.length
      ? "Add missing descriptors"
      : "Refine order only";

  if (!snapshot.title || !snapshot.brand) {
    throw new Error("Title tool: missing live title or brand.");
  }

  return {
    tool: "amazon-listing-title-checker",
    asin: snapshot.asin,
    category: category.label,
    repeatedWordCount: repeated.length,
    missingDescriptorCount: missing.length,
    firstMove,
  };
}

function verifyImageTool(snapshot) {
  const imageCount = snapshot.imageUrls.length;
  const lifestyleImages = imageCount >= 6 ? 1 : 0;
  const detailImages = Math.min(4, Math.max(1, imageCount - 2));
  const infographicImages = snapshot.hasAPlus ? 1 : 0;
  const supportGaps = [
    lifestyleImages < 1 ? "Lifestyle" : "",
    detailImages < 2 ? "Detail" : "",
    infographicImages < 1 ? "Infographic" : "",
  ].filter(Boolean);
  const overbuiltSet = imageCount >= 10 && supportGaps.length === 0;
  const firstMove = supportGaps.length
    ? "Fill missing roles"
    : overbuiltSet
      ? "Reorder and trim weak frames"
      : "Upgrade weakest asset";

  if (imageCount < 1) {
    throw new Error("Image tool: live listing has no images.");
  }

  return {
    tool: "amazon-image-compliance-checker",
    asin: snapshot.asin,
    imageCount,
    supportGaps,
    firstMove,
  };
}

function verifyVariationTool(snapshot) {
  const colorCount = snapshot.colorOptions.length;
  const sizeCount = snapshot.sizeOptions.length;
  const variationTheme =
    colorCount >= 2 ? "color" : sizeCount >= 2 ? "size" : /pack|count|set/i.test(snapshot.title) ? "pack" : "style";
  const childCount = Math.max(colorCount, sizeCount, 1);
  const mixedBundleLogic =
    variationTheme !== "pack" && /bundle|kit|set of|multi-pack/i.test(snapshot.title);
  const hasVisibleFamilySignal = colorCount > 1 || sizeCount > 1;
  const standaloneLikely = !hasVisibleFamilySignal && childCount <= 1 && !mixedBundleLogic;
  const firstMove = standaloneLikely
    ? "Do not force a parent-child merge"
    : !hasVisibleFamilySignal
      ? "Treat as standalone until proven otherwise"
      : mixedBundleLogic
        ? "Split bundle logic out"
        : "Validate allowed theme";

  return {
    tool: "amazon-variation-relationship-checker",
    asin: snapshot.asin,
    variationTheme,
    childCount,
    hasVisibleFamilySignal,
    mixedBundleLogic,
    standaloneLikely,
    firstMove,
  };
}

function verifyBrowseTool(snapshot) {
  const category = inferCategory(snapshot);
  const listingTitle = snapshot.title;
  const itemType = snapshot.breadcrumbs[snapshot.breadcrumbs.length - 1] ?? "";
  const backendTerms = [
    snapshot.brand,
    ...snapshot.bulletPoints.slice(0, 3),
    itemType,
  ]
    .join(" ")
    .slice(0, 240);
  const coreKeywords = buildLiveKeywordSeed(snapshot);
  const titleWords = uniqueWords(tokenizeWords(listingTitle).filter((word) => word.length > 2));
  const backendWords = uniqueWords(tokenizeWords(backendTerms).filter((word) => word.length > 2));
  const keywordPhrases = coreKeywords.split(/[\n,]+/).map((item) => item.trim()).filter(Boolean);
  const keywordWords = uniqueWords(
    keywordPhrases.flatMap((phrase) => tokenizeWords(phrase).filter((word) => word.length > 2)),
  );
  const missingWords = keywordWords.filter((word) => !titleWords.includes(word) && !backendWords.includes(word));
  const overlapWords = backendWords.filter((word) => titleWords.includes(word));
  const itemTypeWords = uniqueWords(tokenizeWords(itemType).filter((word) => word.length > 2));
  const browseCoverage = itemTypeWords.length
    ? Math.round((itemTypeWords.filter((word) => titleWords.includes(word)).length / itemTypeWords.length) * 100)
    : 100;
  const firstMove = overlapWords.length >= Math.max(6, missingWords.length * 2)
    ? "Trim backend duplicates"
    : missingWords.length
      ? "Place missing demand terms"
      : "Test better browse wording";

  if (!coreKeywords) {
    throw new Error("Browse tool: failed to derive live keyword seed.");
  }

  return {
    tool: "amazon-browse-search-keyword-checker",
    asin: snapshot.asin,
    category: category.label,
    keywordSeedCount: keywordPhrases.length,
    missingWordCount: missingWords.length,
    overlapWordCount: overlapWords.length,
    browseCoverage,
    firstMove,
  };
}

function verifyBrandRegistryTool(snapshot) {
  const liveBrand = (snapshot.brand || "").trim();
  const breadcrumbText = snapshot.breadcrumbs.join(" / ").toLowerCase();
  const listingsLive = snapshot.title ? 1 : 0;
  const exactBrandMatch = liveBrand.length > 0;
  const logoOnProductLikely = snapshot.imageUrls.length >= 3;
  const logoOnPackagingLikely = /box|pack|set|gift|kit/i.test(snapshot.title) || snapshot.imageUrls.length >= 5;
  const firstMove =
    !liveBrand
      ? "Fix live brand attribution first"
      : !logoOnProductLikely && !logoOnPackagingLikely
        ? "Add permanent brand proof"
        : "Prepare the application packet";

  return {
    tool: "amazon-brand-registry",
    asin: snapshot.asin,
    liveBrand: liveBrand || "Unknown",
    listingsLive,
    exactBrandMatch,
    logoOnProductLikely,
    logoOnPackagingLikely,
    categoryHint: breadcrumbText || "Unknown",
    firstMove,
  };
}

function verifyUngatingTool(snapshot) {
  const category = inferCategory(snapshot);
  const restrictionLevel = /supplement|ingest|vitamin|beauty|skin|health/i.test(
    `${snapshot.title} ${snapshot.breadcrumbs.join(" ")}`,
  )
    ? "brand"
    : "category";
  const likelyNeedsSafetyDocs = /beauty|health|grocery|topical|supplement/i.test(
    `${snapshot.title} ${snapshot.breadcrumbs.join(" ")}`.toLowerCase(),
  );
  const firstMove =
    likelyNeedsSafetyDocs
      ? "Collect invoices and safety documents first"
      : restrictionLevel === "brand"
        ? "Get brand authorization before applying"
        : "Strengthen invoice packet before applying";

  return {
    tool: "amazon-category-ungating",
    asin: snapshot.asin,
    inferredCategory: category.label,
    restrictionLevel,
    likelyNeedsSafetyDocs,
    imageCount: snapshot.imageUrls.length,
    firstMove,
  };
}

function verifySalesEstimatorTool(snapshot) {
  const category = inferCategory(snapshot);
  const bsrText = snapshot.bestSellersRank || snapshot.subCategoryRank || "";
  const bsrMatch = bsrText.match(/#([\d,]+)/);
  const bsr = bsrMatch ? Number(bsrMatch[1].replace(/,/g, "")) : 0;
  const priceMatch = (snapshot.priceText || "").match(/-?\d+(?:\.\d+)?/);
  const sellingPrice = priceMatch ? Number(priceMatch[0].replace(/,/g, "")) : 0;
  const monthlyUnits =
    bsr <= 0
      ? 0
      : Math.max(
          1,
          Math.round(250000 / Math.pow(Math.max(bsr, 1), category.label === "Home & Kitchen" ? 0.62 : 0.64)),
        );
  const monthlyRevenue = monthlyUnits * sellingPrice;
  const firstMove =
    monthlyUnits < 120
      ? "Do not trust demand alone"
      : bsr > 30000
        ? "Validate with nearby ASINs"
        : monthlyRevenue < 5000
          ? "Check margin before entry"
          : "Push into profit analysis";

  return {
    tool: "amazon-sales-estimator",
    asin: snapshot.asin,
    category: category.label,
    bsr,
    sellingPrice,
    monthlyUnits,
    monthlyRevenue,
    firstMove,
  };
}

function verifyProfitAnalyzerTool(snapshot) {
  const category = inferCategory(snapshot);
  const priceMatch = (snapshot.priceText || "").match(/-?\d+(?:\.\d+)?/);
  const sellingPrice = priceMatch ? Number(priceMatch[0].replace(/,/g, "")) : 0;
  const assumedCost = sellingPrice > 0 ? round2(sellingPrice * 0.32) : 0;
  const assumedInbound = sellingPrice > 0 ? round2(Math.max(1.25, sellingPrice * 0.06)) : 0;
  const assumedFulfillment = sellingPrice > 0 ? round2(Math.max(3.8, sellingPrice * 0.18)) : 0;
  const assumedAds = sellingPrice > 0 ? round2(sellingPrice * 0.14) : 0;
  const assumedReturns = round2((assumedCost + assumedInbound + assumedFulfillment * 0.35) * 0.04);
  const assumedStorage = round2(Math.max(0.2, sellingPrice * 0.008));
  const assumedOverhead = round2(Math.max(0.4, sellingPrice * 0.015));
  const referralFee = round2(sellingPrice * 0.15);
  const preAdContribution =
    sellingPrice - referralFee - assumedCost - assumedInbound - assumedFulfillment - assumedStorage - assumedOverhead;
  const netProfit = round2(preAdContribution - assumedAds - assumedReturns);
  const marginRate = sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0;
  const firstMove =
    preAdContribution <= 0
      ? "Fix core unit economics first"
      : marginRate < 12
        ? "Tighten leaks before growth"
        : "Model scale scenarios";

  return {
    tool: "amazon-profit-analyzer",
    asin: snapshot.asin,
    category: category.label,
    sellingPrice,
    assumedCost,
    preAdContribution,
    netProfit,
    marginRate: round2(marginRate),
    firstMove,
  };
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

async function fetchSnapshot(asin) {
  const response = await fetch(
    `${baseUrl}/api/amazon-listing?marketplace=US&asinOrUrl=${encodeURIComponent(asin)}`,
  );
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`${asin} failed with ${response.status}: ${payload.error || "Unknown error"}`);
  }
  return payload;
}

async function main() {
  const asins = ["B0GYRT3FNL", "B0DZFGTCLR"];
  const results = [];

  for (const asin of asins) {
    const snapshot = await fetchSnapshot(asin);
    results.push(verifyTitleTool(snapshot));
    results.push(verifyImageTool(snapshot));
    results.push(verifyVariationTool(snapshot));
    results.push(verifyBrowseTool(snapshot));
    results.push(verifyBrandRegistryTool(snapshot));
    results.push(verifyUngatingTool(snapshot));
    results.push(verifySalesEstimatorTool(snapshot));
    results.push(verifyProfitAnalyzerTool(snapshot));
  }

  process.stdout.write(`${JSON.stringify({ baseUrl, results }, null, 2)}\n`);
}

main().catch((error) => {
  console.error(`FAIL: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
