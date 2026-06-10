import type { Metadata } from "next";

import { AccountButton } from "@/components/account-button";
import { AlexaListingBuilder } from "@/components/alexa-listing-builder";
import { AmazonProductSeoSection } from "@/components/amazon-product-seo-section";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ToolPageRecommendations } from "@/components/tool-page-recommendations";

export const metadata: Metadata = {
  title: "Alexa for Shopping Listing Builder | AI-Ready Amazon Listing Tool",
  description:
    "Build Amazon listing drafts that are easier for Alexa for Shopping and AI shopping assistants to understand, compare, and answer from. No ranking or recommendation guarantee.",
};

export default function AlexaForShoppingListingBuilderPage() {
  return (
    <>
      <div className="border-b border-slate-200 bg-white px-4 py-3 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl justify-end gap-2">
          <AccountButton locale="en" />
          <LanguageSwitcher locale="en" path="/amazon/alexa-for-shopping-listing-builder" />
        </div>
      </div>
      <AlexaListingBuilder locale="en" />
      <ToolPageRecommendations locale="en" />
      <AmazonProductSeoSection product="alexa" />
    </>
  );
}
