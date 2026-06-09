import type { Metadata } from "next";
import { StaticInfoPage } from "@/components/static-info-page";
import { getCanonicalAlternates } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Commerce Tool System, including what data is used and how tool inputs are handled.",
  alternates: getCanonicalAlternates("/privacy"),
  openGraph: {
    title: "Privacy Policy",
    description: "Privacy policy for Commerce Tool System, including what data is used and how tool inputs are handled.",
    url: absoluteUrl("/privacy"),
    type: "website",
    locale: "en_US",
  },
};

export default function PrivacyPage() {
  return (
    <StaticInfoPage
      locale="en"
      pageSlug="privacy"
      eyebrow="Privacy Policy"
      title="How data is handled on this site"
      intro="Commerce Tool System is designed to minimize friction for operators. That includes keeping data handling narrow, understandable, and tied to the actual product workflow."
      sections={[
        {
          heading: "What users may enter",
          body: [
            "Depending on the tool, users may enter ASINs, product URLs, listing text, operating assumptions, cost values, or other business context needed to generate a result.",
            "Users should avoid submitting secrets, payment details, personal identity documents, or any information they are not comfortable using in a web-based tool workflow.",
          ],
        },
        {
          heading: "How tool inputs are used",
          body: [
            "Tool inputs are used to render the requested analysis, estimate, audit, or recommendation flow on the page.",
            "Some pages may also fetch public marketplace information associated with a submitted ASIN or URL so the result can be grounded in live listing context rather than manual user guesswork.",
          ],
        },
        {
          heading: "Analytics and operational logs",
          body: [
            "The site may use standard hosting, error, and usage logs to keep the service working, diagnose breakage, and understand which pages are actively used.",
            "Those logs are used for product operations, reliability, and improvement, not to resell user data.",
          ],
        },
        {
          heading: "Third-party services",
          body: [
            "This product may rely on infrastructure, analytics, hosting, or model-assist providers needed to operate the website and its tool flows.",
            "When third-party services are used, they are used to support the product workflow, not to change the ownership of the underlying user input.",
          ],
        },
      ]}
    />
  );
}
