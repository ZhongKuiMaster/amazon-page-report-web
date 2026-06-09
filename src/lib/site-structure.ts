export type CommercePlatformKey =
  | "amazon"
  | "tiktok-shop"
  | "walmart"
  | "shopify"
  | "etsy"
  | "ozon";

export type PlatformStatus = "live" | "next" | "planned";

export type PlatformDefinition = {
  key: CommercePlatformKey;
  slug: string;
  name: string;
  status: PlatformStatus;
  shortLabel: string;
  currentFocus: string;
  futureFocus: string;
  landingPageAngle: string;
  zhName: string;
  zhShortLabel: string;
  zhCurrentFocus: string;
  zhFutureFocus: string;
  zhLandingPageAngle: string;
};

export type CapabilityCluster = {
  slug: string;
  title: string;
  summary: string;
  examples: string[];
  zhTitle: string;
  zhSummary: string;
  zhExamples: string[];
};

export const platformRoadmap: PlatformDefinition[] = [
  {
    key: "amazon",
    slug: "amazon",
    name: "Amazon",
    status: "live",
    shortLabel: "Available",
    currentFocus: "Fees, compliance, ungating, prep, and operational planning.",
    futureFocus: "Listing audits, variation logic, keyword checks, and catalog health.",
    landingPageAngle: "Official-rule-backed seller tools with real browser-side logic for commerce teams.",
    zhName: "Amazon",
    zhShortLabel: "可用",
    zhCurrentFocus: "费用测算、合规审核、类目解封、FBA 备货和运营规划。",
    zhFutureFocus: "Listing 审核、变体逻辑、关键词检查和目录健康度。",
    zhLandingPageAngle: "基于官方规则和浏览器端确定性逻辑的卖家工具系统。",
  },
  {
    key: "tiktok-shop",
    slug: "tiktok-shop",
    name: "TikTok Shop",
    status: "live",
    shortLabel: "Available",
    currentFocus: "Policy, onboarding, listing, fulfillment, and creator-commerce tasks.",
    futureFocus: "Commission math, listing checks, and creator matching utilities.",
    landingPageAngle: "A focused TikTok Shop tool set covering seller intake, product lane selection, hook direction, and shoot-ready short-video briefs.",
    zhName: "TikTok Shop",
    zhShortLabel: "可用",
    zhCurrentFocus: "政策、入驻、Listing、履约和达人电商事项。",
    zhFutureFocus: "佣金测算、Listing 检查和达人匹配工具。",
    zhLandingPageAngle: "一套聚焦 TikTok Shop 起步与内容判断的工具集合，覆盖卖家起步梳理、商品方向筛选、开场钩子判断和可拍摄的短视频脚本单。",
  },
  {
    key: "walmart",
    slug: "walmart",
    name: "Walmart Marketplace",
    status: "planned",
    shortLabel: "Coming soon",
    currentFocus: "Assortment eligibility, shipping SLAs, and listing quality.",
    futureFocus: "WFS cost planning, catalog setup, and approval readiness.",
    landingPageAngle: "Tool pages for assortment decisions, shipping requirements, and catalog readiness.",
    zhName: "Walmart Marketplace",
    zhShortLabel: "即将上线",
    zhCurrentFocus: "选品资格、物流时效和 Listing 质量。",
    zhFutureFocus: "WFS 成本规划、目录搭建和审批准备度。",
    zhLandingPageAngle: "围绕选品资格、物流要求和商品目录准备度的工具页。",
  },
  {
    key: "shopify",
    slug: "shopify",
    name: "Shopify",
    status: "live",
    shortLabel: "Available",
    currentFocus: "Conversion audits, offer positioning, lifecycle messaging, and DTC creative planning.",
    futureFocus: "Theme QA, app audits, retention analytics, and paid-media creative systems.",
    landingPageAngle: "A Shopify tool system for teams improving PDP conversion, offer clarity, lifecycle flows, and traffic routing.",
    zhName: "Shopify",
    zhShortLabel: "可用",
    zhCurrentFocus: "聚焦商品页转化审计、offer 定位、生命周期邮件和 DTC 内容规划。",
    zhFutureFocus: "后续扩展主题 QA、应用审计、留存分析和投放创意系统。",
    zhLandingPageAngle: "面向 Shopify 团队的工具系统，用来处理 PDP 转化、offer 清晰度、生命周期流程和流量路由。",
  },
  {
    key: "etsy",
    slug: "etsy",
    name: "Etsy",
    status: "planned",
    shortLabel: "Coming soon",
    currentFocus: "Listing quality, tags, shipping profiles, and handmade-policy fit.",
    futureFocus: "Fee calculators, holiday planning, and catalog optimization.",
    landingPageAngle: "Tool pages for listing quality, tags, shipping profiles, and policy fit.",
    zhName: "Etsy",
    zhShortLabel: "即将上线",
    zhCurrentFocus: "Listing 质量、标签、运费模板和手工商品政策匹配。",
    zhFutureFocus: "费用计算器、节日规划和目录优化。",
    zhLandingPageAngle: "围绕商品页面、标签、运费模板和政策匹配的工具页。",
  },
  {
    key: "ozon",
    slug: "ozon",
    name: "Ozon",
    status: "planned",
    shortLabel: "Coming soon",
    currentFocus: "Cross-border listing setup, localization, and logistics readiness.",
    futureFocus: "Catalog translation QA, tariff planning, and operations tooling.",
    landingPageAngle: "Tool pages for cross-border setup, localization, and logistics readiness.",
    zhName: "Ozon",
    zhShortLabel: "即将上线",
    zhCurrentFocus: "跨境 Listing 搭建、本地化和物流准备度。",
    zhFutureFocus: "目录翻译 QA、关税规划和运营工具。",
    zhLandingPageAngle: "围绕跨境上架、本地化和物流准备度的工具页。",
  },
];

export const capabilityClusters: CapabilityCluster[] = [
  {
    slug: "pricing-fees",
    title: "Pricing and fee math",
    summary:
      "Deterministic calculators for margin, landed cost, fees, tax pressure, and contribution risk.",
    examples: [
      "FBA fee calculators",
      "Tariff and landed-cost planners",
      "Platform commission checkers",
    ],
    zhTitle: "定价与费用测算",
    zhSummary: "用确定性工具处理利润、到岸成本、平台费用、税负压力和贡献利润风险。",
    zhExamples: ["FBA 费用计算器", "关税与到岸成本规划", "平台佣金检查"],
  },
  {
    slug: "policy-compliance",
    title: "Policy and compliance",
    summary:
      "Rule-backed checkers for documentation, restricted products, certification gaps, and approval readiness.",
    examples: [
      "Compliance checkers",
      "Ungating or approval readiness",
      "Restricted-product evidence reviews",
    ],
    zhTitle: "政策与合规",
    zhSummary: "基于规则的检查工具，用来判断资料缺口、受限商品风险、认证要求和审批准备度。",
    zhExamples: ["合规检查器", "类目解封或审批准备度", "受限商品证据审核"],
  },
  {
    slug: "listing-quality",
    title: "Listing quality",
    summary:
      "Audit-style tools for titles, bullets, images, variations, and search placement before content goes live.",
    examples: [
      "Title rule checkers",
      "Variation relationship reviews",
      "Browse and keyword fit checks",
    ],
    zhTitle: "Listing 质量",
    zhSummary: "在内容上线前，审核标题、五点、图片、变体和搜索匹配度的质检工具。",
    zhExamples: ["标题规则检查", "变体关系审核", "类目路径与关键词匹配检查"],
  },
  {
    slug: "operations-fulfillment",
    title: "Operations and fulfillment",
    summary:
      "Tools for prep, packaging, shipping, inventory timing, and warehouse coordination decisions.",
    examples: [
      "Prep checklists",
      "Inventory planners",
      "Shipping burden estimators",
    ],
    zhTitle: "运营与履约",
    zhSummary: "围绕备货、包装、发货、库存节奏和仓库协同决策的运营工具。",
    zhExamples: ["备货清单", "库存规划器", "物流负担测算"],
  },
  {
    slug: "growth-expansion",
    title: "Growth and expansion",
    summary:
      "Cross-platform tools that help sellers expand into new marketplaces without losing operational control.",
    examples: [
      "Marketplace-entry checklists",
      "Brand registry readiness",
      "Catalog expansion planning",
    ],
    zhTitle: "增长与扩张",
    zhSummary: "帮助卖家扩展到新平台、同时保持运营可控的跨平台增长工具。",
    zhExamples: ["平台进入清单", "品牌备案准备度", "目录扩展规划"],
  },
];
