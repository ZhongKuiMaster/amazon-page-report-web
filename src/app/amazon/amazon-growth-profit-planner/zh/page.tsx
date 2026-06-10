import type { Metadata } from "next";

import { AmazonProductSeoSection } from "@/components/amazon-product-seo-section";
import { AmazonGrowthProfitPlanner } from "@/components/amazon-growth-profit-planner";
import { CommercialAccessPanel } from "@/components/commercial-access-panel";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ToolPageRecommendations } from "@/components/tool-page-recommendations";

export const metadata: Metadata = {
  title: "Amazon 增长与利润规划器 | SKU 经营决策 Brief",
  description:
    "基于利润底线、流量缺口、转化信号和库存风险，判断 Amazon SKU 下一步增长动作。",
};

export default function AmazonGrowthProfitPlannerZhPage() {
  return (
    <>
      <div className="border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl justify-end">
          <LanguageSwitcher locale="zh" path="/amazon/amazon-growth-profit-planner" />
        </div>
      </div>
      <CommercialAccessPanel locale="zh" activeTool="growth-profit-planner" />
      <AmazonGrowthProfitPlanner locale="zh" />
      <ToolPageRecommendations locale="zh" />
      <AmazonProductSeoSection product="growth" />
    </>
  );
}
