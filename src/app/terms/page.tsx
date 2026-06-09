import type { Metadata } from "next";
import { StaticInfoPage } from "@/components/static-info-page";
import { getCanonicalAlternates } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for Commerce Tool System.",
  alternates: getCanonicalAlternates("/terms"),
  openGraph: {
    title: "Terms of Service",
    description: "Terms of service for Commerce Tool System.",
    url: absoluteUrl("/terms"),
    type: "website",
    locale: "en_US",
  },
};

export default function TermsPage() {
  return (
    <StaticInfoPage
      locale="en"
      pageSlug="terms"
      eyebrow="Terms of Service"
      title="Rules for using the site"
      intro="These terms exist to keep the site usable, honest, and operationally safe for both the people using the tools and the team maintaining them."
      sections={[
        {
          heading: "Permitted use",
          body: [
            "You may use the site to run legitimate ecommerce research, operations, planning, and decision-support workflows.",
            "You may not use the site for abuse, disruption, unauthorized scraping beyond ordinary usage, attempts to break the service, or unlawful conduct.",
          ],
        },
        {
          heading: "Nature of the output",
          body: [
            "Tool outputs are decision-support material. They are meant to help users think faster and act more clearly, but they are not a substitute for legal, tax, accounting, customs, regulatory, or marketplace-specific professional advice.",
            "Users remain responsible for their own submissions, listings, pricing, sourcing, shipping, compliance posture, and business decisions.",
          ],
        },
        {
          heading: "Availability and changes",
          body: [
            "Because the product is in active beta, tools, workflows, page structure, and result formatting may change over time.",
            "The team may update, pause, replace, or remove parts of the service in order to improve correctness, reduce risk, or simplify the product.",
          ],
        },
        {
          heading: "Ownership and responsibility",
          body: [
            "The site, its structure, and its product logic remain the property of the project owner unless a separate written agreement says otherwise.",
            "Users are responsible for making sure they have the right to use any content, URLs, listing text, images, or business material they bring into a tool flow.",
          ],
        },
      ]}
    />
  );
}
