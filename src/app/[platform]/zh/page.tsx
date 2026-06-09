import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlatformPageContent } from "@/components/platform-page-content";
import { getCanonicalAlternates } from "@/lib/i18n";
import { platformRoadmap } from "@/lib/site-structure";
import { getNotFoundMetadata } from "@/lib/not-found-metadata";
import { absoluteUrl } from "@/lib/site-url";

type PlatformZhPageProps = {
  params: Promise<{ platform: string }>;
};

export function generateStaticParams() {
  return platformRoadmap.map((platform) => ({ platform: platform.slug }));
}

function buildZhPlatformKeyword(...parts: string[]) {
  return parts
    .join("")
    .replace(/\s+/g, " ")
    .replace(/工具工具/g, "工具")
    .trim();
}

function getZhPlatformKeywords(platformName: string) {
  return [
    `${platformName}工具`,
    `${platformName}费用计算器`,
    `${platformName}合规检查`,
    `${platformName}商品页面优化`,
    `${platformName}库存管理`,
    `${platformName}履约规划`,
    `${platformName}类目准入`,
    `${platformName}FBA费用计算器`,
    `${platformName}备货清单`,
    `${platformName}平台工具`,
    "定价与费用测算",
    "政策与合规",
    "商品页面优化",
    "运营与履约规划",
    "增长与扩张策略",
  ].map((keyword) => buildZhPlatformKeyword(keyword));
}

function getZhWorkflowSearchPhrases(platformName: string) {
  return [
    `${platformName}利润测算`,
    `${platformName}到岸成本`,
    `${platformName}产品合规要求`,
    `${platformName}上架前检查`,
    `${platformName}搜索词布局`,
    `${platformName}库存补货计划`,
    `${platformName}发货准备`,
    `${platformName}运营规划`,
  ].map((keyword) => buildZhPlatformKeyword(keyword));
}

export async function generateMetadata({
  params,
}: PlatformZhPageProps): Promise<Metadata> {
  const { platform: platformSlug } = await params;
  const platform = platformRoadmap.find((item) => item.slug === platformSlug);

  if (!platform) {
    return getNotFoundMetadata("zh");
  }

  const isTiktokShop = platform.slug === "tiktok-shop";
  const isShopify = platform.slug === "shopify";
  const keywords = Array.from(
    new Set(
      isTiktokShop
        ? [
            "TikTok Shop 工具",
            "TikTok Shop卖家诊断",
            "TikTok Shop选品调研",
            "TikTok Shop视频钩子",
            "TikTok Shop短视频脚本",
            "TikTok Shop视频规划",
            "TikTok Shop内容工具",
            "TikTok Shop创作者工具",
          ]
        : isShopify
          ? [
              "Shopify 工具",
              "Shopify商品页审计",
              "Shopify offer定位",
              "Shopify落地页角度",
              "Shopify定价测试",
              "Shopify PDP文案",
              "Shopify售后流程",
              "Shopify上线准备度",
              "Shopify独立站工具",
            ]
          : [
              ...getZhPlatformKeywords(platform.zhName),
              ...getZhWorkflowSearchPhrases(platform.zhName),
            ],
    ),
  );

  const pageTitle = isTiktokShop
    ? "TikTok Shop 工具 | 卖家诊断、选品调研、钩子与短视频脚本"
    : isShopify
      ? "Shopify 工具 | 商品页审计、Offer 定位、定价测试与售后流程"
      : `${platform.zhName} 工具页 | 费用测算、合规检查与运营系统`;
  const pageDescription = isTiktokShop
    ? `${platform.zhLandingPageAngle} 这里集中提供卖家诊断、选品调研、钩子撰写和短视频脚本等 TikTok Shop 工具入口。`
    : isShopify
      ? `${platform.zhLandingPageAngle} 这里集中提供商品页审计、Offer 定位、落地页角度、定价测试、PDP 文案、售后流程、退货防守和上线判断等 Shopify 工具入口。`
      : `${platform.zhLandingPageAngle} 这里集中提供适合 ${platform.zhName} 卖家与团队的结构化工具入口。`;
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
      url: absoluteUrl(`/${platform.slug}/zh`),
      locale: "zh_CN",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
    },
    other: {
      "content-language": "zh",
    },
    robots: isIndexablePlatform
      ? undefined
      : {
          index: false,
          follow: true,
        },
  };
}

export default async function PlatformZhPage({ params }: PlatformZhPageProps) {
  const { platform: platformSlug } = await params;

  if (!platformRoadmap.find((item) => item.slug === platformSlug)) {
    notFound();
  }

  return <PlatformPageContent locale="zh" platformSlug={platformSlug} />;
}
