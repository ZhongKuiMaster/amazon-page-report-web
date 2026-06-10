import { NextResponse } from "next/server";

import { fetchAmazonListingSnapshot } from "@/lib/amazon-listing-fetch";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const marketplace = searchParams.get("marketplace") || "US";
  const asinOrUrl = searchParams.get("asinOrUrl") || "";

  try {
    const snapshot = await fetchAmazonListingSnapshot({ marketplace, asinOrUrl });
    return NextResponse.json({ ok: true, snapshot });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message:
          "We could not import this public Amazon listing right now. Please fill the listing details manually.",
      },
      { status: 200 },
    );
  }
}
