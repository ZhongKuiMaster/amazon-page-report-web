"use client";

import { useMemo, useState } from "react";
import {
  commercialTools,
  entitlementRules,
  paidPlans,
  type CommercialToolId,
} from "@/lib/commercial/entitlements";
import type { SupportedLocale } from "@/lib/i18n";

type Snapshot = {
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

type ApiResponse = {
  ok: boolean;
  message?: string;
  snapshot?: Snapshot;
};

function isZh(locale: SupportedLocale) {
  return locale === "zh";
}

function initialSnapshot(): Snapshot {
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

export function CommercialAccessPanel({ locale, activeTool }: { locale: SupportedLocale; activeTool: CommercialToolId }) {
  const zh = isZh(locale);
  const [email, setEmail] = useState("");
  const [wechatId, setWechatId] = useState("");
  const [redeemCode, setRedeemCode] = useState("");
  const [snapshot, setSnapshot] = useState<Snapshot>(initialSnapshot);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const activeBalance = useMemo(
    () => snapshot.balances.find((item) => item.toolId === activeTool)?.remainingCredits ?? 0,
    [activeTool, snapshot.balances],
  );

  async function callApi(path: string, payload?: Record<string, string>) {
    setLoading(true);
    setStatus("");
    try {
      const response = await fetch(path, {
        method: payload ? "POST" : "GET",
        headers: payload ? { "content-type": "application/json" } : undefined,
        body: payload ? JSON.stringify(payload) : undefined,
      });
      const data = (await response.json()) as ApiResponse;
      if (data.snapshot) {
        setSnapshot(data.snapshot);
      }
      setStatus(data.snapshot?.message || data.message || (zh ? "已更新。" : "Updated."));
    } catch {
      setStatus(zh ? "暂时无法连接用户系统，请稍后重试。" : "Unable to reach the account system right now.");
    } finally {
      setLoading(false);
    }
  }

  const emailQuery = encodeURIComponent(email.trim());

  return (
    <section className="border-b border-slate-200 bg-slate-950 px-4 py-4 text-white lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl gap-4 xl:grid-cols-[1fr_1.25fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-300">{zh ? "账户与使用次数" : "Account and credits"}</p>
          <h2 className="mt-2 text-xl font-black">
            {zh ? `本工具剩余 ${activeBalance} 次 AI 报告机会` : `${activeBalance} AI report credit${activeBalance === 1 ? "" : "s"} left for this tool`}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            {zh
              ? "注册后 3 个产品各可体验 1 次；加微信群并兑换后，3 个产品各再增加 3 次。当前 deterministic 演示不强制扣次，后续接 AI 报告时会先校验次数。"
              : "Registration grants one trial per flagship tool. Community redemption adds three more per tool. Deterministic demos are not blocked yet; AI reports will check credits before generation."}
          </p>
          {!snapshot.configured ? (
            <p className="mt-3 rounded-md border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-100">
              {zh ? "商业化后端尚未配置 Supabase 环境变量；页面先展示 P0 规则和接入入口。" : "Commercial backend env vars are not configured yet; this panel shows the P0 rules and integration path."}
            </p>
          ) : null}
        </div>

        <div className="grid gap-3">
          <div className="grid gap-2 md:grid-cols-[1fr_0.8fr_auto]">
            <input
              className="h-10 rounded-md border border-white/10 bg-white px-3 text-sm font-semibold text-slate-950"
              onChange={(event) => setEmail(event.target.value)}
              placeholder={zh ? "邮箱" : "Email"}
              type="email"
              value={email}
            />
            <input
              className="h-10 rounded-md border border-white/10 bg-white px-3 text-sm font-semibold text-slate-950"
              onChange={(event) => setWechatId(event.target.value)}
              placeholder={zh ? "微信号（可选）" : "WeChat ID optional"}
              value={wechatId}
            />
            <button
              className="h-10 rounded-md bg-teal-500 px-4 text-sm font-black text-slate-950 disabled:opacity-60"
              disabled={loading || !email.trim()}
              onClick={() => void callApi("/api/commercial/register", { email, wechatId })}
              type="button"
            >
              {zh ? "注册领次数" : "Register"}
            </button>
          </div>

          <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
            <input
              className="h-10 rounded-md border border-white/10 bg-white px-3 text-sm font-semibold text-slate-950"
              onChange={(event) => setRedeemCode(event.target.value)}
              placeholder={zh ? "加群兑换码" : "Community code"}
              value={redeemCode}
            />
            <button
              className="h-10 rounded-md border border-white/20 px-4 text-sm font-black text-white disabled:opacity-60"
              disabled={loading || !email.trim()}
              onClick={() => void callApi(`/api/commercial/entitlements?email=${emailQuery}`)}
              type="button"
            >
              {zh ? "查看次数" : "Check credits"}
            </button>
            <button
              className="h-10 rounded-md bg-white px-4 text-sm font-black text-slate-950 disabled:opacity-60"
              disabled={loading || !email.trim() || !redeemCode.trim()}
              onClick={() => void callApi("/api/commercial/redeem", { email, code: redeemCode })}
              type="button"
            >
              {zh ? "兑换加群奖励" : "Redeem"}
            </button>
          </div>

          <div className="grid gap-2 md:grid-cols-3">
            {snapshot.balances.map((item) => (
              <div key={item.toolId} className={`rounded-md border px-3 py-2 ${item.toolId === activeTool ? "border-teal-300 bg-teal-300/10" : "border-white/10 bg-white/5"}`}>
                <p className="truncate text-xs font-bold text-slate-300">{zh ? item.zhName : item.name}</p>
                <p className="mt-1 text-lg font-black">{item.remainingCredits}</p>
              </div>
            ))}
          </div>

          {status ? <p className="rounded-md bg-white/10 px-3 py-2 text-xs font-semibold text-slate-200">{status}</p> : null}
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
            {entitlementRules.map((rule) => (
              <span key={rule.source} className="rounded-full bg-white/10 px-3 py-1">
                {zh ? rule.zhLabel : rule.label}: {rule.creditsPerTool} / tool
              </span>
            ))}
            {paidPlans.slice(0, 2).map((plan) => (
              <span key={plan.id} className="rounded-full bg-white/10 px-3 py-1">
                {zh ? plan.zhName : plan.name}: ${plan.priceUsd}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
