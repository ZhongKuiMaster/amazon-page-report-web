import { Suspense } from "react";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SiteFooter } from "@/components/site-footer";
import { ToolHelpLauncher } from "@/components/tool-help-launcher";
import { ToolRuntimeClientShell } from "@/components/tool-runtime-client-shell";
import { getToolHelpEntry } from "@/lib/amazon-tool-help";
import {
  getLocalizedPath,
  getLocalizedRuntimeTitle,
  localizeTool,
  translateCategory,
  type SupportedLocale,
} from "@/lib/i18n";
import { absoluteUrl, siteUrl } from "@/lib/site-url";
import {
  filterVisibleToolSlugs,
  imageStudioToolSlugs,
  sortToolsByDistributionPriority,
} from "@/lib/page-visible-tools";
import { getAmazonSupportPagesForTool } from "@/lib/amazon-seo-support-pages";
import { platformRoadmap } from "@/lib/site-structure";
import { getToolPageContract } from "@/lib/tool-page-contracts";
import { getToolBySlug, getToolExecutionProfile } from "@/lib/tools";
import { ecommerceVisualWorkbenchEntry } from "@/lib/workbench-links";

const runtimeFallbackBySlug: Record<string, string> = {
  "amazon-fba-calculator": "Run the FBA estimate",
  "tariff-calculator-amazon": "Estimate landed cost",
  "amazon-shipping-calculator": "Model monthly fulfillment burden",
  "amazon-product-compliance": "Screen documentation risk",
  "amazon-image-compliance-checker": "Review image-set compliance",
  "amazon-category-ungating": "Check ungating evidence strength",
  "amazon-listing-optimization": "Review listing direction",
  "amazon-profit-analyzer": "Review profit posture",
  "amazon-sales-estimator": "Estimate demand",
  "amazon-price-tracker": "Compare price posture",
  "amazon-keyword-tracker": "Track keyword pressure",
  "amazon-competitor-monitoring": "Review competitor movement",
  "tiktok-shop-seller-intake": "Clarify the seller setup",
  "tiktok-shop-product-research": "Evaluate the product lane",
  "tiktok-shop-hook-writing": "Shape the opening hook family",
  "tiktok-shop-short-video-brief": "Build the short-video plan",
};

const runtimeFallbackBySlugZh: Record<string, string> = {
  "amazon-fba-calculator": "运行 FBA 费用测算",
  "tariff-calculator-amazon": "估算关税与到岸成本",
  "amazon-shipping-calculator": "测算每月物流负担",
  "amazon-product-compliance": "筛查合规资料风险",
  "amazon-image-compliance-checker": "检查图片结构与主图合规性",
  "amazon-category-ungating": "检查类目解封资料强度",
  "amazon-listing-optimization": "查看商品页优化方向",
  "amazon-profit-analyzer": "查看利润判断",
  "amazon-sales-estimator": "估算销量与需求区间",
  "amazon-price-tracker": "查看价格姿态",
  "amazon-keyword-tracker": "查看关键词压力",
  "amazon-competitor-monitoring": "查看竞品变化",
  "tiktok-shop-seller-intake": "看清卖家起步路径",
  "tiktok-shop-product-research": "筛选商品方向",
  "tiktok-shop-hook-writing": "生成开场钩子方向",
  "tiktok-shop-short-video-brief": "生成短视频脚本",
};

const supportButtonLabels = {
  en: {
    "before-you-use": "Before you use",
    "how-to": "How to",
    vs: "Compare",
    examples: "Examples",
  },
  zh: {
    "before-you-use": "使用前",
    "how-to": "操作步骤",
    vs: "如何区分",
    examples: "查看示例",
  },
} as const;

function RuntimeLoadingPreview({
  locale,
  title,
  promise,
}: {
  locale: SupportedLocale;
  title: string;
  promise: string;
}) {
  return (
    <div className="rounded-[24px] border border-black/8 bg-white px-5 py-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700">
        {locale === "zh" ? "结果加载中" : "Loading result"}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {locale === "zh"
          ? "系统正在整理输入并生成结论。"
          : "The tool is organizing the inputs and preparing the result."}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{promise}</p>
      <div className="mt-4 space-y-2">
        <div className="h-2 rounded-full bg-slate-100" />
        <div className="h-2 w-11/12 rounded-full bg-slate-100" />
        <div className="h-2 w-8/12 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

function getImageStudioPath(locale: SupportedLocale) {
  return getLocalizedPath(locale, "/amazon/image-studio");
}

export function ToolPageContent({
  locale,
  platformSlug = "amazon",
  slug,
}: {
  locale: SupportedLocale;
  platformSlug?: string;
  slug: string;
}) {
  const sourceTool = getToolBySlug(slug);

  if (!sourceTool) {
    return null;
  }

  const platform = platformRoadmap.find((item) => item.slug === platformSlug);
  if (!platform) {
    return null;
  }

  const tool = localizeTool(sourceTool, locale);
  const canonicalPath = getLocalizedPath(locale, `/${platformSlug}/${tool.slug}`);
  const platformName = locale === "zh" ? platform.zhName : platform.name;
  const categoryLabel = translateCategory(tool.category, locale);
  const execution = getToolExecutionProfile(sourceTool.slug);
  const pageContract = getToolPageContract(sourceTool.slug);
  const hasAutomaticData =
    execution.liveDataMode === "amazon-listing-fetch" ||
    execution.liveDataMode === "paste-or-upload";
  const showImageStudioCta = imageStudioToolSlugs.has(sourceTool.slug);
  const visibleRelatedSlugs = filterVisibleToolSlugs(tool.related);
  const orderedRelatedTools = sortToolsByDistributionPriority(
    visibleRelatedSlugs
      .map((relatedSlug) => getToolBySlug(relatedSlug))
      .filter((relatedTool): relatedTool is NonNullable<typeof relatedTool> => Boolean(relatedTool)),
  ).slice(0, 2);
  const primaryIntro = pageContract
    ? locale === "zh"
      ? pageContract.userGoal.zh
      : pageContract.userGoal.en
    : tool.summary;
  const loadHint = hasAutomaticData
    ? locale === "zh"
      ? "先加载核心链接或页面，系统会直接给出判断和下一步。"
      : "Load the main URL or page first. The tool should return a judgment and next move."
    : locale === "zh"
      ? "先填写核心信息，页面会直接压成判断和下一步。"
      : "Enter the core context first. The page should compress it into a judgment and next move.";
  const resultPromise = pageContract
    ? locale === "zh"
      ? pageContract.resultPromise.zh
      : pageContract.resultPromise.en
    : loadHint;
  const supportPages =
    platformSlug === "amazon" ? getAmazonSupportPagesForTool(sourceTool.slug) : [];
  const helpEntry = getToolHelpEntry(tool);
  const showWorkbenchRecommendation = platformSlug === "amazon";

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description: tool.seoDescription,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  const webpageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: tool.seoTitle,
    description: tool.seoDescription,
    url: absoluteUrl(canonicalPath),
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: locale === "zh" ? "电商工具矩阵" : "Commerce Tool Matrix",
      url: siteUrl,
    },
    about: [
      { "@type": "Thing", name: platformName },
      { "@type": "Thing", name: categoryLabel },
    ],
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "zh" ? "首页" : "Home",
        item: absoluteUrl(getLocalizedPath(locale)),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: platformName,
        item: absoluteUrl(getLocalizedPath(locale, `/${platformSlug}`)),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.name,
        item: absoluteUrl(canonicalPath),
      },
    ],
  };

  return (
    <main
      lang={locale}
      className="pb-16"
      data-page-type="tool"
      data-page-locale={locale}
      data-page-platform={platformSlug}
      data-tool-slug={sourceTool.slug}
      data-page-template="tool-runtime"
    >
      <JsonLd data={softwareJsonLd} />
      <JsonLd data={webpageJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <section className="border-b border-black/6 bg-white">
        <div className="page-shell py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <Link href={getLocalizedPath(locale)} className="transition hover:text-teal-700">
                {locale === "zh" ? "首页" : "Home"}
              </Link>
              <span>/</span>
              <Link
                href={getLocalizedPath(locale, `/${platformSlug}`)}
                className="transition hover:text-teal-700"
              >
                {platformName}
              </Link>
              <span>/</span>
              <span className="text-slate-700">{tool.name}</span>
            </div>
            <LanguageSwitcher locale={locale} path={`/${platformSlug}/${tool.slug}`} />
          </div>
        </div>
      </section>

      <section className="page-shell py-4 lg:py-5">
        <div className="tool-page-header">
          <div className="flex flex-wrap items-center gap-2">
            <span className="tool-row-tag">{categoryLabel}</span>
          </div>

          <div className="mt-2.5">
            <h1 className="text-balance text-[2rem] font-semibold tracking-tight text-slate-950 sm:text-[2.45rem] lg:text-[2.35rem]">
              {tool.name}
            </h1>
            <p className="mt-1.5 max-w-3xl text-[14px] leading-6 text-slate-700">{primaryIntro}</p>
            <p className="mt-1 max-w-3xl text-[13px] leading-5 text-slate-500">{resultPromise}</p>
            <p className="mt-1 max-w-3xl text-[12px] leading-5 text-slate-400">{loadHint}</p>
            {showImageStudioCta ? (
              <div className="mt-4">
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={getImageStudioPath(locale)}
                    className="inline-flex min-h-11 items-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
                    data-analytics-event="image_studio_cta_click"
                    data-analytics-category="navigation"
                    data-analytics-label={sourceTool.slug}
                    data-analytics-destination={getImageStudioPath(locale)}
                    data-analytics-link-type="internal"
                  >
                    {locale === "zh" ? "打开图片工作台" : "Open image studio"}
                  </Link>
                  {helpEntry ? <ToolHelpLauncher locale={locale} entry={helpEntry} /> : null}
                  {supportPages.map((page) => (
                    <Link
                      key={`${page.toolSlug}-${page.supportSlug}`}
                      href={getLocalizedPath(locale, `/${platformSlug}/${page.toolSlug}/${page.supportSlug}`)}
                      className="inline-flex min-h-11 items-center rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-100"
                      data-analytics-event="support_page_click"
                      data-analytics-category="support"
                      data-analytics-label={`${page.toolSlug}:${page.supportSlug}`}
                      data-analytics-destination={getLocalizedPath(locale, `/${platformSlug}/${page.toolSlug}/${page.supportSlug}`)}
                      data-analytics-link-type="internal"
                    >
                      {supportButtonLabels[locale][page.supportSlug]}
                    </Link>
                  ))}
                </div>
              </div>
            ) : helpEntry ? (
              <div className="mt-4">
                <div className="flex flex-wrap gap-3">
                  <ToolHelpLauncher locale={locale} entry={helpEntry} />
                  {supportPages.map((page) => (
                    <Link
                      key={`${page.toolSlug}-${page.supportSlug}`}
                      href={getLocalizedPath(locale, `/${platformSlug}/${page.toolSlug}/${page.supportSlug}`)}
                      className="inline-flex min-h-11 items-center rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-100"
                      data-analytics-event="support_page_click"
                      data-analytics-category="support"
                      data-analytics-label={`${page.toolSlug}:${page.supportSlug}`}
                      data-analytics-destination={getLocalizedPath(locale, `/${platformSlug}/${page.toolSlug}/${page.supportSlug}`)}
                      data-analytics-link-type="internal"
                    >
                      {supportButtonLabels[locale][page.supportSlug]}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <span className="tool-row-tag">{locale === "zh" ? "输入" : "Input"}</span>
          <span className="text-sm text-slate-400">→</span>
          <span className="tool-row-tag">{locale === "zh" ? "确认" : "Confirm"}</span>
          <span className="text-sm text-slate-400">→</span>
          <span className="tool-row-tag">{locale === "zh" ? "结果" : "Result"}</span>
        </div>

        <div className="mt-3 rounded-[18px] border border-black/8 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-700">
            {locale === "zh" ? "结果输出区" : "Result output"}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {locale === "zh"
              ? "填写必要输入后，点击页面主动作按钮，结果会直接显示在工具区中。"
              : "Fill the core inputs, use the main action button, and the result will appear directly inside the tool area."}
          </p>
        </div>

        <div
          id="tool-runtime"
          className={`mt-3 tool-runtime-shell tool-runtime-platform-${platformSlug} tool-runtime-slug-${sourceTool.slug}`}
        >
          <Suspense
            fallback={
              <RuntimeLoadingPreview
                locale={locale}
                title={getLocalizedRuntimeTitle(
                  sourceTool.slug,
                  locale,
                  locale === "zh"
                    ? runtimeFallbackBySlugZh[sourceTool.slug] ?? sourceTool.name
                    : runtimeFallbackBySlug[sourceTool.slug] ?? sourceTool.name,
                )}
                promise={resultPromise}
              />
            }
          >
            <ToolRuntimeClientShell
              tool={sourceTool}
              locale={locale}
              titleOverride={getLocalizedRuntimeTitle(
                sourceTool.slug,
                locale,
                locale === "zh"
                  ? runtimeFallbackBySlugZh[sourceTool.slug] ?? sourceTool.name
                  : runtimeFallbackBySlug[sourceTool.slug] ?? sourceTool.name,
              )}
            />
          </Suspense>
        </div>
      </section>

      <section id="tool-related" className="page-shell py-5 lg:py-6">
        <div className="section-heading">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
            {locale === "zh" ? "相关工具" : "Related tools"}
          </h2>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-2">
          {orderedRelatedTools.map((relatedToolSource) => {
            const relatedTool = localizeTool(relatedToolSource, locale);

            return (
              <Link
                key={relatedTool.slug}
                href={getLocalizedPath(locale, `/${platformSlug}/${relatedTool.slug}`)}
                className="surface-panel p-5 transition hover:border-teal-700"
                data-analytics-event="related_tool_click"
                data-analytics-category="navigation"
                data-analytics-label={relatedTool.slug}
                data-analytics-destination={getLocalizedPath(locale, `/${platformSlug}/${relatedTool.slug}`)}
                data-analytics-link-type="internal"
              >
                <span className="tool-row-tag">{translateCategory(relatedTool.category, locale)}</span>
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">
                  {relatedTool.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{relatedTool.summary}</p>
                <p className="mt-4 text-sm font-semibold text-teal-800">
                  {locale === "zh" ? "打开工具" : "Open tool"}
                </p>
              </Link>
            );
          })}
          {showWorkbenchRecommendation ? (
            <a
              key={ecommerceVisualWorkbenchEntry.key}
              href={ecommerceVisualWorkbenchEntry.href}
              className="surface-panel p-5 transition hover:border-teal-700"
              data-analytics-event="product_recommendation_click"
              data-analytics-category="recommendation"
              data-analytics-label={sourceTool.slug}
              data-analytics-destination={ecommerceVisualWorkbenchEntry.href}
              data-analytics-link-type="external"
              target="_blank"
              rel="noreferrer"
            >
              <span className="tool-row-tag">
                {locale === "zh" ? "产品推荐" : "Recommended"}
              </span>
              <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">
                {ecommerceVisualWorkbenchEntry.name[locale]}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {ecommerceVisualWorkbenchEntry.description[locale]}
              </p>
              <p className="mt-4 text-sm font-semibold text-teal-800">
                {ecommerceVisualWorkbenchEntry.cta[locale]}
              </p>
            </a>
          ) : null}
        </div>
      </section>
      <SiteFooter locale={locale} />
    </main>
  );
}
