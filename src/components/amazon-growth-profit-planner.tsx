"use client";

import { useMemo, useState } from "react";
import type { SupportedLocale } from "@/lib/i18n";

type Branch =
  | "missing-profit-core"
  | "missing-traffic-core"
  | "inventory-risk"
  | "profit-floor-risk"
  | "traffic-gap"
  | "conversion-gap"
  | "scale-ready"
  | "clearance-needed";

type Goal =
  | "scale"
  | "protect-profit"
  | "clear-inventory"
  | "new-launch"
  | "rank-defense"
  | "budget-reallocation";

type Status = "none" | "active" | "eligible" | "unknown";
type FeeMode = "rate" | "amount";
type TrafficMetric = "sessions" | "pageViews";

type PlannerInput = {
  asin: string;
  price: string;
  landedCost: string;
  referralFeeMode: FeeMode;
  referralFeeRate: string;
  referralFeeAmount: string;
  fbaFee: string;
  inventoryUnits: string;
  avgDailySales: string;
  trafficMetricType: TrafficMetric;
  sessionsOrPageViews: string;
  orders: string;
  cvr: string;
  adSpend: string;
  adSales: string;
  acos: string;
  currentGoal: Goal;
  couponStatus: Status;
  dealStatus: Status;
  rating: string;
  reviewCount: string;
  targetNetMargin: string;
  targetTacos: string;
  returnRate: string;
  returnCost: string;
  inboundUnits: string;
  inboundEta: string;
};

type Metrics = {
  price: number | null;
  landedCost: number | null;
  referralFee: number | null;
  fbaFee: number | null;
  inventoryUnits: number | null;
  avgDailySales: number | null;
  sessions: number | null;
  orders: number | null;
  preAdGrossProfit: number | null;
  preAdMargin: number | null;
  breakEvenAcos: number | null;
  suggestedAcosCeiling: number | null;
  acos: number | null;
  cvr: number | null;
  inventoryCover: number | null;
  tacos: number | null;
  targetTacos: number | null;
};

type NormalizedPlannerInput = {
  asin: string;
  price: number | null;
  landedCost: number | null;
  referralFeeMode: FeeMode;
  referralFeeRate: number | null;
  referralFeeAmount: number | null;
  fbaFee: number | null;
  inventoryUnits: number | null;
  avgDailySales: number | null;
  trafficMetricType: TrafficMetric;
  sessionsOrPageViews: number | null;
  orders: number | null;
  cvr: number | null;
  adSpend: number | null;
  adSales: number | null;
  acos: number | null;
  currentGoal: Goal;
  couponStatus: Status;
  dealStatus: Status;
  rating: number | null;
  reviewCount: number | null;
  targetNetMargin: number | null;
  targetTacos: number | null;
  returnRate: number | null;
  returnCost: number | null;
  inboundUnits: number | null;
  inboundEta: string;
};

type CompactAiPayload = {
  version: "growth-p0-compact-v1";
  asin: string;
  goal: Goal;
  branch: Branch;
  confidence: Result["confidence"];
  inputs: Partial<Record<keyof NormalizedPlannerInput, string | number>>;
  metrics: Partial<Record<keyof Metrics, number>>;
  guardrails: {
    noLiveSellerCentralData: true;
    deterministicBranchOnly: true;
    excludesUiCopy: true;
  };
};

type SubmittedSnapshot = {
  input: PlannerInput;
  normalized: NormalizedPlannerInput;
  metrics: Metrics;
};

type CopySet = {
  decision: string;
  evidence: string[];
  actions: string[];
  doNotDo: string[];
  reviewRules: string[];
  missingData: string[];
  operatingPlan: {
    profitStructure: string;
    adToleranceLine: string;
    bottleneck: string;
    officialActions: string;
    boundary: string;
    stopLine: string;
  };
};

type Result = CopySet & {
  branch: Branch;
  confidence: "blocked" | "low" | "medium" | "high";
  compactAiPayload: CompactAiPayload;
};

const defaultInput: PlannerInput = {
  asin: "B0EXAMPLE",
  price: "29.99",
  landedCost: "8.40",
  referralFeeMode: "rate",
  referralFeeRate: "15",
  referralFeeAmount: "",
  fbaFee: "4.65",
  inventoryUnits: "840",
  avgDailySales: "22",
  trafficMetricType: "sessions",
  sessionsOrPageViews: "4200",
  orders: "308",
  cvr: "",
  adSpend: "1836",
  adSales: "5400",
  acos: "",
  currentGoal: "scale",
  couponStatus: "eligible",
  dealStatus: "unknown",
  rating: "4.4",
  reviewCount: "86",
  targetNetMargin: "12",
  targetTacos: "12",
  returnRate: "4",
  returnCost: "",
  inboundUnits: "",
  inboundEta: "",
};

const branchLabels: Record<Branch, { en: string; zh: string }> = {
  "missing-profit-core": { en: "Missing profit core inputs", zh: "缺利润核心输入" },
  "missing-traffic-core": { en: "Missing traffic, conversion, or ad efficiency inputs", zh: "缺流量、转化或广告效率输入" },
  "inventory-risk": { en: "Inventory risk", zh: "库存风险" },
  "profit-floor-risk": { en: "Profit floor risk", zh: "利润底线风险" },
  "traffic-gap": { en: "Traffic gap", zh: "流量缺口" },
  "conversion-gap": { en: "Conversion gap", zh: "转化缺口" },
  "scale-ready": { en: "Controlled scale ready", zh: "可受控放量" },
  "clearance-needed": { en: "Clearance needed", zh: "需要清库存" },
};

const goals: Array<{ value: Goal; en: string; zh: string }> = [
  { value: "scale", en: "Scale", zh: "放量增长" },
  { value: "protect-profit", en: "Protect profit", zh: "保利润" },
  { value: "clear-inventory", en: "Clear inventory", zh: "清库存" },
  { value: "new-launch", en: "New launch", zh: "新品启动" },
  { value: "rank-defense", en: "Rank defense", zh: "排名防守" },
  { value: "budget-reallocation", en: "Budget reallocation", zh: "预算重分配" },
];

const statuses: Array<{ value: Status; en: string; zh: string }> = [
  { value: "none", en: "None", zh: "无" },
  { value: "active", en: "Active", zh: "进行中" },
  { value: "eligible", en: "Eligible", zh: "可用" },
  { value: "unknown", en: "Unknown", zh: "未知" },
];

function numberValue(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function percentValue(value: string): number | null {
  const parsed = numberValue(value);
  return parsed === null ? null : parsed / 100;
}

function normalizeSubmittedInput(input: PlannerInput): NormalizedPlannerInput {
  return {
    asin: input.asin.trim(),
    price: numberValue(input.price),
    landedCost: numberValue(input.landedCost),
    referralFeeMode: input.referralFeeMode,
    referralFeeRate: percentValue(input.referralFeeRate),
    referralFeeAmount: numberValue(input.referralFeeAmount),
    fbaFee: numberValue(input.fbaFee),
    inventoryUnits: numberValue(input.inventoryUnits),
    avgDailySales: numberValue(input.avgDailySales),
    trafficMetricType: input.trafficMetricType,
    sessionsOrPageViews: numberValue(input.sessionsOrPageViews),
    orders: numberValue(input.orders),
    cvr: percentValue(input.cvr),
    adSpend: numberValue(input.adSpend),
    adSales: numberValue(input.adSales),
    acos: percentValue(input.acos),
    currentGoal: input.currentGoal,
    couponStatus: input.couponStatus,
    dealStatus: input.dealStatus,
    rating: numberValue(input.rating),
    reviewCount: numberValue(input.reviewCount),
    targetNetMargin: percentValue(input.targetNetMargin),
    targetTacos: percentValue(input.targetTacos),
    returnRate: percentValue(input.returnRate),
    returnCost: numberValue(input.returnCost),
    inboundUnits: numberValue(input.inboundUnits),
    inboundEta: input.inboundEta.trim(),
  };
}

function stripNullish<T extends Record<string, string | number | null>>(values: T): Partial<{ [K in keyof T]: NonNullable<T[K]> }> {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== null && value !== ""),
  ) as Partial<{ [K in keyof T]: NonNullable<T[K]> }>;
}

function buildCompactAiPayload(
  normalized: NormalizedPlannerInput,
  metrics: Metrics,
  branch: Branch,
  confidence: Result["confidence"],
): CompactAiPayload {
  return {
    version: "growth-p0-compact-v1",
    asin: normalized.asin,
    goal: normalized.currentGoal,
    branch,
    confidence,
    inputs: stripNullish({
      price: normalized.price,
      landedCost: normalized.landedCost,
      referralFeeRate: normalized.referralFeeMode === "rate" ? normalized.referralFeeRate : null,
      referralFeeAmount: normalized.referralFeeMode === "amount" ? normalized.referralFeeAmount : null,
      fbaFee: normalized.fbaFee,
      inventoryUnits: normalized.inventoryUnits,
      avgDailySales: normalized.avgDailySales,
      trafficMetricType: normalized.trafficMetricType,
      sessionsOrPageViews: normalized.sessionsOrPageViews,
      orders: normalized.orders,
      cvr: normalized.cvr,
      adSpend: normalized.adSpend,
      adSales: normalized.adSales,
      acos: normalized.acos,
      couponStatus: normalized.couponStatus,
      dealStatus: normalized.dealStatus,
      rating: normalized.rating,
      reviewCount: normalized.reviewCount,
      targetNetMargin: normalized.targetNetMargin,
      targetTacos: normalized.targetTacos,
      returnRate: normalized.returnRate,
      returnCost: normalized.returnCost,
      inboundUnits: normalized.inboundUnits,
      inboundEta: normalized.inboundEta,
    }),
    metrics: stripNullish({
      preAdGrossProfit: metrics.preAdGrossProfit,
      preAdMargin: metrics.preAdMargin,
      breakEvenAcos: metrics.breakEvenAcos,
      suggestedAcosCeiling: metrics.suggestedAcosCeiling,
      acos: metrics.acos,
      cvr: metrics.cvr,
      inventoryCover: metrics.inventoryCover,
      tacos: metrics.tacos,
      targetTacos: metrics.targetTacos,
    }),
    guardrails: {
      noLiveSellerCentralData: true,
      deterministicBranchOnly: true,
      excludesUiCopy: true,
    },
  };
}

function money(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "unknown";
  return `$${value.toFixed(2)}`;
}

function pct(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "unknown";
  return `${(value * 100).toFixed(1)}%`;
}

function isZh(locale: SupportedLocale) {
  return locale === "zh";
}

function missingProfitFields(input: PlannerInput, locale: SupportedLocale) {
  const zh = isZh(locale);
  const missing: string[] = [];
  if (numberValue(input.price) === null) missing.push(zh ? "售价" : "selling price");
  if (numberValue(input.landedCost) === null) {
    missing.push(zh ? "单件到仓成本" : "landed cost per unit");
  }
  if (numberValue(input.fbaFee) === null) missing.push(zh ? "FBA / 履约费" : "FBA / fulfillment fee");
  if (input.referralFeeMode === "rate" && percentValue(input.referralFeeRate) === null) {
    missing.push(zh ? "Amazon 佣金率" : "Amazon referral fee rate");
  }
  if (input.referralFeeMode === "amount" && numberValue(input.referralFeeAmount) === null) {
    missing.push(zh ? "Amazon 佣金金额" : "Amazon referral fee amount");
  }
  return missing;
}

function missingTrafficFields(input: PlannerInput, locale: SupportedLocale) {
  const zh = isZh(locale);
  const missing: string[] = [];
  if (numberValue(input.sessionsOrPageViews) === null) missing.push("Sessions / Page views");
  if (numberValue(input.orders) === null && percentValue(input.cvr) === null) {
    missing.push(zh ? "Orders 或 CVR" : "Orders or CVR");
  }
  const hasAcos = percentValue(input.acos) !== null;
  const hasSpendSales = numberValue(input.adSpend) !== null && numberValue(input.adSales) !== null;
  if (!hasAcos && !hasSpendSales) {
    missing.push(zh ? "广告花费 / 广告销售额或 ACOS" : "ad spend / ad sales or ACOS");
  }
  return missing;
}

function getMetrics(input: PlannerInput): Metrics {
  const price = numberValue(input.price);
  const landedCost = numberValue(input.landedCost);
  const fbaFee = numberValue(input.fbaFee);
  const referralFee =
    input.referralFeeMode === "rate" && price !== null
      ? price * (percentValue(input.referralFeeRate) ?? Number.NaN)
      : numberValue(input.referralFeeAmount);
  const inventoryUnits = numberValue(input.inventoryUnits);
  const avgDailySales = numberValue(input.avgDailySales);
  const sessions = numberValue(input.sessionsOrPageViews);
  const orders = numberValue(input.orders);
  const directCvr = percentValue(input.cvr);
  const adSpend = numberValue(input.adSpend);
  const adSales = numberValue(input.adSales);
  const directAcos = percentValue(input.acos);
  const targetNetMargin = percentValue(input.targetNetMargin) ?? 0.12;
  const returnRate = percentValue(input.returnRate) ?? 0;
  const targetTacos = percentValue(input.targetTacos);
  const preAdGrossProfit =
    price !== null && landedCost !== null && referralFee !== null && fbaFee !== null && Number.isFinite(referralFee)
      ? price - landedCost - referralFee - fbaFee
      : null;
  const preAdMargin = price !== null && price > 0 && preAdGrossProfit !== null ? preAdGrossProfit / price : null;
  const suggestedAcosCeiling = preAdMargin === null ? null : Math.max(0, preAdMargin - targetNetMargin - returnRate);
  const acos = directAcos ?? (adSpend !== null && adSales !== null && adSales > 0 ? adSpend / adSales : null);
  const cvr = directCvr ?? (orders !== null && sessions !== null && sessions > 0 ? orders / sessions : null);
  const inventoryCover =
    inventoryUnits !== null && avgDailySales !== null && avgDailySales > 0 ? inventoryUnits / avgDailySales : null;
  const totalSales = adSales === null ? null : adSales / 0.58;
  const tacos = adSpend !== null && totalSales !== null && totalSales > 0 ? adSpend / totalSales : null;

  return {
    price,
    landedCost,
    referralFee,
    fbaFee,
    inventoryUnits,
    avgDailySales,
    sessions,
    orders,
    preAdGrossProfit,
    preAdMargin,
    breakEvenAcos: preAdMargin,
    suggestedAcosCeiling,
    acos,
    cvr,
    inventoryCover,
    tacos,
    targetTacos,
  };
}

function pickBranch(input: PlannerInput, metrics: Metrics, locale: SupportedLocale): { branch: Branch; confidence: Result["confidence"]; missing: string[] } {
  const profitMissing = missingProfitFields(input, locale);
  if (profitMissing.length > 0) return { branch: "missing-profit-core", confidence: "blocked", missing: profitMissing };

  const trafficMissing = missingTrafficFields(input, locale);
  if (trafficMissing.length > 0) return { branch: "missing-traffic-core", confidence: "blocked", missing: trafficMissing };

  if (metrics.inventoryUnits === null || metrics.avgDailySales === null || metrics.inventoryCover === null) {
    return { branch: "inventory-risk", confidence: "blocked", missing: [isZh(locale) ? "当前库存件数或日均销量" : "inventory units or average daily sales"] };
  }

  if (input.currentGoal === "clear-inventory" || metrics.inventoryCover > 90) {
    return { branch: "clearance-needed", confidence: "medium", missing: [] };
  }
  if (metrics.inventoryCover < 21) {
    return { branch: "inventory-risk", confidence: metrics.inventoryCover < 14 ? "high" : "medium", missing: [] };
  }
  if (
    (metrics.preAdGrossProfit !== null && metrics.preAdGrossProfit <= 0) ||
    (metrics.acos !== null && metrics.suggestedAcosCeiling !== null && metrics.acos > metrics.suggestedAcosCeiling)
  ) {
    return { branch: "profit-floor-risk", confidence: "high", missing: [] };
  }
  if (metrics.cvr !== null && metrics.cvr < 0.08 && metrics.sessions !== null && metrics.sessions >= 500) {
    return { branch: "conversion-gap", confidence: "medium", missing: [] };
  }
  if (metrics.sessions !== null && metrics.sessions < 1000) {
    return { branch: "traffic-gap", confidence: "medium", missing: [] };
  }
  return { branch: "scale-ready", confidence: "high", missing: [] };
}

function baseEvidence(metrics: Metrics, input: PlannerInput, locale: SupportedLocale) {
  const trafficLabel = input.trafficMetricType === "sessions" ? "Sessions" : "Page views";
  if (isZh(locale)) {
    return [
      `售价 ${money(metrics.price)}，单件到仓成本 ${money(metrics.landedCost)}，佣金 ${money(metrics.referralFee)}，FBA / 履约费 ${money(metrics.fbaFee)}。`,
      `广告前毛利约 ${money(metrics.preAdGrossProfit)}，广告前毛利率约 ${pct(metrics.preAdMargin)}。`,
      `Break-even ACOS 约 ${pct(metrics.breakEvenAcos)}，广告承受线约 ${pct(metrics.suggestedAcosCeiling)}，当前 ACOS 约 ${pct(metrics.acos)}。`,
      `库存约 ${metrics.inventoryUnits ?? "unknown"} 件，日均销量 ${metrics.avgDailySales ?? "unknown"}，库存 cover 约 ${metrics.inventoryCover === null ? "unknown" : `${metrics.inventoryCover.toFixed(0)} 天`}。`,
      `${trafficLabel} 为 ${metrics.sessions ?? "unknown"}，CVR 约 ${pct(metrics.cvr)}，TACOS ${metrics.tacos === null ? "unknown" : pct(metrics.tacos)}。`,
    ];
  }
  return [
    `Price ${money(metrics.price)}, landed cost per unit ${money(metrics.landedCost)}, referral fee ${money(metrics.referralFee)}, and FBA / fulfillment fee ${money(metrics.fbaFee)}.`,
    `Estimated pre-ad gross profit is ${money(metrics.preAdGrossProfit)}, or about ${pct(metrics.preAdMargin)} pre-ad margin.`,
    `Break-even ACOS is about ${pct(metrics.breakEvenAcos)}, the ad tolerance line is about ${pct(metrics.suggestedAcosCeiling)}, and current ACOS is about ${pct(metrics.acos)}.`,
    `Inventory is about ${metrics.inventoryUnits ?? "unknown"} units, average daily sales are ${metrics.avgDailySales ?? "unknown"}, and inventory cover is ${metrics.inventoryCover === null ? "unknown" : `${metrics.inventoryCover.toFixed(0)} days`}.`,
    `${trafficLabel} are ${metrics.sessions ?? "unknown"}, CVR is about ${pct(metrics.cvr)}, and TACOS is ${metrics.tacos === null ? "unknown" : pct(metrics.tacos)}.`,
  ];
}

function planTable(metrics: Metrics, branch: Branch, locale: SupportedLocale): CopySet["operatingPlan"] {
  if (isZh(locale)) {
    const bottleneck: Record<Branch, string> = {
      "missing-profit-core": "缺失数据",
      "missing-traffic-core": "缺失数据",
      "inventory-risk": "库存",
      "profit-floor-risk": "利润",
      "traffic-gap": "流量",
      "conversion-gap": "转化",
      "scale-ready": "无硬阻断",
      "clearance-needed": "库存",
    };
    const actions: Record<Branch, string> = {
      "missing-profit-core": "无。先补齐利润核心输入。",
      "missing-traffic-core": "无。先补齐流量、转化和广告效率。",
      "inventory-risk": "保库存；不推荐放量动作。",
      "profit-floor-risk": "先控制 Sponsored Products 花费；如需广告深度清理，交给 Ads Workbench。",
      "traffic-gap": "受控 Sponsored Products 小测；仅在利润安全时评估小额 Coupon。",
      "conversion-gap": "核查 A+、Vine 资格和商品证明；Coupon 仅在利润安全时小测。",
      "scale-ready": "受控 Sponsored Products 放量；Coupon / Deal / PED 只在资格和利润都确认后使用。",
      "clearance-needed": "利润安全的 Coupon / Deal 边界；不做排名冲刺。",
    };
    const boundary: Record<Branch, string> = {
      "missing-profit-core": "补齐数据前不设置广告或促销预算。",
      "missing-traffic-core": "补齐数据前不设置放量预算。",
      "inventory-risk": "库存 cover 低于 21 天不新增增长预算。",
      "profit-floor-risk": "新增预算为 0，直到 ACOS 回到广告承受线下方。",
      "traffic-gap": "预算不超过广告承受线对应的可承受范围。",
      "conversion-gap": "CVR 未改善前不增加预算。",
      "scale-ready": "只有 ACOS 低于广告承受线且库存 cover 高于 21 天才扩预算。",
      "clearance-needed": "折扣后预估净利率低于目标即停止。",
    };
    const stopLine: Record<Branch, string> = {
      "missing-profit-core": "补齐数据前停止强结论。",
      "missing-traffic-core": "补齐数据前停止强结论。",
      "inventory-risk": "库存 cover 低于 14 天停止促销和放量。",
      "profit-floor-risk": "ACOS 高于广告承受线 3 天、净利低于目标或库存 cover 低于 21 天即停止。",
      "traffic-gap": "ACOS 超过广告承受线、CVR 下滑或库存 cover 低于 21 天即停止。",
      "conversion-gap": "CVR 继续下滑或 ACOS 超过广告承受线即停止。",
      "scale-ready": "ACOS 超过广告承受线、CVR 下滑或库存 cover 低于 21 天即停止或降级。",
      "clearance-needed": "库存 cover 回到健康区间或利润低于目标时停止或降级。",
    };
    return {
      profitStructure: `售价 ${money(metrics.price)}；单件到仓成本 ${money(metrics.landedCost)}；佣金 ${money(metrics.referralFee)}；FBA / 履约费 ${money(metrics.fbaFee)}；广告前毛利 ${money(metrics.preAdGrossProfit)}；毛利率 ${pct(metrics.preAdMargin)}。`,
      adToleranceLine: `Break-even ACOS ${pct(metrics.breakEvenAcos)}；广告承受线 ${pct(metrics.suggestedAcosCeiling)}；当前 ACOS ${pct(metrics.acos)}；目标 TACOS ${pct(metrics.targetTacos)}。`,
      bottleneck: bottleneck[branch],
      officialActions: actions[branch],
      boundary: boundary[branch],
      stopLine: stopLine[branch],
    };
  }

  const bottleneck: Record<Branch, string> = {
    "missing-profit-core": "Missing data",
    "missing-traffic-core": "Missing data",
    "inventory-risk": "Inventory",
    "profit-floor-risk": "Profit",
    "traffic-gap": "Traffic",
    "conversion-gap": "Conversion",
    "scale-ready": "No hard blocker",
    "clearance-needed": "Inventory",
  };
  const actions: Record<Branch, string> = {
    "missing-profit-core": "None. Complete profit core inputs first.",
    "missing-traffic-core": "None. Complete traffic, conversion, and ad efficiency inputs first.",
    "inventory-risk": "Protect inventory; no growth action recommended.",
    "profit-floor-risk": "Control Sponsored Products spend first; route deep ad cleanup to Ads Workbench if needed.",
    "traffic-gap": "Run a capped Sponsored Products test; evaluate a small Coupon only if the margin stays safe.",
    "conversion-gap": "Check A+ and Vine eligibility and strengthen product proof; test Coupon only if margin is safe.",
    "scale-ready": "Controlled Sponsored Products scale; use Coupon / Deal / PED only after eligibility and profit are verified.",
    "clearance-needed": "Profit-safe Coupon / Deal boundary; do not run a rank push.",
  };
  const boundary: Record<Branch, string> = {
    "missing-profit-core": "No ad or promotion budget until the missing data is complete.",
    "missing-traffic-core": "No scale budget until the missing data is complete.",
    "inventory-risk": "Do not add growth budget when inventory cover is below 21 days.",
    "profit-floor-risk": "New scale budget is zero until ACOS returns below the ad tolerance line.",
    "traffic-gap": "Budget must stay within the ad tolerance line.",
    "conversion-gap": "Do not increase budget until CVR improves.",
    "scale-ready": "Expand only while ACOS stays below tolerance and inventory cover stays above 21 days.",
    "clearance-needed": "Stop if the post-discount estimated net margin falls below target.",
  };
  const stopLine: Record<Branch, string> = {
    "missing-profit-core": "Stop strong recommendations until inputs are complete.",
    "missing-traffic-core": "Stop strong recommendations until inputs are complete.",
    "inventory-risk": "Stop promotions and scaling when inventory cover is below 14 days.",
    "profit-floor-risk": "Stop if ACOS stays above tolerance for 3 days, margin falls below target, or inventory cover falls below 21 days.",
    "traffic-gap": "Stop if ACOS exceeds tolerance, CVR falls, or inventory cover drops below 21 days.",
    "conversion-gap": "Stop if CVR keeps falling or ACOS exceeds tolerance.",
    "scale-ready": "Stop or downgrade if ACOS exceeds tolerance, CVR falls, or inventory cover drops below 21 days.",
    "clearance-needed": "Stop or downgrade when inventory cover returns to a healthy range or margin falls below target.",
  };
  return {
    profitStructure: `Price ${money(metrics.price)}; landed cost per unit ${money(metrics.landedCost)}; referral fee ${money(metrics.referralFee)}; FBA / fulfillment fee ${money(metrics.fbaFee)}; pre-ad gross profit ${money(metrics.preAdGrossProfit)}; pre-ad margin ${pct(metrics.preAdMargin)}.`,
    adToleranceLine: `Break-even ACOS ${pct(metrics.breakEvenAcos)}; ad tolerance line ${pct(metrics.suggestedAcosCeiling)}; current ACOS ${pct(metrics.acos)}; target TACOS ${pct(metrics.targetTacos)}.`,
    bottleneck: bottleneck[branch],
    officialActions: actions[branch],
    boundary: boundary[branch],
    stopLine: stopLine[branch],
  };
}

function branchCopy(branch: Branch, metrics: Metrics, input: PlannerInput, missing: string[], locale: SupportedLocale): CopySet {
  const evidence = baseEvidence(metrics, input, locale);
  const operatingPlan = planTable(metrics, branch, locale);
  if (isZh(locale)) {
    const copies: Record<Branch, Omit<CopySet, "evidence" | "operatingPlan">> = {
      "missing-profit-core": {
        decision: "现在不能判断是否该加广告或做促销。利润核心输入不完整，任何增长动作都可能打穿利润底线。",
        actions: ["先补齐售价、单件到仓成本、Amazon 佣金和 FBA / 履约费。"],
        doNotDo: ["不要推荐广告、Deal、Coupon、折扣、排名冲刺或放量。"],
        reviewRules: ["补齐利润核心输入后重新生成经营建议；当前结果只用于补数据。"],
        missingData: missing,
      },
      "missing-traffic-core": {
        decision: "当前不能高置信判断流量或转化断点。请先补齐流量、转化和广告效率输入。",
        actions: ["补齐 Sessions / Page views、Orders / CVR、广告花费 / 广告销售额或 ACOS。"],
        doNotDo: ["不要在缺流量、转化或广告效率时判断流量缺口、转化缺口或可放量。"],
        reviewRules: ["补齐核心流量数据后重新评估；不要用当前结果做大额预算或促销决定。"],
        missingData: missing,
      },
      "inventory-risk": {
        decision: "当前先处理库存风险。库存缺失或库存 cover 不足时，不建议放量或活动扩张。",
        actions: ["确认当前库存、日均销量、在途库存和预计到仓时间。", "限制广告预算和促销力度，避免断货。"],
        doNotDo: ["不要加预算、做排名冲刺、扩大 Deal 或扩大 Coupon。"],
        reviewRules: ["每日看库存 cover；低于 14 天停止促销和放量，回到 30 天以上再评估增长。"],
        missingData: missing,
      },
      "profit-floor-risk": {
        decision: "不要扩量。当前广告效率或单件利润已经接近或超过利润底线，下一步先控广告和促销。",
        actions: [
          "暂停宽泛放量，削减或冻结超过广告承受线的投放。",
          "任何 Coupon、Deal 或 Prime Exclusive Deal 前先重算利润底线。",
          "ACOS 连续 7 天低于广告承受线后，才恢复 capped Sponsored Products 小测。",
        ],
        doNotDo: ["不要在 ACOS 高于广告承受线时叠加预算、Coupon、Deal 或折扣。"],
        reviewRules: ["7 天看 ACOS、CVR、订单和库存 cover；ACOS 连续 3 天高于广告承受线就继续冻结扩量。"],
        missingData: [],
      },
      "traffic-gap": {
        decision: "利润和库存允许小测，但当前流量不足。下一步是受控补流量，不是叠加活动。",
        actions: ["做 capped Sponsored Products 小测，预算不超过广告承受线。", "只有折扣后利润仍安全时，才评估小额 Coupon。"],
        doNotDo: ["不要做 Ads Workbench 式 search term / placement 深度诊断；不要直接做 Deal。"],
        reviewRules: ["7 天看 Sessions、CVR 和 ACOS；ACOS 超过广告承受线或库存 cover 低于 21 天即停止。"],
        missingData: [],
      },
      "conversion-gap": {
        decision: "流量已有基础，但转化偏弱。先修转化证明和 offer，不要盲目加预算。",
        actions: ["检查 A+ Content 资格和商品证明内容。", "Review 数偏低时核查 Vine 资格；不要假设已经可报名。", "Coupon 只在利润底线允许时小测。"],
        doNotDo: ["不要生成标题、五点、描述或 Search Terms；不要用加预算掩盖弱转化。"],
        reviewRules: ["7 天看 CVR 和订单；CVR 无改善时继续修商品证明和 offer，不进入放量。"],
        missingData: [],
      },
      "scale-ready": {
        decision: "当前利润、库存和基础效率允许受控放量。可以小幅扩预算，但必须带 stop-line。",
        actions: ["小幅提高 Sponsored Products 预算或保留高意图流量。", "只在利润安全时加入 Coupon；Deal / PED 需先确认资格和费用。", "把 ACOS 承受线、TACOS 和库存 cover 作为放量边界。"],
        doNotDo: ["不要承诺保证增长、保证降低 ACOS、保证提高利润或保证排名。"],
        reviewRules: ["7 天看 ACOS、CVR 和库存；14 天看净利和订单；30 天决定扩大或回撤。"],
        missingData: [],
      },
      "clearance-needed": {
        decision: "库存 cover 偏高或当前目标是清库存。下一步应做利润安全的出清计划，而不是排名冲刺。",
        actions: ["先计算可承受的折扣边界，再选择 Coupon 或 Deal。", "只在利润底线允许时设置清库存预算。", "7 天看 sell-through，14 天复查净利和库存 cover。"],
        doNotDo: ["不要为了清库存直接叠加 Deal、Coupon 和高广告预算。"],
        reviewRules: ["7 天看销量和库存 cover；14 天看净利率；30 天决定继续清仓或回到常规价格。"],
        missingData: [],
      },
    };
    return { ...copies[branch], evidence, operatingPlan };
  }

  const copies: Record<Branch, Omit<CopySet, "evidence" | "operatingPlan">> = {
    "missing-profit-core": {
      decision: "Do not decide on ads or promotions yet. Profit core inputs are incomplete, so any growth action could break the margin floor.",
      actions: ["Complete selling price, landed cost per unit, Amazon referral fee, and FBA / fulfillment fee."],
      doNotDo: ["Do not recommend ads, Deal, Coupon, discounting, rank push, or scaling."],
      reviewRules: ["Generate a new plan after profit core inputs are complete; use the current state only to complete data."],
      missingData: missing,
    },
    "missing-traffic-core": {
      decision: "Do not make a high-confidence traffic or conversion call yet. Traffic, conversion, or ad efficiency inputs are incomplete.",
      actions: ["Complete Sessions / Page views, Orders / CVR, and ad spend / ad sales or ACOS."],
      doNotDo: ["Do not call a traffic gap, conversion gap, or scale-ready state without those inputs."],
      reviewRules: ["Re-run the plan after traffic data is complete; do not use this state for a large budget or promotion decision."],
      missingData: missing,
    },
    "inventory-risk": {
      decision: "Treat inventory as the first risk. When inventory data is missing or cover is too low, do not scale or expand promotions.",
      actions: ["Confirm current inventory, average daily sales, inbound inventory, and expected arrival date.", "Limit ad budget and promotion pressure to avoid stockout."],
      doNotDo: ["Do not increase budget, run a rank push, expand Deal, or expand Coupon."],
      reviewRules: ["Review inventory cover daily; stop promotions and scaling below 14 days, and reassess growth only after cover is above 30 days."],
      missingData: missing,
    },
    "profit-floor-risk": {
      decision: "Do not scale. Current ad efficiency or unit economics are too close to the profit floor, so the next move is margin protection.",
      actions: [
        "Pause broad scaling and reduce or hold campaigns above the ad tolerance line.",
        "Recalculate the profit floor before any Coupon, Deal, or Prime Exclusive Deal.",
        "Resume only a capped Sponsored Products test after ACOS stays below the tolerance line for 7 days.",
      ],
      doNotDo: ["Do not add budget, Coupon, Deal, or discount pressure while ACOS is above the ad tolerance line."],
      reviewRules: ["Review ACOS, CVR, orders, and inventory cover after 7 days; keep scaling frozen if ACOS stays above tolerance for 3 days."],
      missingData: [],
    },
    "traffic-gap": {
      decision: "Margin and inventory allow a small test, but traffic is the current gap. Add traffic in a controlled way instead of stacking promotions.",
      actions: ["Run a capped Sponsored Products test under the ad tolerance line.", "Evaluate a small Coupon only if post-discount margin remains safe."],
      doNotDo: ["Do not perform Ads Workbench-style search term or placement diagnosis here; do not jump directly into a Deal."],
      reviewRules: ["Review Sessions, CVR, and ACOS after 7 days; stop if ACOS exceeds tolerance or inventory cover falls below 21 days."],
      missingData: [],
    },
    "conversion-gap": {
      decision: "Traffic exists, but conversion is weak. Fix proof and offer clarity before adding budget.",
      actions: ["Check A+ Content eligibility and product proof.", "If review count is low, verify Vine eligibility; do not assume enrollment is available.", "Test Coupon only if the profit floor allows it."],
      doNotDo: ["Do not generate title, bullets, description, or Search Terms; do not use more budget to hide weak conversion."],
      reviewRules: ["Review CVR and orders after 7 days; if CVR does not improve, keep improving proof and offer before scaling."],
      missingData: [],
    },
    "scale-ready": {
      decision: "Profit, inventory, and baseline efficiency allow controlled scaling. Increase budget carefully and keep the stop-line visible.",
      actions: ["Increase Sponsored Products budget slightly or keep high-intent traffic active.", "Use Coupon only when margin remains safe; verify Deal / PED eligibility and fees first.", "Use ACOS tolerance, TACOS, and inventory cover as scale boundaries."],
      doNotDo: ["Do not promise guaranteed growth, lower ACOS, higher profit, or ranking improvement."],
      reviewRules: ["Review ACOS, CVR, and inventory after 7 days; review net margin and orders after 14 days; decide to expand or roll back after 30 days."],
      missingData: [],
    },
    "clearance-needed": {
      decision: "Inventory cover is high or the current goal is clearance. Build a profit-safe sell-through plan instead of a rank push.",
      actions: ["Calculate the sustainable discount boundary before choosing Coupon or Deal.", "Set clearance budget only when the profit floor allows it.", "Review sell-through after 7 days and margin plus inventory cover after 14 days."],
      doNotDo: ["Do not stack Deal, Coupon, and high ad budget just to clear inventory."],
      reviewRules: ["Review sales and inventory cover after 7 days; review margin after 14 days; decide whether to continue clearance or return to regular pricing after 30 days."],
      missingData: [],
    },
  };
  return { ...copies[branch], evidence, operatingPlan };
}

function analyze(input: PlannerInput, locale: SupportedLocale, metrics = getMetrics(input), normalized = normalizeSubmittedInput(input)): Result {
  const picked = pickBranch(input, metrics, locale);
  const copy = branchCopy(picked.branch, metrics, input, picked.missing, locale);
  return {
    branch: picked.branch,
    confidence: picked.confidence,
    compactAiPayload: buildCompactAiPayload(normalized, metrics, picked.branch, picked.confidence),
    ...copy,
  };
}

const ui = {
  en: {
    kicker: "Amazon operator brief",
    title: "Amazon Growth & Profit Planner",
    subtitle:
      "Enter ASIN, price, cost, inventory, traffic, conversion, and ad efficiency. Generate a SKU growth and profit plan only when you submit.",
    inputsTitle: "Inputs",
    inputsHint: "Editing does not update the final brief until you submit.",
    howItWorks: "How it works",
    demo: "Demo",
    generate: "Generate plan",
    dirty: "Inputs changed. Generate again to refresh the brief.",
    waitingTitle: "Ready to generate",
    waitingText: "Complete the SKU inputs, then generate a clean operating brief. The result will not refresh while you type.",
    currentJudgment: "Current Judgment",
    profitFloor: "Profit floor",
    adTolerance: "Ad tolerance line",
    bottleneck: "Bottleneck",
    suggestedActions: "Suggested actions",
    stopLine: "Stop-line",
    operatingPlan: "Operating Plan Table",
    basis: "Decision basis",
    keyEvidence: "Key Evidence",
    priorityActions: "Priority Actions",
    doNotDo: "Do Not Do",
    reviewRules: "Review Rules",
    missingData: "Missing Data",
    close: "Close",
  },
  zh: {
    kicker: "Amazon 经营建议",
    title: "Amazon 增长与利润规划器",
    subtitle: "输入 ASIN、价格、成本、库存、流量、转化和广告效率后，点击提交生成 SKU 增长与利润经营建议。",
    inputsTitle: "输入信息",
    inputsHint: "编辑输入不会刷新最终建议；只有点击提交后才生成。",
    howItWorks: "功能说明",
    demo: "示例",
    generate: "提交生成",
    dirty: "输入已变更。请重新提交生成经营建议。",
    waitingTitle: "等待生成",
    waitingText: "补齐 SKU 输入后点击提交，右侧会生成经营建议。输入过程中不会实时刷新结果。",
    currentJudgment: "当前判断",
    profitFloor: "利润底线",
    adTolerance: "广告承受线",
    bottleneck: "瓶颈",
    suggestedActions: "建议动作",
    stopLine: "Stop-line",
    operatingPlan: "经营计划表",
    basis: "判断依据",
    keyEvidence: "关键证据",
    priorityActions: "优先动作",
    doNotDo: "不要做什么",
    reviewRules: "复查规则",
    missingData: "缺失数据",
    close: "关闭",
  },
};

export function AmazonGrowthProfitPlanner({ locale = "zh" }: { locale?: SupportedLocale }) {
  const lang = isZh(locale) ? "zh" : "en";
  const t = ui[lang];
  const [input, setInput] = useState<PlannerInput>(defaultInput);
  const [submittedSnapshot, setSubmittedSnapshot] = useState<SubmittedSnapshot | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showBasis, setShowBasis] = useState(false);
  const result = useMemo(
    () => (submittedSnapshot ? analyze(submittedSnapshot.input, locale, submittedSnapshot.metrics, submittedSnapshot.normalized) : null),
    [submittedSnapshot, locale],
  );

  function update<K extends keyof PlannerInput>(key: K, value: PlannerInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
    setIsDirty(true);
  }

  function submitPlan() {
    setSubmittedSnapshot({
      input,
      normalized: normalizeSubmittedInput(input),
      metrics: getMetrics(input),
    });
    setIsDirty(false);
  }

  return (
    <main className="min-h-screen bg-[#f6f7f4] text-slate-950">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{t.kicker}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{t.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t.subtitle}</p>
        </header>

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <FormPanel input={input} update={update} locale={locale} onSubmit={submitPlan} onShowBasis={() => setShowBasis(true)} isDirty={isDirty} />
          <ResultPanel result={result} locale={locale} isDirty={isDirty} onShowBasis={() => setShowBasis(true)} />
        </div>
      </section>
      {showBasis ? <BasisModal result={result} locale={locale} onClose={() => setShowBasis(false)} /> : null}
    </main>
  );
}

function FormPanel({
  input,
  update,
  locale,
  onSubmit,
  onShowBasis,
  isDirty,
}: {
  input: PlannerInput;
  update: <K extends keyof PlannerInput>(key: K, value: PlannerInput[K]) => void;
  locale: SupportedLocale;
  onSubmit: () => void;
  onShowBasis: () => void;
  isDirty: boolean;
}) {
  const lang = isZh(locale) ? "zh" : "en";
  const t = ui[lang];
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-950">{t.inputsTitle}</h2>
          <p className="mt-1 text-sm text-slate-600">{t.inputsHint}</p>
        </div>
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          onClick={onShowBasis}
        >
          {t.howItWorks}
        </button>
      </div>

      <div className="mt-5 grid gap-4">
        <TextField label="ASIN" value={input.asin} onChange={(value) => update("asin", value)} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label={lang === "zh" ? "售价" : "Price"} value={input.price} onChange={(value) => update("price", value)} />
          <TextField
            label={lang === "zh" ? "单件到仓成本（采购价 + 头程/入仓前运费）" : "Landed cost per unit (purchase + inbound freight)"}
            value={input.landedCost}
            onChange={(value) => update("landedCost", value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            {lang === "zh" ? "佣金输入方式" : "Referral fee mode"}
            <select className="rounded-md border border-slate-300 px-3 py-2" value={input.referralFeeMode} onChange={(event) => update("referralFeeMode", event.target.value as FeeMode)}>
              <option value="rate">{lang === "zh" ? "按比例 %" : "Rate %"}</option>
              <option value="amount">{lang === "zh" ? "按金额" : "Amount"}</option>
            </select>
          </label>
          {input.referralFeeMode === "rate" ? (
            <TextField label={lang === "zh" ? "Amazon 佣金率 %" : "Amazon referral fee rate %"} value={input.referralFeeRate} onChange={(value) => update("referralFeeRate", value)} />
          ) : (
            <TextField label={lang === "zh" ? "Amazon 佣金金额" : "Amazon referral fee amount"} value={input.referralFeeAmount} onChange={(value) => update("referralFeeAmount", value)} />
          )}
        </div>
        <TextField label={lang === "zh" ? "FBA / 履约费" : "FBA / fulfillment fee"} value={input.fbaFee} onChange={(value) => update("fbaFee", value)} />
        <div className="grid grid-cols-2 gap-3">
          <TextField label={lang === "zh" ? "当前库存件数" : "Inventory units"} value={input.inventoryUnits} onChange={(value) => update("inventoryUnits", value)} />
          <TextField label={lang === "zh" ? "日均销量" : "Average daily sales"} value={input.avgDailySales} onChange={(value) => update("avgDailySales", value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            {lang === "zh" ? "流量指标" : "Traffic metric"}
            <select className="rounded-md border border-slate-300 px-3 py-2" value={input.trafficMetricType} onChange={(event) => update("trafficMetricType", event.target.value as TrafficMetric)}>
              <option value="sessions">Sessions</option>
              <option value="pageViews">Page views</option>
            </select>
          </label>
          <TextField label="Sessions / Page views" value={input.sessionsOrPageViews} onChange={(value) => update("sessionsOrPageViews", value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField label={lang === "zh" ? "订单数" : "Orders"} value={input.orders} onChange={(value) => update("orders", value)} />
          <TextField label="CVR %" value={input.cvr} onChange={(value) => update("cvr", value)} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <TextField label={lang === "zh" ? "广告花费" : "Ad spend"} value={input.adSpend} onChange={(value) => update("adSpend", value)} />
          <TextField label={lang === "zh" ? "广告销售额" : "Ad sales"} value={input.adSales} onChange={(value) => update("adSales", value)} />
          <TextField label="ACOS %" value={input.acos} onChange={(value) => update("acos", value)} />
        </div>
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          {lang === "zh" ? "当前目标" : "Current goal"}
          <select className="rounded-md border border-slate-300 px-3 py-2" value={input.currentGoal} onChange={(event) => update("currentGoal", event.target.value as Goal)}>
            {goals.map((goal) => (
              <option key={goal.value} value={goal.value}>{lang === "zh" ? goal.zh : goal.en}</option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <SelectStatus label={lang === "zh" ? "Coupon 状态" : "Coupon status"} value={input.couponStatus} onChange={(value) => update("couponStatus", value)} locale={locale} />
          <SelectStatus label={lang === "zh" ? "Deal / PED 状态" : "Deal / PED status"} value={input.dealStatus} onChange={(value) => update("dealStatus", value)} locale={locale} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField label={lang === "zh" ? "评分" : "Rating"} value={input.rating} onChange={(value) => update("rating", value)} />
          <TextField label={lang === "zh" ? "Review 数量" : "Review count"} value={input.reviewCount} onChange={(value) => update("reviewCount", value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField label={lang === "zh" ? "目标净利率 %" : "Target net margin %"} value={input.targetNetMargin} onChange={(value) => update("targetNetMargin", value)} />
          <TextField label="Target TACOS %" value={input.targetTacos} onChange={(value) => update("targetTacos", value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField label={lang === "zh" ? "退货率 %" : "Return rate %"} value={input.returnRate} onChange={(value) => update("returnRate", value)} />
          <TextField label={lang === "zh" ? "单件退货成本" : "Return cost per unit"} value={input.returnCost} onChange={(value) => update("returnCost", value)} />
        </div>
        <button type="button" className="rounded-md bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800" onClick={onSubmit}>
          {t.generate}
        </button>
        {isDirty ? <p className="text-sm font-semibold text-amber-700">{t.dirty}</p> : null}
      </div>
    </section>
  );
}

function ResultPanel({
  result,
  locale,
  isDirty,
  onShowBasis,
}: {
  result: Result | null;
  locale: SupportedLocale;
  isDirty: boolean;
  onShowBasis: () => void;
}) {
  const lang = isZh(locale) ? "zh" : "en";
  const t = ui[lang];
  if (!result) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{t.currentJudgment}</p>
        <h2 className="mt-3 text-2xl font-bold text-slate-950">{t.waitingTitle}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{t.waitingText}</p>
      </section>
    );
  }

  return (
    <section className="grid gap-5" data-testid="growth-result">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{lang === "zh" ? "SKU 利润增长作战盘" : "SKU Growth & Profit Battle Plan"}</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{branchLabels[result.branch][lang]}</h2>
          </div>
          <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white" data-testid="growth-result-branch">
            {result.branch} · {result.confidence}
          </span>
        </div>
        <div className="mt-5 space-y-4 text-base leading-8 text-slate-700">
          <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-slate-500">{t.currentJudgment}</h3>
          <p>
            {lang === "zh"
              ? `这个 SKU 现在不能再只用“销量思维”管。${result.decision} 真正专业的增长不是多做动作，而是先知道广告、促销、库存和利润哪一条线会先断。`
              : `This SKU should not be managed with sales-volume thinking alone. ${result.decision} Professional growth means knowing which line breaks first: ads, promotion, inventory, or profit.`}
          </p>
          <p>
            {lang === "zh"
              ? `卖家最容易掉进销量幻觉：销量低就加广告，转化弱就上 Coupon，库存多就做 Deal。三个动作单独看都合理，组合起来可能就是亏损增长。现在要先建立 SKU 利润底盘，再决定是否拿增长许可。`
              : `The common seller trap is sales illusion: low sales leads to more ads, weak conversion leads to coupons, and excess stock leads to deals. Each move can look reasonable alone; together they can create unprofitable growth. Build the SKU profit floor before earning permission to scale.`}
          </p>
        </div>
        {isDirty ? <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">{t.dirty}</p> : null}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-black text-slate-950">{lang === "zh" ? "利润底盘与增长许可线" : "Profit Floor and Growth Permission Line"}</h3>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <SummaryTile title={t.profitFloor} value={result.operatingPlan.profitStructure} />
          <SummaryTile title={t.adTolerance} value={result.operatingPlan.adToleranceLine} />
          <SummaryTile title={t.bottleneck} value={result.operatingPlan.bottleneck} />
          <SummaryTile title={t.stopLine} value={result.operatingPlan.stopLine} />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-black text-slate-950">{lang === "zh" ? "作战动作" : "Battle Moves"}</h3>
          <button type="button" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={onShowBasis}>
            {t.howItWorks}
          </button>
        </div>
        <ol className="mt-3 grid gap-2 pl-5 text-sm leading-6 text-slate-700 list-decimal">
          {result.actions.map((item) => <li key={item}>{item}</li>)}
        </ol>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-950">
        <h3 className="text-xl font-black">{lang === "zh" ? "AI 边缘化风险" : "AI Marginalization Risk"}</h3>
        <p className="mt-3 text-sm leading-7">
          {lang === "zh"
            ? "只会算单项利润的卖家，会输给能把广告、促销、库存、转化放在同一个经营模型里的卖家。前者每天都在猜，后者每周都在复盘停止线、利润线和增长许可线。"
            : "Sellers who only calculate isolated profit will lose to operators who connect ads, promotions, inventory, and conversion in one operating model. One side guesses daily; the other reviews stop-lines, profit lines, and scale permission every week."}
        </p>
        <p className="mt-3 text-sm font-bold leading-7">
          {lang === "zh"
            ? "下一步适合进入月度增长作战盘：每周更新售价、成本、广告效率、库存覆盖、促销结果和停止线。否则你会反复在加广告、打折、等一等之间来回摇摆。"
            : "Next step: a monthly growth battle plan that updates price, cost, ad efficiency, inventory cover, promotion results, and stop-lines every week. Otherwise every decision becomes another guess."}
        </p>
      </div>
    </section>
  );
}

function BasisModal({ result, locale, onClose }: { result: Result | null; locale: SupportedLocale; onClose: () => void }) {
  const lang = isZh(locale) ? "zh" : "en";
  const t = ui[lang];
  const sections = result
    ? [
        [t.currentJudgment, [result.decision]],
        [t.keyEvidence, result.evidence],
        [t.priorityActions, result.actions],
        [t.doNotDo, result.doNotDo],
        [t.reviewRules, result.reviewRules],
        [t.missingData, result.missingData.length ? result.missingData : [lang === "zh" ? "核心输入已足够生成当前分支。" : "Core inputs are sufficient for the current branch."]],
      ]
    : [
        [t.currentJudgment, [t.waitingText]],
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <div className="max-h-[88vh] w-full max-w-3xl overflow-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between gap-3 border-b border-slate-200 bg-white p-5">
          <h2 className="text-xl font-bold text-slate-950">{t.basis}</h2>
          <button type="button" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={onClose}>
            {t.close}
          </button>
        </div>
        <div className="grid gap-4 p-5">
          {sections.map(([title, items]) => (
            <div key={title as string} className="rounded-lg border border-slate-200 p-4">
              <h3 className="font-bold text-slate-950">{title as string}</h3>
              <ul className="mt-2 grid gap-2 pl-5 text-sm leading-6 text-slate-700 list-disc">
                {(items as string[]).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryTile({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold tracking-[0.08em] text-slate-500">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-slate-700">
      {label}
      <input className="rounded-md border border-slate-300 px-3 py-2 text-slate-950" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectStatus({ label, value, onChange, locale }: { label: string; value: Status; onChange: (value: Status) => void; locale: SupportedLocale }) {
  const lang = isZh(locale) ? "zh" : "en";
  return (
    <label className="grid gap-1 text-sm font-semibold text-slate-700">
      {label}
      <select className="rounded-md border border-slate-300 px-3 py-2" value={value} onChange={(event) => onChange(event.target.value as Status)}>
        {statuses.map((status) => (
          <option key={status.value} value={status.value}>{status[lang]}</option>
        ))}
      </select>
    </label>
  );
}
