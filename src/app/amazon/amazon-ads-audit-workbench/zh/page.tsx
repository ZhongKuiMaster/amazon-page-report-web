import type { Metadata } from "next";

import { AccountButton } from "@/components/account-button";
import { AmazonProductSeoSection } from "@/components/amazon-product-seo-section";
import { AmazonGrowthDeskWorkbench } from "@/components/amazon-growth-desk-workbench";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ToolPageRecommendations } from "@/components/tool-page-recommendations";

export const metadata: Metadata = {
  title: "Amazon Ads 体检工作台 | 广告与零售诊断",
  description:
    "上传 Amazon Ads 与业务报表，判断 PPC 浪费、TACOS 压力、关键词机会、Listing 转化拖累和下一步动作。",
};

export default function AmazonAdsAuditWorkbenchZhPage() {
  return (
    <>
      <div className="border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl justify-end gap-2">
          <AccountButton locale="zh" />
          <LanguageSwitcher locale="zh" path="/amazon/amazon-ads-audit-workbench" />
        </div>
      </div>
      <AmazonGrowthDeskWorkbench locale="zh" />
      <ToolPageRecommendations locale="zh" />
      <AmazonProductSeoSection product="ads" locale="zh" />
    </>
  );
}
