import type { Metadata } from "next";
import { StaticInfoPage } from "@/components/static-info-page";
import { getCanonicalAlternates } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "服务条款",
  description: "电商工具系统的服务条款。",
  alternates: getCanonicalAlternates("/terms"),
  openGraph: {
    title: "服务条款",
    description: "电商工具系统的服务条款。",
    url: absoluteUrl("/terms/zh"),
    type: "website",
    locale: "zh_CN",
  },
};

export default function TermsZhPage() {
  return (
    <StaticInfoPage
      locale="zh"
      pageSlug="terms"
      eyebrow="服务条款"
      title="使用本网站的基本规则"
      intro="这些条款的目的，是让网站对使用者和维护者都保持可用、诚实且可控。"
      sections={[
        {
          heading: "允许的使用方式",
          body: [
            "你可以将本网站用于真实的电商研究、运营、规划和决策支持工作流。",
            "你不得将本网站用于滥用、扰乱服务、超出正常使用范围的攻击性抓取、试图破坏系统，或任何违法用途。",
          ],
        },
        {
          heading: "结果的性质",
          body: [
            "工具输出属于决策支持材料，目的是帮助用户更快思考、更清楚行动，但不能替代法律、税务、财务、报关、监管或平台规则层面的专业意见。",
            "用户仍需对自己的上架、定价、采购、发货、合规状态，以及最终经营决策负责。",
          ],
        },
        {
          heading: "可用性与变更",
          body: [
            "由于产品当前仍处于 active beta，工具、流程、页面结构和结果呈现都可能持续调整。",
            "为了提升正确性、降低风险或简化产品，团队可以更新、暂停、替换或移除部分服务。",
          ],
        },
        {
          heading: "归属与责任",
          body: [
            "除非另有书面约定，站点本身、页面结构与产品逻辑的归属仍属于项目所有者。",
            "用户需要自行确保，对提交到工具中的内容、链接、Listing 文案、图片或业务材料拥有相应使用权。",
          ],
        },
      ]}
    />
  );
}
