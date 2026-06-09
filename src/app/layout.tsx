import type { Metadata } from "next";
import { AnalyticsScripts } from "@/components/analytics-scripts";
import { analyticsConfig } from "@/lib/analytics-config";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Commerce Tool System | Practical Tools for Commerce Teams",
    template: "%s | Commerce Tool System",
  },
  description:
    "Practical tools for Amazon, Shopify, TikTok Shop, and other commerce teams, with calculators, checks, audits, and clear next-step recommendations.",
  keywords: [
    "commerce tool system",
    "amazon seller tools",
    "marketplace tools",
    "amazon fba calculator",
    "amazon tariff calculator",
    "amazon shipping calculator",
    "amazon compliance checker",
    "amazon brand registry checker",
    "amazon category ungating",
  ],
  openGraph: {
    title: "Commerce Tool System | Practical Tools for Commerce Teams",
    description:
      "Practical tools for fees, compliance, listing quality, conversion, and operations across major commerce platforms.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Commerce Tool System | Practical Tools for Commerce Teams",
    description:
      "Practical tools for Amazon, Shopify, TikTok Shop, and other commerce teams.",
  },
  other: {
    ...(analyticsConfig.googleSiteVerification
      ? {
          "google-site-verification": analyticsConfig.googleSiteVerification,
        }
      : {}),
    ...(analyticsConfig.bingSiteVerification
      ? {
          "msvalidate.01": analyticsConfig.bingSiteVerification,
        }
      : {}),
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Commerce Tool System",
  description:
    "A multilingual commerce tool product for practical analysis, checks, and recommendations.",
  url: siteUrl,
};

const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Commerce Tool System",
  url: siteUrl,
  description:
    "A multilingual commerce tool product organized around practical seller workflows.",
  inLanguage: ["en", "zh"],
};

const appStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Commerce Tool System",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "A set of commerce calculators, audits, checkers, and recommendation tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full bg-[var(--page-background)] text-[var(--page-foreground)]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(appStructuredData) }}
        />
        <AnalyticsScripts />
        <div className="flex min-h-full flex-col">{children}</div>
      </body>
    </html>
  );
}
