import type { SupportedLocale } from "@/lib/i18n";

export type LocalizedWorkbenchEntry = {
  key: string;
  href: string;
  external: boolean;
  index?: string;
  eyebrow: Record<SupportedLocale, string>;
  name: Record<SupportedLocale, string>;
  description: Record<SupportedLocale, string>;
  cta: Record<SupportedLocale, string>;
};

export const ecommerceVisualWorkbenchEntry: LocalizedWorkbenchEntry = {
  key: "amazon-alexa-copy-visual-plan",
  href: "https://bit.ly/dealingnow",
  external: true,
  index: "00",
  eyebrow: {
    en: "Amazon Creative Plan",
    zh: "Amazon Creative Plan",
  },
  name: {
    en: "Amazon Alexa Copy & Visual Plan",
    zh: "Amazon Alexa 文案&视觉方案",
  },
  description: {
    en: "Open the dedicated Amazon Alexa copy and visual planning offer before choosing a platform tool.",
    zh: "优先进入 Amazon Alexa 文案与视觉方案，再选择具体平台工具。",
  },
  cta: {
    en: "Open plan",
    zh: "查看方案",
  },
};

export const amazonAdsWorkbenchEntry: LocalizedWorkbenchEntry = {
  key: "amazon-ads-audit-workbench",
  href: "/amazon/amazon-ads-audit-workbench",
  external: false,
  index: "01",
  eyebrow: {
    en: "Amazon Ads",
    zh: "Amazon Ads",
  },
  name: {
    en: "Amazon Ads Diagnosis Workbench",
    zh: "Amazon Ads 体检工作台",
  },
  description: {
    en: "Open the Amazon ads and retail diagnosis desk for campaign pressure, retail drag, and next actions.",
    zh: "进入 Amazon Ads 与零售联动体检工作台，查看广告压力、零售拖累和下一步动作。",
  },
  cta: {
    en: "Open Ads workbench",
    zh: "打开 Ads 工作台",
  },
};
