import type { Metadata } from "next";
import { StaticInfoPage } from "@/components/static-info-page";
import { getCanonicalAlternates } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "关于我们",
  description: "了解电商工具系统为什么存在，以及它如何把电商运营判断做成可直接使用的工具。",
  alternates: getCanonicalAlternates("/about"),
  openGraph: {
    title: "关于我们",
    description: "了解电商工具系统为什么存在，以及它如何把电商运营判断做成可直接使用的工具。",
    url: absoluteUrl("/about/zh"),
    type: "website",
    locale: "zh_CN",
  },
};

export default function AboutZhPage() {
  return (
    <StaticInfoPage
      locale="zh"
      pageSlug="about"
      eyebrow="关于我们"
      title="为真实电商决策而做的工具系统"
      intro="电商工具系统服务的是需要快速做判断的运营团队：利润测算、合规判断、Listing 诊断、平台准备度，以及与之相邻的执行决策。"
      sections={[
        {
          heading: "这个产品在做什么",
          body: [
            "这个站点把电商团队反复遇到的问题拆成专门工具，而不是把它们埋进很长的文章或空泛的大仪表盘里。",
            "核心目标很直接：用户带着 ASIN、商品链接，或者少量必要输入进入页面后，应该能尽快拿到一个可以直接行动的结果。",
          ],
        },
        {
          heading: "当前已经上线什么",
          body: [
            "当前 beta 以 Amazon 为核心，同时并行扩展其他平台版块。",
            "整站优先坚持 live data first、首屏输入尽量短、结果层直接给判断和下一步，而不是向用户展示内部流程。",
          ],
        },
        {
          heading: "适合谁使用",
          body: [
            "核心用户是卖家、运营、品牌负责人，以及不想再给团队增加一套重型软件负担的小团队。",
            "尤其适合在更深投入之前，先快速判断某个产品、Listing、活动或平台动作值不值得继续推进。",
          ],
        },
      ]}
    />
  );
}
