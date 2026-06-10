import { NextResponse } from "next/server";

import { consumeToolCredit } from "@/lib/commercial/service";
import { commercialTools, type CommercialToolId } from "@/lib/commercial/entitlements";

export const runtime = "nodejs";

function isToolId(value: string): value is CommercialToolId {
  return commercialTools.some((tool) => tool.id === value);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; toolId?: string } | null;
  const email = body?.email || "";
  const toolId = body?.toolId || "";

  if (!email.trim() || !isToolId(toolId)) {
    return NextResponse.json({
      ok: false,
      message: "请输入邮箱并选择有效工具。",
    });
  }

  try {
    return NextResponse.json({ ok: true, usage: await consumeToolCredit(email, toolId) });
  } catch {
    return NextResponse.json({
      ok: false,
      message: "暂时无法扣减使用次数，请稍后重试或联系运营处理。",
    });
  }
}
