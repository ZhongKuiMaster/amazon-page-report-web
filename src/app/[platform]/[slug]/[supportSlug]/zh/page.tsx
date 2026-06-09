import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AmazonSupportPageTemplate } from "@/components/amazon-support-page-template";
import { getAmazonSupportPageEntry, getAmazonSupportPageStaticParams } from "@/lib/amazon-seo-support-pages";
import { getCanonicalAlternates } from "@/lib/i18n";
import { getNotFoundMetadata } from "@/lib/not-found-metadata";
import { absoluteUrl } from "@/lib/site-url";

type AmazonSupportZhPageProps = {
  params: Promise<{ platform: string; slug: string; supportSlug: string }>;
};

export function generateStaticParams() {
  return getAmazonSupportPageStaticParams();
}

export async function generateMetadata({
  params,
}: AmazonSupportZhPageProps): Promise<Metadata> {
  const { platform, slug, supportSlug } = await params;

  if (platform !== "amazon") {
    return getNotFoundMetadata("zh");
  }

  const entry = getAmazonSupportPageEntry(slug, supportSlug);
  if (!entry) {
    return getNotFoundMetadata("zh");
  }

  const path = `/${platform}/${slug}/${supportSlug}`;

  return {
    title: entry.title.zh,
    description: entry.description.zh,
    alternates: getCanonicalAlternates(path),
    openGraph: {
      title: entry.title.zh,
      description: entry.description.zh,
      url: absoluteUrl(`${path}/zh`),
      type: "article",
      locale: "zh_CN",
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title.zh,
      description: entry.description.zh,
    },
    other: {
      "content-language": "zh",
    },
  };
}

export default async function AmazonSupportZhPage({
  params,
}: AmazonSupportZhPageProps) {
  const { platform, slug, supportSlug } = await params;

  if (platform !== "amazon") {
    notFound();
  }

  const entry = getAmazonSupportPageEntry(slug, supportSlug);

  if (!entry) {
    notFound();
  }

  return <AmazonSupportPageTemplate locale="zh" entry={entry} />;
}
