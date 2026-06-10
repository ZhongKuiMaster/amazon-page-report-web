import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SiteFooter } from "@/components/site-footer";
import { getHomeCopy, getLocalizedPath, type SupportedLocale } from "@/lib/i18n";
import { absoluteUrl, siteUrl } from "@/lib/site-url";
import { platformRoadmap } from "@/lib/site-structure";
import { amazonAdsWorkbenchEntry } from "@/lib/workbench-links";

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
  const homepagePlatforms = platformRoadmap.filter((platform) => platform.key === "amazon");
  const homepageEntries = [
    {
      key: amazonAdsWorkbenchEntry.key,
      href: amazonAdsWorkbenchEntry.href,
      indexLabel: amazonAdsWorkbenchEntry.index,
      eyebrow: amazonAdsWorkbenchEntry.eyebrow[locale],
      name: amazonAdsWorkbenchEntry.name[locale],
      description: amazonAdsWorkbenchEntry.description[locale],
      cta: amazonAdsWorkbenchEntry.cta[locale],
      external: false,
    },
    ...homepagePlatforms.map((platform, index) => {
      const labels = platformLabel(platform, locale);

      return {
        key: platform.key,
        href: getLocalizedPath(locale, `/${platform.slug}`),
        indexLabel: String(index + 2).padStart(2, "0"),
        eyebrow: copy.platformMap,
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
                    <p className="panel-kicker">{entry.eyebrow}</p>
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
