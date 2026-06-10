"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { commercialTools, entitlementRules, paidPlans } from "@/lib/commercial/entitlements";
import { getLocalizedPath, type SupportedLocale } from "@/lib/i18n";

type Snapshot = {
  configured: boolean;
  user: { id: string; email: string; wechatId?: string | null } | null;
  balances: Array<{
    toolId: string;
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

function emptySnapshot(): Snapshot {
  return {
    configured: true,
    user: null,
    balances: commercialTools.map((tool) => ({
      toolId: tool.id,
      name: tool.name,
      zhName: tool.zhName,
      remainingCredits: 0,
    })),
  };
}

export function AccountCenter({ locale }: { locale: SupportedLocale }) {
  const zh = locale === "zh";
  const [email, setEmail] = useState("");
  const [wechatId, setWechatId] = useState("");
  const [redeemCode, setRedeemCode] = useState("");
  const [snapshot, setSnapshot] = useState<Snapshot>(emptySnapshot);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const totalCredits = useMemo(
    () => snapshot.balances.reduce((sum, item) => sum + item.remainingCredits, 0),
    [snapshot.balances],
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
      if (data.snapshot) setSnapshot(data.snapshot);
      setStatus(data.snapshot?.message || data.message || (zh ? "已更新。" : "Updated."));
    } catch {
      setStatus(zh ? "暂时无法连接用户系统，请稍后重试。" : "Unable to reach the account system right now.");
    } finally {
      setLoading(false);
    }
  }

  const emailQuery = encodeURIComponent(email.trim());

  return (
    <main lang={locale} className="min-h-screen bg-slate-50 pb-16 text-slate-950">
      <section className="border-b border-slate-200 bg-white px-4 py-5 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
          <Link href={getLocalizedPath(locale)} className="site-mark">
            {zh ? "电商工具系统" : "Commerce Tool System"}
          </Link>
          <Link href={getLocalizedPath(locale, "/amazon")} className="pill-link">
            {zh ? "返回 Amazon 工具" : "Back to Amazon tools"}
          </Link>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="panel-kicker">{zh ? "用户中心" : "Account center"}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight">
            {zh ? "登录并查看三大工具次数" : "Log in and manage tool credits"}
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {zh
              ? "P0 阶段使用邮箱作为身份。注册后三个产品各 1 次；加群兑换码可再给三个产品各 3 次。"
              : "P0 uses email as the account identity. Registration grants one run per product; community codes add three more per product."}
          </p>

          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-500">{zh ? "总剩余次数" : "Total remaining credits"}</p>
            <p className="mt-2 text-5xl font-black">{totalCredits}</p>
            {snapshot.user ? (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {zh ? "当前账户：" : "Current account: "}
                <span className="font-bold text-slate-950">{snapshot.user.email}</span>
              </p>
            ) : null}
            {!snapshot.configured ? (
              <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
                {zh ? "Supabase 后端未配置或未连通。" : "Supabase backend is not configured or reachable."}
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3">
            <input
              className="h-11 rounded-md border border-slate-200 px-3 text-sm font-semibold"
              onChange={(event) => setEmail(event.target.value)}
              placeholder={zh ? "邮箱" : "Email"}
              type="email"
              value={email}
            />
            <input
              className="h-11 rounded-md border border-slate-200 px-3 text-sm font-semibold"
              onChange={(event) => setWechatId(event.target.value)}
              placeholder={zh ? "微信号（可选）" : "WeChat ID optional"}
              value={wechatId}
            />
            <div className="flex flex-wrap gap-2">
              <button
                className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-black text-white disabled:opacity-50"
                disabled={loading || !email.trim()}
                onClick={() => void callApi("/api/commercial/register", { email, wechatId })}
                type="button"
              >
                {zh ? "注册/登录" : "Register / log in"}
              </button>
              <button
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-black disabled:opacity-50"
                disabled={loading || !email.trim()}
                onClick={() => void callApi(`/api/commercial/entitlements?email=${emailQuery}`)}
                type="button"
              >
                {zh ? "查看次数" : "Check credits"}
              </button>
            </div>

            <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
              <input
                className="h-11 rounded-md border border-slate-200 px-3 text-sm font-semibold"
                onChange={(event) => setRedeemCode(event.target.value)}
                placeholder={zh ? "加群兑换码" : "Community code"}
                value={redeemCode}
              />
              <button
                className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-black text-white disabled:opacity-50"
                disabled={loading || !email.trim() || !redeemCode.trim()}
                onClick={() => void callApi("/api/commercial/redeem", { email, code: redeemCode })}
                type="button"
              >
                {zh ? "兑换" : "Redeem"}
              </button>
            </div>

            {status ? <p className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">{status}</p> : null}
          </div>

          <div className="mt-6 grid gap-3">
            {snapshot.balances.map((item) => {
              const tool = commercialTools.find((candidate) => candidate.id === item.toolId);
              const href = tool ? getLocalizedPath(locale, zh ? tool.zhPath : tool.path) : getLocalizedPath(locale, "/amazon");
              return (
                <Link key={item.toolId} href={href} className="rounded-lg border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-black">{zh ? item.zhName : item.name}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{zh ? "点击进入工具" : "Open tool"}</p>
                    </div>
                    <span className="text-3xl font-black">{item.remainingCredits}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            <p className="font-black text-slate-950">{zh ? "次数规则" : "Credit rules"}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {entitlementRules.map((rule) => (
                <span key={rule.source} className="rounded-full bg-white px-3 py-1 font-semibold">
                  {zh ? rule.zhLabel : rule.label}: {rule.creditsPerTool}
                </span>
              ))}
              {paidPlans.slice(0, 2).map((plan) => (
                <span key={plan.id} className="rounded-full bg-white px-3 py-1 font-semibold">
                  {zh ? plan.zhName : plan.name}: ${plan.priceUsd}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
