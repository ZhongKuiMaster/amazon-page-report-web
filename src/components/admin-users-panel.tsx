"use client";

import { useState } from "react";
import { commercialTools } from "@/lib/commercial/entitlements";

type AdminUser = {
  id: string;
  email: string;
  wechatId?: string | null;
  createdAt?: string | null;
  balances: Array<{
    toolId: string;
    name: string;
    zhName: string;
    remainingCredits: number;
  }>;
  recentLedger: Array<{
    toolId: string;
    delta: number;
    reason: string;
    createdAt?: string | null;
  }>;
};

type UsersResponse = {
  ok: boolean;
  message?: string;
  data?: {
    configured: boolean;
    users: AdminUser[];
    message?: string;
  };
};

type GrantResponse = {
  ok: boolean;
  message?: string;
  snapshot?: {
    message?: string;
  };
};

export function AdminUsersPanel() {
  const [adminCode, setAdminCode] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [email, setEmail] = useState("");
  const [credits, setCredits] = useState("1");
  const [toolId, setToolId] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadUsers() {
    setLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/commercial/admin/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ adminCode }),
      });
      const data = (await response.json()) as UsersResponse;
      if (data.data?.users) setUsers(data.data.users);
      setStatus(data.data?.message || data.message || "已更新用户列表。");
    } catch {
      setStatus("暂时无法读取用户列表。");
    } finally {
      setLoading(false);
    }
  }

  async function grantCredits() {
    setLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/commercial/admin/grant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          adminCode,
          email,
          credits: Number(credits),
          toolId: toolId || undefined,
        }),
      });
      const data = (await response.json()) as GrantResponse;
      setStatus(data.snapshot?.message || data.message || "发放完成。");
      if (data.ok) await loadUsers();
    } catch {
      setStatus("暂时无法发放次数。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-16 text-slate-950">
      <section className="border-b border-slate-200 bg-white px-4 py-5 lg:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <p className="site-mark">Commerce Tool System</p>
          <p className="mt-2 text-sm font-semibold text-slate-500">后台用户管理</p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[360px_1fr] lg:px-8">
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h1 className="text-2xl font-black">用户与次数</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              P0 后台只做三件事：查看用户、查看工具剩余次数、给用户发放次数。管理码来自 Vercel 环境变量。
            </p>
            <input
              className="mt-4 h-11 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold"
              onChange={(event) => setAdminCode(event.target.value)}
              placeholder="COMMERCIAL_ADMIN_CODE"
              type="password"
              value={adminCode}
            />
            <button
              className="mt-3 w-full rounded-lg bg-slate-950 px-4 py-2 text-sm font-black text-white disabled:opacity-50"
              disabled={loading || !adminCode.trim()}
              onClick={() => void loadUsers()}
              type="button"
            >
              读取用户列表
            </button>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black">发放次数</h2>
            <div className="mt-4 grid gap-3">
              <input className="h-11 rounded-md border border-slate-200 px-3 text-sm font-semibold" onChange={(event) => setEmail(event.target.value)} placeholder="用户邮箱" type="email" value={email} />
              <input className="h-11 rounded-md border border-slate-200 px-3 text-sm font-semibold" min="1" max="100" onChange={(event) => setCredits(event.target.value)} type="number" value={credits} />
              <select className="h-11 rounded-md border border-slate-200 px-3 text-sm font-semibold" onChange={(event) => setToolId(event.target.value)} value={toolId}>
                <option value="">三个工具都发放</option>
                {commercialTools.map((tool) => (
                  <option key={tool.id} value={tool.id}>
                    {tool.zhName}
                  </option>
                ))}
              </select>
              <button
                className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-black text-white disabled:opacity-50"
                disabled={loading || !adminCode.trim() || !email.trim()}
                onClick={() => void grantCredits()}
                type="button"
              >
                确认发放
              </button>
            </div>
          </div>

          {status ? <p className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">{status}</p> : null}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-xl font-black">用户列表</h2>
            <p className="mt-1 text-sm text-slate-500">最多显示最近 100 个用户。</p>
          </div>
          <div className="divide-y divide-slate-200">
            {users.length === 0 ? (
              <p className="p-5 text-sm font-semibold text-slate-500">输入管理码后读取用户。</p>
            ) : null}
            {users.map((user) => (
              <div key={user.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-black">{user.email}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      微信：{user.wechatId || "未填"} · 注册：{user.createdAt ? new Date(user.createdAt).toLocaleString("zh-CN") : "未知"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {user.balances.map((balance) => (
                    <div key={balance.toolId} className="rounded-md bg-slate-50 p-3">
                      <p className="text-xs font-bold text-slate-500">{balance.zhName}</p>
                      <p className="mt-1 text-2xl font-black">{balance.remainingCredits}</p>
                    </div>
                  ))}
                </div>
                {user.recentLedger.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {user.recentLedger.map((item, index) => (
                      <span key={`${item.createdAt}-${index}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {item.toolId} {item.delta > 0 ? "+" : ""}{item.delta} · {item.reason}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
