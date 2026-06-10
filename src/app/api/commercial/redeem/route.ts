import { NextResponse } from "next/server";

import { redeemWechatCode } from "@/lib/commercial/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; code?: string } | null;
  const email = body?.email || "";
  const code = body?.code || "";

  if (!email.trim() || !code.trim()) {
    return NextResponse.json({
      ok: false,
      message: "请输入邮箱和加群兑换码。",
    });
  }

  try {
    return NextResponse.json({ ok: true, snapshot: await redeemWechatCode(email, code) });
  } catch {
    return NextResponse.json({
      ok: false,
      message: "暂时无法兑换加群次数，请稍后重试或联系运营处理。",
    });
  }
}
