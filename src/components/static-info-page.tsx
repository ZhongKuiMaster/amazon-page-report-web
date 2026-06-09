import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SiteFooter } from "@/components/site-footer";
import { getLocalizedPath, type SupportedLocale } from "@/lib/i18n";

type StaticInfoPageProps = {
  locale: SupportedLocale;
  eyebrow: string;
  title: string;
  intro: string;
  pageSlug: string;
  sections: Array<{
    heading: string;
    body: string[];
  }>;
};

export function StaticInfoPage({
  locale,
  eyebrow,
  title,
  intro,
  pageSlug,
  sections,
}: StaticInfoPageProps) {
  return (
    <main
      lang={locale}
      className="pb-16"
      data-page-type="trust"
      data-page-locale={locale}
      data-page-platform="site"
      data-page-template={pageSlug}
    >
      <section className="border-b border-black/6 bg-white">
        <div className="page-shell py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link href={getLocalizedPath(locale)} className="site-mark">
                {locale === "zh" ? "电商工具系统" : "Commerce Tool System"}
              </Link>
            </div>
            <LanguageSwitcher locale={locale} />
          </div>
        </div>
      </section>

      <section className="page-shell py-12 lg:py-16">
        <div className="max-w-4xl rounded-[28px] border border-black/8 bg-white px-6 py-8 shadow-[0_20px_48px_rgba(15,23,42,0.05)] sm:px-8">
          <p className="panel-kicker">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">{intro}</p>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                  {section.heading}
                </h2>
                <div className="mt-3 space-y-3">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-7 text-slate-600">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter locale={locale} />
    </main>
  );
}
