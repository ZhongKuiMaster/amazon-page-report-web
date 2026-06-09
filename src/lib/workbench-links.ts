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
  key: "lemons7-workbench",
  href: "https://www.lemons7.com/workbench",
  external: true,
  index: "00",
  eyebrow: {
    en: "Solutions",
    zh: "解决方案",
  },
  name: {
    en: "Ecommerce Visual & Copy Solutions",
    zh: "电商视觉&文案解决方案",
  },
  description: {
    en: "Open the dedicated workbench for ecommerce visuals and copy workflows.",
    zh: "进入电商视觉与文案工作台，直接处理素材与内容产出。",
  },
  cta: {
    en: "Open workbench",
    zh: "打开工作台",
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
