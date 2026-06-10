import { NextResponse } from "next/server";

import { getEntitlements } from "@/lib/commercial/service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") || "";

  if (!email.trim()) {
    return NextResponse.json({
      ok: false,
      message: "请输入邮箱后查看次数权益。",
    });
  }

  try {
    return NextResponse.json({ ok: true, snapshot: await getEntitlements(email) });
  } catch {
    return NextResponse.json({
      ok: false,
      message: "暂时无法读取次数权益，请稍后重试或联系运营处理。",
    });
  }
}
