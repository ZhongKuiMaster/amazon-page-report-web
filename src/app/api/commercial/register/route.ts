import { NextResponse } from "next/server";

import { registerCommercialUser } from "@/lib/commercial/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; wechatId?: string } | null;
  const email = body?.email || "";

  if (!email.trim()) {
    return NextResponse.json({
      ok: false,
      message: "请输入邮箱后注册体验次数。",
    });
  }

  try {
    return NextResponse.json({ ok: true, snapshot: await registerCommercialUser(email, body?.wechatId) });
  } catch {
    return NextResponse.json({
      ok: false,
      message: "暂时无法开通体验次数，请稍后重试或联系运营处理。",
    });
  }
}
