import type { Metadata } from "next";

import { AccountButton } from "@/components/account-button";
import { AmazonProductSeoSection } from "@/components/amazon-product-seo-section";
import { AmazonGrowthProfitPlanner } from "@/components/amazon-growth-profit-planner";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ToolPageRecommendations } from "@/components/tool-page-recommendations";

export const metadata: Metadata = {
  title: "Amazon Growth & Profit Planner | SKU Growth Decision Brief",
  description:
    "Plan Amazon growth with traffic gap, margin floor, inventory risk, and action priority so expansion decisions stay grounded in profit reality.",
};

export default function AmazonGrowthProfitPlannerPage() {
  return (
    <>
      <div className="border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl justify-end gap-2">
          <AccountButton locale="en" />
          <LanguageSwitcher locale="en" path="/amazon/amazon-growth-profit-planner" />
        </div>
      </div>
      <AmazonGrowthProfitPlanner locale="en" />
      <ToolPageRecommendations locale="en" />
      <AmazonProductSeoSection product="growth" />
    </>
  );
}
