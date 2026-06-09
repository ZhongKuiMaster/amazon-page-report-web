import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SiteFooter } from "@/components/site-footer";
import {
  getLocalizedPath,
  localizeTool,
  type SupportedLocale,
} from "@/lib/i18n";
import type { AmazonSupportPageEntry } from "@/lib/amazon-seo-support-pages";
import { absoluteUrl, siteUrl } from "@/lib/site-url";
import { getToolBySlug } from "@/lib/tools";

export function AmazonSupportPageTemplate({
  locale,
  entry,
}: {
  locale: SupportedLocale;
  entry: AmazonSupportPageEntry;
}) {
  const tool = getToolBySlug(entry.toolSlug);

  if (!tool) {
    return null;
  }

  const localizedTool = localizeTool(tool, locale);
  const pagePath = getLocalizedPath(
    locale,
    `/amazon/${entry.toolSlug}/${entry.supportSlug}`,
  );
  const toolPath = getLocalizedPath(locale, `/amazon/${entry.toolSlug}`);
  const title = entry.title[locale];
  const description = entry.description[locale];
  const intro = entry.intro[locale];

  const webpageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: absoluteUrl(pagePath),
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: locale === "zh" ? "电商工具系统" : "Commerce Tool System",
      url: siteUrl,
    },
    about: [
      { "@type": "Thing", name: "Amazon" },
      { "@type": "Thing", name: localizedTool.name },
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
        name: "Amazon",
        item: absoluteUrl(getLocalizedPath(locale, "/amazon")),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: localizedTool.name,
        item: absoluteUrl(toolPath),
      },
      {
        "@type": "ListItem",
        position: 4,
        name: title,
        item: absoluteUrl(pagePath),
      },
    ],
  };

  return (
    <main
      lang={locale}
      className="pb-16"
      data-page-type="support"
      data-page-locale={locale}
      data-page-platform="amazon"
      data-tool-slug={entry.toolSlug}
      data-support-slug={entry.supportSlug}
      data-page-template="support-article"
    >
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
                href={getLocalizedPath(locale, "/amazon")}
                className="transition hover:text-teal-700"
              >
                Amazon
              </Link>
              <span>/</span>
              <Link href={toolPath} className="transition hover:text-teal-700">
                {localizedTool.name}
              </Link>
              <span>/</span>
              <span className="text-slate-700">{title}</span>
            </div>
            <LanguageSwitcher
              locale={locale}
              path={`/amazon/${entry.toolSlug}/${entry.supportSlug}`}
            />
          </div>
        </div>
      </section>

      <section className="page-shell py-10 lg:py-12">
        <div className="max-w-4xl">
          <p className="panel-kicker">
            {locale === "zh" ? "Amazon 支持页" : "Amazon support page"}
          </p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{description}</p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{intro}</p>

          <div className="mt-6">
            <Link
              href={toolPath}
              className="inline-flex min-h-11 items-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              data-analytics-event="support_to_tool_click"
              data-analytics-category="support"
              data-analytics-label={`${entry.toolSlug}:${entry.supportSlug}`}
              data-analytics-destination={toolPath}
              data-analytics-link-type="internal"
            >
              {locale === "zh" ? "打开工具" : "Open tool"}
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-5">
          {entry.sections.map((section) => (
            <section
              key={section.heading.en}
              className="surface-panel p-6 sm:p-7"
            >
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                {section.heading[locale]}
              </h2>
              <div className="mt-4 space-y-3">
                {section.body[locale].map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-7 text-slate-600">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-[24px] border border-black/8 bg-white px-6 py-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
          <p className="panel-kicker">
            {locale === "zh" ? "回到工具" : "Back to tool"}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            {localizedTool.name}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            {localizedTool.summary}
          </p>
          <div className="mt-5">
            <Link
              href={toolPath}
              className="inline-flex min-h-11 items-center rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-100"
              data-analytics-event="support_to_tool_click"
              data-analytics-category="support"
              data-analytics-label={`${entry.toolSlug}:${entry.supportSlug}:footer`}
              data-analytics-destination={toolPath}
              data-analytics-link-type="internal"
            >
              {locale === "zh" ? "进入这个工具" : "Use this tool"}
            </Link>
          </div>
        </section>
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}
