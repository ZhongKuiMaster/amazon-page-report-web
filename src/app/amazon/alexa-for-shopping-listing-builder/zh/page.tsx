import type { Metadata } from "next";

import { AccountButton } from "@/components/account-button";
import { AlexaListingBuilder } from "@/components/alexa-listing-builder";
import { AmazonProductSeoSection } from "@/components/amazon-product-seo-section";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ToolPageRecommendations } from "@/components/tool-page-recommendations";

export const metadata: Metadata = {
  title: "Alexa for Shopping 商品文案构建器 | Amazon AI 购物助手 Listing 优化工具",
  description:
    "帮助 Amazon 卖家整理标题、卖点、FAQ 和买家问答，让商品信息更容易被 Alexa for Shopping 等 AI 购物助手理解。不承诺推荐、排名或销量提升。",
};

export default function AlexaForShoppingListingBuilderZhPage() {
  return (
    <>
      <div className="border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl justify-end gap-2">
          <AccountButton locale="zh" />
          <LanguageSwitcher locale="zh" path="/amazon/alexa-for-shopping-listing-builder" />
        </div>
      </div>
      <AlexaListingBuilder locale="zh" />
      <ToolPageRecommendations locale="zh" />
      <AmazonProductSeoSection product="alexa" />
    </>
  );
}
