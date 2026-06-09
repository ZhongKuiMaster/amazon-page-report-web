import Link from "next/link";
import { getLocalizedPath, type SupportedLocale } from "@/lib/i18n";

const languages: { locale: SupportedLocale; label: string }[] = [
  { locale: "en", label: "EN" },
  { locale: "zh", label: "中文" },
];

export function LanguageSwitcher({
  locale,
  path = "/",
}: {
  locale: SupportedLocale;
  path?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {languages.map((item) => (
        <Link
          key={item.locale}
          href={getLocalizedPath(item.locale, path)}
          className={item.locale === locale ? "pill-link pill-link-active" : "pill-link"}
          data-analytics-event="language_switch"
          data-analytics-category="navigation"
          data-analytics-label={item.locale}
          data-analytics-destination={getLocalizedPath(item.locale, path)}
          data-analytics-link-type="internal"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
