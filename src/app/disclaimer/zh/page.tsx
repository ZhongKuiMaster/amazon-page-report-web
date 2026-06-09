import type { Metadata } from "next";
import { StaticInfoPage } from "@/components/static-info-page";
import { getCanonicalAlternates } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "免责声明与数据使用",
  description: "电商工具系统的重要使用边界、结果限制与数据使用说明。",
  alternates: getCanonicalAlternates("/disclaimer"),
  openGraph: {
    title: "免责声明与数据使用",
    description: "电商工具系统的重要使用边界、结果限制与数据使用说明。",
    url: absoluteUrl("/disclaimer/zh"),
    type: "website",
    locale: "zh_CN",
  },
};

export default function DisclaimerZhPage() {
  return (
    <StaticInfoPage
      locale="zh"
      pageSlug="disclaimer"
      eyebrow="免责声明与数据使用"
      title="这个网站能做什么，不能承诺什么"
      intro="这个产品追求的是有用、快速、诚实，因此也必须把输出代表什么、依赖什么数据、边界在哪里讲清楚。"
      sections={[
        {
          heading: "它是决策支持，不是结果保证",
          body: [
            "这个网站的作用，是帮助用户更快整理商业判断、发现高概率风险，并缩短进入行动的路径。",
            "它不承诺平台审核一定通过、排名一定变化、广告一定提升、合规一定成功、利润一定达标，或任何最终经营结果。",
          ],
        },
        {
          heading: "结果依赖实时数据与用户输入",
          body: [
            "有些结果依赖公开商品页的实时信号，有些则依赖用户自己提供的经营数字与判断前提。",
            "如果商品页发生变化、平台规则更新，或者用户输入不完整，结果也可能随之变化。",
          ],
        },
        {
          heading: "数据使用边界",
          body: [
            "提交的 ASIN、链接、文本和经营假设，会被用于生成当前页面请求的结果，并用于支持产品可靠性与后续改进。",
            "除非产品明确支持相关流程，否则用户不应通过工具输入提交账号密钥、支付数据、身份证明材料，或受监管的敏感记录。",
          ],
        },
        {
          heading: "专业判断仍然重要",
          body: [
            "凡是涉及法律、税务、报关、医疗、安全或强监管市场问题时，用户都应把页面结果当作工作辅助，而不是最终裁决。",
            "最终经营使用责任，仍然在做决定的运营方、品牌方或专业顾问手中。",
          ],
        },
      ]}
    />
  );
}
