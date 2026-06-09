import { NextResponse } from "next/server";
import { fetchShopifyPageSnapshot } from "@/lib/shopify-page-fetch";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageUrl = searchParams.get("pageUrl") ?? "";

  if (!pageUrl.trim()) {
    return NextResponse.json({ error: "Missing pageUrl query parameter." }, { status: 400 });
  }

  try {
    const snapshot = await fetchShopifyPageSnapshot(pageUrl);
    return NextResponse.json(snapshot, {
      headers: {
        "cache-control": "s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Shopify page fetch error.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
