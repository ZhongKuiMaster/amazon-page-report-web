export type CommercialToolId = "ads-workbench" | "alexa-listing-builder" | "growth-profit-planner";

export type EntitlementSource = "registration" | "wechat-community" | "paid-pack" | "admin-grant";

export type CommercialPlanId = "trial" | "starter" | "operator" | "expert";

export type CommercialTool = {
  id: CommercialToolId;
  name: string;
  zhName: string;
  path: string;
  zhPath: string;
};

export type EntitlementRule = {
  source: EntitlementSource;
  label: string;
  zhLabel: string;
  creditsPerTool: number;
};

export const commercialTools: CommercialTool[] = [
  {
    id: "ads-workbench",
    name: "Amazon Ads Audit Workbench",
    zhName: "Amazon Ads 体检工作台",
    path: "/amazon/amazon-ads-audit-workbench",
    zhPath: "/amazon/amazon-ads-audit-workbench/zh",
  },
  {
    id: "alexa-listing-builder",
    name: "Alexa for Shopping Listing Builder",
    zhName: "Alexa for Shopping 商品文案构建器",
    path: "/amazon/alexa-for-shopping-listing-builder",
    zhPath: "/amazon/alexa-for-shopping-listing-builder/zh",
  },
  {
    id: "growth-profit-planner",
    name: "Amazon Growth & Profit Planner",
    zhName: "Amazon 增长与利润规划器",
    path: "/amazon/amazon-growth-profit-planner",
    zhPath: "/amazon/amazon-growth-profit-planner/zh",
  },
];

export const entitlementRules: EntitlementRule[] = [
  {
    source: "registration",
    label: "Account trial",
    zhLabel: "注册体验",
    creditsPerTool: 1,
  },
  {
    source: "wechat-community",
    label: "Community bonus",
    zhLabel: "加群奖励",
    creditsPerTool: 3,
  },
];

export const paidPlans: Array<{
  id: CommercialPlanId;
  name: string;
  zhName: string;
  priceUsd: number;
  creditsPerTool: number;
  note: string;
  zhNote: string;
}> = [
  {
    id: "starter",
    name: "Starter Pack",
    zhName: "入门包",
    priceUsd: 19,
    creditsPerTool: 3,
    note: "For one SKU or one account review cycle.",
    zhNote: "适合 1 个 SKU 或 1 次账户复盘周期。",
  },
  {
    id: "operator",
    name: "Operator Pack",
    zhName: "运营包",
    priceUsd: 49,
    creditsPerTool: 10,
    note: "For weekly operating use across the three flagship tools.",
    zhNote: "适合三大工具每周反复使用。",
  },
  {
    id: "expert",
    name: "Expert Review",
    zhName: "专家复核",
    priceUsd: 199,
    creditsPerTool: 30,
    note: "For users who need saved runs and manual review handoff.",
    zhNote: "适合需要保存报告和人工复核交接的用户。",
  },
];

export function getCommercialTool(toolId: CommercialToolId) {
  return commercialTools.find((tool) => tool.id === toolId);
}

export function getInitialCreditsByTool() {
  return Object.fromEntries(commercialTools.map((tool) => [tool.id, 1])) as Record<CommercialToolId, number>;
}

export function getWechatBonusCreditsByTool() {
  return Object.fromEntries(commercialTools.map((tool) => [tool.id, 3])) as Record<CommercialToolId, number>;
}
