import { NextResponse } from "next/server";

import {
  isCommercialAdminConfigured,
  listCommercialUsersForAdmin,
  verifyCommercialAdminCode,
} from "@/lib/commercial/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { adminCode?: string } | null;

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

  try {
    return NextResponse.json({ ok: true, data: await listCommercialUsersForAdmin() });
  } catch {
    return NextResponse.json({
      ok: false,
      message: "暂时无法读取用户列表，请检查 Supabase 表结构和 service role 权限。",
    });
  }
}
