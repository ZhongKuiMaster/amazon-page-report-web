import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SiteFooter } from "@/components/site-footer";
import { getHomeCopy, getLocalizedPath, type SupportedLocale } from "@/lib/i18n";
import { absoluteUrl, siteUrl } from "@/lib/site-url";
import { platformRoadmap } from "@/lib/site-structure";

const externalWorkbenchEntry = {
  key: "lemons7-workbench",
  href: "https://www.lemons7.com/workbench",
  index: "00",
  name: {
    en: "Ecommerce Visual & Copy Solutions",
    zh: "电商视觉&文案解决方案",
  },
  description: {
    en: "Open the dedicated workbench for ecommerce visuals and copy workflows.",
    zh: "进入电商视觉与文案工作台，直接处理素材与内容产出。",
  },
  cta: {
    en: "Open workbench",
    zh: "打开工作台",
  },
} as const;

function platformLabel(
  platform: (typeof platformRoadmap)[number],
  locale: SupportedLocale,
) {
  return {
    name: locale === "zh" ? platform.zhName : platform.name,
    shortLabel: locale === "zh" ? platform.zhShortLabel : platform.shortLabel,
    landingPageAngle:
      locale === "zh" ? platform.zhLandingPageAngle : platform.landingPageAngle,
  };
}

export function HomePageContent({ locale }: { locale: SupportedLocale }) {
  const copy = getHomeCopy(locale);
  const homePath = getLocalizedPath(locale);
  const homepagePlatforms = platformRoadmap.filter(
    (platform) =>
      platform.key === "amazon" ||
      platform.key === "tiktok-shop" ||
      platform.key === "shopify",
  );
  const homepageEntries = [
    {
      key: externalWorkbenchEntry.key,
      href: externalWorkbenchEntry.href,
      indexLabel: externalWorkbenchEntry.index,
      name: externalWorkbenchEntry.name[locale],
      description: externalWorkbenchEntry.description[locale],
      cta: externalWorkbenchEntry.cta[locale],
      external: true,
    },
    ...homepagePlatforms.map((platform, index) => {
      const labels = platformLabel(platform, locale);

      return {
        key: platform.key,
        href: getLocalizedPath(locale, `/${platform.slug}`),
        indexLabel: String(index + 1).padStart(2, "0"),
        name: labels.name,
        description: labels.landingPageAngle,
        cta: locale === "zh" ? "进入平台" : "Open platform",
        external: false,
      };
    }),
  ];

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: copy.matrixHeading,
    itemListElement: homepageEntries.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      url: entry.external ? entry.href : absoluteUrl(entry.href),
    })),
  };

  const webpageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: copy.heroTitle,
    description: copy.heroBody,
    url: absoluteUrl(homePath),
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: copy.siteName,
      url: siteUrl,
    },
  };

  return (
    <main
      lang={locale}
      className="pb-16"
      data-page-type="home"
      data-page-locale={locale}
      data-page-platform="all"
      data-page-template="platform-directory"
    >
      <JsonLd data={itemListJsonLd} />
      <JsonLd data={webpageJsonLd} />

      <section className="border-b border-black/6 bg-white">
        <div className="page-shell py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link href={getLocalizedPath(locale)} className="site-mark">
                {copy.siteName}
              </Link>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {copy.heroBody}
              </p>
            </div>

            <LanguageSwitcher locale={locale} />
          </div>
        </div>
      </section>

      <section className="page-shell py-12 lg:py-16">
        <div className="grid gap-4 lg:grid-cols-3">
          {homepageEntries.map((entry) => {
            return (
              <a
                key={entry.key}
                href={entry.href}
                className="roadmap-card roadmap-card-live"
                data-analytics-event="platform_entry_click"
                data-analytics-category="navigation"
                data-analytics-label={entry.name}
                data-analytics-destination={entry.href}
                data-analytics-link-type={entry.external ? "external" : "internal"}
                {...(entry.external
                  ? {
                      target: "_blank",
                      rel: "noreferrer",
                    }
                  : {})}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="panel-kicker">{copy.platformMap}</p>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                      {entry.name}
                    </h2>
                  </div>
                  <span className="roadmap-index">{entry.indexLabel}</span>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {entry.description}
                </p>
                <div className="mt-6">
                  <span className="inline-flex min-h-11 items-center rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-100">
                    {entry.cta}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </section>
      <SiteFooter locale={locale} />
    </main>
  );
}
