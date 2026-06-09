import type { Metadata } from "next";
import { StaticInfoPage } from "@/components/static-info-page";
import { getCanonicalAlternates } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "隐私政策",
  description: "电商工具系统的隐私政策，包括会使用哪些数据，以及工具输入如何被处理。",
  alternates: getCanonicalAlternates("/privacy"),
  openGraph: {
    title: "隐私政策",
    description: "电商工具系统的隐私政策，包括会使用哪些数据，以及工具输入如何被处理。",
    url: absoluteUrl("/privacy/zh"),
    type: "website",
    locale: "zh_CN",
  },
};

export default function PrivacyZhPage() {
  return (
    <StaticInfoPage
      locale="zh"
      pageSlug="privacy"
      eyebrow="隐私政策"
      title="本网站如何处理数据"
      intro="电商工具系统希望让运营使用起来足够直接，这也意味着数据处理必须尽量克制、易理解，并且只围绕真实产品流程展开。"
      sections={[
        {
          heading: "用户可能提交哪些内容",
          body: [
            "根据不同工具，用户可能会提交 ASIN、商品链接、Listing 文案、经营假设、成本数字，或生成结果所需的其他业务上下文。",
            "用户不应在本网站提交密钥、支付信息、身份证明文件，或任何你不愿意放进网页工具流程中的敏感信息。",
          ],
        },
        {
          heading: "工具输入如何被使用",
          body: [
            "这些输入会被用于生成当前页面请求的分析、测算、检查或建议结果。",
            "部分页面也可能基于你提交的 ASIN 或 URL 读取公开商品信息，使结果尽量基于真实 listing，而不是完全依赖手动猜测。",
          ],
        },
        {
          heading: "统计与运行日志",
          body: [
            "站点可能会使用常规的托管日志、报错日志和使用日志，用于维持服务可用、排查异常，以及判断哪些页面被真实使用。",
            "这些日志的用途是产品运维、可靠性和改进，不是为了转售用户数据。",
          ],
        },
        {
          heading: "第三方服务",
          body: [
            "本产品可能依赖托管、分析、基础设施或辅助模型服务，以支持网站和工具流程运行。",
            "如使用第三方服务，其目的也是为了支撑当前产品流程，而不是转移用户输入的所有权。",
          ],
        },
      ]}
    />
  );
}
