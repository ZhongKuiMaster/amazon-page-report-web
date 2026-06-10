import { JsonLd } from "@/components/json-ld";
import type { SupportedLocale } from "@/lib/i18n";

type ProductSeoContent = {
  slug: string;
  name: string;
  summary: string;
  decision: string;
  inputs: string[];
  outputs: string[];
  boundaries: string[];
  faqs: Array<{ question: string; answer: string }>;
};

const productSeoContent: Record<"ads" | "alexa" | "growth", ProductSeoContent> = {
  ads: {
    slug: "/amazon/amazon-ads-audit-workbench",
    name: "Amazon Ads Audit Workbench",
    summary:
      "A semi-automated Amazon ads audit workspace for sellers who need to turn uploaded ad evidence into a prioritized PPC waste, TACOS, and next-action brief.",
    decision:
      "Use it when you need to decide what to cut, hold, review, or escalate before changing campaigns.",
    inputs: [
      "Sponsored Products search term or campaign CSV",
      "Main ASIN or SKU",
      "Target ACOS and break-even ACOS",
      "Optional Business Report, placement, budget, structure, and SQP context",
    ],
    outputs: [
      "Current diagnosis and confidence",
      "Row-level evidence and missing data",
      "Priority action queue",
      "Review rules and exportable audit summary",
      "Expert review readiness boundary",
    ],
    boundaries: [
      "It does not connect to Seller Central or change campaigns automatically.",
      "It does not guarantee lower ACOS, lower TACOS, sales growth, ranking improvement, or profit lift.",
      "Demo presets are not enough for paid expert review; real uploaded evidence is required.",
    ],
    faqs: [
      {
        question: "What reports should I prepare for Amazon Ads Audit Workbench?",
        answer:
          "Start with a Sponsored Products search term or campaign CSV, the main ASIN or SKU, target ACOS, and break-even ACOS. Business Report, placement, budget, structure, and SQP data improve the review but are optional for the first pass.",
      },
      {
        question: "Does Amazon Ads Audit Workbench manage my campaigns automatically?",
        answer:
          "No. It creates a diagnostic brief and action queue from uploaded and typed inputs. A seller or operator still reviews the evidence before changing campaigns.",
      },
      {
        question: "When is expert review available?",
        answer:
          "Expert review is only shown after the workbench has real uploaded ad evidence and the required operating inputs. Default and demo states stay self-serve.",
      },
    ],
  },
  alexa: {
    slug: "/amazon/alexa-for-shopping-listing-builder",
    name: "Alexa for Shopping Listing Builder",
    summary:
      "An AI-ready Amazon listing tool focused on buyer question coverage, Alexa for Shopping readability, keyword placement, FAQs, and proof-safe English listing drafts.",
    decision:
      "Use it when you need to decide how a listing should answer buyer questions through titles, bullets, A+, Search Terms, FAQs, and proof-safe wording for Alexa for Shopping and other AI shopping assistants.",
    inputs: [
      "Product category",
      "Current title and at least three bullets",
      "Specific target buyer",
      "Three core use cases",
      "Five to ten target keywords",
      "Three to five buyer or Alexa-style questions",
    ],
    outputs: [
      "Current readiness branch",
      "Question coverage evidence",
      "Priority edits",
      "Suggested title, bullets, description, and Search Terms when inputs are complete",
      "Compliance and proof reminders",
    ],
    boundaries: [
      "It does not guarantee Alexa recommendation, search ranking, citation, traffic, sales, or conversion lift.",
      "It does not claim to know Amazon A9, COSMO, or Alexa internal weights.",
      "Missing core inputs block the full listing draft.",
    ],
    faqs: [
      {
        question: "What is Alexa for Shopping Listing Builder?",
        answer:
          "It is an Amazon listing preparation tool that turns product details, keywords, buyer questions, and positioning into clearer titles, bullets, FAQs, Search Terms, and answer-ready copy for Alexa for Shopping and other AI shopping assistants.",
      },
      {
        question: "Can this tool guarantee Alexa for Shopping will recommend my product?",
        answer:
          "No. It helps make listing language easier to understand and answer from, but it cannot guarantee Alexa recommendation, ranking, citation, traffic, sales, or conversion lift.",
      },
      {
        question: "What inputs do I need?",
        answer:
          "You can start with an ASIN import or manually provide product category, current title, bullets, target buyer, use cases, keywords, buyer questions, description, reviews, Q&A, and product facts.",
      },
      {
        question: "What does the tool output?",
        answer:
          "It outputs a current readiness judgment, suggested title, bullets, long description, Search Terms, A+ module ideas, FAQ-style question coverage, and compliance or proof reminders.",
      },
      {
        question: "Is this the same as Amazon SEO?",
        answer:
          "No. Amazon SEO often focuses on keyword relevance and search visibility. This tool focuses on whether the listing can clearly answer buyer questions for Alexa for Shopping and AI-assisted shopping experiences.",
      },
    ],
  },
  growth: {
    slug: "/amazon/amazon-growth-profit-planner",
    name: "Amazon Growth & Profit Planner",
    summary:
      "A SKU-level operating planner that connects profit floor, traffic gap, conversion signal, inventory risk, inventory cover, ad tolerance, and official action boundaries.",
    decision:
      "Use it when you need to decide whether to protect margin, fix conversion, add controlled traffic, clear inventory, or scale with a stop-line.",
    inputs: [
      "SKU or ASIN name",
      "Price, landed cost, referral fee, and FBA or fulfillment fee",
      "Inventory units and average daily sales",
      "Sessions or page views",
      "Orders or CVR",
      "Ad spend and ad sales or ACOS",
      "Current goal",
    ],
    outputs: [
      "Current operating branch",
      "Profit structure and ad tolerance line",
      "Traffic or conversion bottleneck",
      "Official action boundary",
      "Budget boundary and stop-line",
    ],
    boundaries: [
      "It does not read Seller Central live data or verify program eligibility.",
      "It does not generate listing copy or replace Ads Workbench campaign diagnosis.",
      "It does not guarantee growth, lower ACOS, higher profit, ranking, or ROI.",
    ],
    faqs: [
      {
        question: "Is Amazon Growth & Profit Planner a profit calculator?",
        answer:
          "No. It uses profit inputs as the operating floor, then decides whether the next move should be margin protection, traffic, conversion, inventory control, clearance, or controlled scale.",
      },
      {
        question: "Can it tell me whether to run a Coupon or Deal?",
        answer:
          "It can show whether a Coupon or Deal is compatible with the current profit and inventory boundary. It does not verify Amazon program eligibility or guarantee results.",
      },
      {
        question: "What happens if cost, traffic, or inventory data is missing?",
        answer:
          "The planner blocks strong growth conclusions and tells you which input to add before making budget, promotion, or scale decisions.",
      },
    ],
  },
};

const productSeoContentZh: Partial<Record<"ads" | "alexa" | "growth", ProductSeoContent>> = {
  ads: {
    slug: "/amazon/amazon-ads-audit-workbench/zh",
    name: "Amazon Ads 体检工作台",
    summary:
      "面向 Amazon 卖家的广告体检工具，用上传的 Sponsored Products、Sponsored Brands 和业务报表，生成 PPC 浪费、TACOS 压力和下一步广告动作。",
    decision:
      "当你需要决定先砍浪费、保留赢家词、控 TACOS、补 Business Report，还是进入专家建议时使用。",
    inputs: [
      "Sponsored Products search term 或 campaign CSV",
      "主 ASIN",
      "目标 ACOS / TACOS 和盈亏平衡 ACOS",
      "可选 Business Report、Placement、Budget、Campaign Structure 和 SQP 报表",
    ],
    outputs: [
      "当前广告判断和置信度",
      "行级证据和缺失数据",
      "优先广告动作",
      "复查规则和可导出的诊断摘要",
      "专家建议是否适合进入",
    ],
    boundaries: [
      "不连接 Seller Central，也不会自动修改 campaign。",
      "不承诺 ACOS/TACOS 必降、销量增长、排名提升或利润提升。",
      "演示数据只能用于看效果，真实诊断必须上传自己的广告和业务报表。",
    ],
    faqs: [
      {
        question: "Amazon Ads 体检工作台需要准备哪些报表？",
        answer:
          "最低需要 Sponsored Products search term 或 campaign CSV、主 ASIN、目标 ACOS/TACOS 和盈亏平衡 ACOS。Business Report、Placement、Budget、Campaign Structure 和 SQP 会提高判断质量。",
      },
      {
        question: "这个工具会自动管理我的广告活动吗？",
        answer:
          "不会。它只根据上传和手填输入生成诊断摘要和下一步动作，卖家或投手仍然需要人工确认后再改 campaign。",
      },
      {
        question: "什么时候适合进入专家建议？",
        answer:
          "当页面已有真实上传的广告证据，并且最低经营输入齐全时，才适合进入专家建议。默认状态和演示数据不应该直接用于付费复核。",
      },
    ],
  },
};

export function AmazonProductSeoSection({ product, locale = "en" }: { product: keyof typeof productSeoContent; locale?: SupportedLocale }) {
  const content = locale === "zh" && productSeoContentZh[product] ? productSeoContentZh[product] : productSeoContent[product];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: content.name,
    url: `https://dealingnow.com${content.slug}`,
    description: content.summary,
  };

  return (
    <section className="border-t border-slate-200 bg-white px-4 py-10 text-slate-950 lg:px-8" data-seo-geo-section={content.slug}>
      <JsonLd data={webPageJsonLd} />
      <JsonLd data={faqJsonLd} />
      <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{locale === "zh" ? "SEO / GEO 决策说明" : "SEO / GEO decision guide"}</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight">{locale === "zh" ? `${content.name}决策说明` : `${content.name} decision guide`}</h2>
          <p className="mt-4 text-base leading-7 text-slate-700">{content.summary}</p>
          <p className="mt-3 rounded-lg border border-teal-100 bg-teal-50 p-4 text-sm font-semibold leading-6 text-teal-950">
            {content.decision}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <SeoList title={locale === "zh" ? "输入" : "Inputs"} items={content.inputs} locale={locale} />
          <SeoList title={locale === "zh" ? "输出" : "Outputs"} items={content.outputs} locale={locale} />
          <div className="md:col-span-2">
            <SeoList title={locale === "zh" ? "边界" : "Boundaries"} items={content.boundaries} locale={locale} />
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 w-full max-w-7xl">
        <h2 className="text-xl font-black tracking-tight">FAQ</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {content.faqs.map((faq) => (
            <article key={faq.question} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-base font-black leading-6">{faq.question}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-700">{faq.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SeoList({ title, items, locale = "en" }: { title: string; items: string[]; locale?: SupportedLocale }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <h3 className={`text-sm font-black text-slate-600 ${locale === "zh" ? "" : "uppercase tracking-[0.12em]"}`}>{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
