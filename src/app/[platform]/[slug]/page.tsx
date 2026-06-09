import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolPageContent } from "@/components/tool-page-content";
import { getVisibleToolBySlug, getVisibleTools } from "@/lib/page-visible-tools";
import {
  getCanonicalAlternates,
  localizeTool,
} from "@/lib/i18n";
import { getNotFoundMetadata } from "@/lib/not-found-metadata";
import { absoluteUrl } from "@/lib/site-url";
import { platformRoadmap } from "@/lib/site-structure";

type ToolPageProps = {
  params: Promise<{ platform: string; slug: string }>;
};

export function generateStaticParams() {
  return getVisibleTools().map((tool) => ({
    platform: tool.platform,
    slug: tool.slug,
  }));
}

export async function generateMetadata({
  params,
}: ToolPageProps): Promise<Metadata> {
  const { platform: platformSlug, slug } = await params;
  const platform = platformRoadmap.find((item) => item.slug === platformSlug);
  const sourceTool = getVisibleToolBySlug(slug);

  if (!platform || !sourceTool || sourceTool.platform !== platform.key) {
    return getNotFoundMetadata("en");
  }

  const tool = localizeTool(sourceTool, "en");
  const path = `/${platform.slug}/${tool.slug}`;
  const isInternalCompanion = sourceTool.sourceSkillType === "derived-companion" && sourceTool.indexPriority === "internal";
  const isTiktokShop = platform.slug === "tiktok-shop";
  const isShopify = platform.slug === "shopify";
  const keywordSet = new Set<string>(
    isTiktokShop
      ? [
          tool.name,
          tool.seoTitle,
          `TikTok Shop ${tool.name.toLowerCase()}`,
          `TikTok Shop ${tool.category.toLowerCase()} tool`,
          `TikTok Shop ${tool.intent.toLowerCase()}`,
          "TikTok Shop seller tool",
          "TikTok Shop creator tool",
        ]
      : isShopify
        ? [
            tool.name,
            tool.seoTitle,
            `Shopify ${tool.name.toLowerCase()}`,
            `Shopify ${tool.category.toLowerCase()} tool`,
            "Shopify DTC tool",
            "Shopify conversion tool",
            "Shopify ecommerce tool",
          ]
      : [
          tool.name,
          tool.seoTitle,
          `${platform.name} seller tool`,
          `${platform.name} ${tool.category.toLowerCase()} tool`,
          `${platform.name} ${tool.intent.toLowerCase()}`,
          `${platform.name} ${tool.name.toLowerCase()} tool`,
          `${platform.name} ${tool.name.toLowerCase()} calculator`,
          `${platform.name} ${tool.name.toLowerCase()} checker`,
          `${platform.name} ${tool.category.toLowerCase()} guide`,
        ],
  );

  for (const output of tool.outputs.slice(0, 4)) {
    keywordSet.add(`${platform.name} ${output}`.toLowerCase());
  }

  for (const input of tool.requiredInputs.slice(0, 4)) {
    keywordSet.add(`${platform.name} ${input}`.toLowerCase());
  }

  const pageDescription = isTiktokShop
    ? `${tool.summary} Load the core inputs, get the result fast, and move into the next TikTok Shop action with less setup friction.`
    : isShopify
      ? `${tool.summary} Load the key inputs, get a fast result, and leave with a plan your team can actually use.`
      : tool.seoDescription;
  const isIndexableTool = platform.slug === "amazon" && !isInternalCompanion;

  return {
    title: tool.seoTitle,
    description: pageDescription,
    keywords: Array.from(keywordSet),
    alternates: getCanonicalAlternates(path),
    openGraph: {
      title: tool.seoTitle,
      description: pageDescription,
      type: "website",
      url: absoluteUrl(path),
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: tool.seoTitle,
      description: pageDescription,
    },
    other: {
      "content-language": "en",
    },
    robots: isIndexableTool
      ? undefined
      : {
          index: false,
          follow: true,
        },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { platform: platformSlug, slug } = await params;
  const platform = platformRoadmap.find((item) => item.slug === platformSlug);
  const tool = getVisibleToolBySlug(slug);

  if (!platform || !tool || tool.platform !== platform.key) {
    notFound();
  }

  return <ToolPageContent locale="en" platformSlug={platformSlug} slug={slug} />;
}
