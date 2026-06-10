import type { Metadata } from "next";

import { AccountButton } from "@/components/account-button";
import { AmazonProductSeoSection } from "@/components/amazon-product-seo-section";
import { AmazonGrowthDeskWorkbench } from "@/components/amazon-growth-desk-workbench";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ToolPageRecommendations } from "@/components/tool-page-recommendations";

export const metadata: Metadata = {
  title: "Amazon Ads Audit Workbench | Ads and Retail Diagnosis",
  description:
    "Upload Amazon ads and business reports to diagnose PPC waste, TACOS pressure, keyword share gaps, listing conversion drag, and next operator actions.",
};

export default function AmazonAdsAuditWorkbenchPage() {
  return (
    <>
      <div className="border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl justify-end gap-2">
          <AccountButton locale="en" />
          <LanguageSwitcher locale="en" path="/amazon/amazon-ads-audit-workbench" />
        </div>
      </div>
      <AmazonGrowthDeskWorkbench locale="en" />
      <ToolPageRecommendations locale="en" />
      <AmazonProductSeoSection product="ads" />
    </>
  );
}
