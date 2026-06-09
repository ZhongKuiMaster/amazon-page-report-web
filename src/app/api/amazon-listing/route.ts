import { NextResponse } from "next/server";
import { fetchAmazonListingSnapshot } from "@/lib/amazon-listing-fetch";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const marketplace = searchParams.get("marketplace") ?? "US";
  const asinOrUrl = searchParams.get("asinOrUrl") ?? "";

  if (!asinOrUrl.trim()) {
    return NextResponse.json(
      { error: "Missing asinOrUrl query parameter." },
      { status: 400 },
    );
  }

  try {
    const snapshot = await fetchAmazonListingSnapshot({ marketplace, asinOrUrl });
    return NextResponse.json(snapshot, {
      headers: {
        "cache-control": "s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Amazon listing fetch error.";

    return NextResponse.json({ error: message }, { status: 422 });
  }
}
