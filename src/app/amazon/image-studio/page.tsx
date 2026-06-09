import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SiteFooter } from "@/components/site-footer";
import { getCanonicalAlternates, getLocalizedPath, getToolPageCopy } from "@/lib/i18n";
import { absoluteUrl, siteUrl } from "@/lib/site-url";

const locale = "en";
const copy = getToolPageCopy(locale);
const path = "/amazon/image-studio";

export const metadata: Metadata = {
  title: "Amazon Image Studio | Create Amazon Visuals",
  description:
    "Open the visual workspace for Amazon listing images, A+ content modules, storefront assets, and related creative tasks.",
  alternates: getCanonicalAlternates(path),
  openGraph: {
    title: "Amazon Image Studio | Create Amazon Visuals",
    description:
      "Open the visual workspace for Amazon listing images, A+ content modules, storefront assets, and related creative tasks.",
    type: "website",
    url: absoluteUrl(path),
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amazon Image Studio | Create Amazon Visuals",
    description:
      "Open the visual workspace for Amazon listing images, A+ content modules, storefront assets, and related creative tasks.",
  },
  other: {
    "content-language": "en",
  },
};

export default function AmazonImageStudioPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: copy.home,
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
        name: "Amazon Image Studio",
        item: absoluteUrl(path),
      },
    ],
  };

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Amazon Image Studio",
    description: metadata.description,
    url: absoluteUrl(path),
    inLanguage: locale,
    isPartOf: {
      "@type": "WebSite",
      name: "Commerce Tool Matrix",
      url: siteUrl,
    },
  };

  return (
    <main
      lang={locale}
      className="pb-16"
      data-page-type="support"
      data-page-locale={locale}
      data-page-platform="amazon"
      data-page-template="image-studio"
    >
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={pageJsonLd} />

      <section className="border-b border-black/6 bg-white">
        <div className="page-shell py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <Link href={getLocalizedPath(locale)} className="transition hover:text-teal-700">
                {copy.home}
              </Link>
              <span>/</span>
              <Link href={getLocalizedPath(locale, "/amazon")} className="transition hover:text-teal-700">
                Amazon
              </Link>
              <span>/</span>
              <span className="text-slate-700">Amazon Image Studio</span>
            </div>
            <LanguageSwitcher locale={locale} path={path} />
          </div>
        </div>
      </section>

      <section className="page-shell py-12 lg:py-16">
        <div className="max-w-3xl">
          <p className="panel-kicker">{copy.imageStudioEyebrow}</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            {copy.imageStudioTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            {copy.imageStudioBody}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
            The full generation workspace is the next build step. Use the Amazon image tools today to
            audit inputs, tighten visual requirements, and prepare the brief before the studio layer goes
            live.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={getLocalizedPath(locale, "/amazon")}
              className="inline-flex min-h-11 items-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              data-analytics-event="image_studio_back_to_tools"
              data-analytics-category="support"
              data-analytics-label="amazon-image-studio-primary"
              data-analytics-destination={getLocalizedPath(locale, "/amazon")}
              data-analytics-link-type="internal"
            >
              Browse Amazon image tools
            </Link>
            <Link
              href={getLocalizedPath(locale, "/amazon")}
              className="inline-flex min-h-11 items-center rounded-full border border-black/10 px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
              data-analytics-event="image_studio_back_to_tools"
              data-analytics-category="support"
              data-analytics-label="amazon-image-studio-secondary"
              data-analytics-destination={getLocalizedPath(locale, "/amazon")}
              data-analytics-link-type="internal"
            >
              Back to Amazon tools
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}
