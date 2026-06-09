import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SiteFooter } from "@/components/site-footer";
import {
  getLocalizedPath,
  localizeTool,
  translateCategory,
  type SupportedLocale,
} from "@/lib/i18n";
import { getPlatformToolMatrix } from "@/lib/page-visible-tools";
import { absoluteUrl, siteUrl } from "@/lib/site-url";
import { platformRoadmap } from "@/lib/site-structure";
import type { ToolDefinition } from "@/lib/tools";

type PlatformPageContentProps = {
  locale: SupportedLocale;
  platformSlug: string;
};

function dedupeTools(tools: ToolDefinition[]) {
  const seen = new Set<string>();

  return tools.filter((tool) => {
    if (seen.has(tool.slug)) {
      return false;
    }
    seen.add(tool.slug);
    return true;
  });
}

export function PlatformPageContent({
  locale,
  platformSlug,
}: PlatformPageContentProps) {
  const platform = platformRoadmap.find((item) => item.slug === platformSlug);

  if (!platform) {
    return null;
  }

  const platformName = locale === "zh" ? platform.zhName : platform.name;
  const platformAngle =
    locale === "zh" ? platform.zhLandingPageAngle : platform.landingPageAngle;
  const platformPath = getLocalizedPath(locale, `/${platform.slug}`);
  const matrix = getPlatformToolMatrix(platform.key as ToolDefinition["platform"]);
  const orderedTools = dedupeTools([
    ...matrix.featured,
    ...matrix.secondary,
    ...matrix.seoSupport,
  ]).map((tool) => localizeTool(tool, locale));

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${platformName} ${locale === "zh" ? "工具页" : "tool directory"}`,
    description: platformAngle,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: orderedTools.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: tool.name,
        url: absoluteUrl(getLocalizedPath(locale, `/${platform.slug}/${tool.slug}`)),
      })),
    },
  };

  const webpageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${platformName} ${locale === "zh" ? "工具页" : "tool directory"}`,
    description: platformAngle,
    url: absoluteUrl(platformPath),
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: locale === "zh" ? "电商工具系统" : "Commerce Tool System",
      url: siteUrl,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "zh" ? "电商工具系统" : "Commerce Tool System",
        item: absoluteUrl(getLocalizedPath(locale)),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: platformName,
        item: absoluteUrl(platformPath),
      },
    ],
  };

  return (
    <main
      lang={locale}
      className="pb-16"
      data-page-type="platform"
      data-page-locale={locale}
      data-page-platform={platform.slug}
      data-page-template="tool-directory"
    >
      <JsonLd data={collectionJsonLd} />
      <JsonLd data={webpageJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <section className="border-b border-black/6 bg-white">
        <div className="page-shell py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link href={getLocalizedPath(locale)} className="site-mark">
                {locale === "zh" ? "电商工具系统" : "Commerce Tool System"}
              </Link>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {platformAngle}
              </p>
            </div>
            <LanguageSwitcher locale={locale} path={`/${platform.slug}`} />
          </div>
        </div>
      </section>

      <section className="page-shell py-12 lg:py-16">
        <div className="mb-8">
          <p className="panel-kicker">{locale === "zh" ? "工具列表" : "Tool directory"}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            {platformName}
          </h1>
        </div>

        <div>
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {orderedTools.map((tool) => (
              <Link
                key={tool.slug}
                href={getLocalizedPath(locale, `/${platform.slug}/${tool.slug}`)}
                className="roadmap-card roadmap-card-live"
                data-analytics-event="platform_tool_click"
                data-analytics-category="navigation"
                data-analytics-label={tool.slug}
                data-analytics-destination={getLocalizedPath(locale, `/${platform.slug}/${tool.slug}`)}
                data-analytics-link-type="internal"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="tool-row-tag">
                    {translateCategory(tool.category, locale)}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                    {platformName}
                  </span>
                </div>

                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                  {tool.name}
                </h2>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {tool.summary}
                </p>
                <div className="mt-6">
                  <span className="inline-flex min-h-11 items-center rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-100">
                    {locale === "zh" ? "打开工具" : "Open tool"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter locale={locale} />
    </main>
  );
}
