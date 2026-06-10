import { NextResponse } from "next/server";

import { commercialTools, type CommercialToolId } from "@/lib/commercial/entitlements";
import {
  grantAdminCredits,
  isCommercialAdminConfigured,
  verifyCommercialAdminCode,
} from "@/lib/commercial/service";

export const runtime = "nodejs";

function isToolId(value: string): value is CommercialToolId {
  return commercialTools.some((tool) => tool.id === value);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    adminCode?: string;
    email?: string;
    credits?: number;
    toolId?: string;
    reason?: string;
  } | null;

  if (!isCommercialAdminConfigured()) {
    return NextResponse.json({
      ok: false,
      message: "后台管理码未配置。请在 Vercel 环境变量设置 COMMERCIAL_ADMIN_CODE。",
    });
  }

  if (!verifyCommercialAdminCode(body?.adminCode || "")) {
    return NextResponse.json({
      ok: false,
      message: "后台管理码错误。",
    });
  }

  const email = body?.email || "";
  const credits = Number(body?.credits || 0);
  const toolId = body?.toolId && isToolId(body.toolId) ? body.toolId : undefined;

  if (!email.trim() || !Number.isFinite(credits) || credits <= 0 || credits > 100) {
    return NextResponse.json({
      ok: false,
      message: "请输入邮箱，并发放 1-100 次之间的次数。",
    });
  }

  try {
    return NextResponse.json({
      ok: true,
      snapshot: await grantAdminCredits(email, Math.floor(credits), toolId, body?.reason || "admin-grant"),
    });
  } catch {
    return NextResponse.json({
      ok: false,
      message: "暂时无法发放次数，请检查 Supabase 表结构和 service role 权限。",
    });
  }
}
