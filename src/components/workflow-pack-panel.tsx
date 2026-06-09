"use client";

import { useState } from "react";
import type { SupportedLocale } from "@/lib/i18n";

export function WorkflowPackPanel({
  locale,
  body,
}: {
  locale: SupportedLocale;
  body: string;
}) {
  const [copied, setCopied] = useState(false);
  const lines = body.split("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mt-8 rounded-2xl border border-black/8 bg-slate-950 px-5 py-5 text-white">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
            Workflow pack
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {locale === "zh" ? "TikTok Shop 完整执行包" : "TikTok Shop execution pack"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/72">
            {locale === "zh"
              ? "这不是目录说明，而是一份把 4 个工具串成完整执行路径的可复制交付稿。"
              : "This is not directory copy. It is a copyable handoff that stitches the 4 tools into one execution path."}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-10 items-center justify-center rounded-full border border-white/14 bg-white/8 px-4 text-sm font-semibold text-white transition hover:bg-white/14"
        >
          {copied
            ? locale === "zh"
              ? "已复制"
              : "Copied"
            : locale === "zh"
              ? "复制执行包"
              : "Copy pack"}
        </button>
      </div>
      <div className="mt-4 grid gap-2">
        {lines.map((line, index) =>
          line ? (
            <div key={`${line}-${index}`} className="rounded-xl border border-white/10 bg-white/6 px-3 py-2.5">
              <p className="text-sm leading-6 text-white/88">{line}</p>
            </div>
          ) : (
            <div key={`gap-${index}`} className="h-1" />
          ),
        )}
      </div>
    </div>
  );
}
