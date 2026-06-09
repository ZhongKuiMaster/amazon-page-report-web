"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getLocalizedPath, type SupportedLocale } from "@/lib/i18n";

const STORAGE_KEY = "shopify-workflow-progress-v1";
const foundationOrder = [
  "shopify-product-page-audit",
  "shopify-offer-positioning",
  "shopify-landing-page-angle-builder",
] as const;
const commercialOrder = [
  "shopify-pricing-test-planner",
  "shopify-pdp-copy-assembler",
  "shopify-post-purchase-flow-planner",
  "shopify-returns-friction-audit",
  "shopify-faq-objection-builder",
  "shopify-reorder-reminder-planner",
  "shopify-launch-readiness-scorecard",
  "shopify-channel-landing-router",
] as const;
const supportOrder = [
  "shopify-promo-calendar-planner",
  "shopify-merchandising-priority-mapper",
] as const;

const slugMeta = {
  "shopify-product-page-audit": {
    en: { step: "Step 01", title: "PDP audit" },
    zh: { step: "步骤 01", title: "PDP 审计" },
  },
  "shopify-offer-positioning": {
    en: { step: "Step 02", title: "Offer positioning" },
    zh: { step: "步骤 02", title: "Offer 定位" },
  },
  "shopify-landing-page-angle-builder": {
    en: { step: "Step 03", title: "Landing page angle" },
    zh: { step: "步骤 03", title: "落地页角度" },
  },
  "shopify-pricing-test-planner": {
    en: { step: "Priority 01", title: "Pricing test planner" },
    zh: { step: "主卖 01", title: "定价测试" },
  },
  "shopify-pdp-copy-assembler": {
    en: { step: "Priority 02", title: "PDP copy assembler" },
    zh: { step: "主卖 02", title: "PDP 文案组装" },
  },
  "shopify-post-purchase-flow-planner": {
    en: { step: "Priority 03", title: "Post-purchase flow" },
    zh: { step: "主卖 03", title: "售后流程" },
  },
  "shopify-returns-friction-audit": {
    en: { step: "Priority 04", title: "Returns friction audit" },
    zh: { step: "主卖 04", title: "退货摩擦" },
  },
  "shopify-faq-objection-builder": {
    en: { step: "Priority 05", title: "FAQ objection builder" },
    zh: { step: "主卖 05", title: "FAQ 与异议" },
  },
  "shopify-reorder-reminder-planner": {
    en: { step: "Priority 06", title: "Reorder reminder planner" },
    zh: { step: "主卖 06", title: "补货提醒" },
  },
  "shopify-launch-readiness-scorecard": {
    en: { step: "Priority 07", title: "Launch readiness" },
    zh: { step: "主卖 07", title: "上线准备度" },
  },
  "shopify-channel-landing-router": {
    en: { step: "Priority 08", title: "Channel landing router" },
    zh: { step: "主卖 08", title: "渠道路由" },
  },
  "shopify-promo-calendar-planner": {
    en: { step: "Support 01", title: "Promo calendar" },
    zh: { step: "补充 01", title: "活动日历" },
  },
  "shopify-merchandising-priority-mapper": {
    en: { step: "Support 02", title: "Merchandising mapper" },
    zh: { step: "补充 02", title: "陈列优先级" },
  },
} as const;

type ShopifyProgressRecord = {
  lastSlug: string;
  visited: string[];
  updatedAt: string;
};

type ShopifyWorkflowProgressProps = {
  locale: SupportedLocale;
  currentSlug?: string;
  variant: "tracker" | "summary";
};

function getLayer(slug: string) {
  if (foundationOrder.includes(slug as (typeof foundationOrder)[number])) {
    return "foundation";
  }
  if (commercialOrder.includes(slug as (typeof commercialOrder)[number])) {
    return "commercial";
  }
  if (supportOrder.includes(slug as (typeof supportOrder)[number])) {
    return "support";
  }
  return null;
}

function getLayerCopy(locale: SupportedLocale, layer: ReturnType<typeof getLayer>) {
  if (layer === "foundation") {
    return locale === "zh"
      ? {
          label: "基础诊断层",
          body: "页面漏损、商业主张、冷流量开场",
        }
      : {
          label: "Foundation layer",
          body: "Page leak, commercial promise, and cold-traffic opening",
        };
  }
  if (layer === "commercial") {
    return locale === "zh"
      ? {
          label: "主卖决策层",
          body: "定价、改稿、售后、退货、上线与路由",
        }
      : {
          label: "Commercial layer",
          body: "Pricing, rewrite, post-purchase, returns, launch, and routing",
        };
  }
  if (layer === "support") {
    return locale === "zh"
      ? {
          label: "补充控制层",
          body: "活动节奏、Hero SKU、陈列与渠道控制",
        }
      : {
          label: "Support layer",
          body: "Promo cadence, hero SKU, merchandising, and channel control",
        };
  }
  return locale === "zh"
    ? { label: "未开始", body: "还没有记录到 Shopify 工作流进度" }
    : { label: "Not started", body: "No Shopify workflow progress recorded yet" };
}

function getNextSlug(slug: string) {
  const layer = getLayer(slug);
  if (layer === "foundation") {
    const index = foundationOrder.indexOf(slug as (typeof foundationOrder)[number]);
    return foundationOrder[index + 1] ?? commercialOrder[0];
  }
  if (layer === "commercial") {
    const index = commercialOrder.indexOf(slug as (typeof commercialOrder)[number]);
    return commercialOrder[index + 1] ?? supportOrder[0];
  }
  if (layer === "support") {
    const index = supportOrder.indexOf(slug as (typeof supportOrder)[number]);
    return supportOrder[index + 1] ?? null;
  }
  return foundationOrder[0];
}

function getMeta(locale: SupportedLocale, slug: string) {
  return slugMeta[slug as keyof typeof slugMeta]?.[locale] ?? null;
}

export function ShopifyWorkflowProgress({
  locale,
  currentSlug,
  variant,
}: ShopifyWorkflowProgressProps) {
  const [record, setRecord] = useState<ShopifyProgressRecord | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    let parsed: ShopifyProgressRecord | null = null;

    if (raw) {
      try {
        parsed = JSON.parse(raw) as ShopifyProgressRecord;
      } catch {
        parsed = null;
      }
    }

    if (currentSlug) {
      const nextRecord = {
        lastSlug: currentSlug,
        visited: [currentSlug, ...(parsed?.visited ?? []).filter((slug) => slug !== currentSlug)].slice(0, 6),
        updatedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecord));
      setRecord(nextRecord);
      return;
    }

    setRecord(parsed);
  }, [currentSlug]);

  const summary = useMemo(() => {
    const activeSlug = currentSlug ?? record?.lastSlug ?? null;
    const currentLayer = activeSlug ? getLayer(activeSlug) : null;
    const layerCopy = getLayerCopy(locale, currentLayer);
    const lastMeta = activeSlug ? getMeta(locale, activeSlug) : null;
    const nextSlug = activeSlug ? getNextSlug(activeSlug) : foundationOrder[0];
    const nextMeta = nextSlug ? getMeta(locale, nextSlug) : null;

    return {
      activeSlug,
      currentLayer,
      layerCopy,
      lastMeta,
      nextSlug,
      nextMeta,
      recentSlugs: (record?.visited ?? []).slice(0, 3),
    };
  }, [currentSlug, locale, record]);

  if (variant === "tracker") {
    return null;
  }

  return (
    <div className="rounded-[26px] border border-teal-900/10 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.14),transparent_32%),linear-gradient(180deg,#ffffff_0%,#f4fbfa_100%)] px-4 py-4 shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="panel-kicker">{locale === "zh" ? "Workflow memory" : "Workflow memory"}</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {locale === "zh" ? "系统记得你做到哪一步了" : "The system remembers where the team left off"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{summary.layerCopy.body}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-[18px] border border-teal-900/8 bg-white/92 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {locale === "zh" ? "当前阶段" : "Current stage"}
              </p>
              <p className="mt-2 text-base font-semibold text-slate-950">{summary.layerCopy.label}</p>
            </div>
            <div className="rounded-[18px] border border-teal-900/8 bg-white/92 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {locale === "zh" ? "最近工具" : "Last active tool"}
              </p>
              <p className="mt-2 text-base font-semibold text-slate-950">
                {summary.lastMeta
                  ? `${summary.lastMeta.step} ${summary.lastMeta.title}`
                  : locale === "zh"
                    ? "建议从基础层开始"
                    : "Start from the foundation layer"}
              </p>
            </div>
            <div className="rounded-[18px] border border-teal-900/8 bg-white/92 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {locale === "zh" ? "推荐下一步" : "Recommended next step"}
              </p>
              <p className="mt-2 text-base font-semibold text-slate-950">
                {summary.nextMeta
                  ? `${summary.nextMeta.step} ${summary.nextMeta.title}`
                  : locale === "zh"
                    ? "回看当前层结论"
                    : "Review the current layer call"}
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-3">
          {summary.nextSlug && summary.nextMeta ? (
            <Link
              href={getLocalizedPath(locale, `/shopify/${summary.nextSlug}`)}
              className="rounded-[22px] border border-slate-950 bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] px-4 py-4 text-white shadow-[0_18px_40px_rgba(15,23,42,0.2)] transition hover:-translate-y-0.5 hover:bg-slate-900"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/64">
                {locale === "zh" ? "继续推进" : "Continue from here"}
              </p>
              <p className="mt-2 text-lg font-semibold tracking-tight">
                {summary.nextMeta.step} {summary.nextMeta.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/78">
                {locale === "zh"
                  ? "不要重新从目录里猜。直接沿着当前判断继续推进到下一张该开的 Shopify 页。"
                  : "Do not guess from the directory again. Move straight into the next Shopify page the current call unlocks."}
              </p>
            </Link>
          ) : null}
          <div className="rounded-[20px] border border-teal-900/8 bg-white/92 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {locale === "zh" ? "最近访问" : "Recent visits"}
            </p>
            <div className="mt-3 grid gap-2">
              {summary.recentSlugs.length > 0 ? (
                summary.recentSlugs.map((slug) => {
                  const meta = getMeta(locale, slug);
                  if (!meta) {
                    return null;
                  }

                  return (
                    <Link
                      key={slug}
                      href={getLocalizedPath(locale, `/shopify/${slug}`)}
                      className="rounded-xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700 transition hover:bg-teal-50 hover:text-slate-950"
                    >
                      {meta.step} {meta.title}
                    </Link>
                  );
                })
              ) : (
                <p className="rounded-xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">
                  {locale === "zh"
                    ? "还没有访问记录，建议先从 PDP 审计开始。"
                    : "No visits yet. Start with the PDP audit first."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
