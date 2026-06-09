import type { Metadata } from "next";
import { StaticInfoPage } from "@/components/static-info-page";
import { getCanonicalAlternates } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Disclaimer & Data Usage",
  description: "Important usage boundaries, result limitations, and data-usage notes for Commerce Tool System.",
  alternates: getCanonicalAlternates("/disclaimer"),
  openGraph: {
    title: "Disclaimer & Data Usage",
    description: "Important usage boundaries, result limitations, and data-usage notes for Commerce Tool System.",
    url: absoluteUrl("/disclaimer"),
    type: "website",
    locale: "en_US",
  },
};

export default function DisclaimerPage() {
  return (
    <StaticInfoPage
      locale="en"
      pageSlug="disclaimer"
      eyebrow="Disclaimer & Data Usage"
      title="What the site can and cannot promise"
      intro="The product is built to be useful, fast, and operationally honest. That also means being clear about what the outputs represent, what data they depend on, and where the boundaries are."
      sections={[
        {
          heading: "Decision support, not guaranteed outcomes",
          body: [
            "The site helps users frame commercial decisions, spot likely risks, and shorten the path to action.",
            "It does not guarantee marketplace approval, ranking movement, ad performance, compliance success, profit outcomes, or business results.",
          ],
        },
        {
          heading: "Live and user-provided inputs",
          body: [
            "Some outputs depend on live public listing signals, while others depend on values provided by the user.",
            "If the source listing changes, if a marketplace updates its rules, or if a user enters incomplete assumptions, the result can change as well.",
          ],
        },
        {
          heading: "Data usage boundary",
          body: [
            "Submitted ASINs, URLs, text, and operating assumptions are used to generate the requested page result and to support product reliability and improvement.",
            "Users should not submit confidential credentials, payment data, personal identity material, or regulated records through tool inputs unless the product explicitly supports that workflow.",
          ],
        },
        {
          heading: "Professional judgment still matters",
          body: [
            "Where legal, tax, customs, medical, safety, or regulated-market issues matter, users should treat the output as a working aid rather than final authority.",
            "The final responsibility for business use stays with the operator, brand, or advisor making the decision.",
          ],
        },
      ]}
    />
  );
}
