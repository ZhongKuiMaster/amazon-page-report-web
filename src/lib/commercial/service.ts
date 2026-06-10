import {
  commercialTools,
  getInitialCreditsByTool,
  getWechatBonusCreditsByTool,
  type CommercialToolId,
} from "@/lib/commercial/entitlements";
import {
  isCommercialBackendConfigured,
  supabaseInsert,
  supabasePatch,
  supabaseSelect,
} from "@/lib/commercial/supabase-rest";

type CommercialUserRow = {
  id: string;
  email: string;
  wechat_id?: string | null;
  created_at?: string;
};

type BalanceRow = {
  user_id: string;
  tool_id: CommercialToolId;
  remaining_credits: number;
  updated_at?: string;
};

type RedemptionCodeRow = {
  code: string;
  source: string;
  redeemed_by?: string | null;
  redeemed_at?: string | null;
  expires_at?: string | null;
};

type LedgerRow = {
  user_id: string;
  tool_id: CommercialToolId;
  delta: number;
  reason: string;
  created_at?: string;
};

export type EntitlementSnapshot = {
  configured: boolean;
  user: { id: string; email: string; wechatId?: string | null } | null;
  balances: Array<{
    toolId: CommercialToolId;
    name: string;
    zhName: string;
    remainingCredits: number;
  }>;
  message?: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function safeEmailQuery(email: string) {
  return `email=eq.${encodeURIComponent(normalizeEmail(email))}&select=id,email,wechat_id,created_at&limit=1`;
}

function toSnapshot(user: CommercialUserRow | null, balances: BalanceRow[], message?: string): EntitlementSnapshot {
  return {
    configured: true,
    user: user
      ? {
          id: user.id,
          email: user.email,
          wechatId: user.wechat_id ?? null,
        }
      : null,
    balances: commercialTools.map((tool) => {
      const balance = balances.find((item) => item.tool_id === tool.id);
      return {
        toolId: tool.id,
        name: tool.name,
        zhName: tool.zhName,
        remainingCredits: balance?.remaining_credits ?? 0,
      };
    }),
    message,
  };
}

export function unconfiguredSnapshot(): EntitlementSnapshot {
  return {
    configured: false,
    user: null,
    balances: commercialTools.map((tool) => ({
      toolId: tool.id,
      name: tool.name,
      zhName: tool.zhName,
      remainingCredits: tool.id === "ads-workbench" ? 1 : 0,
    })),
    message: "Commercial backend is not configured yet.",
  };
}

async function findUser(email: string) {
  const rows = await supabaseSelect<CommercialUserRow>("commercial_users", safeEmailQuery(email));
  return rows[0] ?? null;
}

async function getBalances(userId: string) {
  return supabaseSelect<BalanceRow>(
    "tool_credit_balances",
    `user_id=eq.${encodeURIComponent(userId)}&select=user_id,tool_id,remaining_credits,updated_at`,
  );
}

async function grantCredits(userId: string, creditsByTool: Record<CommercialToolId, number>, reason: string) {
  const current = await getBalances(userId);
  const balancePayload = commercialTools.map((tool) => {
    const existing = current.find((item) => item.tool_id === tool.id);
    return {
      user_id: userId,
      tool_id: tool.id,
      remaining_credits: (existing?.remaining_credits ?? 0) + creditsByTool[tool.id],
      updated_at: new Date().toISOString(),
    };
  });

  await Promise.all(
    balancePayload.map((row) =>
      current.some((item) => item.tool_id === row.tool_id)
        ? supabasePatch("tool_credit_balances", `user_id=eq.${encodeURIComponent(userId)}&tool_id=eq.${row.tool_id}`, row)
        : supabaseInsert("tool_credit_balances", row),
    ),
  );

  await supabaseInsert(
    "tool_credit_ledger",
    commercialTools.map((tool) => ({
      user_id: userId,
      tool_id: tool.id,
      delta: creditsByTool[tool.id],
      reason,
    })),
  );
}

function emptyCredits() {
  return Object.fromEntries(commercialTools.map((tool) => [tool.id, 0])) as Record<CommercialToolId, number>;
}

export async function getEntitlements(email: string): Promise<EntitlementSnapshot> {
  if (!isCommercialBackendConfigured()) {
    return unconfiguredSnapshot();
  }

  const user = await findUser(email);
  if (!user) {
    return toSnapshot(null, [], "User has not registered yet.");
  }

  return toSnapshot(user, await getBalances(user.id));
}

export async function registerCommercialUser(email: string, wechatId?: string) {
  if (!isCommercialBackendConfigured()) {
    return unconfiguredSnapshot();
  }

  const normalizedEmail = normalizeEmail(email);
  const existing = await findUser(normalizedEmail);
  if (existing) {
    if (wechatId && wechatId !== existing.wechat_id) {
      await supabasePatch("commercial_users", `id=eq.${encodeURIComponent(existing.id)}`, { wechat_id: wechatId });
    }
    return toSnapshot(existing, await getBalances(existing.id), "Account already exists.");
  }

  const rows = await supabaseInsert<CommercialUserRow>("commercial_users", {
    email: normalizedEmail,
    wechat_id: wechatId || null,
  });
  const user = rows[0];
  if (!user) {
    throw new Error("COMMERCIAL_REGISTER_FAILED");
  }

  await grantCredits(user.id, getInitialCreditsByTool(), "registration");
  return toSnapshot(user, await getBalances(user.id), "Registration trial credits granted.");
}

export async function redeemWechatCode(email: string, code: string) {
  if (!isCommercialBackendConfigured()) {
    return unconfiguredSnapshot();
  }

  const user = await findUser(email);
  if (!user) {
    return toSnapshot(null, [], "Register before redeeming a community code.");
  }

  const rows = await supabaseSelect<RedemptionCodeRow>(
    "redemption_codes",
    `code=eq.${encodeURIComponent(code.trim())}&select=code,source,redeemed_by,redeemed_at,expires_at&limit=1`,
  );
  const redemption = rows[0];
  if (!redemption || redemption.redeemed_by) {
    return toSnapshot(user, await getBalances(user.id), "This code is invalid or already redeemed.");
  }

  await supabasePatch("redemption_codes", `code=eq.${encodeURIComponent(redemption.code)}`, {
    redeemed_by: user.id,
    redeemed_at: new Date().toISOString(),
  });
  await grantCredits(user.id, getWechatBonusCreditsByTool(), "wechat-community");

  return toSnapshot(user, await getBalances(user.id), "Community bonus credits granted.");
}

export async function consumeToolCredit(email: string, toolId: CommercialToolId) {
  if (!isCommercialBackendConfigured()) {
    return {
      configured: false,
      ok: false,
      remainingCredits: 0,
      message: "Commercial backend is not configured yet.",
    };
  }

  const user = await findUser(email);
  if (!user) {
    return {
      configured: true,
      ok: false,
      remainingCredits: 0,
      message: "Register before using paid AI report credits.",
    };
  }

  const balances = await getBalances(user.id);
  const balance = balances.find((item) => item.tool_id === toolId);
  const currentCredits = balance?.remaining_credits ?? 0;

  if (!balance) {
    return {
      configured: true,
      ok: false,
      remainingCredits: 0,
      message: "No credits found for this tool.",
    };
  }

  if (currentCredits <= 0) {
    return {
      configured: true,
      ok: false,
      remainingCredits: currentCredits,
      message: "No remaining credits.",
    };
  }

  const nextCredits = currentCredits - 1;
  await supabasePatch("tool_credit_balances", `user_id=eq.${encodeURIComponent(user.id)}&tool_id=eq.${toolId}`, {
    remaining_credits: nextCredits,
    updated_at: new Date().toISOString(),
  });
  await supabaseInsert("tool_credit_ledger", {
    user_id: user.id,
    tool_id: toolId,
    delta: -1,
    reason: "tool-run",
  });

  return {
    configured: true,
    ok: true,
    remainingCredits: nextCredits,
    message: "Credit consumed.",
  };
}

export function isCommercialAdminConfigured() {
  return Boolean(process.env.COMMERCIAL_ADMIN_CODE?.trim());
}

export function verifyCommercialAdminCode(code: string) {
  const expected = process.env.COMMERCIAL_ADMIN_CODE?.trim();
  return Boolean(expected && code.trim() === expected);
}

export async function listCommercialUsersForAdmin() {
  if (!isCommercialBackendConfigured()) {
    return {
      configured: false,
      users: [],
      message: "Commercial backend is not configured yet.",
    };
  }

  const users = await supabaseSelect<CommercialUserRow>(
    "commercial_users",
    "select=id,email,wechat_id,created_at&order=created_at.desc&limit=100",
  );
  const balances = await supabaseSelect<BalanceRow>(
    "tool_credit_balances",
    "select=user_id,tool_id,remaining_credits,updated_at",
  );
  const ledger = await supabaseSelect<LedgerRow>(
    "tool_credit_ledger",
    "select=user_id,tool_id,delta,reason,created_at&order=created_at.desc&limit=200",
  );

  return {
    configured: true,
    users: users.map((user) => ({
      id: user.id,
      email: user.email,
      wechatId: user.wechat_id ?? null,
      createdAt: user.created_at ?? null,
      balances: commercialTools.map((tool) => ({
        toolId: tool.id,
        name: tool.name,
        zhName: tool.zhName,
        remainingCredits: balances.find((item) => item.user_id === user.id && item.tool_id === tool.id)?.remaining_credits ?? 0,
      })),
      recentLedger: ledger
        .filter((item) => item.user_id === user.id)
        .slice(0, 5)
        .map((item) => ({
          toolId: item.tool_id,
          delta: item.delta,
          reason: item.reason,
          createdAt: item.created_at ?? null,
        })),
    })),
  };
}

export async function grantAdminCredits(email: string, credits: number, toolId?: CommercialToolId, reason = "admin-grant") {
  if (!isCommercialBackendConfigured()) {
    return unconfiguredSnapshot();
  }

  const normalizedEmail = normalizeEmail(email);
  const existing = await findUser(normalizedEmail);
  const user = existing ?? (await supabaseInsert<CommercialUserRow>("commercial_users", { email: normalizedEmail }))[0];

  if (!user) {
    throw new Error("COMMERCIAL_ADMIN_GRANT_FAILED");
  }

  const creditsByTool = emptyCredits();
  if (toolId) {
    creditsByTool[toolId] = credits;
  } else {
    for (const tool of commercialTools) {
      creditsByTool[tool.id] = credits;
    }
  }

  await grantCredits(user.id, creditsByTool, reason);
  return toSnapshot(user, await getBalances(user.id), "Admin credits granted.");
}
