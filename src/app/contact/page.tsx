import type { Metadata } from "next";
import { StaticInfoPage } from "@/components/static-info-page";
import { getCanonicalAlternates } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to contact Commerce Tool System for product feedback, business requests, and issue reports.",
  alternates: getCanonicalAlternates("/contact"),
  openGraph: {
    title: "Contact",
    description: "How to contact Commerce Tool System for product feedback, business requests, and issue reports.",
    url: absoluteUrl("/contact"),
    type: "website",
    locale: "en_US",
  },
};

export default function ContactPage() {
  return (
    <StaticInfoPage
      locale="en"
      pageSlug="contact"
      eyebrow="Contact"
      title="How to reach the team"
      intro="This beta is still evolving quickly, so the most useful messages are concrete bug reports, product feedback, workflow requests, and partnership inquiries."
      sections={[
        {
          heading: "What to send",
          body: [
            "If a tool result looks wrong, include the page URL, the marketplace, the input you used, and a short description of what felt off.",
            "If you want to discuss partnerships, deployment, or platform-specific expansion, state the business context and the exact workflow you are trying to support.",
          ],
        },
        {
          heading: "Current support posture",
          body: [
            "This site is in active beta. Response time is best-effort rather than guaranteed SLA support.",
            "Until a public support inbox is finalized, this page acts as the official contact policy: product feedback and issue reporting are welcome, but urgent legal, compliance, tax, or account-enforcement matters should go through your own professional advisors or the relevant marketplace support channels.",
          ],
        },
        {
          heading: "Before you report a bug",
          body: [
            "When possible, retry once with the same ASIN or URL and note whether the issue is reproducible.",
            "That small detail helps separate a true product problem from a temporary source or network issue.",
          ],
        },
      ]}
    />
  );
}
