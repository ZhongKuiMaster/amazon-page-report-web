import Link from "next/link";
import { getHomeCopy, getLocalizedPath, type SupportedLocale } from "@/lib/i18n";

export function SiteFooter({ locale }: { locale: SupportedLocale }) {
  const copy = getHomeCopy(locale);
  const footerPages = [
    { href: getLocalizedPath(locale, "/about"), label: locale === "zh" ? "关于我们" : "About" },
    { href: getLocalizedPath(locale, "/contact"), label: locale === "zh" ? "联系方式" : "Contact" },
    {
      href: getLocalizedPath(locale, "/disclaimer"),
      label: locale === "zh" ? "免责声明与数据使用" : "Disclaimer & Data Usage",
    },
    { href: getLocalizedPath(locale, "/privacy"), label: locale === "zh" ? "隐私政策" : "Privacy" },
    { href: getLocalizedPath(locale, "/terms"), label: locale === "zh" ? "服务条款" : "Terms" },
  ];

  return (
    <footer className="border-t border-black/6 bg-white">
      <div className="page-shell py-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <Link href={getLocalizedPath(locale)} className="site-mark">
              {copy.siteName}
            </Link>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">{copy.footerSummary}</p>
          </div>

          <div>
            <p className="subtle-label">{locale === "zh" ? "说明页面" : "Information"}</p>
            <div className="mt-3 grid gap-2">
              {footerPages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="footer-link"
                  data-analytics-event="footer_info_click"
                  data-analytics-category="trust"
                  data-analytics-label={page.label}
                  data-analytics-destination={page.href}
                  data-analytics-link-type="internal"
                >
                  {page.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
