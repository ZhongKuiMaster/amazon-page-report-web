import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextResponse } from "next/server";

const execFileAsync = promisify(execFile);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("imageUrl") ?? "";

  if (!imageUrl.trim()) {
    return NextResponse.json({ error: "Missing imageUrl query parameter." }, { status: 400 });
  }

  try {
    const { stdout } = await execFileAsync(
      "/Library/Frameworks/Python.framework/Versions/3.13/bin/python3",
      [
        "/Users/ortom/Documents/Amazon Page Report/web/scripts/analyze_amazon_image.py",
        imageUrl,
      ],
      { timeout: 25000, maxBuffer: 1024 * 1024 * 4 },
    );

    const payload = JSON.parse(stdout.trim()) as { error?: string };
    if (payload.error) {
      return NextResponse.json(payload, { status: 422 });
    }

    return NextResponse.json(payload, {
      headers: {
        "cache-control": "s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image audit failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
