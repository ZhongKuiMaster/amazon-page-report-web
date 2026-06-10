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

export const amazonAlexaListingBuilderEntry: LocalizedWorkbenchEntry = {
  key: "alexa-for-shopping-listing-builder",
  href: "/amazon/alexa-for-shopping-listing-builder",
  external: false,
  index: "02",
  eyebrow: {
    en: "Alexa for Shopping",
    zh: "Alexa for Shopping",
  },
  name: {
    en: "Alexa for Shopping Listing Builder",
    zh: "Alexa for Shopping 商品文案构建器",
  },
  description: {
    en: "Turn Amazon listing facts, keywords, buyer questions, and use cases into answer-ready title, bullets, Search Terms, A+ and FAQ direction.",
    zh: "把商品事实、关键词、买家问句和使用场景整理成更适合 Alexa for Shopping 理解的标题、五点、Search Terms、A+ 与 FAQ 方向。",
  },
  cta: {
    en: "Open Alexa builder",
    zh: "打开 Alexa 工具",
  },
};

export const amazonGrowthProfitPlannerEntry: LocalizedWorkbenchEntry = {
  key: "amazon-growth-profit-planner",
  href: "/amazon/amazon-growth-profit-planner",
  external: false,
  index: "03",
  eyebrow: {
    en: "Growth and Profit",
    zh: "增长与利润",
  },
  name: {
    en: "Amazon Growth & Profit Planner",
    zh: "Amazon 增长与利润规划器",
  },
  description: {
    en: "Use SKU price, cost, FBA fee, inventory, traffic, conversion, and ads efficiency to decide whether to scale, hold, fix conversion, clear stock, or protect margin.",
    zh: "基于 SKU 售价、成本、FBA 费用、库存、流量、转化和广告效率，判断该放量、控成本、修转化、清库存还是保利润。",
  },
  cta: {
    en: "Open planner",
    zh: "打开增长规划器",
  },
};

export const amazonFlagshipToolEntries = [
  amazonAdsWorkbenchEntry,
  amazonAlexaListingBuilderEntry,
  amazonGrowthProfitPlannerEntry,
] as const;
