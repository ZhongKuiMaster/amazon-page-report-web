import type { Metadata } from "next";
import { HomePageContent } from "@/components/home-page-content";
import { getCanonicalAlternates, getHomeCopy } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: getHomeCopy("en").siteName,
  description: getHomeCopy("en").siteTagline,
  alternates: getCanonicalAlternates("/"),
  openGraph: {
    title: getHomeCopy("en").siteName,
    description: getHomeCopy("en").siteTagline,
    url: absoluteUrl("/"),
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: getHomeCopy("en").siteName,
    description: getHomeCopy("en").siteTagline,
  },
  other: {
    "content-language": "en",
  },
};

export default function HomePage() {
  return <HomePageContent locale="en" />;
}
