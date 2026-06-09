import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AmazonSupportPageTemplate } from "@/components/amazon-support-page-template";
import { getAmazonSupportPageEntry, getAmazonSupportPageStaticParams } from "@/lib/amazon-seo-support-pages";
import { getCanonicalAlternates } from "@/lib/i18n";
import { getNotFoundMetadata } from "@/lib/not-found-metadata";
import { absoluteUrl } from "@/lib/site-url";

type AmazonSupportPageProps = {
  params: Promise<{ platform: string; slug: string; supportSlug: string }>;
};

export function generateStaticParams() {
  return getAmazonSupportPageStaticParams();
}

export async function generateMetadata({
  params,
}: AmazonSupportPageProps): Promise<Metadata> {
  const { platform, slug, supportSlug } = await params;

  if (platform !== "amazon") {
    return getNotFoundMetadata("en");
  }

  const entry = getAmazonSupportPageEntry(slug, supportSlug);
  if (!entry) {
    return getNotFoundMetadata("en");
  }

  const path = `/${platform}/${slug}/${supportSlug}`;

  return {
    title: entry.title.en,
    description: entry.description.en,
    alternates: getCanonicalAlternates(path),
    openGraph: {
      title: entry.title.en,
      description: entry.description.en,
      url: absoluteUrl(path),
      type: "article",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title.en,
      description: entry.description.en,
    },
    other: {
      "content-language": "en",
    },
  };
}

export default async function AmazonSupportPage({
  params,
}: AmazonSupportPageProps) {
  const { platform, slug, supportSlug } = await params;

  if (platform !== "amazon") {
    notFound();
  }

  const entry = getAmazonSupportPageEntry(slug, supportSlug);

  if (!entry) {
    notFound();
  }

  return <AmazonSupportPageTemplate locale="en" entry={entry} />;
}
