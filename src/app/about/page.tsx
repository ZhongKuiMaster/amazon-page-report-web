import type { Metadata } from "next";
import { StaticInfoPage } from "@/components/static-info-page";
import { getCanonicalAlternates } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Commerce Tool System exists and how it turns ecommerce operating decisions into practical tools.",
  alternates: getCanonicalAlternates("/about"),
  openGraph: {
    title: "About",
    description:
      "Why Commerce Tool System exists and how it turns ecommerce operating decisions into practical tools.",
    url: absoluteUrl("/about"),
    type: "website",
    locale: "en_US",
  },
};

export default function AboutPage() {
  return (
    <StaticInfoPage
      locale="en"
      pageSlug="about"
      eyebrow="About"
      title="A tool system for real ecommerce decisions"
      intro="Commerce Tool System is built for operators who need a usable answer fast: margin checks, compliance calls, listing diagnosis, marketplace readiness, and adjacent execution decisions."
      sections={[
        {
          heading: "What this product does",
          body: [
            "This site turns recurring ecommerce questions into focused tools instead of burying them inside long articles or generic dashboards.",
            "The goal is simple: users should be able to bring an ASIN, product URL, or a small set of operating inputs, and get back a result they can act on immediately.",
          ],
        },
        {
          heading: "What is live today",
          body: [
            "The current beta is centered on Amazon, with additional platform sections being added in parallel.",
            "Across the site, we prioritize live-data-first flows, short input surfaces, and result pages that emphasize the decision, the risk, and the next action instead of internal process talk.",
          ],
        },
        {
          heading: "Who this is for",
          body: [
            "The primary audience is sellers, operators, brand owners, and small teams who need decision support without adding another heavy software layer to their workflow.",
            "It is especially useful when the team needs a fast first pass before deciding whether a product, listing, campaign, or marketplace move deserves deeper work.",
          ],
        },
      ]}
    />
  );
}
