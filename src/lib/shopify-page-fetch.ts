export type ShopifyPageSnapshot = {
  sourceUrl: string;
  title: string;
  metaDescription: string;
  priceText?: string;
  heading?: string;
  buttonText?: string;
  reviewHint?: string;
  offerHint?: string;
  bodyText: string;
};

function decodeHtml(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(value: string) {
  return decodeHtml(value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
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

function truncate(value: string, limit: number) {
  return value.length <= limit ? value : `${value.slice(0, limit - 1)}…`;
}

export async function fetchShopifyPageSnapshot(sourceUrl: string) {
  const response = await fetch(sourceUrl, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      "accept-language": "en-US,en;q=0.9",
      pragma: "no-cache",
      "cache-control": "no-cache",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Shopify page request failed with ${response.status}.`);
  }

  const html = await response.text();
  const title = matchFirst(html, [/<title>\s*([^<]+)\s*<\/title>/i, /<meta property="og:title" content="([^"]+)"/i]);
  const metaDescription = matchFirst(html, [/<meta name="description" content="([^"]+)"/i, /<meta property="og:description" content="([^"]+)"/i]);
  const heading = matchFirst(html, [/<h1[^>]*>\s*([\s\S]*?)\s*<\/h1>/i]);
  const priceText = matchFirst(html, [
    /<meta property="product:price:amount" content="([^"]+)"/i,
    /<span[^>]*class="[^"]*price[^"]*"[^>]*>\s*([^<]+)\s*<\/span>/i,
    /<span[^>]*class="[^"]*money[^"]*"[^>]*>\s*([^<]+)\s*<\/span>/i,
  ]);
  const buttonText = matchFirst(html, [
    /<button[^>]*type="submit"[^>]*>\s*([\s\S]*?)\s*<\/button>/i,
    /<button[^>]*>\s*(Add to cart|Buy now|Shop now|Get yours today)\s*<\/button>/i,
  ]);
  const reviewHint = matchFirst(html, [
    /(rated\s+[0-9.]+\s+out of 5[\s\S]{0,80})/i,
    /([0-9.,]+\s+reviews?)/i,
    /(testimonial[\s\S]{0,80})/i,
  ]);
  const offerHint = matchFirst(html, [
    /(free shipping[\s\S]{0,80})/i,
    /(save\s+\d+%[\s\S]{0,80})/i,
    /(bundle[\s\S]{0,80})/i,
    /(limited time[\s\S]{0,80})/i,
  ]);

  const bodyText = truncate(stripTags(html), 6000);

  return {
    sourceUrl,
    title,
    metaDescription,
    priceText,
    heading,
    buttonText,
    reviewHint,
    offerHint,
    bodyText,
  } satisfies ShopifyPageSnapshot;
}
