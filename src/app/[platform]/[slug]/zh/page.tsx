import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolPageContent } from "@/components/tool-page-content";
import { getVisibleToolBySlug, getVisibleTools } from "@/lib/page-visible-tools";
import {
  getCanonicalAlternates,
  localizeTool,
  translateCategory,
  translateIntent,
} from "@/lib/i18n";
import { getNotFoundMetadata } from "@/lib/not-found-metadata";
import { absoluteUrl } from "@/lib/site-url";
import { platformRoadmap } from "@/lib/site-structure";

type ToolZhPageProps = {
  params: Promise<{ platform: string; slug: string }>;
};

export function generateStaticParams() {
  return getVisibleTools().map((tool) => ({
    platform: tool.platform,
    slug: tool.slug,
  }));
}

function getZhKeywordVariants(toolName: string, categoryLabel: string, intentLabel: string) {
  const suffixes = new Set<string>([
    toolName,
    `${toolName}工具`,
    `${toolName}指南`,
    `${toolName}${categoryLabel}`,
    `${toolName}${intentLabel}`,
  ]);

  if (categoryLabel.includes("测算") || categoryLabel.includes("费用")) {
    suffixes.add(`${toolName}计算器`);
    suffixes.add(`${toolName}费用测算`);
  }

  if (categoryLabel.includes("合规") || categoryLabel.includes("政策")) {
    suffixes.add(`${toolName}合规检查`);
    suffixes.add(`${toolName}审核工具`);
  }

  if (categoryLabel.includes("Listing")) {
    suffixes.add(`${toolName}商品页面检查`);
    suffixes.add(`${toolName}商品页面优化`);
  }

  if (categoryLabel.includes("运营") || categoryLabel.includes("履约")) {
    suffixes.add(`${toolName}运营规划`);
    suffixes.add(`${toolName}履约工具`);
  }

  if (categoryLabel.includes("增长") || categoryLabel.includes("扩张")) {
    suffixes.add(`${toolName}增长策略`);
    suffixes.add(`${toolName}扩张规划`);
  }

  return Array.from(suffixes);
}

function getZhKeywordGroupLabel(label: string) {
  return label.endsWith("工具") ? label : `${label}工具`;
}

function buildZhKeywordPhrase(...parts: string[]) {
  const phrase = parts.join("");

  return phrase
    .replace(/工具工具/g, "工具")
    .replace(/Amazon亚马逊/g, "Amazon")
    .replace(/亚马逊Amazon/g, "亚马逊")
    .replace(/AmazonAmazon/g, "Amazon")
    .replace(/ShopifyShopify/g, "Shopify")
    .replace(/TikTok ShopTikTok Shop/g, "TikTok Shop");
}

export async function generateMetadata({
  params,
}: ToolZhPageProps): Promise<Metadata> {
  const { platform: platformSlug, slug } = await params;
  const platform = platformRoadmap.find((item) => item.slug === platformSlug);
  const sourceTool = getVisibleToolBySlug(slug);

  if (!platform || !sourceTool || sourceTool.platform !== platform.key) {
    return getNotFoundMetadata("zh");
  }

  const tool = localizeTool(sourceTool, "zh");
  const path = `/${platform.slug}/${tool.slug}`;
  const isInternalCompanion = sourceTool.sourceSkillType === "derived-companion" && sourceTool.indexPriority === "internal";
  const categoryLabel = translateCategory(sourceTool.category, "zh");
  const intentLabel = translateIntent(sourceTool.intent, "zh");
  const isTiktokShop = platform.slug === "tiktok-shop";
  const isShopify = platform.slug === "shopify";
  const keywordSet = new Set<string>([
    tool.name,
    buildZhKeywordPhrase(platform.zhName, "卖家工具"),
    buildZhKeywordPhrase(platform.zhName, categoryLabel),
    buildZhKeywordPhrase(platform.zhName, intentLabel),
    buildZhKeywordPhrase(platform.zhName, tool.name),
    buildZhKeywordPhrase(platform.zhName, tool.name, "工具"),
    buildZhKeywordPhrase(tool.name, platform.zhName),
    buildZhKeywordPhrase(tool.name, "怎么做"),
    buildZhKeywordPhrase(tool.name, "教程"),
    buildZhKeywordPhrase(tool.name, "规则"),
    buildZhKeywordPhrase(tool.name, "要求"),
    getZhKeywordGroupLabel(categoryLabel),
    getZhKeywordGroupLabel(intentLabel),
    ...(isTiktokShop
      ? [
          "TikTok Shop卖家工具",
          "TikTok Shop内容工具",
          "TikTok Shop运营工具",
        ]
      : isShopify
        ? [
            "Shopify独立站工具",
            "Shopify DTC工具",
            "Shopify转化工具",
          ]
      : []),
    ...getZhKeywordVariants(tool.name, categoryLabel, intentLabel).map((value) =>
      buildZhKeywordPhrase(value),
    ),
  ]);

  if (sourceTool.sourceSkillType === "canonical-skill") {
    keywordSet.add(buildZhKeywordPhrase(tool.name, "最佳实践"));
    keywordSet.add(buildZhKeywordPhrase(tool.name, "使用方法"));
  }

  if (sourceTool.sourceSkillType === "derived-companion") {
    keywordSet.add(buildZhKeywordPhrase(tool.name, "快速检查"));
    keywordSet.add(buildZhKeywordPhrase(tool.name, "审核清单"));
  }

  if (tool.seoDescription) {
    keywordSet.add(tool.seoDescription);
  }

  const pageDescription = isTiktokShop
    ? `${tool.seoDescription} 先填写必要信息，再直接查看结果与下一步执行方向。`
    : isShopify
      ? `${tool.seoDescription} 先填写关键输入，再直接拿到清晰结果和下一步建议。`
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
      url: absoluteUrl(`${path}/zh`),
      locale: "zh_CN",
    },
    twitter: {
      card: "summary_large_image",
      title: tool.seoTitle,
      description: pageDescription,
    },
    other: {
      "content-language": "zh",
    },
    robots: isIndexableTool
      ? undefined
      : {
          index: false,
          follow: true,
        },
  };
}

export default async function ToolZhPage({ params }: ToolZhPageProps) {
  const { platform: platformSlug, slug } = await params;
  const platform = platformRoadmap.find((item) => item.slug === platformSlug);
  const tool = getVisibleToolBySlug(slug);

  if (!platform || !tool || tool.platform !== platform.key) {
    notFound();
  }

  return <ToolPageContent locale="zh" platformSlug={platformSlug} slug={slug} />;
}
