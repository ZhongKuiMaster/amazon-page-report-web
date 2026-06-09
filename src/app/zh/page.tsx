import type { Metadata } from "next";
import { HomePageContent } from "@/components/home-page-content";
import { getCanonicalAlternates, getHomeCopy } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: getHomeCopy("zh").siteName,
  description: getHomeCopy("zh").siteTagline,
  alternates: getCanonicalAlternates("/"),
  openGraph: {
    title: getHomeCopy("zh").siteName,
    description: getHomeCopy("zh").siteTagline,
    url: absoluteUrl("/zh"),
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: getHomeCopy("zh").siteName,
    description: getHomeCopy("zh").siteTagline,
  },
  other: {
    "content-language": "zh",
  },
};

export default function ZhHomePage() {
  return <HomePageContent locale="zh" />;
}
