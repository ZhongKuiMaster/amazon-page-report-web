import type { Metadata } from "next";

import { AmazonGrowthDeskWorkbench } from "@/components/amazon-growth-desk-workbench";

export const metadata: Metadata = {
  title: "Amazon Ads Audit Workbench | Ads and Retail Diagnosis",
  description:
    "Audit Amazon ads with sales, listing, keyword share, promo, inventory, and offsite signals, then convert findings into an action queue.",
};

export default function AmazonAdsAuditWorkbenchPage() {
  return <AmazonGrowthDeskWorkbench />;
}
