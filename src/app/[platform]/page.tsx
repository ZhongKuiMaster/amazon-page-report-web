import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlatformPageContent } from "@/components/platform-page-content";
import { getCanonicalAlternates } from "@/lib/i18n";
import { capabilityClusters, platformRoadmap } from "@/lib/site-structure";
import { getNotFoundMetadata } from "@/lib/not-found-metadata";
import { absoluteUrl } from "@/lib/site-url";

type PlatformPageProps = {
  params: Promise<{ platform: string }>;
};

export function generateStaticParams() {
  return platformRoadmap.map((platform) => ({ platform: platform.slug }));
}

export async function generateMetadata({
  params,
}: PlatformPageProps): Promise<Metadata> {
  const { platform: platformSlug } = await params;
  const platform = platformRoadmap.find((item) => item.slug === platformSlug);

  if (!platform) {
    return getNotFoundMetadata("en");
  }

  const isTiktokShop = platform.slug === "tiktok-shop";
  const isShopify = platform.slug === "shopify";
  const keywords = Array.from(
    new Set(
      isTiktokShop
        ? [
            "TikTok Shop tools",
            "TikTok Shop product research",
            "TikTok Shop hook writing",
            "TikTok Shop short video plan",
            "TikTok Shop seller intake",
            "TikTok Shop product selection",
            "TikTok Shop video planning",
            "TikTok Shop content tools",
            "TikTok Shop creator tools",
          ]
        : isShopify
          ? [
              "Shopify tools",
              "Shopify product page audit",
              "Shopify offer positioning",
              "Shopify landing page angle builder",
              "Shopify pricing test planner",
              "Shopify PDP copy assembler",
              "Shopify post-purchase flow planner",
              "Shopify launch readiness scorecard",
              "Shopify DTC tools",
              "Shopify conversion tools",
            ]
          : [
              `${platform.name} seller tools`,
              `${platform.name} marketplace tools`,
              `${platform.name} seller calculator`,
              `${platform.name} seller software`,
              `${platform.name} listing tools`,
              `${platform.name} compliance tools`,
              `${platform.name} fulfillment tools`,
              `${platform.name} inventory tools`,
              `${platform.name} fee calculator`,
              `${platform.name} ungating tools`,
              ...capabilityClusters.flatMap((cluster) => [
                `${platform.name} ${cluster.title.toLowerCase()}`,
                `${platform.name} ${cluster.slug.replaceAll("-", " ")}`,
                `${platform.name} ${cluster.examples[0]?.toLowerCase() ?? cluster.slug.replaceAll("-", " ")}`,
              ]),
            ],
    ),
  );

  const pageTitle = isTiktokShop
    ? "TikTok Shop Tools | Intake, Product Research, Hooks, and Video Plans"
    : isShopify
      ? "Shopify Tools | PDP Audit, Offer Positioning, Pricing Tests, and Post-Purchase Flows"
      : `${platform.name} Tools, Calculators, and Compliance Checks`;
  const pageDescription = isTiktokShop
    ? `${platform.landingPageAngle} Open focused TikTok Shop tools for seller intake, product research, hook writing, and short-video planning.`
    : isShopify
      ? `${platform.landingPageAngle} Open focused Shopify tools for product page audits, offer positioning, landing-page angles, pricing tests, PDP rewrites, post-purchase flows, returns defense, and launch decisions.`
      : `${platform.landingPageAngle} Open structured tools built for ${platform.name} sellers and commerce teams.`;
  const isIndexablePlatform = platform.slug === "amazon";

  return {
    title: pageTitle,
    description: pageDescription,
    keywords,
    alternates: getCanonicalAlternates(`/${platform.slug}`),
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: "website",
      url: absoluteUrl(`/${platform.slug}`),
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
    },
    other: {
      "content-language": "en",
    },
    robots: isIndexablePlatform
      ? undefined
      : {
          index: false,
          follow: true,
        },
  };
}

export default async function PlatformPage({ params }: PlatformPageProps) {
  const { platform: platformSlug } = await params;

  if (!platformRoadmap.find((item) => item.slug === platformSlug)) {
    notFound();
  }

  return <PlatformPageContent locale="en" platformSlug={platformSlug} />;
}
