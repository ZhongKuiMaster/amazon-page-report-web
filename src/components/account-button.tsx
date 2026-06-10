import Link from "next/link";
import { getLocalizedPath, type SupportedLocale } from "@/lib/i18n";

export function AccountButton({ locale }: { locale: SupportedLocale }) {
  return (
    <Link
      href={getLocalizedPath(locale, "/account")}
      className="pill-link"
      data-analytics-event="account_entry_click"
      data-analytics-category="navigation"
      data-analytics-label="account"
      data-analytics-destination={getLocalizedPath(locale, "/account")}
      data-analytics-link-type="internal"
    >
      {locale === "zh" ? "登录" : "Log in"}
    </Link>
  );
}
