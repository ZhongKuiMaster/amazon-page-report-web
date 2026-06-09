import type { Metadata } from "next";
import { StaticInfoPage } from "@/components/static-info-page";
import { getCanonicalAlternates } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "联系方式",
  description: "了解如何就产品反馈、合作请求与问题报告联系电商工具系统。",
  alternates: getCanonicalAlternates("/contact"),
  openGraph: {
    title: "联系方式",
    description: "了解如何就产品反馈、合作请求与问题报告联系电商工具系统。",
    url: absoluteUrl("/contact/zh"),
    type: "website",
    locale: "zh_CN",
  },
};

export default function ContactZhPage() {
  return (
    <StaticInfoPage
      locale="zh"
      pageSlug="contact"
      eyebrow="联系方式"
      title="如何联系团队"
      intro="当前 beta 仍在快速迭代，所以最有价值的联系内容包括明确的问题反馈、产品建议、工作流需求，以及合作沟通。"
      sections={[
        {
          heading: "建议你提供什么信息",
          body: [
            "如果是工具结果看起来不对，建议附上页面链接、站点、你输入的内容，以及一句话说明哪里不符合预期。",
            "如果是合作、部署或渠道扩展沟通，建议直接说明业务背景，以及你希望这个产品支持的具体工作流。",
          ],
        },
        {
          heading: "当前支持方式",
          body: [
            "当前站点仍处于 active beta，响应节奏以实际处理能力为准，不承诺 SLA 级支持。",
            "在公开支持邮箱最终确定之前，这个页面就是当前官方联系口径：欢迎提交产品反馈与问题报告，但涉及法律、合规、税务或店铺处罚的紧急问题，仍应优先通过你自己的专业顾问或对应平台官方支持渠道处理。",
          ],
        },
        {
          heading: "提交问题前建议先做什么",
          body: [
            "如果方便，建议你用同一个 ASIN 或 URL 再重试一次，并记录问题是否稳定复现。",
            "这个细节能帮助区分是真正的产品问题，还是临时的数据源或网络波动。",
          ],
        },
      ]}
    />
  );
}
