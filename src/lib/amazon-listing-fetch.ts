import { execFile } from "node:child_process";
import { promisify } from "node:util";

const marketplaceDomains: Record<string, string> = {
  US: "www.amazon.com",
  CA: "www.amazon.ca",
  MX: "www.amazon.com.mx",
  BR: "www.amazon.com.br",
  UK: "www.amazon.co.uk",
  DE: "www.amazon.de",
  FR: "www.amazon.fr",
  IT: "www.amazon.it",
  ES: "www.amazon.es",
  NL: "www.amazon.nl",
  SE: "www.amazon.se",
  PL: "www.amazon.pl",
  TR: "www.amazon.com.tr",
  AE: "www.amazon.ae",
  SA: "www.amazon.sa",
  EG: "www.amazon.eg",
  IN: "www.amazon.in",
  JP: "www.amazon.co.jp",
  SG: "www.amazon.sg",
  AU: "www.amazon.com.au",
};

const execFileAsync = promisify(execFile);

export type AmazonListingSnapshot = {
  asin: string;
  marketplace: string;
  canonicalUrl: string;
  sourceUrl: string;
  title: string;
  brand: string;
  brandStoreLink?: string;
  breadcrumbs: string[];
  bulletPoints: string[];
  imageUrls: string[];
  mainImageUrl?: string;
  ratingText?: string;
  reviewCountText?: string;
  priceText?: string;
  soldBy?: string;
  shipsFrom?: string;
  badges: string[];
  bestSellersRank?: string;
  subCategoryRank?: string;
  selectedColor?: string;
  colorOptions: string[];
  selectedSize?: string;
  sizeOptions: string[];
  hasAPlus: boolean;
  productDimensionsText?: string;
  itemWeightText?: string;
};

function decodeHtml(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
      String.fromCharCode(parseInt(code, 16)),
    )
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(value: string) {
  return decodeHtml(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function extractAsin(value: string) {
  const raw = value.trim();
  const direct = raw.match(/\b([A-Z0-9]{10})\b/i);
  const fromUrl = raw.match(/\/(?:dp|gp\/product|product)\/([A-Z0-9]{10})/i);
  const asin = (fromUrl?.[1] ?? direct?.[1] ?? "").toUpperCase();
  return asin.length === 10 ? asin : "";
}

function getSourceUrl(input: { marketplace: string; asinOrUrl: string }) {
  const candidate = input.asinOrUrl.trim();
  if (candidate.startsWith("http://") || candidate.startsWith("https://")) {
    return candidate;
  }

  const asin = extractAsin(candidate);
  const domain = marketplaceDomains[input.marketplace] ?? marketplaceDomains.US;
  return `https://${domain}/dp/${asin}`;
}

async function fetchListingHtml(sourceUrl: string) {
  try {
    const response = await fetch(sourceUrl, {
      headers: {
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        pragma: "no-cache",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`Amazon page request failed with ${response.status}.`);
    }

    return await response.text();
  } catch {
    return fetchListingHtmlWithPython(sourceUrl);
  }
}

async function fetchListingHtmlWithPython(sourceUrl: string) {
  const { stdout } = await execFileAsync(
    "/Library/Frameworks/Python.framework/Versions/3.13/bin/python3",
    [
      "/Users/ortom/Documents/Amazon Page Report/web/scripts/fetch_amazon_html.py",
      sourceUrl,
    ],
    { timeout: 30000, maxBuffer: 1024 * 1024 * 8 },
  );
  return stdout;
}

function matchFirst(html: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return stripTags(match[1]);
    }
  }

  return "";
}

function matchAll(html: string, pattern: RegExp) {
  return Array.from(html.matchAll(pattern)).map((match) => stripTags(match[1] ?? ""));
}

function scoreAmazonImageUrl(url: string) {
  let score = 0;
  if (/hires/i.test(url)) score += 120;
  const sl = url.match(/SL(\d{3,4})/i);
  if (sl) score += Number(sl[1]);
  const sx = url.match(/SX(\d{3,4})/i);
  if (sx) score += Number(sx[1]) * 0.6;
  const sy = url.match(/SY(\d{3,4})/i);
  if (sy) score += Number(sy[1]) * 0.6;
  if (/QL70|_ML2_/i.test(url)) score -= 50;
  if (/SX300|SY300/i.test(url)) score -= 100;
  return score;
}

function normalizeAmazonImageUrl(url: string) {
  const cleaned = decodeHtml(url.replace(/\\\//g, "/")).trim();
  return cleaned.replace(/\._[^./]+(?=\.(?:jpg|jpeg|png|webp))/i, "");
}

function getAmazonImageAssetKey(url: string) {
  const normalized = normalizeAmazonImageUrl(url);
  const match = normalized.match(/\/images\/I\/([^/?]+)\.(?:jpg|jpeg|png|webp)$/i);
  return (match?.[1] ?? normalized).toLowerCase();
}

function collectBestAmazonImages(candidates: string[], limit: number) {
  const bestByAsset = new Map<string, string>();

  for (const candidate of candidates) {
    if (!candidate || !/m\.media-amazon\.com\/images\/I\//i.test(candidate)) {
      continue;
    }

    const assetKey = getAmazonImageAssetKey(candidate);
    const current = bestByAsset.get(assetKey);
    if (!current || scoreAmazonImageUrl(candidate) > scoreAmazonImageUrl(current)) {
      bestByAsset.set(assetKey, candidate);
    }
  }

  return Array.from(bestByAsset.values())
    .sort((a, b) => scoreAmazonImageUrl(b) - scoreAmazonImageUrl(a))
    .slice(0, limit);
}

function parseImages(html: string) {
  const dynamicMatch = html.match(/"colorImages"\s*:\s*\{\s*"initial"\s*:\s*(\[[\s\S]*?\])\s*,/);
  const dynamicCandidates: string[] = [];

  if (dynamicMatch?.[1]) {
    const hiResMatches = Array.from(
      dynamicMatch[1].matchAll(/"(?:hiRes|large|mainUrl)"\s*:\s*"([^"]+)"/g),
    );
    for (const match of hiResMatches) {
      if (match[1]) {
        dynamicCandidates.push(decodeHtml(match[1].replace(/\\\//g, "/")));
      }
    }
  }

  const dynamicImages = collectBestAmazonImages(dynamicCandidates, 16);
  if (dynamicImages.length > 0) {
    return dynamicImages;
  }

  const globalCandidates: string[] = [];

  const globalHighResMatches = Array.from(
    html.matchAll(/(?:data-old-hires=|"(?:hiRes|mainUrl)"\s*:\s*)"([^"]+)"/g),
  );
  for (const match of globalHighResMatches) {
    if (match[1]) {
      globalCandidates.push(decodeHtml(match[1].replace(/\\\//g, "/")));
    }
  }

  const globalImages = collectBestAmazonImages(globalCandidates, 16);
  if (globalImages.length > 0) {
    return globalImages;
  }

  if (globalCandidates.length === 0) {
    const fallbackCandidates: string[] = [];
    const fallbackMatches = Array.from(
      html.matchAll(/https:\/\/[^"' ]+\._AC_[^"' ]+\.jpg/g),
    );
    for (const match of fallbackMatches) {
      fallbackCandidates.push(match[0]);
    }
    return collectBestAmazonImages(fallbackCandidates, 12);
  }

  return [];
}

function parseBreadcrumbs(html: string) {
  const segment = html.match(
    /id="wayfinding-breadcrumbs_feature_div"[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i,
  );
  if (!segment?.[1]) {
    return [];
  }

  return matchAll(segment[1], /<a[^>]*class="[^"]*a-link-normal[^"]*"[^>]*>([\s\S]*?)<\/a>/gi);
}

function parseBullets(html: string) {
  const segment = html.match(/id="feature-bullets"[\s\S]*?<ul[^>]*>([\s\S]*?)<\/ul>/i);
  if (!segment?.[1]) {
    return [];
  }

  return matchAll(segment[1], /<span class="a-list-item">([\s\S]*?)<\/span>/gi).filter(Boolean);
}

function parseCanonicalUrl(html: string, fallback: string) {
  const canonical = matchFirst(html, [/<link rel="canonical" href="([^"]+)"/i]);
  return canonical || fallback;
}

function parsePriceText(html: string) {
  return matchFirst(html, [
    /id="corePrice_feature_div"[\s\S]*?<span class="a-offscreen">\s*([^<]+)\s*<\/span>/i,
    /id="apex_desktop"[\s\S]*?<span class="a-offscreen">\s*([^<]+)\s*<\/span>/i,
    /class="[^"]*apex-pricetopay-value[^"]*"[\s\S]*?<span class="a-offscreen">\s*([^<]+)\s*<\/span>/i,
    /class="a-price aok-align-center[^"]*"[\s\S]*?<span class="a-offscreen">\s*([^<]+)\s*<\/span>/i,
    /class="a-price a-text-price[^"]*"[\s\S]*?<span class="a-offscreen">\s*([^<]+)\s*<\/span>/i,
    /id="twister-plus-price-data-price" value="([^"]+)"/i,
  ]);
}

function parseBadges(html: string) {
  const matches = new Set<string>();
  const patterns = [
    /Amazon's?\s+Choice/gi,
    /Best Seller/gi,
    /Climate Pledge Friendly/gi,
    /Limited time deal/gi,
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      matches.add(stripTags(match[0]));
    }
  }

  return Array.from(matches);
}

function parseBuyBoxLine(html: string, label: string) {
  const normalizedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return matchFirst(html, [
    new RegExp(
      `${normalizedLabel}<\\/span>[\\s\\S]*?<span class="a-size-small tabular-buybox-text[^"]*"[^>]*>([\\s\\S]*?)<\\/span>`,
      "i",
    ),
    new RegExp(
      `${normalizedLabel}<\\/span>[\\s\\S]*?<div class="tabular-buybox-text[^"]*"[^>]*>([\\s\\S]*?)<\\/div>`,
      "i",
    ),
    new RegExp(
      `${normalizedLabel}\\s*:<\\/span>\\s*<span class="a-size-small">\\s*([\\s\\S]*?)\\s*<\\/span>`,
      "i",
    ),
  ]);
}

function parseAbbreviatedShipFromSoldBy(html: string) {
  const section = html.match(
    /id="sfsb_accordion_head"[\s\S]*?Ships from:\s*<\/span>\s*<span class="a-size-small">\s*([\s\S]*?)\s*<\/span>[\s\S]*?Sold by:\s*<\/span>\s*<span class="a-size-small">\s*([\s\S]*?)\s*<\/span>/i,
  );

  return {
    shipsFrom: section?.[1] ? stripTags(section[1]) : "",
    soldBy: section?.[2] ? stripTags(section[2]) : "",
  };
}

function parseMerchantInfo(html: string) {
  const merchantInfo = matchFirst(html, [
    /id="merchant-info"[\s\S]*?<span>\s*Sold by\s*<\/span>([\s\S]*?)<\/div>/i,
    /id="merchant-info"[\s\S]*?class="a-section a-spacing-base">([\s\S]*?)<\/div>/i,
  ]);

  if (!merchantInfo) {
    return { soldBy: "", shipsFrom: "" };
  }

  const soldByMatch = merchantInfo.match(/Sold by\s+(.+?)(?:\s+and\s+|\.)/i);
  const fulfilledByAmazon = /Fulfilled by Amazon|ships from Amazon Fulfillment/i.test(merchantInfo);

  return {
    soldBy: soldByMatch ? stripTags(soldByMatch[1]).trim() : "",
    shipsFrom: fulfilledByAmazon ? "Amazon Fulfillment" : "",
  };
}

function parseMerchantSentenceSignals(html: string) {
  const anchorCandidates = [
    html.indexOf('id="merchant-info"'),
    html.indexOf('shipsFromSoldBy_feature_div'),
    html.indexOf('shipsFromSoldByODF_feature_div'),
    html.indexOf('desktop-merchant-info'),
    html.indexOf('corePrice_feature_div'),
  ].filter((index) => index >= 0);

  const anchor = anchorCandidates.length ? Math.min(...anchorCandidates) : 0;
  const scopedHtml =
    anchorCandidates.length
      ? html.slice(Math.max(0, anchor - 1500), Math.min(html.length, anchor + 6000))
      : html.slice(0, 8000);

  const directAmazon = scopedHtml.match(/Ships from and sold by\s+([^<.]+)\./i);
  if (directAmazon?.[1]) {
    const merchant = stripTags(directAmazon[1]).trim();
    return {
      soldBy: merchant,
      shipsFrom: merchant,
    };
  }

  const amazonFulfillment = scopedHtml.match(
    /Sold by\s+([^<.]+?)\s+and ships from\s+(Amazon Fulfillment|Amazon\.com|Amazon)\./i,
  );
  if (amazonFulfillment?.[1] || amazonFulfillment?.[2]) {
    return {
      soldBy: amazonFulfillment?.[1] ? stripTags(amazonFulfillment[1]).trim() : "",
      shipsFrom: amazonFulfillment?.[2] ? stripTags(amazonFulfillment[2]).trim() : "",
    };
  }

  const fulfilledByAmazon = scopedHtml.match(
    /Sold by\s+([^<.]+?)\s+and\s+Fulfilled by Amazon\./i,
  );
  if (fulfilledByAmazon?.[1]) {
    return {
      soldBy: stripTags(fulfilledByAmazon[1]).trim(),
      shipsFrom: "Amazon Fulfillment",
    };
  }

  return { soldBy: "", shipsFrom: "" };
}

function normalizeMerchantName(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s*[.:]\s*$/, "")
    .trim();
}

function parseRanks(html: string) {
  const rankBlock = matchFirst(html, [
    /id="SalesRank"[\s\S]*?<ul[\s\S]*?>([\s\S]*?)<\/ul>/i,
    /Best Sellers Rank[\s\S]*?<\/th>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/i,
  ]);

  if (!rankBlock) {
    return { bestSellersRank: "", subCategoryRank: "" };
  }

  const rankMatches = Array.from(rankBlock.matchAll(/#[\d,]+\s+in\s+[^<(]+/gi)).map((match) =>
    stripTags(match[0]),
  );

  return {
    bestSellersRank: rankMatches[0] ?? "",
    subCategoryRank: rankMatches[1] ?? "",
  };
}

function parseVariationGroup(
  html: string,
  containerId: string,
  selectedId: string,
) {
  const selected = matchFirst(html, [
    new RegExp(`id="${selectedId}"[\\s\\S]*?<span class="selection">([\\s\\S]*?)<\\/span>`, "i"),
    new RegExp(`id="${selectedId}"[\\s\\S]*?<span[^>]*>\\s*([\\s\\S]*?)\\s*<\\/span>`, "i"),
  ]);

  const section = html.match(new RegExp(`id="${containerId}"[\\s\\S]*?<ul[^>]*>([\\s\\S]*?)<\\/ul>`, "i"));
  if (!section?.[1]) {
    return { selected, options: [] as string[] };
  }

  const rawOptions = [
    ...matchAll(section[1], /alt="([^"]+)"/gi),
    ...matchAll(section[1], /title="([^"]+)"/gi),
    ...matchAll(section[1], /<span class="a-size-base">([\s\S]*?)<\/span>/gi),
    ...matchAll(section[1], /<p[^>]*class="[^"]*a-spacing-micro[^"]*"[^>]*>([\s\S]*?)<\/p>/gi),
  ];
  const options = Array.from(
    new Set(
      rawOptions
        .map((item) => item.replace(/^Click to select\s+/i, "").trim())
        .filter((item) => item && item.length < 80 && !/currently unavailable/i.test(item)),
    ),
  );

  return { selected, options };
}

function parseProductDetailValue(html: string, labels: string[]) {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const value = matchFirst(html, [
      new RegExp(
        `<span class="a-size-base a-text-bold">\\s*${escaped}\\s*<\\/span>[\\s\\S]*?<span class="a-size-base po-break-word">\\s*([\\s\\S]*?)\\s*<\\/span>`,
        "i",
      ),
      new RegExp(
        `<th[^>]*prodDetSectionEntry[^>]*>\\s*${escaped}\\s*<\\/th>[\\s\\S]*?<td[^>]*prodDetAttrValue[^>]*>\\s*([\\s\\S]*?)\\s*<\\/td>`,
        "i",
      ),
    ]);
    if (value) {
      return value;
    }
  }

  return "";
}

export async function fetchAmazonListingSnapshot(input: {
  marketplace: string;
  asinOrUrl: string;
}) {
  const asin = extractAsin(input.asinOrUrl);

  if (!asin) {
    throw new Error("Enter a valid ASIN or Amazon product URL.");
  }

  const sourceUrl = getSourceUrl(input);
  const html = await fetchListingHtml(sourceUrl);

  if (
    /captcha|Enter the characters you see below|Sorry, we just need to make sure/i.test(html)
  ) {
    throw new Error("Amazon returned bot protection or captcha for this request.");
  }

  const title = matchFirst(html, [
    /id="productTitle"[^>]*>\s*([\s\S]*?)\s*<\/span>/i,
    /<meta property="og:title" content="([^"]+)"/i,
    /<title>\s*([^<]+)\s*<\/title>/i,
  ]);
  const brand = matchFirst(html, [
    /id="bylineInfo"[^>]*>\s*([\s\S]*?)\s*<\/a>/i,
    /id="bylineInfo"[^>]*>\s*([\s\S]*?)\s*<\/span>/i,
  ]).replace(/^Visit the\s+/i, "").replace(/\s+Store$/i, "").trim();
  const brandStoreLink = matchFirst(html, [
    /id="bylineInfo"[^>]*href="([^"]+)"/i,
  ]);
  const ratingText = matchFirst(html, [
    /id="acrPopover"[^>]*title="([^"]+)"/i,
    /data-hook="rating-out-of-text"[^>]*>\s*([^<]+)\s*<\/span>/i,
  ]);
  const reviewCountText = matchFirst(html, [
    /id="acrCustomerReviewText"[^>]*>\s*([^<]+)\s*<\/span>/i,
  ]);
  let fallbackHtml: string | null = null;
  const getFallbackHtml = async () => {
    if (fallbackHtml !== null) {
      return fallbackHtml;
    }
    fallbackHtml = await fetchListingHtmlWithPython(sourceUrl);
    return fallbackHtml;
  };

  const collectMerchantFields = (sourceHtml: string) => {
    const merchantInfo = parseMerchantInfo(sourceHtml);
    const abbreviatedMerchant = parseAbbreviatedShipFromSoldBy(sourceHtml);
    const merchantSentenceSignals = parseMerchantSentenceSignals(sourceHtml);

    return {
      soldBy: normalizeMerchantName(
        parseBuyBoxLine(sourceHtml, "Sold by") ||
          abbreviatedMerchant.soldBy ||
          merchantInfo.soldBy ||
          merchantSentenceSignals.soldBy,
      ),
      shipsFrom: normalizeMerchantName(
        parseBuyBoxLine(sourceHtml, "Ships from") ||
          abbreviatedMerchant.shipsFrom ||
          merchantInfo.shipsFrom ||
          merchantSentenceSignals.shipsFrom,
      ),
    };
  };

  let priceText = parsePriceText(html);
  let merchantFields = collectMerchantFields(html);
  if (!priceText || (!merchantFields.soldBy && !merchantFields.shipsFrom)) {
    try {
      const richerHtml = await getFallbackHtml();
      if (!priceText) {
        priceText = parsePriceText(richerHtml);
      }
      if (!merchantFields.soldBy && !merchantFields.shipsFrom) {
        merchantFields = collectMerchantFields(richerHtml);
      }
    } catch {
      // Keep the snapshot usable even if the richer fallback request fails.
    }
  }

  const imageUrls = parseImages(html);
  const breadcrumbs = parseBreadcrumbs(html);
  const bulletPoints = parseBullets(html).slice(0, 8);
  const canonicalUrl = parseCanonicalUrl(html, sourceUrl);
  const badges = parseBadges(html);
  const ranks = parseRanks(html);
  const colorGroup = parseVariationGroup(html, "variation_color_name", "variation_color_name");
  const sizeGroup = parseVariationGroup(html, "variation_size_name", "variation_size_name");
  const hasAPlus =
    /aplus_feature_div|productDescription_feature_div|brandStory_feature_div/i.test(html);
  const productDimensionsText = parseProductDetailValue(html, [
    "Product Dimensions",
    "Item Dimensions L x W",
    "Item Dimensions",
    "Package Dimensions",
  ]);
  const itemWeightText = parseProductDetailValue(html, [
    "Item Weight",
    "Shipping Weight",
    "Package Weight",
  ]);

  if (!title) {
    throw new Error("Could not extract the live listing title from the Amazon page.");
  }

  return {
    asin,
    marketplace: input.marketplace,
    canonicalUrl,
    sourceUrl,
    title,
    brand,
    brandStoreLink: brandStoreLink
      ? brandStoreLink.startsWith("http")
        ? brandStoreLink
        : new URL(brandStoreLink, sourceUrl).toString()
      : undefined,
    breadcrumbs,
    bulletPoints,
    imageUrls,
    mainImageUrl: imageUrls[0],
    ratingText,
    reviewCountText,
    priceText,
    soldBy: merchantFields.soldBy,
    shipsFrom: merchantFields.shipsFrom,
    badges,
    bestSellersRank: ranks.bestSellersRank || undefined,
    subCategoryRank: ranks.subCategoryRank || undefined,
    selectedColor: colorGroup.selected || undefined,
    colorOptions: colorGroup.options,
    selectedSize: sizeGroup.selected || undefined,
    sizeOptions: sizeGroup.options,
    hasAPlus,
    productDimensionsText: productDimensionsText || undefined,
    itemWeightText: itemWeightText || undefined,
  } satisfies AmazonListingSnapshot;
}
