"use client";

import { useMemo, useState } from "react";
import type { SupportedLocale } from "@/lib/i18n";

type Goal = "lower-tacos" | "rank-push" | "scale" | "margin-control" | "clear-inventory" | "deal-support";
type Lifecycle = "launch" | "growth" | "mature" | "clearance";
type Branch =
  | "input-gap"
  | "retail-data-gap"
  | "ad-waste"
  | "listing-conversion"
  | "scale-opportunity"
  | "rank-push"
  | "clearance"
  | "promo-window";

type IntakeState = {
  spReport: boolean;
  sbReport: boolean;
  sdReport: boolean;
  placementReport: boolean;
  budgetReport: boolean;
  structureReport: boolean;
  businessReport: boolean;
  sqpReport: boolean;
  marginKnown: boolean;
  targetKnown: boolean;
  conversionKnown: boolean;
  inventoryKnown: boolean;
  rankKnown: boolean;
  dealWindow: boolean;
  featuredOfferStable: boolean;
  mainAsin: string;
  goal: Goal;
  lifecycle: Lifecycle;
  acos: number;
  targetAcos: number;
  breakEvenAcos: number;
  tacos: number;
  targetTacos: number;
  cvr: number;
  inventoryDays: number;
  keywordRank: number;
  weeklySales: number;
};

type SixModule = {
  branch: Branch;
  label: string;
  confidence: number;
  current: string;
  evidence: string[];
  actions: string[];
  dont: string[];
  review: string[];
  missing: string[];
};

type ReadinessItem = {
  label: string;
  ready: boolean;
  impact: "blocks strong call" | "limits confidence" | "optional context";
};

type GoalReadiness = {
  title: string;
  verdict: string;
  readyCount: number;
  totalCount: number;
  items: ReadinessItem[];
  next: string;
};

type QueueAction = {
  id: string;
  action: string;
  evidence: string;
  owner: "Owner" | "Operator" | "Ad operator";
  window: string;
  confidence: number;
};

type AdSignal = {
  label: string;
  campaign: string;
  spend: number;
  sales: number;
  orders: number;
  clicks: number;
  acos: number | null;
};

type BidDecision = "increase-cautiously" | "bid-down" | "pause-or-negative" | "watch-only";

type BidGuardrail = {
  signal: AdSignal;
  decision: BidDecision;
  action: string;
  reason: string;
  boundary: string;
};

type CsvTemplate = {
  id: string;
  label: string;
  fileName: string;
  note: string;
  csv: string;
};

type AdsReportSummary = {
  fileName: string;
  rowCount: number;
  signals: AdSignal[];
  spend: number;
  sales: number;
  orders: number;
  clicks: number;
  acos: number | null;
  cvr: number | null;
  waste: AdSignal[];
  winners: AdSignal[];
  negativeCandidates: AdSignal[];
  bidDownCandidates: AdSignal[];
  keepCandidates: AdSignal[];
  weakEvidence: AdSignal[];
  bidGuardrails: BidGuardrail[];
};

type ChannelSummary = AdsReportSummary & {
  channel: "Sponsored Products" | "Sponsored Brands" | "Sponsored Display";
};

type AdPortfolioSummary = {
  channels: ChannelSummary[];
  spend: number;
  sales: number;
  orders: number;
  clicks: number;
  acos: number | null;
  cvr: number | null;
  waste: AdSignal[];
  winners: AdSignal[];
  negativeCandidates: AdSignal[];
  bidDownCandidates: AdSignal[];
  keepCandidates: AdSignal[];
  weakEvidence: AdSignal[];
  bidGuardrails: BidGuardrail[];
  mix: string[];
};

type PlacementSignal = {
  placement: string;
  spend: number;
  sales: number;
  orders: number;
  clicks: number;
  acos: number | null;
};

type PlacementReportSummary = {
  fileName: string;
  rowCount: number;
  signals: PlacementSignal[];
  spend: number;
  sales: number;
  orders: number;
  clicks: number;
  inefficient: PlacementSignal[];
  winners: PlacementSignal[];
};

type BudgetSignal = {
  campaign: string;
  budget: number;
  spend: number;
  sales: number;
  orders: number;
  clicks: number;
  budgetUsage: number | null;
  budgetStatus: string;
  acos: number | null;
};

type BudgetReportSummary = {
  fileName: string;
  rowCount: number;
  signals: BudgetSignal[];
  budget: number;
  spend: number;
  sales: number;
  orders: number;
  clicks: number;
  constrained: BudgetSignal[];
  inefficient: BudgetSignal[];
};

type StructureRole = "brand-defense" | "discovery" | "rank-push" | "profit-control" | "retargeting" | "unknown";

type StructureSignal = {
  campaign: string;
  adGroup: string;
  matchType: string;
  targeting: string;
  targetingType: string;
  spend: number;
  sales: number;
  orders: number;
  clicks: number;
  acos: number | null;
  role: StructureRole;
};

type StructureReportSummary = {
  fileName: string;
  rowCount: number;
  signals: StructureSignal[];
  spend: number;
  sales: number;
  orders: number;
  clicks: number;
  mixedCampaigns: Array<{ campaign: string; roles: StructureRole[]; spend: number; orders: number }>;
  wasteTargets: StructureSignal[];
  provenTargets: StructureSignal[];
};

type RetailReportSummary = {
  fileName: string;
  rowCount: number;
  sessions: number;
  units: number;
  sales: number;
  unitSessionPercentage: number | null;
};

type QuerySignal = {
  query: string;
  impressions: number;
  clicks: number;
  purchases: number;
  purchaseShare: number | null;
};

type QueryReportSummary = {
  fileName: string;
  rowCount: number;
  signals: QuerySignal[];
  impressions: number;
  clicks: number;
  purchases: number;
  opportunities: QuerySignal[];
  winners: QuerySignal[];
};

const goals: Array<{ id: Goal; label: string; zhLabel: string }> = [
  { id: "lower-tacos", label: "Lower TACOS", zhLabel: "降低 TACOS" },
  { id: "rank-push", label: "Rank push", zhLabel: "冲关键词排名" },
  { id: "scale", label: "Scale profitable traffic", zhLabel: "放大利润内流量" },
  { id: "margin-control", label: "Protect margin", zhLabel: "保护利润" },
  { id: "clear-inventory", label: "Clear inventory", zhLabel: "清库存" },
  { id: "deal-support", label: "Deal support", zhLabel: "配合 Deal / Coupon" },
];

const csvTemplates: CsvTemplate[] = [
  {
    id: "sp",
    label: "SP search term",
    fileName: "sample-sponsored-products-search-term.csv",
    note: "Minimum ads diagnosis, cleanup, and bid guardrails",
    csv: [
      "Campaign Name,Customer Search Term,Spend,Sales,Orders,Clicks",
      "Discovery Broad,free garlic press,120,0,0,31",
      "Phrase Expansion,garlic press coupon,95,120,2,28",
      "Exact Profit,garlic press stainless,80,500,9,55",
      "Discovery Broad,mini garlic press,22,0,0,4",
    ].join("\n"),
  },
  {
    id: "business",
    label: "Business Report",
    fileName: "sample-business-report.csv",
    note: "Retail sales, sessions, and unit session percentage",
    csv: [
      "ASIN,Sessions,Units Ordered,Ordered Product Sales,Unit Session Percentage",
      "B0SAMPLE123,3200,260,12500,8.1%",
      "B0SAMPLE123,2800,210,9800,7.5%",
    ].join("\n"),
  },
  {
    id: "sqp",
    label: "SQP",
    fileName: "sample-search-query-performance.csv",
    note: "Query opportunity, purchase proof, and rank-push guardrails",
    csv: [
      "Search Query,Impressions,Clicks,Purchases,Purchase Share",
      "garlic press stainless,18000,820,42,3.2%",
      "easy clean garlic press,9400,390,18,7.8%",
    ].join("\n"),
  },
  {
    id: "placement",
    label: "Placement",
    fileName: "sample-placement.csv",
    note: "Top of Search, Product Pages, and Rest of Search checks",
    csv: [
      "Placement,Spend,Sales,Orders,Clicks",
      "Top of Search,240,1200,18,180",
      "Product Pages,180,120,2,140",
      "Rest of Search,90,0,0,75",
    ].join("\n"),
  },
  {
    id: "budget",
    label: "Budget settings",
    fileName: "sample-budget-campaign-settings.csv",
    note: "Budget-constrained winners and inefficient budget pools",
    csv: [
      "Campaign Name,Budget,Spend,Sales,Orders,Clicks,Budget Status,Budget Usage",
      "Exact Profit Control,100,95,900,14,160,Limited by budget,95%",
      "Discovery Broad,120,118,80,1,210,Active,98%",
    ].join("\n"),
  },
  {
    id: "structure",
    label: "Campaign structure",
    fileName: "sample-campaign-structure.csv",
    note: "Campaign role, match type, target-level waste, and protected targets",
    csv: [
      "Campaign Name,Ad Group Name,Match Type,Targeting,Targeting Type,Spend,Sales,Orders,Clicks",
      "Launch Garlic Mixed,Discovery Ad Group,broad,garlic press broad,keyword,180,0,0,45",
      "Launch Garlic Mixed,Exact Ad Group,exact,garlic press stainless,keyword,90,450,8,60",
      "Brand Defense,Brand Exact,exact,own brand garlic press,keyword,40,400,7,35",
    ].join("\n"),
  },
];

const reportChecks: Array<{ key: keyof IntakeState; name: string; type: string; required: boolean; note: string }> = [
  {
    key: "spReport",
    name: "Sponsored Products report",
    type: "Ads",
    required: true,
    note: "Search term or campaign performance CSV",
  },
  {
    key: "sbReport",
    name: "Sponsored Brands report",
    type: "Ads",
    required: false,
    note: "Brand traffic, video, or headline campaign CSV",
  },
  {
    key: "sdReport",
    name: "Sponsored Display report",
    type: "Ads",
    required: false,
    note: "Display, retargeting, or audience campaign CSV",
  },
  {
    key: "placementReport",
    name: "Placement report",
    type: "Ads",
    required: false,
    note: "Top of Search, Product Pages, Rest of Search performance",
  },
  {
    key: "budgetReport",
    name: "Budget and campaign settings",
    type: "Ads",
    required: false,
    note: "Campaign budget, budget status, spend, sales, orders",
  },
  {
    key: "structureReport",
    name: "Campaign structure report",
    type: "Ads",
    required: false,
    note: "Campaign, ad group, match type, targeting type, spend, sales, orders",
  },
  {
    key: "businessReport",
    name: "Business Report",
    type: "Retail",
    required: false,
    note: "Sales, sessions, unit session percentage",
  },
  {
    key: "sqpReport",
    name: "Search Query Performance",
    type: "Brand Analytics",
    required: false,
    note: "Search query volume, clicks, purchases, and share",
  },
  {
    key: "marginKnown",
    name: "Margin line confirmed",
    type: "Manual",
    required: true,
    note: "Needs the numeric margin threshold below before calling ACOS healthy",
  },
  {
    key: "targetKnown",
    name: "Target ACOS or TACOS",
    type: "Manual",
    required: true,
    note: "Defines the diagnosis line",
  },
  {
    key: "conversionKnown",
    name: "Sessions or CVR",
    type: "Retail",
    required: false,
    note: "Needed for listing conversion calls",
  },
  {
    key: "inventoryKnown",
    name: "Inventory and Featured Offer",
    type: "Retail",
    required: false,
    note: "Needed before scaling",
  },
  {
    key: "rankKnown",
    name: "Keyword rank or known position",
    type: "Keyword",
    required: false,
    note: "Needed for rank-push claims",
  },
  {
    key: "dealWindow",
    name: "Deal or coupon window",
    type: "Promo",
    required: false,
    note: "Separates promo data from normal data",
  },
];

const defaultIntake: IntakeState = {
  spReport: false,
  sbReport: false,
  sdReport: false,
  placementReport: false,
  budgetReport: false,
  structureReport: false,
  businessReport: false,
  sqpReport: false,
  marginKnown: false,
  targetKnown: false,
  conversionKnown: false,
  inventoryKnown: false,
  rankKnown: false,
  dealWindow: false,
  featuredOfferStable: true,
  mainAsin: "",
  goal: "lower-tacos",
  lifecycle: "mature",
  acos: 0,
  targetAcos: 0,
  breakEvenAcos: 0,
  tacos: 0,
  targetTacos: 0,
  cvr: 0,
  inventoryDays: 0,
  keywordRank: 0,
  weeklySales: 0,
};

const demoIntake: IntakeState = {
  ...defaultIntake,
  spReport: true,
  sbReport: true,
  sdReport: true,
  placementReport: true,
  budgetReport: true,
  structureReport: true,
  businessReport: true,
  sqpReport: true,
  marginKnown: true,
  targetKnown: true,
  conversionKnown: true,
  inventoryKnown: true,
  rankKnown: true,
  mainAsin: "B0HERO1234",
  acos: 28,
  targetAcos: 22,
  breakEvenAcos: 32,
  tacos: 14.2,
  targetTacos: 12,
  cvr: 7.8,
  inventoryDays: 36,
  keywordRank: 18,
  weeklySales: 125480,
};

const zhUi = {
  subtitle: "上传 Amazon Ads 证据，选择经营目标，生成 PPC 浪费、TACOS 压力和下一步动作队列。",
  mainAsin: "主 ASIN 或 SKU",
  mainAsinPlaceholder: "诊断前输入 ASIN 或 SKU",
  goal: "目标",
  confidence: "诊断置信度",
  minimumInput: "1. 最低真实输入",
  requiredReady: (ready: number, total: number) => `${ready} / ${total} 个必填输入已就绪。`,
  uploadSp: "上传 Sponsored Products CSV",
  uploadSpNote: "P1 会读取 spend、sales、orders、clicks、campaign 和 search term；不会连接 Seller Central。",
  uploadSb: "上传 Sponsored Brands CSV",
  uploadSbNote: "可选：读取品牌、视频或 headline campaign 的 spend、sales、orders 和 clicks。",
  uploadSd: "上传 Sponsored Display CSV",
  uploadSdNote: "可选：读取 display、retargeting 或 audience 的 spend、sales、orders 和 clicks。",
  uploadPlacement: "上传 Placement CSV",
  uploadPlacementNote: "可选：读取 Top of Search、Product Pages、Rest of Search 的 spend、sales、orders 和 clicks。",
  uploadBudget: "上传 Budget / Campaign Settings CSV",
  uploadBudgetNote: "可选：读取 campaign budget、budget status、spend、sales、orders、clicks 和 budget usage。",
  uploadStructure: "上传 Campaign Structure CSV",
  uploadStructureNote: "可选：读取 campaign、ad group、match type、targeting type、target/keyword、spend、sales、orders 和 clicks。",
  uploadBusiness: "上传 Business Report CSV",
  uploadBusinessNote: "可选但重要：读取 sessions、ordered units、ordered product sales 和 unit session percentage。",
  uploadSqp: "上传 Search Query Performance CSV",
  uploadSqpNote: "rank-push 可选：读取 search query、impressions/query volume、clicks、purchases 和 purchase share。",
  sampleHeading: "CSV 样例模板",
  sampleBody: "这些只用于查看字段格式。正式诊断前，请用 Seller Central / Amazon Ads 导出的真实报表替换样例行。",
  localTemplates: "本地模板",
  loadDemo: "加载完整演示数据",
  demoLoaded: "已加载完整演示数据：SP/SB/SD、Placement、Budget、Structure、Business Report 和 SQP 都已进入诊断。",
  lifecycle: "生命周期",
  featuredOffer: "Featured Offer",
  stable: "稳定",
  unstable: "不稳定",
  boundary: "边界：缺少 margin、sales、conversion、inventory 或 rank 数据时，诊断必须降级。本工具不连接 Seller Central，也不会自动修改广告活动。",
  nextDataStep: "下一步补数据",
  branchHeading: "2. 分支诊断",
  branchBody: "下面诊断来自同一个经营分支，不是泛泛 dashboard。",
  modules: {
    current: "当前判断",
    evidence: "关键证据",
    actions: "优先动作",
    dont: "不要做什么",
    review: "复查规则",
    missing: "缺失数据",
  },
  actionQueue: "3. 动作队列",
  actionQueueBody: "动作继承当前诊断分支，并且只在已有数据边界内给出。",
  focus: "定位",
  reviewLoop: "4. 复查闭环",
  reviewBody: "每条建议都需要继续、观察或回滚的检查点。",
  decisionNextWeek: "下周决策",
  currentNextAction: "当前下一步动作",
  decisionState: "决策状态",
  exportAudit: "导出当前诊断",
  exportBody: "导出内容使用本页同一分支、证据、动作队列和缺失数据边界。",
  copySummary: "复制诊断摘要",
  downloadSummary: "下载诊断摘要",
  expertReview: "专家建议",
  expertBody: "当上传证据需要人工排优先级，再让投手改广告前使用。",
  reviewable: "可复核",
  notReady: "未就绪",
  prepare: "准备材料",
  prepareItems: ["SP search term 或 campaign report", "Break-even ACOS 和目标 ACOS/TACOS", "可用时补 Business Report、placement、budget、SQP 或 structure CSV"],
  expertBoundary: "边界",
  boundaryItems: ["不是自动 campaign management", "不保证 ACOS 下降或 sales lift", "本页不会修改 Seller Central"],
  requestExpert: "查看专家建议",
  completeInputs: "先补齐输入",
  addMoreData: "补充更多报表",
  ready: "已就绪",
  missing: "缺失",
  valueRequired: "需要数值",
  uploadRequired: "需要上传",
  topWaste: "优先检查的浪费",
  winners: "可放大的赢家",
  noBlockingGap: "当前场景没有阻断级数据缺口。",
  tableHeaders: {
    action: "动作",
    evidence: "证据",
    owner: "负责人",
    window: "窗口",
    confidence: "置信度",
    status: "状态",
  },
  checkpoints: ["第一检查点", "决策规则", "回退条件"],
  reviewStates: {
    effective: "有效",
    watch: "观察",
    reverse: "回滚",
  },
};

function isZh(locale: SupportedLocale) {
  return locale === "zh";
}

function labelFor<T extends { label: string; zhLabel?: string }>(item: T, locale: SupportedLocale) {
  return locale === "zh" && item.zhLabel ? item.zhLabel : item.label;
}

function formatPercent(value: number) {
  return `${Number(value.toFixed(1))}%`;
}

function formatUsd(value: number) {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function parseNumber(value: string | undefined) {
  if (!value) return 0;
  const cleaned = value.replace(/[$,%"]/g, "").replace(/,/g, "").trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += char;
    }
  }

  cells.push(cell.trim());
  return cells;
}

function pick(row: Record<string, string>, names: string[]) {
  for (const name of names) {
    const value = row[name.toLowerCase()];
    if (value !== undefined) return value;
  }
  return undefined;
}

function assertNotSampleCsv(text: string, fileName: string) {
  const normalizedFileName = fileName.toLowerCase();
  const normalizedText = text.replace(/\r/g, "").trim();
  const sampleFileNames = csvTemplates.map((template) => template.fileName.toLowerCase());
  const sampleContents = csvTemplates.map((template) => template.csv.trim());

  if (sampleFileNames.includes(normalizedFileName) || sampleContents.includes(normalizedText)) {
    throw new Error("Sample CSV uploaded");
  }
}

function csvUploadMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message === "Sample CSV uploaded") {
    return "This is one of the sample CSV templates. Replace the sample rows with your exported Seller Central or Amazon Ads report data, then upload the real file.";
  }

  return fallback;
}

function localizeUploadError(message: string, zh: boolean) {
  if (!zh || !message) return message;
  if (message.includes("sample CSV templates")) {
    return "这是样例 CSV 模板。请用 Seller Central 或 Amazon Ads 导出的真实报表替换样例行后再上传。";
  }
  if (message.includes("Sponsored Products")) {
    return "无法读取为 Sponsored Products CSV。请导出包含 spend、sales、orders、clicks 的 Search Term 或 Campaign 报表后重试。";
  }
  if (message.includes("Sponsored Brands")) {
    return "无法读取为 Sponsored Brands CSV。请导出包含 spend、sales、orders、clicks 的 campaign、keyword 或 search term 报表后重试。";
  }
  if (message.includes("Sponsored Display")) {
    return "无法读取为 Sponsored Display CSV。请导出包含 spend、sales、orders、clicks 的 campaign、target 或 audience 报表后重试。";
  }
  if (message.includes("Placement")) {
    return "无法读取为 Placement CSV。请导出包含 placement、spend、sales、orders、clicks 的报表后重试。";
  }
  if (message.includes("Budget") || message.includes("Campaign Settings")) {
    return "无法读取为 Budget / Campaign Settings CSV。请导出包含 campaign、budget、spend、sales、orders、clicks 和 budget status 的报表后重试。";
  }
  if (message.includes("Campaign Structure")) {
    return "无法读取为 Campaign Structure CSV。请导出包含 campaign、ad group、match type、targeting、spend、sales、orders、clicks 的报表后重试。";
  }
  if (message.includes("Search Query Performance")) {
    return "无法读取为 Search Query Performance CSV。请导出包含 search query、impressions、clicks、purchases 和 purchase share 的报表后重试。";
  }
  if (message.includes("Business Report")) {
    return "无法读取为 Business Report CSV。请导出包含 sessions、ordered units 和 ordered product sales 的 Sales and Traffic 报表后重试。";
  }
  return "这个文件暂时无法读取。请确认 CSV 字段包含本工具需要的广告或业务指标后再上传。";
}

function hasTargetLine(intake: IntakeState) {
  return hasTargetAcosLine(intake) || hasTargetTacosLine(intake);
}

function hasTargetAcosLine(intake: IntakeState) {
  return intake.targetKnown && intake.targetAcos > 0;
}

function hasTargetTacosLine(intake: IntakeState) {
  return intake.targetKnown && intake.targetTacos > 0;
}

function formatTargetAcos(intake: IntakeState) {
  return hasTargetAcosLine(intake) ? formatPercent(intake.targetAcos) : "target missing";
}

function formatTacosEvidence(intake: IntakeState, relation: "above" | "at-or-under") {
  if (!intake.businessReport && !hasTargetTacosLine(intake)) {
    return "TACOS cannot be compared because Business Report and target TACOS are missing.";
  }
  if (!intake.businessReport) {
    return "TACOS cannot be compared because Business Report is missing.";
  }
  if (!hasTargetTacosLine(intake)) {
    return "TACOS target is missing, so TACOS is context only, not a pass/fail line.";
  }
  return `TACOS ${formatPercent(intake.tacos)} is ${relation === "above" ? "above" : "at or under"} ${formatPercent(intake.targetTacos)}.`;
}

function formatTacosEvidenceZh(intake: IntakeState, relation: "above" | "at-or-under") {
  if (!intake.businessReport && !hasTargetTacosLine(intake)) {
    return "缺少 Business Report 和目标 TACOS，暂时不能判断 TACOS 是否健康。";
  }
  if (!intake.businessReport) {
    return "缺少 Business Report，TACOS 只能作为手填参考，不能作为强结论。";
  }
  if (!hasTargetTacosLine(intake)) {
    return "缺少目标 TACOS，当前 TACOS 只能辅助判断，不能作为通过或失败线。";
  }
  return `TACOS ${formatPercent(intake.tacos)} ${relation === "above" ? "高于" : "不高于"}目标 ${formatPercent(intake.targetTacos)}。`;
}

function hasConversionLine(intake: IntakeState) {
  return intake.conversionKnown && intake.cvr > 0;
}

function hasInventoryLine(intake: IntakeState) {
  return intake.inventoryKnown && intake.inventoryDays > 0;
}

function hasRankLine(intake: IntakeState) {
  return intake.rankKnown && intake.keywordRank > 0;
}

function buildBidGuardrail(signal: AdSignal, targetAcos: number | null): BidGuardrail | null {
  if (signal.spend <= 0 && signal.clicks <= 0 && signal.orders <= 0) return null;

  if (signal.orders === 0 && signal.clicks >= 10 && signal.spend > 0) {
    return {
      signal,
      decision: "pause-or-negative",
      action: `Pause, cap, or add negative only after checking match type for ${signal.label}`,
      reason: `${signal.clicks} clicks and ${formatUsd(signal.spend)} spend with 0 orders.`,
      boundary: "Do not apply account-wide negatives before checking campaign role, match type, and whether this is a rank-push test.",
    };
  }

  if (targetAcos !== null && signal.orders > 0 && signal.acos !== null && signal.acos > targetAcos) {
    return {
      signal,
      decision: "bid-down",
      action: `Bid down or isolate ${signal.label}`,
      reason: `${signal.orders} orders but ${formatPercent(signal.acos)} ACOS is above the ${formatPercent(targetAcos)} target.`,
      boundary: "Do not negate ordered terms; reduce bid, isolate budget, or move to a tighter campaign first.",
    };
  }

  if (targetAcos !== null && signal.orders >= 3 && signal.acos !== null && signal.acos <= targetAcos * 0.8 && signal.clicks >= 10) {
    return {
      signal,
      decision: "increase-cautiously",
      action: `Increase cautiously only inside a protected campaign for ${signal.label}`,
      reason: `${signal.orders} orders and ${formatPercent(signal.acos)} ACOS are comfortably under target.`,
      boundary: "Do not scale broad discovery from this proof; protect inventory, Featured Offer, and TACOS before increasing again.",
    };
  }

  if (signal.orders === 0 && signal.clicks > 0 && signal.clicks < 10 && signal.spend > 0) {
    return {
      signal,
      decision: "watch-only",
      action: `Keep watching ${signal.label}`,
      reason: `${signal.clicks} clicks is not enough sample for a hard bid or negative decision.`,
      boundary: "Do not pause from thin sample unless it violates a known brand, compliance, or irrelevant-query rule.",
    };
  }

  return null;
}

function bidDecisionPriority(decision: BidDecision) {
  const priorities: Record<BidDecision, number> = {
    "pause-or-negative": 4,
    "bid-down": 3,
    "increase-cautiously": 2,
    "watch-only": 1,
  };

  return priorities[decision];
}

function summarizeBidGuardrails(signals: AdSignal[], targetAcos: number | null) {
  return signals
    .map((signal) => buildBidGuardrail(signal, targetAcos))
    .filter((item): item is BidGuardrail => Boolean(item))
    .sort((a, b) => bidDecisionPriority(b.decision) - bidDecisionPriority(a.decision) || b.signal.spend - a.signal.spend)
    .slice(0, 6);
}

function summarizeAdsSignals(signals: AdSignal[], fileName: string, targetAcos: number | null): AdsReportSummary {
  const spend = signals.reduce((sum, item) => sum + item.spend, 0);
  const sales = signals.reduce((sum, item) => sum + item.sales, 0);
  const orders = signals.reduce((sum, item) => sum + item.orders, 0);
  const clicks = signals.reduce((sum, item) => sum + item.clicks, 0);
  const waste = signals
    .filter((item) => item.spend > 0 && item.orders === 0)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 3);
  const winners = signals
    .filter((item) => targetAcos !== null && item.orders > 0 && item.acos !== null && item.acos <= targetAcos)
    .sort((a, b) => b.orders - a.orders || a.spend - b.spend)
    .slice(0, 3);
  const negativeCandidates = signals
    .filter((item) => item.spend > 0 && item.clicks >= 10 && item.orders === 0)
    .sort((a, b) => b.spend - a.spend || b.clicks - a.clicks)
    .slice(0, 4);
  const bidDownCandidates = signals
    .filter((item) => targetAcos !== null && item.orders > 0 && item.acos !== null && item.acos > targetAcos)
    .sort((a, b) => (b.acos ?? 0) - (a.acos ?? 0) || b.spend - a.spend)
    .slice(0, 4);
  const keepCandidates = signals
    .filter((item) => targetAcos !== null && item.orders > 0 && item.acos !== null && item.acos <= targetAcos)
    .sort((a, b) => b.orders - a.orders || a.spend - b.spend)
    .slice(0, 4);
  const weakEvidence = signals
    .filter((item) => item.spend > 0 && item.orders === 0 && item.clicks > 0 && item.clicks < 10)
    .sort((a, b) => b.spend - a.spend || b.clicks - a.clicks)
    .slice(0, 4);
  const bidGuardrails = summarizeBidGuardrails(signals, targetAcos);

  return {
    fileName,
    rowCount: signals.length,
    signals,
    spend,
    sales,
    orders,
    clicks,
    acos: sales > 0 ? (spend / sales) * 100 : null,
    cvr: clicks > 0 ? (orders / clicks) * 100 : null,
    waste,
    winners,
    negativeCandidates,
    bidDownCandidates,
    keepCandidates,
    weakEvidence,
    bidGuardrails,
  };
}

function buildPortfolioSummary(channels: ChannelSummary[]): AdPortfolioSummary | null {
  if (!channels.length) return null;

  const spend = channels.reduce((sum, item) => sum + item.spend, 0);
  const sales = channels.reduce((sum, item) => sum + item.sales, 0);
  const orders = channels.reduce((sum, item) => sum + item.orders, 0);
  const clicks = channels.reduce((sum, item) => sum + item.clicks, 0);
  const waste = channels
    .flatMap((item) => item.waste.map((signal) => ({ ...signal, campaign: `${item.channel}: ${signal.campaign}` })))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 4);
  const winners = channels
    .flatMap((item) => item.winners.map((signal) => ({ ...signal, campaign: `${item.channel}: ${signal.campaign}` })))
    .sort((a, b) => b.orders - a.orders || a.spend - b.spend)
    .slice(0, 4);
  const negativeCandidates = channels
    .flatMap((item) => item.negativeCandidates.map((signal) => ({ ...signal, campaign: `${item.channel}: ${signal.campaign}` })))
    .sort((a, b) => b.spend - a.spend || b.clicks - a.clicks)
    .slice(0, 4);
  const bidDownCandidates = channels
    .flatMap((item) => item.bidDownCandidates.map((signal) => ({ ...signal, campaign: `${item.channel}: ${signal.campaign}` })))
    .sort((a, b) => (b.acos ?? 0) - (a.acos ?? 0) || b.spend - a.spend)
    .slice(0, 4);
  const keepCandidates = channels
    .flatMap((item) => item.keepCandidates.map((signal) => ({ ...signal, campaign: `${item.channel}: ${signal.campaign}` })))
    .sort((a, b) => b.orders - a.orders || a.spend - b.spend)
    .slice(0, 4);
  const weakEvidence = channels
    .flatMap((item) => item.weakEvidence.map((signal) => ({ ...signal, campaign: `${item.channel}: ${signal.campaign}` })))
    .sort((a, b) => b.spend - a.spend || b.clicks - a.clicks)
    .slice(0, 4);
  const bidGuardrails = channels
    .flatMap((item) =>
      item.bidGuardrails.map((guardrail) => ({
        ...guardrail,
        signal: { ...guardrail.signal, campaign: `${item.channel}: ${guardrail.signal.campaign}` },
      })),
    )
    .sort((a, b) => bidDecisionPriority(b.decision) - bidDecisionPriority(a.decision) || b.signal.spend - a.signal.spend)
    .slice(0, 6);
  const mix = channels.map((item) => {
    const share = spend > 0 ? (item.spend / spend) * 100 : 0;
    return `${item.channel}: ${formatPercent(share)} of ad spend, ${item.acos === null ? "ACOS missing" : `${formatPercent(item.acos)} ACOS`}`;
  });

  return {
    channels,
    spend,
    sales,
    orders,
    clicks,
    acos: sales > 0 ? (spend / sales) * 100 : null,
    cvr: clicks > 0 ? (orders / clicks) * 100 : null,
    waste,
    winners,
    negativeCandidates,
    bidDownCandidates,
    keepCandidates,
    weakEvidence,
    bidGuardrails,
    mix,
  };
}

function parseAdsCsv(text: string, fileName: string, targetAcos: number | null): AdsReportSummary {
  assertNotSampleCsv(text, fileName);
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("No rows");
  }

  const headers = splitCsvLine(lines[0]).map((header) => header.toLowerCase());
  const rows = lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = cells[index] ?? "";
      return row;
    }, {});
  });

  const signals = rows.map((row, index) => {
    const spend = parseNumber(pick(row, ["Spend", "Cost", "14 Day Total Spend"]));
    const sales = parseNumber(pick(row, ["Sales", "7 Day Total Sales", "14 Day Total Sales", "Total Advertising Sales"]));
    const orders = parseNumber(pick(row, ["Orders", "7 Day Total Orders (#)", "14 Day Total Orders (#)", "Purchases"]));
    const clicks = parseNumber(pick(row, ["Clicks"]));
    const searchTerm = pick(row, ["Customer Search Term", "Search Term", "Targeting", "Keyword"])?.trim();
    const campaign = pick(row, ["Campaign Name", "Campaign", "Campaigns"])?.trim() || "Unlabeled campaign";
    const label = searchTerm || campaign || `Row ${index + 1}`;

    return {
      label,
      campaign,
      spend,
      sales,
      orders,
      clicks,
      acos: sales > 0 ? (spend / sales) * 100 : null,
    };
  });

  const summary = summarizeAdsSignals(signals, fileName, targetAcos);
  if (summary.spend <= 0 && summary.sales <= 0 && summary.clicks <= 0) {
    throw new Error("Missing metrics");
  }

  return summary;
}

function summarizePlacementSignals(signals: PlacementSignal[], fileName: string, targetAcos: number | null): PlacementReportSummary {
  const spend = signals.reduce((sum, item) => sum + item.spend, 0);
  const sales = signals.reduce((sum, item) => sum + item.sales, 0);
  const orders = signals.reduce((sum, item) => sum + item.orders, 0);
  const clicks = signals.reduce((sum, item) => sum + item.clicks, 0);
  const inefficient = signals
    .filter((item) => item.spend > 0 && (item.orders === 0 || (targetAcos !== null && item.acos !== null && item.acos > targetAcos)))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 3);
  const winners = signals
    .filter((item) => targetAcos !== null && item.orders > 0 && item.acos !== null && item.acos <= targetAcos)
    .sort((a, b) => b.orders - a.orders || a.spend - b.spend)
    .slice(0, 3);

  return {
    fileName,
    rowCount: signals.length,
    signals,
    spend,
    sales,
    orders,
    clicks,
    inefficient,
    winners,
  };
}

function parsePlacementCsv(text: string, fileName: string, targetAcos: number | null): PlacementReportSummary {
  assertNotSampleCsv(text, fileName);
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("No rows");
  }

  const headers = splitCsvLine(lines[0]).map((header) => header.toLowerCase());
  const rows = lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = cells[index] ?? "";
      return row;
    }, {});
  });

  const signals = rows.map((row, index) => {
    const placement = pick(row, ["Placement", "Placement Type", "Matched Placement", "Ad Placement"])?.trim() || `Placement ${index + 1}`;
    const spend = parseNumber(pick(row, ["Spend", "Cost", "14 Day Total Spend"]));
    const sales = parseNumber(pick(row, ["Sales", "7 Day Total Sales", "14 Day Total Sales", "Total Advertising Sales"]));
    const orders = parseNumber(pick(row, ["Orders", "7 Day Total Orders (#)", "14 Day Total Orders (#)", "Purchases"]));
    const clicks = parseNumber(pick(row, ["Clicks"]));

    return {
      placement,
      spend,
      sales,
      orders,
      clicks,
      acos: sales > 0 ? (spend / sales) * 100 : null,
    };
  });

  const summary = summarizePlacementSignals(signals, fileName, targetAcos);
  if (summary.spend <= 0 && summary.sales <= 0 && summary.clicks <= 0) {
    throw new Error("Missing placement metrics");
  }

  return summary;
}

function summarizeBudgetSignals(signals: BudgetSignal[], fileName: string, targetAcos: number | null): BudgetReportSummary {
  const budget = signals.reduce((sum, item) => sum + item.budget, 0);
  const spend = signals.reduce((sum, item) => sum + item.spend, 0);
  const sales = signals.reduce((sum, item) => sum + item.sales, 0);
  const orders = signals.reduce((sum, item) => sum + item.orders, 0);
  const clicks = signals.reduce((sum, item) => sum + item.clicks, 0);
  const constrained = signals
    .filter((item) => {
      const statusLimited = /budget|limited|exhaust|cap/i.test(item.budgetStatus);
      const usageLimited = item.budgetUsage !== null ? item.budgetUsage >= 90 : item.budget > 0 && item.spend >= item.budget * 0.9;
      const hasProof = targetAcos !== null && item.orders > 0 && (item.acos === null || item.acos <= targetAcos);
      return (statusLimited || usageLimited) && hasProof;
    })
    .sort((a, b) => b.orders - a.orders || b.spend - a.spend)
    .slice(0, 3);
  const inefficient = signals
    .filter((item) => item.spend > 0 && (item.orders === 0 || (targetAcos !== null && item.acos !== null && item.acos > targetAcos)))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 3);

  return {
    fileName,
    rowCount: signals.length,
    signals,
    budget,
    spend,
    sales,
    orders,
    clicks,
    constrained,
    inefficient,
  };
}

function parseBudgetCsv(text: string, fileName: string, targetAcos: number | null): BudgetReportSummary {
  assertNotSampleCsv(text, fileName);
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("No rows");
  }

  const headers = splitCsvLine(lines[0]).map((header) => header.toLowerCase());
  const rows = lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = cells[index] ?? "";
      return row;
    }, {});
  });

  const signals = rows.map((row, index) => {
    const campaign = pick(row, ["Campaign Name", "Campaign", "Campaigns"])?.trim() || `Campaign ${index + 1}`;
    const budget = parseNumber(pick(row, ["Budget", "Daily Budget", "Campaign Budget"]));
    const spend = parseNumber(pick(row, ["Spend", "Cost", "14 Day Total Spend"]));
    const sales = parseNumber(pick(row, ["Sales", "7 Day Total Sales", "14 Day Total Sales", "Total Advertising Sales"]));
    const orders = parseNumber(pick(row, ["Orders", "7 Day Total Orders (#)", "14 Day Total Orders (#)", "Purchases"]));
    const clicks = parseNumber(pick(row, ["Clicks"]));
    const budgetUsageRaw = pick(row, ["Budget Usage", "Budget Usage %", "Budget utilization", "Budget Utilization %"]);
    const budgetUsage = budgetUsageRaw === undefined || budgetUsageRaw.trim() === "" ? null : parseNumber(budgetUsageRaw);
    const budgetStatus = pick(row, ["Budget Status", "Status", "Campaign Status", "Serving Status"])?.trim() || "";

    return {
      campaign,
      budget,
      spend,
      sales,
      orders,
      clicks,
      budgetUsage,
      budgetStatus,
      acos: sales > 0 ? (spend / sales) * 100 : null,
    };
  });

  const summary = summarizeBudgetSignals(signals, fileName, targetAcos);
  if (summary.budget <= 0 && summary.spend <= 0 && summary.clicks <= 0) {
    throw new Error("Missing budget metrics");
  }

  return summary;
}

function inferStructureRole(signal: Pick<StructureSignal, "campaign" | "adGroup" | "matchType" | "targeting" | "targetingType">): StructureRole {
  const text = `${signal.campaign} ${signal.adGroup} ${signal.matchType} ${signal.targeting} ${signal.targetingType}`.toLowerCase();
  if (/retarget|remarket|audience|views remarketing|purchases remarketing/.test(text)) return "retargeting";
  if (/rank|push|hero keyword|ranking/.test(text)) return "rank-push";
  if (/brand|branded|defense|defence|own asin|own product|protect/.test(text)) return "brand-defense";
  if (/exact|profit|control|harvest|winner/.test(text)) return "profit-control";
  if (/launch|broad|phrase|auto|close match|loose match|substitutes|complements|category|discovery|research|explore/.test(text)) return "discovery";
  return "unknown";
}

function summarizeStructureSignals(signals: StructureSignal[], fileName: string, targetAcos: number | null): StructureReportSummary {
  const spend = signals.reduce((sum, item) => sum + item.spend, 0);
  const sales = signals.reduce((sum, item) => sum + item.sales, 0);
  const orders = signals.reduce((sum, item) => sum + item.orders, 0);
  const clicks = signals.reduce((sum, item) => sum + item.clicks, 0);
  const byCampaign = signals.reduce<Map<string, StructureSignal[]>>((map, item) => {
    const existing = map.get(item.campaign) ?? [];
    existing.push(item);
    map.set(item.campaign, existing);
    return map;
  }, new Map());

  const mixedCampaigns = Array.from(byCampaign.entries())
    .map(([campaign, rows]) => {
      const campaignSpend = rows.reduce((sum, item) => sum + item.spend, 0);
      const campaignOrders = rows.reduce((sum, item) => sum + item.orders, 0);
      const roles = Array.from(new Set(rows.filter((item) => item.role !== "unknown" && item.spend > 0).map((item) => item.role)));
      return { campaign, roles, spend: campaignSpend, orders: campaignOrders };
    })
    .filter((item) => item.roles.length >= 2 && item.spend > 0)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 3);

  const wasteTargets = signals
    .filter((item) => item.spend > 0 && (item.orders === 0 || (targetAcos !== null && item.acos !== null && item.acos > targetAcos)))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 4);
  const provenTargets = signals
    .filter((item) => targetAcos !== null && item.orders > 0 && item.acos !== null && item.acos <= targetAcos)
    .sort((a, b) => b.orders - a.orders || a.spend - b.spend)
    .slice(0, 4);

  return {
    fileName,
    rowCount: signals.length,
    signals,
    spend,
    sales,
    orders,
    clicks,
    mixedCampaigns,
    wasteTargets,
    provenTargets,
  };
}

function parseStructureCsv(text: string, fileName: string, targetAcos: number | null): StructureReportSummary {
  assertNotSampleCsv(text, fileName);
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("No rows");
  }

  const headers = splitCsvLine(lines[0]).map((header) => header.toLowerCase());
  const rows = lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = cells[index] ?? "";
      return row;
    }, {});
  });

  const signals = rows.map((row, index) => {
    const campaign = pick(row, ["Campaign Name", "Campaign", "Campaigns"])?.trim() || `Campaign ${index + 1}`;
    const adGroup = pick(row, ["Ad Group Name", "Ad Group", "Ad group"])?.trim() || "Unlabeled ad group";
    const matchType = pick(row, ["Match Type", "Keyword Match Type", "Match"])?.trim() || "";
    const targeting =
      pick(row, ["Targeting", "Keyword", "Customer Search Term", "Search Term", "Product Targeting Expression"])?.trim() || `Target ${index + 1}`;
    const targetingType = pick(row, ["Targeting Type", "Target Type", "Campaign Targeting Type", "Expression Type"])?.trim() || "";
    const spend = parseNumber(pick(row, ["Spend", "Cost", "14 Day Total Spend"]));
    const sales = parseNumber(pick(row, ["Sales", "7 Day Total Sales", "14 Day Total Sales", "Total Advertising Sales"]));
    const orders = parseNumber(pick(row, ["Orders", "7 Day Total Orders (#)", "14 Day Total Orders (#)", "Purchases"]));
    const clicks = parseNumber(pick(row, ["Clicks"]));
    const baseSignal = {
      campaign,
      adGroup,
      matchType,
      targeting,
      targetingType,
      spend,
      sales,
      orders,
      clicks,
      acos: sales > 0 ? (spend / sales) * 100 : null,
    };

    return {
      ...baseSignal,
      role: inferStructureRole(baseSignal),
    };
  });

  const summary = summarizeStructureSignals(signals, fileName, targetAcos);
  const hasStructureColumn = signals.some((item) => item.matchType || item.targetingType || item.targeting || item.adGroup);
  if (!hasStructureColumn || (summary.spend <= 0 && summary.clicks <= 0 && summary.orders <= 0)) {
    throw new Error("Missing structure metrics");
  }

  return summary;
}

function parseRetailCsv(text: string, fileName: string): RetailReportSummary {
  assertNotSampleCsv(text, fileName);
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("No rows");
  }

  const headers = splitCsvLine(lines[0]).map((header) => header.toLowerCase());
  const rows = lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = cells[index] ?? "";
      return row;
    }, {});
  });

  const totals = rows.reduce(
    (sum, row) => {
      const sessions = parseNumber(pick(row, ["Sessions", "Browser Sessions", "Mobile App Sessions", "Total Sessions"]));
      const units = parseNumber(pick(row, ["Units Ordered", "Ordered Units", "Total Order Items", "Ordered Product Units"]));
      const sales = parseNumber(pick(row, ["Ordered Product Sales", "Sales", "Ordered Product Sales - B2B", "Total Sales"]));
      const unitSessionPercentage = parseNumber(pick(row, ["Unit Session Percentage", "Unit Session %", "Unit Session Percentage B2B"]));

      return {
        sessions: sum.sessions + sessions,
        units: sum.units + units,
        sales: sum.sales + sales,
        unitSessionPercentageTotal: sum.unitSessionPercentageTotal + unitSessionPercentage,
        unitSessionPercentageRows: sum.unitSessionPercentageRows + (unitSessionPercentage > 0 ? 1 : 0),
      };
    },
    { sessions: 0, units: 0, sales: 0, unitSessionPercentageTotal: 0, unitSessionPercentageRows: 0 },
  );

  if (totals.sessions <= 0 && totals.units <= 0 && totals.sales <= 0) {
    throw new Error("Missing retail metrics");
  }

  return {
    fileName,
    rowCount: rows.length,
    sessions: totals.sessions,
    units: totals.units,
    sales: totals.sales,
    unitSessionPercentage:
      totals.sessions > 0
        ? (totals.units / totals.sessions) * 100
        : totals.unitSessionPercentageRows > 0
          ? totals.unitSessionPercentageTotal / totals.unitSessionPercentageRows
          : null,
  };
}

function summarizeQuerySignals(signals: QuerySignal[], fileName: string): QueryReportSummary {
  const impressions = signals.reduce((sum, item) => sum + item.impressions, 0);
  const clicks = signals.reduce((sum, item) => sum + item.clicks, 0);
  const purchases = signals.reduce((sum, item) => sum + item.purchases, 0);
  const opportunities = signals
    .filter((item) => item.impressions > 0 && (item.purchaseShare === null || item.purchaseShare < 4))
    .sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks)
    .slice(0, 3);
  const winners = signals
    .filter((item) => item.purchases > 0)
    .sort((a, b) => b.purchases - a.purchases || b.clicks - a.clicks)
    .slice(0, 3);

  return {
    fileName,
    rowCount: signals.length,
    signals,
    impressions,
    clicks,
    purchases,
    opportunities,
    winners,
  };
}

function parseQueryCsv(text: string, fileName: string): QueryReportSummary {
  assertNotSampleCsv(text, fileName);
  const lines = text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("No rows");
  }

  const headers = splitCsvLine(lines[0]).map((header) => header.toLowerCase());
  const rows = lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    return headers.reduce<Record<string, string>>((row, header, index) => {
      row[header] = cells[index] ?? "";
      return row;
    }, {});
  });

  const signals = rows.map((row, index) => {
    const query = pick(row, ["Search Query", "Query", "Customer Search Term", "Search Term"])?.trim() || `Query ${index + 1}`;
    const impressions = parseNumber(pick(row, ["Impressions", "Impressions: Total Count", "Search Query Volume", "Query Volume"]));
    const clicks = parseNumber(pick(row, ["Clicks", "Clicks: Total Count", "Total Clicks"]));
    const purchases = parseNumber(pick(row, ["Purchases", "Purchases: Total Count", "Orders", "Total Purchases"]));
    const purchaseShareRaw = pick(row, ["Purchase Share", "Purchase Share %", "Purchases: Share %", "Purchase Share Percentage"]);
    const purchaseShare = purchaseShareRaw === undefined || purchaseShareRaw.trim() === "" ? null : parseNumber(purchaseShareRaw);

    return {
      query,
      impressions,
      clicks,
      purchases,
      purchaseShare,
    };
  });

  const summary = summarizeQuerySignals(signals, fileName);
  if (summary.impressions <= 0 && summary.clicks <= 0 && summary.purchases <= 0) {
    throw new Error("Missing query metrics");
  }

  return summary;
}

function inferBranch(intake: IntakeState): Branch {
  if (!intake.spReport || !intake.marginKnown || intake.breakEvenAcos <= 0 || !hasTargetLine(intake) || !intake.mainAsin.trim()) {
    return "input-gap";
  }
  if (intake.dealWindow || intake.goal === "deal-support") {
    return "promo-window";
  }
  if (intake.lifecycle === "clearance" || intake.goal === "clear-inventory") {
    return "clearance";
  }
  if (hasConversionLine(intake) && intake.cvr < 6.5) {
    return "listing-conversion";
  }
  if (
    (intake.goal === "scale" || intake.goal === "margin-control") &&
    (!intake.businessReport || !hasConversionLine(intake) || !hasInventoryLine(intake) || !intake.featuredOfferStable)
  ) {
    return "retail-data-gap";
  }
  if (intake.goal === "rank-push" || intake.lifecycle === "launch" || intake.lifecycle === "growth") {
    return "rank-push";
  }
  if (
    hasTargetAcosLine(intake) &&
    hasTargetTacosLine(intake) &&
    intake.acos <= intake.targetAcos &&
    intake.tacos <= intake.targetTacos &&
    intake.businessReport &&
    hasConversionLine(intake) &&
    intake.cvr >= 9 &&
    hasInventoryLine(intake) &&
    intake.inventoryDays >= 30 &&
    intake.featuredOfferStable
  ) {
    return "scale-opportunity";
  }
  return "ad-waste";
}

function buildMissing(intake: IntakeState) {
  const missing: string[] = [];
  if (!intake.spReport) missing.push("Sponsored Products report");
  if (!intake.marginKnown || intake.breakEvenAcos <= 0) missing.push("Margin line and break-even ACOS");
  if (!hasTargetLine(intake)) missing.push("Target ACOS or TACOS");
  if (!intake.businessReport) missing.push("Business Report");
  if (!hasConversionLine(intake)) missing.push("Sessions or CVR");
  if (!hasInventoryLine(intake)) missing.push("Inventory days and Featured Offer status");
  if (!hasRankLine(intake)) missing.push("Keyword rank or current position");
  if ((intake.goal === "rank-push" || intake.lifecycle === "launch" || intake.lifecycle === "growth") && !intake.sqpReport) {
    missing.push("Search Query Performance");
  }
  if (!intake.mainAsin.trim()) missing.push("Main ASIN or SKU");
  return missing;
}

function buildGoalReadiness(intake: IntakeState): GoalReadiness {
  const baseItems: ReadinessItem[] = [
    { label: "Sponsored Products report uploaded", ready: intake.spReport, impact: "blocks strong call" },
    { label: "Main ASIN or SKU provided", ready: Boolean(intake.mainAsin.trim()), impact: "blocks strong call" },
    { label: "Break-even ACOS confirmed", ready: intake.marginKnown && intake.breakEvenAcos > 0, impact: "blocks strong call" },
    { label: "Target ACOS or TACOS confirmed", ready: hasTargetLine(intake), impact: "blocks strong call" },
  ];
  const goalItems: Record<Goal, ReadinessItem[]> = {
    "lower-tacos": [
      { label: "Business Report for TACOS and sales contribution", ready: intake.businessReport, impact: "limits confidence" },
      { label: "Campaign structure for role-safe cuts", ready: intake.structureReport, impact: "limits confidence" },
      { label: "Placement or budget report for spend leakage", ready: intake.placementReport || intake.budgetReport, impact: "optional context" },
    ],
    "rank-push": [
      { label: "Keyword rank baseline provided", ready: hasRankLine(intake), impact: "blocks strong call" },
      { label: "Search Query Performance uploaded", ready: intake.sqpReport, impact: "limits confidence" },
      { label: "Business Report for organic order movement", ready: intake.businessReport, impact: "limits confidence" },
      { label: "Campaign structure separates rank-push from profit-control", ready: intake.structureReport, impact: "limits confidence" },
    ],
    scale: [
      { label: "Business Report for retail sales and sessions", ready: intake.businessReport, impact: "blocks strong call" },
      { label: "CVR or sessions confirmed", ready: hasConversionLine(intake), impact: "blocks strong call" },
      { label: "Inventory days confirmed", ready: hasInventoryLine(intake), impact: "blocks strong call" },
      { label: "Featured Offer is stable", ready: intake.featuredOfferStable, impact: "limits confidence" },
      { label: "Budget report for constrained winners", ready: intake.budgetReport, impact: "optional context" },
    ],
    "margin-control": [
      { label: "Business Report for TACOS and sales contribution", ready: intake.businessReport, impact: "blocks strong call" },
      { label: "CVR or sessions confirmed", ready: hasConversionLine(intake), impact: "limits confidence" },
      { label: "Campaign structure for role-safe cuts", ready: intake.structureReport, impact: "limits confidence" },
      { label: "Budget report for inefficient budget pools", ready: intake.budgetReport, impact: "optional context" },
    ],
    "clear-inventory": [
      { label: "Inventory days confirmed", ready: hasInventoryLine(intake), impact: "blocks strong call" },
      { label: "Business Report for weekly units and sales", ready: intake.businessReport, impact: "limits confidence" },
      { label: "Deal or coupon window marked when active", ready: intake.dealWindow || intake.lifecycle === "clearance", impact: "optional context" },
      { label: "Campaign structure avoids expanding exit SKUs", ready: intake.structureReport, impact: "optional context" },
    ],
    "deal-support": [
      { label: "Deal or coupon window marked active", ready: intake.dealWindow, impact: "blocks strong call" },
      { label: "Business Report for incremental sales check", ready: intake.businessReport, impact: "limits confidence" },
      { label: "Placement report for promo traffic mix", ready: intake.placementReport, impact: "optional context" },
      { label: "Budget report for deal-week caps", ready: intake.budgetReport, impact: "optional context" },
    ],
  };
  const items = [...baseItems, ...goalItems[intake.goal]];
  const readyCount = items.filter((item) => item.ready).length;
  const blockingMissing = items.filter((item) => !item.ready && item.impact === "blocks strong call");
  const limitingMissing = items.filter((item) => !item.ready && item.impact === "limits confidence");
  const goalLabel = goals.find((item) => item.id === intake.goal)?.label ?? intake.goal;

  return {
    title: `${goalLabel} readiness`,
    verdict: blockingMissing.length
      ? "Strong recommendation is blocked until the required inputs are filled."
      : limitingMissing.length
        ? "A directional recommendation is possible, but confidence is limited by missing support data."
        : "The current input set can support a stronger operating recommendation.",
    readyCount,
    totalCount: items.length,
    items,
    next: blockingMissing[0]?.label ?? limitingMissing[0]?.label ?? "Use the six-module diagnosis and action queue.",
  };
}

function buildSixModule(
  intake: IntakeState,
  querySummary: QueryReportSummary | null = null,
  portfolioSummary: AdPortfolioSummary | null = null,
  placementSummary: PlacementReportSummary | null = null,
  budgetSummary: BudgetReportSummary | null = null,
  structureSummary: StructureReportSummary | null = null,
): SixModule {
  const branch = inferBranch(intake);
  const missing = buildMissing(intake);
  const sharedBoundary =
    "This diagnosis uses only uploaded and typed inputs. Missing margin, sales, conversion, inventory, or rank data will not be treated as complete retail truth.";
  const marginLine = `Break-even ACOS is ${formatPercent(intake.breakEvenAcos)}, so spend above that line needs a clear rank, deal, or inventory reason.`;
  const queryOpportunity = querySummary?.opportunities[0];
  const queryWinner = querySummary?.winners[0];
  const negativeCandidate = portfolioSummary?.negativeCandidates[0];
  const bidDownCandidate = portfolioSummary?.bidDownCandidates[0];
  const keepCandidate = portfolioSummary?.keepCandidates[0];
  const weakCleanupEvidence = portfolioSummary?.weakEvidence[0];
  const bidGuardrail = portfolioSummary?.bidGuardrails[0];
  const channelMixLine = portfolioSummary && portfolioSummary.channels.length > 1 ? `Uploaded ad mix covers ${portfolioSummary.channels.map((item) => item.channel).join(", ")}.` : null;
  const placementWaste = placementSummary?.inefficient[0];
  const placementLine = placementWaste
    ? `${placementWaste.placement} is the first placement to inspect: ${formatUsd(placementWaste.spend)} spend, ${
        placementWaste.acos === null ? "ACOS missing" : `${formatPercent(placementWaste.acos)} ACOS`
      }.`
    : placementSummary
      ? "Placement report is present, and no above-target placement was isolated from uploaded rows."
      : "Placement report is missing, so Top of Search, Product Pages, and Rest of Search decisions must stay limited.";
  const constrainedBudget = budgetSummary?.constrained[0];
  const inefficientBudget = budgetSummary?.inefficient[0];
  const mixedStructure = structureSummary?.mixedCampaigns[0];
  const wasteStructure = structureSummary?.wasteTargets[0];
  const provenStructure = structureSummary?.provenTargets[0];
  const budgetLine = constrainedBudget
    ? `${constrainedBudget.campaign} looks budget constrained with ${constrainedBudget.orders} orders and ${
        constrainedBudget.budgetUsage === null ? `${formatUsd(constrainedBudget.spend)} spend` : `${formatPercent(constrainedBudget.budgetUsage)} budget usage`
      }; only increase if margin and retail data support it.`
    : inefficientBudget
      ? `${inefficientBudget.campaign} is the first budget cleanup candidate: ${formatUsd(inefficientBudget.spend)} spend, ${inefficientBudget.orders} orders.`
      : budgetSummary
        ? "Budget report is present, and no constrained winner or low-efficiency budget was isolated from uploaded rows."
        : "Budget report is missing, so daily budget and campaign status decisions must stay limited.";
  const structureLine = mixedStructure
    ? `${mixedStructure.campaign} mixes ${mixedStructure.roles.join(", ")} roles with ${formatUsd(mixedStructure.spend)} spend; split role before scaling or cutting the whole campaign.`
    : wasteStructure
      ? `${wasteStructure.targeting} is a structure cleanup candidate in ${wasteStructure.campaign}: ${formatUsd(wasteStructure.spend)} spend, ${wasteStructure.orders} orders.`
      : provenStructure
        ? `${provenStructure.targeting} has target-level proof in ${provenStructure.campaign}: ${provenStructure.orders} orders and ${
            provenStructure.acos === null ? "ACOS missing" : `${formatPercent(provenStructure.acos)} ACOS`
          }.`
        : structureSummary
          ? "Campaign structure report is present, and no mixed-role campaign or target-level waste was isolated from uploaded rows."
          : "Campaign structure report is missing, so match type, targeting type, and campaign-role decisions must stay limited.";
  const cleanupLine = negativeCandidate
    ? `${negativeCandidate.label} is a negative-keyword candidate from uploaded rows: ${negativeCandidate.clicks} clicks, ${formatUsd(negativeCandidate.spend)} spend, 0 orders.`
    : bidDownCandidate
      ? `${bidDownCandidate.label} has orders but is above target ACOS, so it is a bid-down or isolation candidate, not a negative keyword.`
      : weakCleanupEvidence
        ? `${weakCleanupEvidence.label} has spend but only ${weakCleanupEvidence.clicks} clicks and 0 orders; sample is too thin for a hard negative.`
        : keepCandidate
          ? `${keepCandidate.label} has order proof and at-target ACOS; protect it before cutting waste.`
          : portfolioSummary
          ? "Uploaded search-term rows did not isolate a negative-keyword, bid-down, or protect candidate with enough evidence."
          : "Search-term cleanup is limited until an ads report with spend, clicks, orders, and sales is uploaded.";
  const bidGuardrailLine = bidGuardrail
    ? `Bid guardrail: ${bidGuardrail.action}. ${bidGuardrail.reason} Boundary: ${bidGuardrail.boundary}`
    : portfolioSummary
      ? "Bid guardrail: uploaded rows do not yet support a clear increase, decrease, pause, or watch-only bid decision."
      : "Bid guardrail is unavailable until an ads report with spend, sales, orders, and clicks is uploaded.";

  if (branch === "input-gap") {
    const requiredInputGaps = [
      !intake.spReport ? "Sponsored Products report" : null,
      !hasTargetLine(intake) ? "target ACOS or TACOS" : null,
      !intake.marginKnown || intake.breakEvenAcos <= 0 ? "break-even ACOS" : null,
      !intake.mainAsin.trim() ? "main ASIN or SKU" : null,
    ].filter((item): item is string => Boolean(item));

    return {
      branch,
      label: "Input gap",
      confidence: 42,
      current: "Current diagnosis is blocked. Add the minimum ad report, goal line, margin line, and main ASIN before making campaign moves.",
      evidence: [
        `${missing.slice(0, 4).join(", ") || "Minimum input"} is still missing.`,
        "Without those inputs, ACOS, TACOS, rank, and scale decisions would be overconfident.",
        sharedBoundary,
      ],
      actions: [
        "Upload one Sponsored Products search term or campaign report.",
        requiredInputGaps.length
          ? `Add the missing required inputs: ${requiredInputGaps.join(", ")}.`
          : "Minimum required inputs are present; add retail support data before making stronger campaign moves.",
        "Only after the gap is closed, generate the action queue.",
      ],
      dont: [
        "Do not cut or scale campaigns from partial inputs.",
        "Do not call ACOS healthy without a break-even ACOS line.",
        "Do not infer rank or listing blockers without the corresponding inputs.",
      ],
      review: [
        "Re-run diagnosis after the required inputs are present.",
        "If SP report is present but margin is missing, keep output at ad-efficiency trend only.",
        "If Business Report is missing, do not report TACOS or total sales contribution.",
      ],
      missing,
    };
  }

  if (branch === "retail-data-gap") {
    return {
      branch,
      label: "Retail data gap",
      confidence: 58,
      current: "The ad metrics are not enough to approve scaling. Add retail, conversion, inventory, and Featured Offer proof before making a growth call.",
      evidence: [
        `${missing.join(", ") || "Retail readiness"} is missing or unstable.`,
        `ACOS ${formatPercent(intake.acos)} is ad-report context; ${formatTacosEvidence(intake, "above")}`,
        channelMixLine ?? "Only uploaded ad channels are considered; missing SB or SD files will not be inferred.",
        placementLine,
        budgetLine,
        structureLine,
        cleanupLine,
        bidGuardrailLine,
        sharedBoundary,
      ],
      actions: [
        "Keep current winning campaigns stable while missing retail data is added.",
        "Add Business Report, CVR or sessions, inventory days, and Featured Offer status before scaling.",
        "Only after retail data is present, re-run the branch and decide whether this is scale or waste.",
      ],
      dont: [
        "Do not approve scaling from ad metrics alone.",
        "Do not call TACOS healthy without Business Report support.",
        "Do not increase budgets if inventory or Featured Offer status is missing or unstable.",
      ],
      review: [
        "Re-run diagnosis when Business Report, CVR, inventory, and Featured Offer inputs are present.",
        "If retail data confirms conversion and inventory, move to controlled scaling review.",
        "If retail data shows weak CVR or stock risk, keep spend capped and fix the blocker first.",
      ],
      missing,
    };
  }

  if (branch === "listing-conversion") {
    return {
      branch,
      label: "Listing conversion first",
      confidence: 74,
      current: "This is not mainly a bid problem yet. Fix listing conversion before expanding budget.",
      evidence: [
        `CVR is ${formatPercent(intake.cvr)}, below the minimum working line for paid traffic expansion.`,
        `ACOS is ${formatPercent(intake.acos)} against ${formatTargetAcos(intake)}, but clicks need a stronger PDP before scale.`,
        channelMixLine ?? "Only uploaded ad channels are considered; missing SB or SD files will not be inferred.",
        placementLine,
        budgetLine,
        structureLine,
        cleanupLine,
        bidGuardrailLine,
        intake.businessReport ? "Business Report is present, so retail conversion can be considered." : "Business Report is missing, so retail conversion confidence is limited.",
      ],
      actions: [
        "Hold budget expansion on broad and phrase traffic for 7 days.",
        "Audit main image, price, coupon, reviews, and Featured Offer before raising bids.",
        "Keep only exact terms with proven orders while PDP fixes are tested.",
      ],
      dont: [
        "Do not solve low CVR with more spend.",
        "Do not treat ad clicks as profitable demand until the PDP can convert.",
        "Do not move every campaign at once; isolate listing fixes first.",
      ],
      review: [
        "Review CVR, ATC, orders, and ACOS after 7 days.",
        "If CVR stays below 6.5%, keep budget capped and continue PDP work.",
        "If CVR rises and ACOS stays near target, reopen exact scaling only.",
      ],
      missing,
    };
  }

  if (branch === "scale-opportunity") {
    return {
      branch,
      label: "Controlled scaling chance",
      confidence: 83,
      current: "Scaling is allowed, but only through proven exact, phrase, or ASIN targets with inventory protection.",
      evidence: [
        `ACOS ${formatPercent(intake.acos)} is at or under ${formatTargetAcos(intake)}.`,
        marginLine,
        channelMixLine ?? "Only uploaded ad channels are considered; missing SB or SD files will not be inferred.",
        placementLine,
        budgetLine,
        structureLine,
        cleanupLine,
        bidGuardrailLine,
        formatTacosEvidence(intake, "at-or-under"),
        `CVR ${formatPercent(intake.cvr)} and ${intake.inventoryDays} inventory days support a controlled expansion test.`,
      ],
      actions: [
        "Move budget from waste campaigns into exact winners and high-converting ASIN targets.",
        "Set a weekly expansion cap, then check TACOS before the next increase.",
        "Protect Featured Offer and inventory before adding new broad discovery.",
      ],
      dont: [
        "Do not expand broad match just because current exact terms are profitable.",
        "Do not scale if inventory drops under 21 days or Featured Offer becomes unstable.",
        "Do not call this a permanent state; it needs weekly proof.",
      ],
      review: [
        "Review ACOS, TACOS, CVR, orders, and inventory after 7 days.",
        "If TACOS rises above target by more than 1.5pp, pause the expansion.",
        "If orders rise without TACOS pressure, add the next exact cluster.",
      ],
      missing,
    };
  }

  if (branch === "rank-push") {
    return {
      branch,
      label: "Rank push with discipline",
      confidence: hasRankLine(intake) ? 76 : 61,
      current: "This can be a rank-push period, but short-term ACOS cannot be judged alone. Tie spend to keyword position and organic order movement.",
      evidence: [
        `${intake.lifecycle} lifecycle and ${goals.find((item) => item.id === intake.goal)?.label.toLowerCase()} goal allow higher short-term ACOS if ranking proof exists.`,
        `Current keyword position is ${hasRankLine(intake) ? `around ${intake.keywordRank}` : "not provided"}.`,
        queryOpportunity
          ? `SQP shows ${queryOpportunity.query} has ${queryOpportunity.impressions.toLocaleString("en-US")} impressions and ${
              queryOpportunity.purchaseShare === null ? "missing purchase share" : `${formatPercent(queryOpportunity.purchaseShare)} purchase share`
            }, so it is an opportunity candidate, not a ranking fact.`
          : intake.sqpReport
            ? "SQP is present, but no low-share query opportunity was isolated from the uploaded rows."
            : "SQP is missing, so query share opportunity must be treated as unverified.",
        `ACOS ${formatPercent(intake.acos)} needs a stop line because target ACOS is ${formatTargetAcos(intake)}.`,
        structureLine,
        cleanupLine,
        bidGuardrailLine,
      ],
      actions: [
        queryOpportunity ? `Test rank-push spend only around the SQP opportunity: ${queryOpportunity.query}.` : "Keep spend only on strategic keywords with rank movement or clear order contribution.",
        queryWinner ? `Protect query with purchase proof before adding new discovery: ${queryWinner.query}.` : "Use SQP, keyword rank, or organic order proof before adding new discovery spend.",
        "Separate rank-push campaigns from profit-control campaigns.",
        "Set a 14-day stop line using rank, organic orders, and TACOS.",
      ],
      dont: [
        "Do not kill the whole launch push from ACOS alone.",
        "Do not let rank-push spend leak into broad discovery with no keyword goal.",
        "Do not claim rank lift if rank input is missing.",
      ],
      review: [
        "Review rank, organic orders, ad orders, and TACOS after 14 days.",
        "If rank does not improve and TACOS worsens, reduce push spend.",
        "If rank improves but margin breaks, narrow to fewer strategic terms.",
      ],
      missing,
    };
  }

  if (branch === "clearance") {
    return {
      branch,
      label: "Clearance mode",
      confidence: 72,
      current: "Treat this as inventory cleanup, not a healthy long-term ad structure. Spend should clear units without hiding margin risk.",
      evidence: [
        `Lifecycle is ${intake.lifecycle} and goal is ${goals.find((item) => item.id === intake.goal)?.label}.`,
        `Inventory days are ${hasInventoryLine(intake) ? intake.inventoryDays : "missing"}, so the stock goal must shape ad decisions.`,
        `ACOS ${formatPercent(intake.acos)} should be judged against liquidation economics, not normal growth targets.`,
        structureLine,
        cleanupLine,
        bidGuardrailLine,
      ],
      actions: [
        "Keep only high-intent terms and retargeting paths that move units.",
        "Stop expensive discovery campaigns during clearance.",
        "Tie coupon and ad spend to remaining inventory windows.",
      ],
      dont: [
        "Do not call low-margin clearance performance a repeatable growth play.",
        "Do not replenish before the post-clearance economics are reviewed.",
        "Do not expand campaign structure for a SKU you are trying to exit.",
      ],
      review: [
        "Review units sold, remaining inventory, ACOS, and net margin every 7 days.",
        "If inventory is not moving, adjust price or coupon before adding more traffic.",
        "If margin turns negative beyond the clearance limit, stop paid expansion.",
      ],
      missing,
    };
  }

  if (branch === "promo-window") {
    return {
      branch,
      label: "Promo window separation",
      confidence: 78,
      current: "Read this as a deal-period diagnosis. Do not mix promo conversion with normal evergreen performance.",
      evidence: [
        "Deal or coupon context is active, so CVR and ACOS are temporarily shaped by discount pressure.",
        `Promo-period ACOS is ${formatPercent(intake.acos)} against ${formatTargetAcos(intake)}.`,
        intake.businessReport ? "Business Report is present for sales movement checks." : "Business Report is missing, so incremental sales cannot be trusted yet.",
        structureLine,
        cleanupLine,
        bidGuardrailLine,
      ],
      actions: [
        "Tag deal-period campaigns and compare them separately from normal weeks.",
        "Keep high-converting terms during the promo, but avoid permanent bid raises until post-deal data clears.",
        "Create a post-deal review for CVR, TACOS, and organic order fallback.",
      ],
      dont: [
        "Do not treat deal-week CVR as the evergreen baseline.",
        "Do not raise normal bids permanently from discounted data alone.",
        "Do not call incremental sales unless Business Report support is present.",
      ],
      review: [
        "Review deal week, 7 days after deal, and 14 days after deal separately.",
        "If CVR drops back while spend stays high, roll bids back.",
        "If organic orders hold after the deal, keep only the terms that contributed.",
      ],
      missing,
    };
  }

  return {
    branch,
    label: "Ad waste first",
    confidence: 81,
    current: "Ad waste is the first blocker. Control low-quality spend before asking the account to scale.",
    evidence: [
      `ACOS ${formatPercent(intake.acos)} is above ${formatTargetAcos(intake)}.`,
      marginLine,
      channelMixLine ?? "Only uploaded ad channels are considered; missing SB or SD files will not be inferred.",
      placementLine,
      budgetLine,
      structureLine,
      cleanupLine,
      bidGuardrailLine,
      formatTacosEvidence(intake, "above"),
      hasConversionLine(intake) ? `CVR is ${formatPercent(intake.cvr)}, so query quality and conversion both need separation.` : "CVR is missing, so listing diagnosis must stay limited.",
    ],
    actions: [
      "Cut or cap high-spend, low-order search terms before touching winners.",
      "Move converting search terms into exact match with tighter budgets.",
      "Separate brand-defense, discovery, and profit-control campaigns.",
    ],
    dont: [
      "Do not cut every high-ACOS campaign without checking orders and role.",
      "Do not scale broad campaigns until waste is isolated.",
      "Do not call the account fixed from ACOS alone; watch TACOS and sales contribution.",
    ],
    review: [
      "Review wasted spend, ACOS, orders, and TACOS after 7 days.",
      "If sales drop faster than spend, reverse the last cut.",
      "If TACOS improves without order loss, move to exact scaling review.",
    ],
    missing,
  };
}

function buildActions(
  result: SixModule,
  portfolioSummary: AdPortfolioSummary | null,
  querySummary: QueryReportSummary | null,
  placementSummary: PlacementReportSummary | null,
  budgetSummary: BudgetReportSummary | null,
  structureSummary: StructureReportSummary | null,
): QueueAction[] {
  const firstWaste = portfolioSummary?.waste[0];
  const firstWinner = portfolioSummary?.winners[0];
  const firstNegativeCandidate = portfolioSummary?.negativeCandidates[0];
  const firstBidDownCandidate = portfolioSummary?.bidDownCandidates[0];
  const firstKeepCandidate = portfolioSummary?.keepCandidates[0];
  const firstWeakCleanupEvidence = portfolioSummary?.weakEvidence[0];
  const firstBidGuardrail = portfolioSummary?.bidGuardrails[0];
  const firstQueryOpportunity = querySummary?.opportunities[0];
  const firstQueryWinner = querySummary?.winners[0];
  const firstPlacementWaste = placementSummary?.inefficient[0];
  const firstPlacementWinner = placementSummary?.winners[0];
  const firstConstrainedBudget = budgetSummary?.constrained[0];
  const firstInefficientBudget = budgetSummary?.inefficient[0];
  const firstMixedStructure = structureSummary?.mixedCampaigns[0];
  const firstStructureWaste = structureSummary?.wasteTargets[0];
  const firstStructureWinner = structureSummary?.provenTargets[0];

  if (result.branch === "input-gap") {
    return [
      {
        id: "add-sp-report",
        action: "Add the minimum report and margin line",
        evidence: result.missing.slice(0, 3).join(", ") || "Minimum diagnosis input missing",
        owner: "Operator",
        window: "Before diagnosis",
        confidence: 95,
      },
    ];
  }

  if (result.branch === "retail-data-gap") {
    return [
      {
        id: "add-retail-proof",
        action: "Add retail proof before scaling",
        evidence: result.missing.slice(0, 3).join(", ") || "Retail readiness is missing",
        owner: "Operator",
        window: "Before budget expansion",
        confidence: 92,
      },
      {
        id: "hold-growth",
        action: "Hold growth budget until retail data confirms readiness",
        evidence: portfolioSummary?.mix[0] ?? "Ad metrics alone cannot approve scaling",
        owner: "Owner",
        window: "Before next spend increase",
        confidence: 86,
      },
    ];
  }

  if (result.branch === "listing-conversion") {
    return [
      {
        id: "hold-budget",
        action: "Hold broad budget expansion",
        evidence: "CVR is below the paid traffic expansion line",
        owner: "Ad operator",
        window: "Next 7 days",
        confidence: 78,
      },
      {
        id: "fix-pdp",
        action: "Audit main image, price, reviews, coupon, and Featured Offer",
        evidence: "Clicks need stronger PDP conversion before scale",
        owner: "Operator",
        window: "Next 7 days",
        confidence: 74,
      },
    ];
  }

  if (result.branch === "scale-opportunity") {
    return [
      {
        id: "scale-exact",
        action: firstConstrainedBudget
          ? `Review budget increase for constrained winner: ${firstConstrainedBudget.campaign}`
          : firstPlacementWinner
            ? `Protect efficient placement before scaling: ${firstPlacementWinner.placement}`
            : firstStructureWinner
              ? `Move proven target into protected structure: ${firstStructureWinner.targeting}`
              : firstWinner
                ? `Shift budget into winner: ${firstWinner.label}`
                : "Shift budget into exact winners and high-converting ASIN targets",
        evidence: firstConstrainedBudget
          ? `${firstConstrainedBudget.orders} orders, ${firstConstrainedBudget.budgetUsage === null ? `${formatUsd(firstConstrainedBudget.spend)} spend` : `${formatPercent(firstConstrainedBudget.budgetUsage)} budget usage`}`
          : firstPlacementWinner
          ? `${firstPlacementWinner.orders} orders, ${firstPlacementWinner.acos === null ? "ACOS missing" : `${formatPercent(firstPlacementWinner.acos)} ACOS`}, ${formatUsd(firstPlacementWinner.spend)} spend`
          : firstStructureWinner
            ? `${firstStructureWinner.orders} orders, ${firstStructureWinner.acos === null ? "ACOS missing" : `${formatPercent(firstStructureWinner.acos)} ACOS`}, ${firstStructureWinner.matchType || firstStructureWinner.targetingType || "target-level"} proof`
            : firstWinner
              ? `${firstWinner.orders} orders, ${firstWinner.acos === null ? "ACOS missing" : `${formatPercent(firstWinner.acos)} ACOS`}, ${formatUsd(firstWinner.spend)} spend`
              : "ACOS, TACOS, CVR, and inventory support a controlled test",
        owner: "Ad operator",
        window: "Next 7 days",
        confidence: 83,
      },
      {
        id: "watch-inventory",
        action: "Set an inventory and Featured Offer stop line",
        evidence: "Scaling should stop if retail readiness weakens",
        owner: "Owner",
        window: "Weekly",
        confidence: 76,
      },
    ];
  }

  if (result.branch === "rank-push") {
    return [
      {
        id: "rank-campaign",
        action: firstMixedStructure
          ? `Split rank-push and profit-control roles in ${firstMixedStructure.campaign}`
          : firstQueryOpportunity
            ? `Build a rank-push test around SQP opportunity: ${firstQueryOpportunity.query}`
            : "Separate rank-push keywords from profit-control campaigns",
        evidence: firstMixedStructure
          ? `${firstMixedStructure.roles.join(", ")} roles share ${formatUsd(firstMixedStructure.spend)} spend`
          : firstQueryOpportunity
            ? `${firstQueryOpportunity.impressions.toLocaleString("en-US")} impressions; ${
                firstQueryOpportunity.purchaseShare === null ? "purchase share missing" : `${formatPercent(firstQueryOpportunity.purchaseShare)} purchase share`
              }`
            : "Launch and growth spend needs a separate stop line",
        owner: "Ad operator",
        window: "14 days",
        confidence: 76,
      },
      {
        id: "rank-review",
        action: firstQueryWinner ? `Protect purchased query while testing rank: ${firstQueryWinner.query}` : "Review rank movement with organic order movement",
        evidence: firstQueryWinner ? `${firstQueryWinner.purchases} purchases and ${firstQueryWinner.clicks} clicks in SQP` : "ACOS alone cannot validate a rank push",
        owner: "Operator",
        window: "14 days",
        confidence: 72,
      },
    ];
  }

  if (result.branch === "clearance") {
    return [
      {
        id: "clearance-spend",
        action: "Keep only high-intent paid paths that move units",
        evidence: "Clearance mode prioritizes inventory exit over structure expansion",
        owner: "Ad operator",
        window: "Next 7 days",
        confidence: 72,
      },
      {
        id: "stock-exit",
        action: "Tie coupon, price, and spend to remaining units",
        evidence: "Clearance cannot be judged as evergreen performance",
        owner: "Owner",
        window: "Weekly",
        confidence: 74,
      },
    ];
  }

  if (result.branch === "promo-window") {
    return [
      {
        id: "tag-promo",
        action: "Separate promo-week campaigns from evergreen diagnosis",
        evidence: "Discount data cannot become the normal bid baseline",
        owner: "Operator",
        window: "Deal week plus 14 days",
        confidence: 78,
      },
      {
        id: "post-deal",
        action: "Schedule a post-deal rollback or keep decision",
        evidence: "CVR and TACOS need post-promo confirmation",
        owner: "Owner",
        window: "7 and 14 days after deal",
        confidence: 75,
      },
    ];
  }

  return [
    {
      id: "cut-waste",
      action: firstInefficientBudget
        ? `Reduce or pause inefficient budget: ${firstInefficientBudget.campaign}`
          : firstPlacementWaste
            ? `Reduce inefficient placement: ${firstPlacementWaste.placement}`
            : firstMixedStructure
              ? `Split mixed-role campaign before broad cuts: ${firstMixedStructure.campaign}`
              : firstStructureWaste
                ? `Cap or negate waste target: ${firstStructureWaste.targeting}`
                : firstNegativeCandidate
                  ? `Add negative or cap search term: ${firstNegativeCandidate.label}`
                  : firstBidDownCandidate
                    ? `Bid down or isolate above-target ordered term: ${firstBidDownCandidate.label}`
                    : firstWaste
                      ? `Cap wasted query or target: ${firstWaste.label}`
                      : "Cap high-spend, low-order search terms",
      evidence: firstInefficientBudget
        ? `${formatUsd(firstInefficientBudget.spend)} spend, ${firstInefficientBudget.orders} orders, ${
            firstInefficientBudget.acos === null ? "ACOS missing" : `${formatPercent(firstInefficientBudget.acos)} ACOS`
          }`
        : firstPlacementWaste
        ? `${formatUsd(firstPlacementWaste.spend)} spend, ${firstPlacementWaste.orders} orders, ${
            firstPlacementWaste.acos === null ? "ACOS missing" : `${formatPercent(firstPlacementWaste.acos)} ACOS`
          }`
        : firstMixedStructure
          ? `${firstMixedStructure.roles.join(", ")} roles share ${formatUsd(firstMixedStructure.spend)} spend`
          : firstStructureWaste
            ? `${formatUsd(firstStructureWaste.spend)} spend, ${firstStructureWaste.orders} orders, ${firstStructureWaste.matchType || firstStructureWaste.targetingType || "target"} row`
            : firstNegativeCandidate
              ? `${firstNegativeCandidate.clicks} clicks, ${formatUsd(firstNegativeCandidate.spend)} spend, 0 orders`
              : firstBidDownCandidate
                ? `${firstBidDownCandidate.orders} orders, ${firstBidDownCandidate.acos === null ? "ACOS missing" : `${formatPercent(firstBidDownCandidate.acos)} ACOS`}; do not negate ordered terms`
                : firstWaste
                  ? `${formatUsd(firstWaste.spend)} spend with 0 orders in ${firstWaste.campaign}`
                  : firstWeakCleanupEvidence
                    ? `${firstWeakCleanupEvidence.clicks} clicks is too thin for a hard negative; keep watching`
                    : "ACOS and TACOS are above target",
      owner: "Ad operator",
      window: "Next 7 days",
      confidence: 82,
    },
    {
      id: "harvest-exact",
      action: firstStructureWinner
        ? `Harvest proven target into profit-control campaign: ${firstStructureWinner.targeting}`
        : firstKeepCandidate
          ? `Protect converting search term before cleanup: ${firstKeepCandidate.label}`
          : firstWinner
            ? `Move proven query into exact: ${firstWinner.label}`
            : "Move converting queries into exact match",
      evidence: firstStructureWinner
        ? `${firstStructureWinner.orders} orders from ${firstStructureWinner.campaign}; keep separate from discovery waste`
        : firstKeepCandidate
          ? `${firstKeepCandidate.orders} orders, ${firstKeepCandidate.acos === null ? "ACOS missing" : `${formatPercent(firstKeepCandidate.acos)} ACOS`}; exclude from negative cleanup`
          : firstWinner
            ? `${firstWinner.orders} orders from ${firstWinner.campaign}; keep separate from waste`
            : "Waste must be separated from proven query demand",
      owner: "Ad operator",
      window: "Next 7 days",
      confidence: 79,
    },
    {
      id: "bid-guardrail",
      action: firstBidGuardrail ? firstBidGuardrail.action : "Keep bid changes inside uploaded-data guardrails",
      evidence: firstBidGuardrail ? `${firstBidGuardrail.reason} ${firstBidGuardrail.boundary}` : "No row has enough evidence for a specific bid direction yet",
      owner: "Ad operator",
      window: firstBidGuardrail?.decision === "watch-only" ? "After more clicks" : "Next 7 days",
      confidence: firstBidGuardrail?.decision === "watch-only" ? 64 : 78,
    },
  ];
}

function isCheckReady(intake: IntakeState, key: keyof IntakeState) {
  if (key === "marginKnown") return intake.marginKnown && intake.breakEvenAcos > 0;
  if (key === "targetKnown") return hasTargetLine(intake);
  if (key === "conversionKnown") return hasConversionLine(intake);
  if (key === "inventoryKnown") return hasInventoryLine(intake);
  if (key === "rankKnown") return hasRankLine(intake);
  return Boolean(intake[key]);
}

function toneClass(confidence: number) {
  if (confidence >= 80) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (confidence < 60) return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

function formatList(title: string, items: string[]) {
  return [`## ${title}`, ...(items.length ? items : ["No item available."]).map((item) => `- ${item}`)].join("\n");
}

function buildManualReviewQueue(
  intake: IntakeState,
  result: SixModule,
  placementSummary: PlacementReportSummary | null,
  budgetSummary: BudgetReportSummary | null,
  structureSummary: StructureReportSummary | null,
  querySummary: QueryReportSummary | null,
) {
  return [
    "Confirm the first action against the uploaded rows before changing campaigns.",
    !intake.businessReport ? "Add Business Report before claiming TACOS movement or total sales contribution." : null,
    !hasConversionLine(intake) ? "Add CVR or sessions before blaming listing conversion." : null,
    !hasInventoryLine(intake) || !intake.featuredOfferStable ? "Confirm inventory days and Featured Offer before approving any scale action." : null,
    !hasRankLine(intake) ? "Add keyword rank baseline before claiming rank-push progress." : null,
    result.branch === "rank-push" && !querySummary ? "Add SQP before treating query share opportunity as verified." : null,
    !placementSummary ? "Placement bid changes need a placement report; do not infer Top of Search/Product Pages from campaign totals." : null,
    !budgetSummary ? "Budget migration needs a budget or campaign settings report; do not move budget from spend totals alone." : null,
    !structureSummary ? "Campaign role changes need a structure report; do not split or merge campaigns from summary metrics alone." : null,
  ].filter((item): item is string => Boolean(item));
}

function buildAuditSummaryText(
  intake: IntakeState,
  result: SixModule,
  actions: QueueAction[],
  portfolioSummary: AdPortfolioSummary | null,
  placementSummary: PlacementReportSummary | null,
  budgetSummary: BudgetReportSummary | null,
  structureSummary: StructureReportSummary | null,
  querySummary: QueryReportSummary | null,
  expertFit: ReturnType<typeof buildExpertReviewFit>,
  goalReadiness: GoalReadiness,
  locale: SupportedLocale,
) {
  const zh = isZh(locale);
  const outputResult = zh ? buildSixModuleZh(intake, result, querySummary, portfolioSummary, placementSummary, budgetSummary, structureSummary) : result;
  const outputActions = zh ? actions.map(localizeActionZh) : actions;
  const outputExpertFit = zh ? buildExpertReviewFitZh(outputResult, outputActions, portfolioSummary) : expertFit;
  const outputGoalReadiness = zh ? localizeReadinessZh(goalReadiness) : goalReadiness;
  const firstAction = outputActions[0];
  const manualReviewQueue = buildManualReviewQueue(intake, result, placementSummary, budgetSummary, structureSummary, querySummary);

  if (zh) {
    const lines = [
      "# Amazon Ads 诊断摘要",
      "",
      `主 ASIN: ${intake.mainAsin.trim() || "缺失"}`,
      `诊断目标: ${goals.find((item) => item.id === intake.goal)?.zhLabel ?? intake.goal}`,
      `诊断分支: ${outputResult.label}`,
      `置信度: ${outputResult.confidence}%`,
      "",
      "## 交付摘要",
      `- 第一动作: ${firstAction?.action ?? outputResult.current}`,
      `- 第一动作证据: ${firstAction?.evidence ?? outputResult.evidence[0] ?? "暂无行级证据。"}`,
      `- 执行窗口: ${firstAction?.window ?? "必填输入齐全后再定"}`,
      `- 专家建议状态: ${outputExpertFit.status}`,
      "- 交付方式: 先给广告诊断 brief，人工确认后再改 campaign。",
      "",
      "## 已使用数据",
      `- Sponsored Products / 广告组合: ${portfolioSummary ? `${portfolioSummary.channels.length} 份广告文件，花费 ${formatUsd(portfolioSummary.spend)}，${portfolioSummary.orders} 单` : "缺失"}`,
      `- Placement 报表: ${placementSummary ? `${placementSummary.rowCount} 行，花费 ${formatUsd(placementSummary.spend)}` : "缺失"}`,
      `- Budget 报表: ${budgetSummary ? `${budgetSummary.rowCount} 行，花费 ${formatUsd(budgetSummary.spend)}` : "缺失"}`,
      `- Campaign Structure 报表: ${structureSummary ? `${structureSummary.rowCount} 行，${structureSummary.mixedCampaigns.length} 个混合角色 campaign` : "缺失"}`,
      `- Search Query Performance: ${querySummary ? `${querySummary.rowCount} 行，${querySummary.impressions.toLocaleString("en-US")} impressions` : "缺失"}`,
      "",
      "## 目标准备度",
      `- ${outputGoalReadiness.title}: ${outputGoalReadiness.readyCount}/${outputGoalReadiness.totalCount} 已就绪`,
      `- 结论: ${outputGoalReadiness.verdict}`,
      `- 下一步补数据: ${outputGoalReadiness.next}`,
      ...outputGoalReadiness.items.map((item) => `- ${item.ready ? "已就绪" : "缺失"}: ${item.label}`),
      "",
      formatList("当前判断", [outputResult.current]),
      "",
      formatList("关键证据", outputResult.evidence),
      "",
      formatList("优先动作", outputResult.actions),
      "",
      formatList("不要做什么", outputResult.dont),
      "",
      formatList("复查规则", outputResult.review),
      "",
      formatList("缺失数据", outputResult.missing.length ? outputResult.missing : ["当前没有阻断级缺失数据。"]),
      "",
      "## Bid 调整边界",
      ...(portfolioSummary?.bidGuardrails.length
        ? portfolioSummary.bidGuardrails.map((item) => `- ${translateBidActionZh(item.action)}。${translateEvidenceZh(item.reason)} ${translateEvidenceZh(item.boundary)}`)
        : ["- 当前没有足够行级证据支持明确加价、降价、暂停或观察。不要编造 bid 动作。"]),
      "",
      "## 专家建议",
      `- 状态: ${outputExpertFit.status}`,
      `- 原因: ${outputExpertFit.reason}`,
      `- 下一步: ${outputExpertFit.next}`,
      "- 边界: 专家建议不等于自动托管，不保证 ACOS/TACOS 下降、销量增长、排名提升或利润提升。",
      "",
      "## 动作清单",
      ...outputActions.map((item, index) => `${index + 1}. ${item.action}\n   证据: ${item.evidence}\n   窗口: ${item.window}\n   置信度: ${item.confidence}%`),
      "",
      "边界: 本摘要只使用本页上传和手填输入，不连接 Seller Central，不修改 campaign，也不推断缺失的零售、排名或后台数据。",
    ];

    return lines.join("\n");
  }

  const lines = [
    "# Amazon Ads Audit Workbench Summary",
    "",
    `Main ASIN or SKU: ${intake.mainAsin.trim() || "Missing"}`,
    `Goal: ${goals.find((item) => item.id === intake.goal)?.label ?? intake.goal}`,
    `Lifecycle: ${intake.lifecycle}`,
    `Diagnosis branch: ${result.branch}`,
    `Confidence: ${result.confidence}%`,
    "",
    "## Delivery snapshot",
    `- First operator move: ${firstAction?.action ?? outputResult.current}`,
    `- Evidence behind first move: ${firstAction?.evidence ?? outputResult.evidence[0] ?? "No row-level evidence yet."}`,
    `- Owner and window: ${firstAction ? `${firstAction.owner}, ${firstAction.window}` : "Not assigned until required inputs are complete."}`,
    `- Expert advice status: ${outputExpertFit.status}`,
    "- Delivery mode: semi-automated diagnostic brief for human review before campaign changes.",
    "",
    "## Data used",
    `- Sponsored Products / portfolio: ${portfolioSummary ? `${portfolioSummary.channels.length} channel file(s), ${formatUsd(portfolioSummary.spend)} spend, ${portfolioSummary.orders} orders` : "Missing"}`,
    `- Placement report: ${placementSummary ? `${placementSummary.rowCount} rows, ${formatUsd(placementSummary.spend)} spend` : "Missing"}`,
    `- Budget report: ${budgetSummary ? `${budgetSummary.rowCount} rows, ${formatUsd(budgetSummary.spend)} spend` : "Missing"}`,
    `- Campaign structure report: ${structureSummary ? `${structureSummary.rowCount} rows, ${structureSummary.mixedCampaigns.length} mixed-role campaign(s)` : "Missing"}`,
    `- Search Query Performance: ${querySummary ? `${querySummary.rowCount} rows, ${querySummary.impressions.toLocaleString("en-US")} impressions` : "Missing"}`,
    "",
    "## Goal readiness",
    `- ${outputGoalReadiness.title}: ${outputGoalReadiness.readyCount}/${outputGoalReadiness.totalCount} ready`,
    `- Verdict: ${outputGoalReadiness.verdict}`,
    `- Next data step: ${outputGoalReadiness.next}`,
    ...outputGoalReadiness.items.map((item) => `- ${item.ready ? "Ready" : "Missing"}: ${item.label} (${item.impact})`),
    "",
    formatList("Current judgment", [outputResult.current]),
    "",
    formatList("Key evidence", outputResult.evidence),
    "",
    formatList("Priority actions", outputResult.actions),
    "",
    formatList("Do not do", outputResult.dont),
    "",
    formatList("Review rules", outputResult.review),
    "",
    formatList("Missing data", outputResult.missing.length ? outputResult.missing : ["No blocking data gap in this scenario."]),
    "",
    "## Bid guardrails",
    ...(portfolioSummary?.bidGuardrails.length
      ? portfolioSummary.bidGuardrails.map((item) => `- ${item.decision}: ${item.action}. ${item.reason} ${item.boundary}`)
      : ["- No uploaded row currently supports a specific bid direction. Do not invent bid changes without row-level evidence."]),
    "",
    "## Manual review queue",
    ...manualReviewQueue.map((item) => `- ${item}`),
    "",
    "## Unsupported claims",
    "- This report does not prove Amazon Ads caused total sales movement without Business Report and before/after context.",
    "- This report does not prove organic rank movement without keyword rank baseline and follow-up measurement.",
    "- This report does not approve campaign changes in Seller Central; an operator must review before execution.",
    "- This report does not guarantee ACOS reduction, TACOS reduction, sales growth, ranking improvement, or profit lift.",
    "",
    "## Expert advice fit",
    `- Status: ${outputExpertFit.status}`,
    `- Why: ${outputExpertFit.reason}`,
    `- Next: ${outputExpertFit.next}`,
    "- Boundary: expert review is a semi-automated diagnostic report. It does not guarantee ACOS reduction, sales growth, or automatic campaign management.",
    "",
    "## Action list",
    ...outputActions.map((item, index) => `${index + 1}. ${item.action}\n   Evidence: ${item.evidence}\n   Owner: ${item.owner}\n   Window: ${item.window}\n   Confidence: ${item.confidence}%`),
    "",
    "Boundary: this export uses only uploaded and typed inputs from the workbench. It does not connect to Seller Central, change campaigns, or infer missing retail, rank, or backend data.",
  ];

  return lines.join("\n");
}

function buildExpertReviewFit(result: SixModule, actions: QueueAction[], portfolioSummary: AdPortfolioSummary | null) {
  const firstAction = actions[0];
  const hasUploadedAdEvidence = Boolean(portfolioSummary && portfolioSummary.spend > 0);

  if (result.branch === "input-gap") {
    return {
      status: "Not ready for paid expert review yet",
      reason: "The workbench is still missing the minimum ad report, margin line, target line, or main ASIN.",
      next: "Use the sample CSV templates and fill the required inputs first. A paid review before that would mostly become data collection.",
    };
  }

  if (!hasUploadedAdEvidence) {
    return {
      status: "Self-serve first, then expert review if the branch stays unclear",
      reason: "Typed inputs exist, but uploaded ad evidence is still thin.",
      next: "Upload SP, placement, budget, structure, or SQP reports before asking for manual prioritization.",
    };
  }

  return {
    status: "Good fit for semi-automated expert review",
    reason: `The workbench has enough uploaded evidence to review the first action: ${firstAction?.action ?? result.current}.`,
    next: "Request a human-reviewed action plan if you need campaign-level sequence, risk checks, and operator-ready instructions.",
  };
}

function formatMissingZh(item: string) {
  const labels: Record<string, string> = {
    "Sponsored Products report": "Sponsored Products 报表",
    "Margin line and break-even ACOS": "毛利线和盈亏平衡 ACOS",
    "Target ACOS or TACOS": "目标 ACOS 或目标 TACOS",
    "Business Report": "Business Report",
    "Sessions or CVR": "Sessions 或 CVR",
    "Inventory days and Featured Offer status": "库存天数和 Featured Offer 状态",
    "Keyword rank or current position": "关键词排名或当前位置",
    "Search Query Performance": "Search Query Performance",
    "Main ASIN or SKU": "主 ASIN",
  };

  return labels[item] ?? item;
}

function buildSixModuleZh(
  intake: IntakeState,
  result: SixModule,
  querySummary: QueryReportSummary | null = null,
  portfolioSummary: AdPortfolioSummary | null = null,
  placementSummary: PlacementReportSummary | null = null,
  budgetSummary: BudgetReportSummary | null = null,
  structureSummary: StructureReportSummary | null = null,
): SixModule {
  const missing = result.missing.map(formatMissingZh);
  const marginLine = `盈亏平衡 ACOS 是 ${formatPercent(intake.breakEvenAcos)}，高于这条线的花费必须有明确的排名、Deal 或清库存理由。`;
  const queryOpportunity = querySummary?.opportunities[0];
  const queryWinner = querySummary?.winners[0];
  const negativeCandidate = portfolioSummary?.negativeCandidates[0];
  const bidDownCandidate = portfolioSummary?.bidDownCandidates[0];
  const keepCandidate = portfolioSummary?.keepCandidates[0];
  const weakCleanupEvidence = portfolioSummary?.weakEvidence[0];
  const bidGuardrail = portfolioSummary?.bidGuardrails[0];
  const channelMixLine =
    portfolioSummary && portfolioSummary.channels.length > 1
      ? `已上传广告组合包含 ${portfolioSummary.channels.map((item) => item.channel).join("、")}。`
      : "只按已上传广告报表判断，缺失的广告类型不会被推断。";
  const placementWaste = placementSummary?.inefficient[0];
  const placementLine = placementWaste
    ? `${placementWaste.placement} 是优先检查的版位：花费 ${formatUsd(placementWaste.spend)}，${
        placementWaste.acos === null ? "ACOS 缺失" : `ACOS ${formatPercent(placementWaste.acos)}`
      }。`
    : placementSummary
      ? "Placement 报表已上传，当前没有从报表行里隔离出明显高于目标的版位。"
      : "缺少 Placement 报表，Top of Search、Product Pages、Rest of Search 的判断必须降级。";
  const constrainedBudget = budgetSummary?.constrained[0];
  const inefficientBudget = budgetSummary?.inefficient[0];
  const budgetLine = constrainedBudget
    ? `${constrainedBudget.campaign} 看起来受预算限制：${constrainedBudget.orders} 单，${
        constrainedBudget.budgetUsage === null ? `花费 ${formatUsd(constrainedBudget.spend)}` : `预算使用率 ${formatPercent(constrainedBudget.budgetUsage)}`
      }；只有毛利和零售数据也支持时，才允许加预算。`
    : inefficientBudget
      ? `${inefficientBudget.campaign} 是优先清理的预算池：花费 ${formatUsd(inefficientBudget.spend)}，${inefficientBudget.orders} 单。`
      : budgetSummary
        ? "Budget 报表已上传，当前没有从报表行里隔离出明显的预算受限赢家或低效预算池。"
        : "缺少 Budget / Campaign Settings 报表，日预算和 campaign 状态判断必须降级。";
  const mixedStructure = structureSummary?.mixedCampaigns[0];
  const wasteStructure = structureSummary?.wasteTargets[0];
  const provenStructure = structureSummary?.provenTargets[0];
  const structureLine = mixedStructure
    ? `${mixedStructure.campaign} 混合了 ${mixedStructure.roles.join("、")} 等投放角色，花费 ${formatUsd(mixedStructure.spend)}；放量或砍预算前要先拆清角色。`
    : wasteStructure
      ? `${wasteStructure.targeting} 是结构清理候选：${wasteStructure.campaign} 花费 ${formatUsd(wasteStructure.spend)}，${wasteStructure.orders} 单。`
      : provenStructure
        ? `${provenStructure.targeting} 有 target 级别成交证据：${provenStructure.campaign} ${provenStructure.orders} 单，${
            provenStructure.acos === null ? "ACOS 缺失" : `ACOS ${formatPercent(provenStructure.acos)}`
          }。`
        : structureSummary
          ? "Campaign Structure 报表已上传，当前没有隔离出混合角色 campaign 或 target 级浪费。"
          : "缺少 Campaign Structure 报表，match type、targeting type 和 campaign 角色判断必须降级。";
  const cleanupLine = negativeCandidate
    ? `${negativeCandidate.label} 是否词或限额候选：${negativeCandidate.clicks} 次点击，花费 ${formatUsd(negativeCandidate.spend)}，0 单。`
    : bidDownCandidate
      ? `${bidDownCandidate.label} 有成交但 ACOS 高于目标，应先降 bid 或隔离预算，不应直接否掉。`
      : weakCleanupEvidence
        ? `${weakCleanupEvidence.label} 有花费但只有 ${weakCleanupEvidence.clicks} 次点击、0 单，样本太薄，不能硬否。`
        : keepCandidate
          ? `${keepCandidate.label} 有成交且 ACOS 在目标内，清理浪费前要先保护它。`
          : portfolioSummary
            ? "已上传搜索词行里，还没有足够证据隔离出否词、降 bid 或保护对象。"
            : "缺少带 spend、clicks、orders、sales 的广告报表，暂时不能做搜索词清理。";
  const bidGuardrailLine = bidGuardrail
    ? `Bid 边界：${translateBidActionZh(bidGuardrail.action)}。${translateEvidenceZh(bidGuardrail.reason)} ${translateEvidenceZh(bidGuardrail.boundary)}`
    : portfolioSummary
      ? "Bid 边界：当前报表行还不足以支持明确加价、降价、暂停或观察决策。"
      : "缺少带 spend、sales、orders、clicks 的广告报表，暂时不能给 bid 建议。";
  const sharedBoundary = "本诊断只使用已上传和手填信息；缺少毛利、销售、转化、库存或排名数据时，不能当成完整经营事实。";

  const modules: Record<Branch, Omit<SixModule, "branch" | "confidence">> = {
    "input-gap": {
      label: "输入不足，先补最低数据",
      current: "当前不能做广告调整判断。先补 Sponsored Products 报表、目标线、毛利线和主 ASIN，再决定是否清理、放量或冲排名。",
      evidence: [`${missing.slice(0, 4).join("、") || "最低输入"}仍缺失。`, "缺这些数据时，ACOS、TACOS、排名和放量判断都会过度自信。", sharedBoundary],
      actions: ["上传一份 Sponsored Products search term 或 campaign 报表。", "补齐主 ASIN、目标 ACOS/TACOS、盈亏平衡 ACOS。", "补齐后再生成广告动作，不能先动 campaign。"],
      dont: ["不要用半截输入砍 campaign 或加预算。", "没有盈亏平衡 ACOS，不要说 ACOS 健康。", "没有对应输入，不要判断排名、转化或库存问题。"],
      review: ["必填输入齐全后重新生成诊断。", "如果只有 SP 报表但缺毛利，输出只能停留在广告效率趋势。", "缺 Business Report 时，不判断 TACOS 和总销售贡献。"],
      missing,
    },
    "retail-data-gap": {
      label: "零售数据不足，不能批准放量",
      current: "广告指标不足以支持放量。先补 Business Report、CVR、库存和 Featured Offer，再判断这是放量机会还是广告浪费。",
      evidence: [`${missing.join("、") || "零售准备度"}缺失或不稳定。`, `ACOS ${formatPercent(intake.acos)} 只是广告报表口径；${formatTacosEvidenceZh(intake, "above")}`, channelMixLine, placementLine, budgetLine, structureLine, cleanupLine, bidGuardrailLine, sharedBoundary],
      actions: ["保留已成交的稳定 campaign，不先扩大预算。", "补 Business Report、CVR 或 sessions、库存天数和 Featured Offer 状态。", "补齐后重新生成，确认是放量还是清理浪费。"],
      dont: ["不要只凭广告指标批准放量。", "没有 Business Report，不要说 TACOS 健康。", "库存或 Featured Offer 不稳定时，不要加预算。"],
      review: ["补齐 Business Report、CVR、库存和 Featured Offer 后重新诊断。", "如果零售数据支持转化和库存，再进入可控放量判断。", "如果 CVR 弱或库存有风险，先控预算并修阻断点。"],
      missing,
    },
    "listing-conversion": {
      label: "先修 Listing 转化，不先加广告预算",
      current: "这不是单纯 bid 问题。PDP 转化没站稳前，继续加预算只会放大无效点击。",
      evidence: [`CVR ${formatPercent(intake.cvr)} 低于付费流量扩张的最低工作线。`, `ACOS ${formatPercent(intake.acos)} 对比目标 ${formatTargetAcos(intake)}，但点击需要更强 PDP 承接。`, channelMixLine, placementLine, budgetLine, structureLine, cleanupLine, bidGuardrailLine, intake.businessReport ? "Business Report 已上传，可以把零售转化纳入判断。" : "缺少 Business Report，零售转化判断置信度有限。"],
      actions: ["未来 7 天暂停 broad 和 phrase 流量的预算扩张。", "先检查主图、价格、Coupon、评论和 Featured Offer。", "只保留有成交证据的 exact 词，等待 PDP 修复验证。"],
      dont: ["不要用更多广告花费解决低 CVR。", "PDP 没能转化前，不要把广告点击当作健康需求。", "不要一次性改所有 campaign，先隔离 Listing 修复。"],
      review: ["7 天后看 CVR、ATC、订单和 ACOS。", "CVR 仍低于 6.5% 时，继续控预算并修 PDP。", "CVR 上升且 ACOS 接近目标时，只重新打开 exact 放量。"],
      missing,
    },
    "scale-opportunity": {
      label: "允许可控放量，但只能放大已验证流量",
      current: "可以放量，但只允许从已成交的 exact、phrase 或 ASIN target 开始，并且要保护库存和 Featured Offer。",
      evidence: [`ACOS ${formatPercent(intake.acos)} 不高于目标 ${formatTargetAcos(intake)}。`, marginLine, channelMixLine, placementLine, budgetLine, structureLine, cleanupLine, bidGuardrailLine, formatTacosEvidenceZh(intake, "at-or-under"), `CVR ${formatPercent(intake.cvr)} 和 ${intake.inventoryDays} 天库存支持一轮受控扩张。`],
      actions: ["把预算从浪费 campaign 转到 exact 赢家和高转化 ASIN target。", "设定每周放量上限，下次加预算前先检查 TACOS。", "新增 broad 探索前，先确认库存和 Featured Offer 稳定。"],
      dont: ["不要因为 exact 赚钱就直接放大 broad。", "库存低于 21 天或 Featured Offer 不稳定时不要放量。", "不要把当前状态当成永久健康，每周都要复查。"],
      review: ["7 天后看 ACOS、TACOS、CVR、订单和库存。", "TACOS 高于目标超过 1.5 个百分点时，暂停扩张。", "订单增长且 TACOS 没有恶化时，再加下一组 exact。"],
      missing,
    },
    "rank-push": {
      label: "可以冲排名，但必须有止损线",
      current: "这是排名推进期，不能只用短期 ACOS 判断好坏。花费必须绑定关键词位置和自然单变化。",
      evidence: [`当前生命周期和诊断目标允许短期 ACOS 偏高，但前提是有排名证据。`, `当前关键词位置是 ${hasRankLine(intake) ? `约第 ${intake.keywordRank} 位` : "未提供"}。`, queryOpportunity ? `SQP 显示 ${queryOpportunity.query} 有 ${queryOpportunity.impressions.toLocaleString("en-US")} 曝光，${queryOpportunity.purchaseShare === null ? "购买份额缺失" : `购买份额 ${formatPercent(queryOpportunity.purchaseShare)}`}，这是机会候选，不是排名事实。` : intake.sqpReport ? "SQP 已上传，但没有隔离出低份额机会词。" : "缺少 SQP，query share 机会必须视为未验证。", `ACOS ${formatPercent(intake.acos)} 必须有止损线，因为目标 ACOS 是 ${formatTargetAcos(intake)}。`, structureLine, cleanupLine, bidGuardrailLine],
      actions: [queryOpportunity ? `只围绕 SQP 机会词测试排名预算：${queryOpportunity.query}。` : "只把预算放在有排名变化或订单贡献的战略词上。", queryWinner ? `加新探索前，先保护已有购买证据的 query：${queryWinner.query}。` : "新增探索花费前，先补 SQP、关键词排名或自然单证据。", "把 rank-push campaign 和利润控制 campaign 分开。", "用排名、自然单和 TACOS 设 14 天止损线。"],
      dont: ["不要只因为 ACOS 高就砍掉整个新品推进。", "不要让冲排名预算流入没有关键词目标的 broad 探索。", "缺少排名输入时，不要声称排名提升。"],
      review: ["14 天后看排名、自然单、广告单和 TACOS。", "排名没改善且 TACOS 恶化，就降低推进预算。", "排名改善但利润被打穿，就收窄到更少战略词。"],
      missing,
    },
    clearance: {
      label: "清库存模式，不当成长期健康投放",
      current: "这是库存清理，不是健康的长期广告结构。广告花费要服务于出货，同时不能掩盖毛利风险。",
      evidence: [`当前目标是清库存，生命周期也指向清仓。`, `库存天数是 ${hasInventoryLine(intake) ? intake.inventoryDays : "缺失"}，库存目标必须影响广告动作。`, `ACOS ${formatPercent(intake.acos)} 应按清仓经济账判断，不能套正常增长目标。`, structureLine, cleanupLine, bidGuardrailLine],
      actions: ["只保留能带动出货的高意图词和再营销路径。", "清仓期暂停昂贵探索 campaign。", "把 Coupon、价格和广告花费绑定到剩余库存窗口。"],
      dont: ["不要把低毛利清仓表现当成可复制增长。", "复盘清仓后经济账前，不要补货。", "不要为了一个准备退出的 SKU 扩广告结构。"],
      review: ["每 7 天看出货、剩余库存、ACOS 和净毛利。", "库存不动时，先调价格或 Coupon，不先加流量。", "毛利跌破清仓底线时，停止付费扩张。"],
      missing,
    },
    "promo-window": {
      label: "Deal / Coupon 周期要单独判断",
      current: "这是一段促销期诊断。不要把 Deal 期间的 CVR 和 ACOS 混进常规投放基线。",
      evidence: ["Deal 或 Coupon 正在影响转化和折扣压力。", `促销期 ACOS 是 ${formatPercent(intake.acos)}，目标是 ${formatTargetAcos(intake)}。`, intake.businessReport ? "Business Report 已上传，可以检查销售变化。" : "缺少 Business Report，暂时不能判断增量销售。", structureLine, cleanupLine, bidGuardrailLine],
      actions: ["给促销期 campaign 打标，和常规周分开比较。", "促销期间保留高转化词，但不要把 bid 永久提高。", "安排 Deal 后的 CVR、TACOS 和自然单回落复查。"],
      dont: ["不要把 Deal 周 CVR 当成常规基线。", "不要只凭折扣期数据永久提高正常 bid。", "没有 Business Report 支撑时，不要声称增量销售。"],
      review: ["分别看 Deal 周、Deal 后 7 天、Deal 后 14 天。", "折扣后 CVR 回落但花费仍高，就回滚 bid。", "如果自然单在 Deal 后仍保持，再保留有贡献的词。"],
      missing,
    },
    "ad-waste": {
      label: "先处理广告浪费",
      current: "广告浪费是第一阻断点。先控制低质量花费，再谈放量、冲排名或扩预算。",
      evidence: [`ACOS ${formatPercent(intake.acos)} 高于目标 ${formatTargetAcos(intake)}。`, marginLine, channelMixLine, placementLine, budgetLine, structureLine, cleanupLine, bidGuardrailLine, formatTacosEvidenceZh(intake, "above"), hasConversionLine(intake) ? `CVR ${formatPercent(intake.cvr)} 已提供，需要把 query 质量和转化问题分开看。` : "缺少 CVR，Listing 诊断必须降级。"],
      actions: ["先削减或限制高花费、低订单的搜索词，再动赢家词。", "把已转化搜索词迁入 exact match，并设置更紧的预算。", "拆开品牌防守、探索流量和利润控制 campaign。"],
      dont: ["不要不看订单和 campaign 角色就砍掉所有高 ACOS campaign。", "浪费未隔离前，不要放大 broad campaign。", "不要只凭 ACOS 说账户已经修好，还要看 TACOS 和销售贡献。"],
      review: ["7 天后看浪费花费、ACOS、订单和 TACOS。", "如果销售下降快于花费下降，回滚上一次削减。", "如果 TACOS 改善且订单没有明显损失，再进入 exact 放量复查。"],
      missing,
    },
  };

  return {
    branch: result.branch,
    confidence: result.confidence,
    ...modules[result.branch],
  };
}

function translateBidActionZh(text: string) {
  return text
    .replace(/^Pause, cap, or add negative only after checking match type for /, "先检查 match type，再暂停、限额或加否词：")
    .replace(/^Bid down or isolate /, "降 bid 或隔离预算：")
    .replace(/^Increase cautiously only inside a protected campaign for /, "只在受保护 campaign 内谨慎加价：")
    .replace(/^Keep watching /, "继续观察：");
}

function translateEvidenceZh(text: string) {
  return text
    .replace(/ clicks and /g, " 次点击，")
    .replace(/ spend with 0 orders\./g, " 花费，0 单。")
    .replace(/ orders but /g, " 单，但 ")
    .replace(/ ACOS is above the /g, " ACOS 高于 ")
    .replace(/ target\./g, " 目标。")
    .replace(/Do not apply account-wide negatives before checking campaign role, match type, and whether this is a rank-push test\./g, "先检查 campaign 角色、match type 和是否为冲排名测试，不要全账户否词。")
    .replace(/Do not negate ordered terms; reduce bid, isolate budget, or move to a tighter campaign first\./g, "有成交的词不要直接否掉，先降 bid、隔离预算或迁入更精确的 campaign。")
    .replace(/Do not scale broad discovery from this proof; protect inventory, Featured Offer, and TACOS before increasing again\./g, "不要用这条证据直接放大 broad 探索；继续加价前先保护库存、Featured Offer 和 TACOS。")
    .replace(/Do not pause from thin sample unless it violates a known brand, compliance, or irrelevant-query rule\./g, "样本太薄时不要暂停，除非它违反品牌、合规或明显不相关规则。");
}

function localizeActionZh(action: QueueAction): QueueAction {
  const actions: Record<string, string> = {
    "add-sp-report": "补齐最低报表和毛利线",
    "add-retail-proof": "放量前先补零售证据",
    "hold-growth": "零售数据确认前暂停加预算",
    "hold-budget": "暂停 broad 预算扩张",
    "fix-pdp": "检查主图、价格、评论、Coupon 和 Featured Offer",
    "watch-inventory": "设置库存和 Featured Offer 止损线",
    "rank-review": "用自然单变化一起复查排名推进",
    "clearance-spend": "只保留能出货的高意图付费路径",
    "stock-exit": "把 Coupon、价格和花费绑定到剩余库存",
    "tag-promo": "把促销周 campaign 和常规诊断分开",
    "post-deal": "安排 Deal 后回滚或保留判断",
    "harvest-exact": "把已成交 query 迁入 exact match",
    "bid-guardrail": "把 bid 调整限制在已上传数据支持的范围内",
  };
  const evidence: Record<string, string> = {
    "add-sp-report": action.evidence.split(", ").map(formatMissingZh).join("、") || "最低诊断输入缺失",
    "add-retail-proof": action.evidence.split(", ").map(formatMissingZh).join("、") || "零售准备度缺失",
    "hold-growth": "只看广告指标不能批准放量",
    "hold-budget": "CVR 低于付费流量扩张线",
    "fix-pdp": "点击需要更强 PDP 转化承接后才能放量",
    "watch-inventory": "零售准备度变弱时必须停止放量",
    "rank-review": "ACOS 不能单独验证冲排名是否有效",
    "clearance-spend": "清仓模式优先出货，不扩广告结构",
    "stock-exit": "清仓表现不能当成常规投放表现",
    "tag-promo": "折扣期数据不能直接成为常规 bid 基线",
    "post-deal": "CVR 和 TACOS 需要促销后确认",
    "harvest-exact": "浪费流量必须和已验证需求分开",
    "bid-guardrail": translateEvidenceZh(action.evidence),
  };
  const owner: Record<QueueAction["owner"], QueueAction["owner"]> = {
    Owner: "Owner",
    Operator: "Operator",
    "Ad operator": "Ad operator",
  };

  let translatedAction = actions[action.id] ?? action.action;
  if (action.id === "scale-exact") translatedAction = "把预算迁到 exact 赢家和高转化 ASIN target";
  if (action.id === "rank-campaign") translatedAction = "拆开冲排名 campaign 和利润控制 campaign";
  if (action.id === "cut-waste") translatedAction = "先削减或限制高花费、低订单对象";

  return {
    ...action,
    action: translatedAction,
    evidence: evidence[action.id] ?? translateEvidenceZh(action.evidence),
    owner: owner[action.owner],
    window: localizeWindowZh(action.window),
  };
}

function localizeWindowZh(window: string) {
  const windows: Record<string, string> = {
    "Before diagnosis": "诊断前",
    "Before budget expansion": "加预算前",
    "Before next spend increase": "下次加花费前",
    "Next 7 days": "未来 7 天",
    Weekly: "每周",
    "14 days": "14 天",
    "Deal week plus 14 days": "Deal 周及之后 14 天",
    "7 and 14 days after deal": "Deal 后 7 天和 14 天",
    "After more clicks": "获得更多点击后",
  };

  return windows[window] ?? window;
}

function localizeReadinessZh(readiness: GoalReadiness): GoalReadiness {
  const labelMap: Record<string, string> = {
    "Sponsored Products report uploaded": "Sponsored Products 报表已上传",
    "Main ASIN or SKU provided": "主 ASIN 已填写",
    "Break-even ACOS confirmed": "盈亏平衡 ACOS 已确认",
    "Target ACOS or TACOS confirmed": "目标 ACOS 或 TACOS 已确认",
    "Business Report for TACOS and sales contribution": "用于判断 TACOS 和销售贡献的 Business Report",
    "Campaign structure for role-safe cuts": "用于安全削减和区分 campaign 角色的结构报表",
    "Placement or budget report for spend leakage": "用于识别花费泄漏的 Placement 或 Budget 报表",
    "Keyword rank baseline provided": "关键词排名基线已填写",
    "Search Query Performance uploaded": "Search Query Performance 已上传",
    "Business Report for organic order movement": "用于观察自然单变化的 Business Report",
    "Campaign structure separates rank-push from profit-control": "Campaign Structure 能区分冲排名和利润控制",
    "Business Report for retail sales and sessions": "用于判断零售销售和 sessions 的 Business Report",
    "CVR or sessions confirmed": "CVR 或 sessions 已确认",
    "Inventory days confirmed": "库存天数已确认",
    "Featured Offer is stable": "Featured Offer 稳定",
    "Budget report for constrained winners": "用于识别预算受限赢家的 Budget 报表",
    "Budget report for inefficient budget pools": "用于识别低效预算池的 Budget 报表",
    "Deal or coupon window marked when active": "Deal 或 Coupon 周期已标记",
    "Campaign structure avoids expanding exit SKUs": "Campaign Structure 能避免扩张退出 SKU",
    "Deal or coupon window marked active": "Deal 或 Coupon 周期已开启",
    "Business Report for incremental sales check": "用于检查增量销售的 Business Report",
    "Placement report for promo traffic mix": "用于促销流量结构的 Placement 报表",
    "Budget report for deal-week caps": "用于 Deal 周限额的 Budget 报表",
  };
  const impactMap: Record<ReadinessItem["impact"], ReadinessItem["impact"]> = {
    "blocks strong call": "blocks strong call",
    "limits confidence": "limits confidence",
    "optional context": "optional context",
  };
  const goalLabel = goals.find((item) => item.id === intakeGoalFromTitle(readiness.title))?.zhLabel;

  return {
    ...readiness,
    title: `${goalLabel ?? "当前目标"}准备度`,
    verdict: readiness.verdict.includes("blocked")
      ? "缺少必填输入，不能给强广告动作。"
      : readiness.verdict.includes("limited")
        ? "可以给方向性建议，但缺少支撑数据，置信度必须降低。"
        : "当前输入足以支持更强的经营建议。",
    items: readiness.items.map((item) => ({
      ...item,
      label: labelMap[item.label] ?? item.label,
      impact: impactMap[item.impact],
    })),
    next: labelMap[readiness.next] ?? readiness.next,
  };
}

function intakeGoalFromTitle(title: string) {
  const found = goals.find((goal) => title.startsWith(goal.label));
  return found?.id ?? "lower-tacos";
}

function buildExpertReviewFitZh(result: SixModule, actions: QueueAction[], portfolioSummary: AdPortfolioSummary | null) {
  const firstAction = actions[0];
  const hasUploadedAdEvidence = Boolean(portfolioSummary && portfolioSummary.spend > 0);

  if (result.branch === "input-gap") {
    return {
      status: "暂时不适合进入专家建议",
      reason: "还缺最低广告报表、毛利线、目标线或主 ASIN。",
      next: "先补齐必填输入。现在进入人工复核，大部分时间会变成补资料。",
    };
  }

  if (!hasUploadedAdEvidence) {
    return {
      status: "先自助补报表，再进入专家建议",
      reason: "手填目标存在，但上传的广告证据还太薄。",
      next: "先上传 SP、Placement、Budget、Structure 或 SQP 报表，再让专家排动作优先级。",
    };
  }

  return {
    status: "适合进入专家建议",
    reason: `当前已有足够上传证据，可以复核第一动作：${firstAction?.action ?? result.current}。`,
    next: "如果需要 campaign 级执行顺序、风险检查和投手可执行说明，再进入专家建议。",
  };
}

function downloadTextFile(fileName: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold text-slate-500">{title}</p>
      <p className="mt-2 text-xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function AdsExpertReport({
  result,
  actions,
  intake,
  portfolioSummary,
  reportStatusRows,
  expertFit,
  exportNotice,
  onCopy,
  onDownload,
  locale,
}: {
  result: SixModule;
  actions: QueueAction[];
  intake: IntakeState;
  portfolioSummary: AdPortfolioSummary | null;
  reportStatusRows: Array<[string, string]>;
  expertFit: { status: string; next: string } | undefined;
  exportNotice: string;
  onCopy: () => void;
  onDownload: () => void;
  locale: SupportedLocale;
}) {
  const zh = isZh(locale);
  const spend = portfolioSummary ? formatUsd(portfolioSummary.spend) : zh ? "未上传" : "Missing";
  const acosLine = `${formatPercent(intake.acos)} / ${formatTargetAcos(intake)}`;
  const tacosLine = intake.businessReport ? formatPercent(intake.tacos) : zh ? "缺失" : "Missing";

  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-black text-teal-950">{zh ? "广告止血层" : "Ad Bleed Control Layer"}</span>
          <span className={`rounded-full border px-3 py-1 text-sm font-black ${toneClass(result.confidence)}`}>{result.branch} · {result.confidence}%</span>
        </div>
        <h2 className="mt-5 text-2xl font-black tracking-tight">{zh ? "Amazon 广告账户止血诊断" : "Amazon Ads Bleed-Control Diagnosis"}</h2>
        <div className="mt-5 space-y-4 text-base leading-8 text-slate-700">
          <p>
            {zh
              ? `这个账户现在不是缺广告流量，而是缺广告分层。当前 ACOS 是 ${formatPercent(intake.acos)}，目标线是 ${formatTargetAcos(intake)}，如果继续不分利润层、探索层和防守层，每一次加预算都可能是在把错误放大。`
              : `This account is not mainly short on traffic. It is short on ad-layer control. Current ACOS is ${formatPercent(intake.acos)} against ${formatTargetAcos(intake)}; without separating profit, discovery, and defense layers, every budget increase can amplify the wrong signal.`}
          </p>
          <p>
            {zh
              ? `${result.current} 我不会建议你现在先加预算。成熟卖家不会把所有 campaign 当成一个池子看，他们会先判断哪一笔钱在买增长，哪一笔钱只是在漏血。`
              : `${result.current} I would not start with more budget. Mature operators do not treat all campaigns as one pool; they first separate spend that buys growth from spend that simply leaks cash.`}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard title={zh ? "广告花费" : "Ad spend"} value={spend} />
        <MetricCard title="ACOS / Target" value={acosLine} />
        <MetricCard title="TACOS" value={tacosLine} />
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-black">{zh ? "第一刀怎么下" : "The First Cut"}</h3>
        <div className="mt-4 grid gap-3">
          {(actions.length ? actions.slice(0, 3) : [{ id: "current", action: result.actions[0] ?? result.current, evidence: result.evidence[0] ?? "", owner: "Operator" as const, window: "", confidence: result.confidence }]).map((item, index) => (
            <article key={item.id} className="rounded-md bg-slate-50 p-4">
              <p className="text-sm font-black text-teal-800">{zh ? `动作 ${index + 1}` : `Move ${index + 1}`}</p>
              <p className="mt-1 font-black text-slate-950">{item.action}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.evidence}</p>
            </article>
          ))}
        </div>
        <p className="mt-4 rounded-md bg-amber-50 p-4 text-sm font-bold leading-7 text-amber-950">
          {zh
            ? `不要做反了：${result.dont[0] ?? "不要在缺少证据时直接改 campaign。"}`
            : `Do not reverse the order: ${result.dont[0] ?? "do not change campaigns without evidence."}`}
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-black">{zh ? "7 天止血复盘线" : "7-Day Control Line"}</h3>
        <p className="mt-3 text-sm leading-7 text-slate-700">
          {zh
            ? `今天先锁住浪费，3 天内保护赢家词，7 天后看浪费花费、订单和 TACOS。${result.review[0] ?? ""} 如果销售下降快于花费下降，就回滚；如果 TACOS 改善且订单没有明显损失，再进入 exact 放量复查。`
            : `Lock waste today, protect winners within 3 days, then review wasted spend, orders, and TACOS after 7 days. ${result.review[0] ?? ""} If sales fall faster than spend, roll back; if TACOS improves without order loss, move into exact scaling review.`}
        </p>
        <p className="mt-4 text-sm font-bold leading-7 text-slate-800">
          {zh
            ? "继续只看 ACOS 的卖家，会越来越容易误砍赚钱词、放过垃圾词。系统化卖家看的不是一个指标，而是广告分层、TACOS 压力和回滚线。"
            : "Sellers who only watch ACOS are more likely to cut winners and protect waste. Systematic operators look at ad layers, TACOS pressure, and rollback lines."}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-black">{zh ? "专家建议" : "Expert Advice"}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-700">{expertFit?.status}</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">{expertFit?.next}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="rounded-md border border-slate-900 bg-slate-900 px-3 py-2 text-xs font-black text-white" onClick={onCopy} type="button">
              {zh ? zhUi.copySummary : "Copy audit summary"}
            </button>
            <button className="rounded-md border border-slate-200 px-3 py-2 text-xs font-black text-slate-700" onClick={onDownload} type="button">
              {zh ? zhUi.downloadSummary : "Download audit summary"}
            </button>
          </div>
          {exportNotice ? <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">{exportNotice}</p> : null}
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-black">{zh ? "已使用的数据" : "Data Used"}</h3>
          <div className="mt-3 divide-y divide-slate-100">
            {reportStatusRows.slice(0, 5).map(([label, value]) => (
              <div key={label} className="grid gap-1 py-2 text-sm">
                <span className="font-bold text-slate-950">{label}</span>
                <span className="text-slate-600">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function AmazonGrowthDeskWorkbench({ locale = "en" }: { locale?: SupportedLocale }) {
  const zh = isZh(locale);
  const [intake, setIntake] = useState<IntakeState>(defaultIntake);
  const [infoOpen, setInfoOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [generatedAudit, setGeneratedAudit] = useState<{
    result: SixModule;
    actions: QueueAction[];
    expertFit: ReturnType<typeof buildExpertReviewFit>;
    goalReadiness: GoalReadiness;
    summaryText: string;
  } | null>(null);
  const [reportSummary, setReportSummary] = useState<AdsReportSummary | null>(null);
  const [brandSummary, setBrandSummary] = useState<AdsReportSummary | null>(null);
  const [displaySummary, setDisplaySummary] = useState<AdsReportSummary | null>(null);
  const [placementSummary, setPlacementSummary] = useState<PlacementReportSummary | null>(null);
  const [budgetSummary, setBudgetSummary] = useState<BudgetReportSummary | null>(null);
  const [structureSummary, setStructureSummary] = useState<StructureReportSummary | null>(null);
  const [retailSummary, setRetailSummary] = useState<RetailReportSummary | null>(null);
  const [querySummary, setQuerySummary] = useState<QueryReportSummary | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [brandUploadError, setBrandUploadError] = useState("");
  const [displayUploadError, setDisplayUploadError] = useState("");
  const [placementUploadError, setPlacementUploadError] = useState("");
  const [budgetUploadError, setBudgetUploadError] = useState("");
  const [structureUploadError, setStructureUploadError] = useState("");
  const [retailUploadError, setRetailUploadError] = useState("");
  const [queryUploadError, setQueryUploadError] = useState("");
  const [exportNotice, setExportNotice] = useState("");
  const [sampleNotice, setSampleNotice] = useState("");
  const confirmedTargetAcos = hasTargetAcosLine(intake) ? intake.targetAcos : null;

  const activeReportSummary = useMemo(
    () => (reportSummary ? summarizeAdsSignals(reportSummary.signals, reportSummary.fileName, confirmedTargetAcos) : null),
    [confirmedTargetAcos, reportSummary],
  );
  const activeBrandSummary = useMemo(
    () => (brandSummary ? summarizeAdsSignals(brandSummary.signals, brandSummary.fileName, confirmedTargetAcos) : null),
    [brandSummary, confirmedTargetAcos],
  );
  const activeDisplaySummary = useMemo(
    () => (displaySummary ? summarizeAdsSignals(displaySummary.signals, displaySummary.fileName, confirmedTargetAcos) : null),
    [displaySummary, confirmedTargetAcos],
  );
  const portfolioSummary = useMemo(() => {
    const channels: ChannelSummary[] = [];
    if (activeReportSummary) channels.push({ ...activeReportSummary, channel: "Sponsored Products" });
    if (activeBrandSummary) channels.push({ ...activeBrandSummary, channel: "Sponsored Brands" });
    if (activeDisplaySummary) channels.push({ ...activeDisplaySummary, channel: "Sponsored Display" });
    return buildPortfolioSummary(channels);
  }, [activeBrandSummary, activeDisplaySummary, activeReportSummary]);
  const activePlacementSummary = useMemo(
    () => (placementSummary ? summarizePlacementSignals(placementSummary.signals, placementSummary.fileName, confirmedTargetAcos) : null),
    [confirmedTargetAcos, placementSummary],
  );
  const activeBudgetSummary = useMemo(
    () => (budgetSummary ? summarizeBudgetSignals(budgetSummary.signals, budgetSummary.fileName, confirmedTargetAcos) : null),
    [budgetSummary, confirmedTargetAcos],
  );
  const activeStructureSummary = useMemo(
    () => (structureSummary ? summarizeStructureSignals(structureSummary.signals, structureSummary.fileName, confirmedTargetAcos) : null),
    [confirmedTargetAcos, structureSummary],
  );
  const result = useMemo(
    () => buildSixModule(intake, querySummary, portfolioSummary, activePlacementSummary, activeBudgetSummary, activeStructureSummary),
    [activeBudgetSummary, activePlacementSummary, activeStructureSummary, intake, portfolioSummary, querySummary],
  );
  const actions = useMemo(
    () => buildActions(result, portfolioSummary, querySummary, activePlacementSummary, activeBudgetSummary, activeStructureSummary),
    [activeBudgetSummary, activePlacementSummary, activeStructureSummary, portfolioSummary, querySummary, result],
  );
  const completion = Math.round((reportChecks.filter((item) => isCheckReady(intake, item.key)).length / reportChecks.length) * 100);

  const expertFit = useMemo(() => buildExpertReviewFit(result, actions, portfolioSummary), [actions, portfolioSummary, result]);
  const goalReadiness = useMemo(() => buildGoalReadiness(intake), [intake]);
  const auditSummaryText = useMemo(
    () => buildAuditSummaryText(intake, result, actions, portfolioSummary, activePlacementSummary, activeBudgetSummary, activeStructureSummary, querySummary, expertFit, goalReadiness, locale),
    [actions, activeBudgetSummary, activePlacementSummary, activeStructureSummary, expertFit, goalReadiness, intake, locale, portfolioSummary, querySummary, result],
  );

  function markDirty() {
    setDirty(true);
  }

  function generateAudit() {
    setGeneratedAudit({ result, actions, expertFit, goalReadiness, summaryText: auditSummaryText });
    setDirty(false);
  }

  function loadFullDemo() {
    const sp = csvTemplates.find((item) => item.id === "sp");
    const business = csvTemplates.find((item) => item.id === "business");
    const sqp = csvTemplates.find((item) => item.id === "sqp");
    const placement = csvTemplates.find((item) => item.id === "placement");
    const budget = csvTemplates.find((item) => item.id === "budget");
    const structure = csvTemplates.find((item) => item.id === "structure");
    const target = demoIntake.targetAcos;
    const demoCsv = (template: CsvTemplate | undefined) => {
      if (!template) return "";
      const replacements: Record<string, [string, string]> = {
        sp: ["free garlic press,120,0,0,31", "free steel garlic press,121,0,0,31"],
        business: ["B0SAMPLE123", "B0HERO1234"],
        sqp: ["garlic press stainless,18000,820,42,3.2%", "steel garlic press,18100,830,43,3.3%"],
        placement: ["Top of Search,240,1200,18,180", "Top of Search Demo,241,1200,18,180"],
        budget: ["Exact Profit Control,100,95,900,14,160,Limited by budget,95%", "Exact Profit Demo,100,96,900,14,160,Limited by budget,96%"],
        structure: ["Launch Garlic Mixed,Discovery Ad Group,broad,garlic press broad,keyword,180,0,0,45", "Launch Garlic Demo,Discovery Ad Group,broad,garlic press broad,keyword,181,0,0,45"],
      };
      const replacement = replacements[template.id];
      return replacement ? template.csv.replace(replacement[0], replacement[1]) : template.csv;
    };

    setIntake({ ...demoIntake, goal: "lower-tacos", lifecycle: "mature", acos: 38, targetAcos: 22, cvr: 7.4 });
    setReportSummary(sp ? parseAdsCsv(demoCsv(sp), "demo-sponsored-products.csv", target) : null);
    setBrandSummary(sp ? parseAdsCsv(demoCsv(sp), "demo-sponsored-brands.csv", target) : null);
    setDisplaySummary(sp ? parseAdsCsv(demoCsv(sp), "demo-sponsored-display.csv", target) : null);
    setRetailSummary(business ? parseRetailCsv(demoCsv(business), "demo-business-report.csv") : null);
    setQuerySummary(sqp ? parseQueryCsv(demoCsv(sqp), "demo-search-query-performance.csv") : null);
    setPlacementSummary(placement ? parsePlacementCsv(demoCsv(placement), "demo-placement.csv", target) : null);
    setBudgetSummary(budget ? parseBudgetCsv(demoCsv(budget), "demo-budget-settings.csv", target) : null);
    setStructureSummary(structure ? parseStructureCsv(demoCsv(structure), "demo-campaign-structure.csv", target) : null);
    setUploadError("");
    setBrandUploadError("");
    setDisplayUploadError("");
    setPlacementUploadError("");
    setBudgetUploadError("");
    setStructureUploadError("");
    setRetailUploadError("");
    setQueryUploadError("");
    setGeneratedAudit(null);
    setDirty(true);
    setSampleNotice(zh ? zhUi.demoLoaded : "Full demo data loaded: SP/SB/SD, Placement, Budget, Structure, Business Report, and SQP are now included in the diagnosis.");
  }

  function update<K extends keyof IntakeState>(key: K, value: IntakeState[K]) {
    setIntake((current) => ({ ...current, [key]: value }));
    markDirty();
  }

  function updateNumber(key: keyof IntakeState, value: number) {
    setIntake((current) => ({
      ...current,
      [key]: value,
      ...(key === "breakEvenAcos" ? { marginKnown: value > 0 } : null),
      ...(key === "targetAcos" ? { targetKnown: value > 0 || current.targetTacos > 0 } : null),
      ...(key === "targetTacos" ? { targetKnown: current.targetAcos > 0 || value > 0 } : null),
      ...(key === "cvr" ? { conversionKnown: value > 0 } : null),
      ...(key === "inventoryDays" ? { inventoryKnown: value > 0 } : null),
      ...(key === "keywordRank" ? { rankKnown: value > 0 } : null),
    }));
    markDirty();
  }

  async function handleReportUpload(file: File | null) {
    if (!file) return;
    setUploadError("");

    try {
      const text = await file.text();
      const summary = parseAdsCsv(text, file.name, confirmedTargetAcos);
      setReportSummary(summary);
      markDirty();
      setIntake((current) => ({
        ...current,
        spReport: true,
        conversionKnown: summary.cvr !== null ? true : current.conversionKnown,
        acos: summary.acos === null ? current.acos : Number(summary.acos.toFixed(1)),
        cvr: summary.cvr === null ? current.cvr : Number(summary.cvr.toFixed(1)),
        weeklySales: summary.sales > 0 ? Math.round(summary.sales) : current.weeklySales,
      }));
    } catch (error) {
      setReportSummary(null);
      markDirty();
      setUploadError(csvUploadMessage(error, "This file could not be read as a Sponsored Products CSV. Export a Search Term or Campaign report with spend, sales, orders, and clicks, then upload again."));
      setIntake((current) => ({ ...current, spReport: false }));
    }
  }

  async function handleBrandUpload(file: File | null) {
    if (!file) return;
    setBrandUploadError("");

    try {
      const summary = parseAdsCsv(await file.text(), file.name, confirmedTargetAcos);
      setBrandSummary(summary);
      markDirty();
      setIntake((current) => ({ ...current, sbReport: true }));
    } catch (error) {
      setBrandSummary(null);
      markDirty();
      setBrandUploadError(csvUploadMessage(error, "This file could not be read as a Sponsored Brands CSV. Export a campaign, keyword, or search term report with spend, sales, orders, and clicks, then upload again."));
      setIntake((current) => ({ ...current, sbReport: false }));
    }
  }

  async function handleDisplayUpload(file: File | null) {
    if (!file) return;
    setDisplayUploadError("");

    try {
      const summary = parseAdsCsv(await file.text(), file.name, confirmedTargetAcos);
      setDisplaySummary(summary);
      markDirty();
      setIntake((current) => ({ ...current, sdReport: true }));
    } catch (error) {
      setDisplaySummary(null);
      markDirty();
      setDisplayUploadError(csvUploadMessage(error, "This file could not be read as a Sponsored Display CSV. Export a campaign, target, or audience report with spend, sales, orders, and clicks, then upload again."));
      setIntake((current) => ({ ...current, sdReport: false }));
    }
  }

  async function handlePlacementUpload(file: File | null) {
    if (!file) return;
    setPlacementUploadError("");

    try {
      const summary = parsePlacementCsv(await file.text(), file.name, confirmedTargetAcos);
      setPlacementSummary(summary);
      markDirty();
      setIntake((current) => ({ ...current, placementReport: true }));
    } catch (error) {
      setPlacementSummary(null);
      markDirty();
      setPlacementUploadError(csvUploadMessage(error, "This file could not be read as a Placement CSV. Export placement rows with placement, spend, sales, orders, and clicks, then upload again."));
      setIntake((current) => ({ ...current, placementReport: false }));
    }
  }

  async function handleBudgetUpload(file: File | null) {
    if (!file) return;
    setBudgetUploadError("");

    try {
      const summary = parseBudgetCsv(await file.text(), file.name, confirmedTargetAcos);
      setBudgetSummary(summary);
      markDirty();
      setIntake((current) => ({ ...current, budgetReport: true }));
    } catch (error) {
      setBudgetSummary(null);
      markDirty();
      setBudgetUploadError(csvUploadMessage(error, "This file could not be read as a Budget or Campaign Settings CSV. Export campaign rows with campaign, budget, spend, sales, orders, clicks, and budget status if available, then upload again."));
      setIntake((current) => ({ ...current, budgetReport: false }));
    }
  }

  async function handleStructureUpload(file: File | null) {
    if (!file) return;
    setStructureUploadError("");

    try {
      const summary = parseStructureCsv(await file.text(), file.name, confirmedTargetAcos);
      setStructureSummary(summary);
      markDirty();
      setIntake((current) => ({ ...current, structureReport: true }));
    } catch (error) {
      setStructureSummary(null);
      markDirty();
      setStructureUploadError(csvUploadMessage(error, "This file could not be read as a Campaign Structure CSV. Export rows with campaign, ad group, match type or targeting type, targeting or keyword, spend, sales, orders, and clicks, then upload again."));
      setIntake((current) => ({ ...current, structureReport: false }));
    }
  }

  async function handleQueryUpload(file: File | null) {
    if (!file) return;
    setQueryUploadError("");

    try {
      const summary = parseQueryCsv(await file.text(), file.name);
      setQuerySummary(summary);
      markDirty();
      setIntake((current) => ({ ...current, sqpReport: true }));
    } catch (error) {
      setQuerySummary(null);
      markDirty();
      setQueryUploadError(csvUploadMessage(error, "This file could not be read as a Search Query Performance CSV. Export rows with search query, impressions or query volume, clicks, purchases, and purchase share, then upload again."));
      setIntake((current) => ({ ...current, sqpReport: false }));
    }
  }

  async function handleRetailUpload(file: File | null) {
    if (!file) return;
    setRetailUploadError("");

    try {
      const text = await file.text();
      const summary = parseRetailCsv(text, file.name);
      setRetailSummary(summary);
      markDirty();
      setIntake((current) => ({
        ...current,
        businessReport: true,
        conversionKnown: summary.unitSessionPercentage !== null,
        cvr: summary.unitSessionPercentage === null ? current.cvr : Number(summary.unitSessionPercentage.toFixed(1)),
        weeklySales: summary.sales > 0 ? Math.round(summary.sales) : current.weeklySales,
      }));
    } catch (error) {
      setRetailSummary(null);
      markDirty();
      setRetailUploadError(csvUploadMessage(error, "This file could not be read as a Business Report CSV. Export Sales and Traffic with sessions, ordered units, and ordered product sales, then upload again."));
      setIntake((current) => {
        const fallbackTargetAcos = current.targetKnown && current.targetAcos > 0 ? current.targetAcos : null;
        const adFallback = reportSummary ? summarizeAdsSignals(reportSummary.signals, reportSummary.fileName, fallbackTargetAcos) : null;
        return {
          ...current,
          businessReport: false,
          conversionKnown: adFallback?.cvr !== null && adFallback?.cvr !== undefined,
          cvr: adFallback?.cvr === null || adFallback?.cvr === undefined ? current.cvr : Number(adFallback.cvr.toFixed(1)),
          weeklySales: adFallback?.sales ? Math.round(adFallback.sales) : current.weeklySales,
        };
      });
    }
  }

  async function copyAuditSummary() {
    const textToCopy = generatedAudit?.summaryText ?? auditSummaryText;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setExportNotice(zh ? "诊断摘要已复制。发给投手或团队前，请再确认里面的动作边界。" : "Audit summary copied. Review it before sharing with operators or clients.");
    } catch {
      setExportNotice(zh ? "浏览器阻止了复制。请改用下载诊断摘要。" : "Copy was blocked by the browser. Use Download audit summary instead.");
    }
  }

  function downloadAuditSummary() {
    const suffix = intake.mainAsin.trim() || "amazon-ads-audit";
    downloadTextFile(`${suffix}-ads-audit-summary.txt`, generatedAudit?.summaryText ?? auditSummaryText);
    setExportNotice(zh ? "诊断摘要已下载。文件只包含当前诊断和已上传数据证据。" : "Audit summary downloaded. It contains only the current workbench diagnosis and uploaded-data evidence.");
  }

  const displayed = generatedAudit;
  const rawDisplayedResult = displayed?.result;
  const displayedResult =
    zh && rawDisplayedResult
      ? buildSixModuleZh(intake, rawDisplayedResult, querySummary, portfolioSummary, activePlacementSummary, activeBudgetSummary, activeStructureSummary)
      : rawDisplayedResult;
  const displayedActions = zh ? (displayed?.actions ?? []).map(localizeActionZh) : (displayed?.actions ?? []);
  const displayedExpertFit = zh && displayed?.expertFit && displayedResult ? buildExpertReviewFitZh(displayedResult, displayedActions, portfolioSummary) : displayed?.expertFit;
  const displayedGoalReadiness = zh && displayed?.goalReadiness ? localizeReadinessZh(displayed.goalReadiness) : displayed?.goalReadiness;
  const reportStatusRows: Array<[string, string]> = [
    [zh ? "Sponsored Products 报表" : "Sponsored Products report", activeReportSummary ? (zh ? `${activeReportSummary.rowCount} 行 · 花费 ${formatUsd(activeReportSummary.spend)} · ${activeReportSummary.orders} 单` : `${activeReportSummary.rowCount} rows · ${formatUsd(activeReportSummary.spend)} spend · ${activeReportSummary.orders} orders`) : zh ? "未上传" : "Not uploaded"],
    [zh ? "Sponsored Brands 报表" : "Sponsored Brands report", activeBrandSummary ? (zh ? `${activeBrandSummary.rowCount} 行 · 花费 ${formatUsd(activeBrandSummary.spend)}` : `${activeBrandSummary.rowCount} rows · ${formatUsd(activeBrandSummary.spend)} spend`) : zh ? "未上传" : "Not uploaded"],
    [zh ? "Sponsored Display 报表" : "Sponsored Display report", activeDisplaySummary ? (zh ? `${activeDisplaySummary.rowCount} 行 · 花费 ${formatUsd(activeDisplaySummary.spend)}` : `${activeDisplaySummary.rowCount} rows · ${formatUsd(activeDisplaySummary.spend)} spend`) : zh ? "未上传" : "Not uploaded"],
    [zh ? "Placement 报表" : "Placement report", activePlacementSummary ? (zh ? `${activePlacementSummary.rowCount} 行 · 花费 ${formatUsd(activePlacementSummary.spend)}` : `${activePlacementSummary.rowCount} rows · ${formatUsd(activePlacementSummary.spend)} spend`) : zh ? "未上传" : "Not uploaded"],
    [zh ? "Budget / Campaign Settings 报表" : "Budget / Campaign Settings report", activeBudgetSummary ? (zh ? `${activeBudgetSummary.rowCount} 行 · 花费 ${formatUsd(activeBudgetSummary.spend)}` : `${activeBudgetSummary.rowCount} rows · ${formatUsd(activeBudgetSummary.spend)} spend`) : zh ? "未上传" : "Not uploaded"],
    [zh ? "Campaign Structure 报表" : "Campaign Structure report", activeStructureSummary ? (zh ? `${activeStructureSummary.rowCount} 行 · 花费 ${formatUsd(activeStructureSummary.spend)}` : `${activeStructureSummary.rowCount} rows · ${formatUsd(activeStructureSummary.spend)} spend`) : zh ? "未上传" : "Not uploaded"],
    [zh ? "Business Report" : "Business Report", retailSummary ? (zh ? `${retailSummary.rowCount} 行 · ${retailSummary.sessions.toLocaleString("en-US")} sessions · 销售额 ${formatUsd(retailSummary.sales)}` : `${retailSummary.rowCount} rows · ${retailSummary.sessions.toLocaleString("en-US")} sessions · ${formatUsd(retailSummary.sales)} sales`) : zh ? "未上传" : "Not uploaded"],
    [zh ? "Search Query Performance" : "Search Query Performance", querySummary ? (zh ? `${querySummary.rowCount} 行 · ${querySummary.impressions.toLocaleString("en-US")} impressions` : `${querySummary.rowCount} rows · ${querySummary.impressions.toLocaleString("en-US")} impressions`) : zh ? "未上传" : "Not uploaded"],
  ];
  const uploadItems: Array<{
    zhLabel: string;
    enLabel: string;
    zhNote: string;
    enNote: string;
    handler: (file: File | null) => Promise<void>;
    error: string;
  }> = [
    { zhLabel: zhUi.uploadSp, enLabel: "Upload Sponsored Products CSV", zhNote: zhUi.uploadSpNote, enNote: "P1 reads spend, sales, orders, clicks, campaign, and search term.", handler: handleReportUpload, error: uploadError },
    { zhLabel: zhUi.uploadSb, enLabel: "Upload Sponsored Brands CSV", zhNote: zhUi.uploadSbNote, enNote: "Optional: reads brand, video, or headline spend, sales, orders, and clicks.", handler: handleBrandUpload, error: brandUploadError },
    { zhLabel: zhUi.uploadSd, enLabel: "Upload Sponsored Display CSV", zhNote: zhUi.uploadSdNote, enNote: "Optional: reads display, retargeting, or audience spend, sales, orders, and clicks.", handler: handleDisplayUpload, error: displayUploadError },
    { zhLabel: zhUi.uploadPlacement, enLabel: "Upload Placement CSV", zhNote: zhUi.uploadPlacementNote, enNote: "Optional: reads Top of Search, Product Pages, Rest of Search spend and sales.", handler: handlePlacementUpload, error: placementUploadError },
    { zhLabel: zhUi.uploadBudget, enLabel: "Upload Budget / Campaign Settings CSV", zhNote: zhUi.uploadBudgetNote, enNote: "Optional: reads campaign budget, status, spend, sales, and orders.", handler: handleBudgetUpload, error: budgetUploadError },
    { zhLabel: zhUi.uploadStructure, enLabel: "Upload Campaign Structure CSV", zhNote: zhUi.uploadStructureNote, enNote: "Optional: reads campaign, ad group, match type, targeting, spend, sales, and orders.", handler: handleStructureUpload, error: structureUploadError },
    { zhLabel: zhUi.uploadBusiness, enLabel: "Upload Business Report CSV", zhNote: zhUi.uploadBusinessNote, enNote: "Optional but important: reads sessions, units, sales, and unit session percentage.", handler: handleRetailUpload, error: retailUploadError },
    { zhLabel: zhUi.uploadSqp, enLabel: "Upload Search Query Performance CSV", zhNote: zhUi.uploadSqpNote, enNote: "Optional for rank-push: reads queries, impressions, clicks, purchases, and purchase share.", handler: handleQueryUpload, error: queryUploadError },
  ];

  return (
    <main className="min-h-screen bg-[#f6f8f9] text-slate-950">
      <section className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
        <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Amazon Ads / Sponsored Products / Sponsored Brands</p>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight">{zh ? "Amazon Ads 体检工作台" : "Amazon Ads Audit Workbench"}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                {zh
                  ? "上传广告和业务报表，点击生成广告诊断。工具会判断先清理浪费、控 TACOS、保护利润、检查转化，还是补数据。"
                  : "Upload ad and business reports, then generate an ads diagnosis. The workbench decides whether to cut waste, control TACOS, protect margin, check conversion, or add missing data first."}
              </p>
            </div>
            <button
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              onClick={() => setInfoOpen(true)}
              type="button"
            >
              {zh ? "功能说明" : "How it works"}
            </button>
          </div>
        </header>

        <div className="mt-6 grid gap-6 xl:grid-cols-[440px_minmax(0,1fr)]">
          <section className="self-start rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">{zh ? "上传文件与经营输入" : "Upload Files and Inputs"}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {zh ? "先上传能提供的报表，再点击生成广告诊断。" : "Upload available reports first, then generate the ads diagnosis."}
                </p>
              </div>
              <span className={`rounded border px-2 py-1 text-xs font-black ${toneClass(result.confidence)}`}>{completion}%</span>
            </div>

            <div className="mt-5 grid gap-3">
              <label className="grid gap-1 text-sm font-bold">
                ASIN
                <input
                  className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                  onChange={(event) => update("mainAsin", event.target.value)}
                  placeholder={zh ? "输入主 ASIN" : "Enter main ASIN"}
                  value={intake.mainAsin}
                />
              </label>
              <label className="grid gap-1 text-sm font-bold">
                {zh ? "诊断目标" : "Diagnosis goal"}
                <select
                  className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                  onChange={(event) => update("goal", event.target.value as Goal)}
                  value={intake.goal}
                >
                  {goals.map((item) => (
                    <option key={item.id} value={item.id}>
                      {labelFor(item, locale)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ["acos", "ACOS"],
                    ["targetAcos", zh ? "目标 ACOS" : "Target ACOS"],
                    ["breakEvenAcos", zh ? "盈亏平衡 ACOS" : "Break-even ACOS"],
                    ["tacos", "TACOS"],
                    ["targetTacos", zh ? "目标 TACOS" : "Target TACOS"],
                    ["cvr", "CVR"],
                    ["inventoryDays", zh ? "库存天数" : "Inventory days"],
                    ["keywordRank", zh ? "关键词排名" : "Keyword rank"],
                  ] as Array<[keyof IntakeState, string]>
                ).map(([key, label]) => (
                  <label key={key} className="grid gap-1 text-sm font-bold">
                    {label}
                    <input
                      className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                      min="0"
                      onChange={(event) => updateNumber(key, Number(event.target.value))}
                      type="number"
                      value={String(intake[key])}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {uploadItems.map((item) => (
                <label key={item.enLabel} className="block rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-3">
                  <span className="block text-sm font-black text-slate-950">{zh ? item.zhLabel : item.enLabel}</span>
                  <span className="mt-1 block text-xs font-semibold leading-5 text-slate-600">{zh ? item.zhNote : item.enNote}</span>
                  <input
                    accept=".csv,text/csv"
                    className="mt-3 w-full text-xs font-semibold text-slate-700 file:mr-3 file:rounded file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-xs file:font-black file:text-white"
                    onChange={(event) => void item.handler(event.target.files?.[0] ?? null)}
                    type="file"
                  />
                  {item.error ? <span className="mt-2 block rounded bg-rose-50 px-2 py-1 text-xs font-bold text-rose-800">{localizeUploadError(item.error, zh)}</span> : null}
                </label>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={loadFullDemo} type="button">
                {zh ? zhUi.loadDemo : "Load full demo data"}
              </button>
              <button className="rounded-md bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-800" onClick={generateAudit} type="button">
                {zh ? "生成广告诊断" : "Generate ads diagnosis"}
              </button>
            </div>
            {sampleNotice ? <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">{sampleNotice}</p> : null}
          </section>

          <section className="grid gap-5">
            {!displayedResult ? (
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-2xl font-black">{zh ? "等待生成广告诊断" : "Waiting for ads diagnosis"}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {zh ? "上传报表或加载演示数据后，点击“生成广告诊断”。右侧不会在你输入时实时变化，也不会消耗 AI token。" : "Upload reports or load demo data, then click Generate. The result does not update while you type and does not spend AI tokens."}
                </p>
              </div>
            ) : null}
            {displayedResult && dirty ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-950">
                {zh ? "输入或报表已变更。点击“生成广告诊断”后，结果才会基于最新数据更新。" : "Inputs or reports changed. Click Generate to refresh the diagnosis from the latest data."}
              </div>
            ) : null}
            {displayedResult ? (
              <AdsExpertReport
                result={displayedResult}
                actions={displayedActions}
                intake={intake}
                portfolioSummary={portfolioSummary}
                reportStatusRows={reportStatusRows}
                expertFit={displayedExpertFit}
                exportNotice={exportNotice}
                onCopy={() => void copyAuditSummary()}
                onDownload={downloadAuditSummary}
                locale={locale}
              />
            ) : null}
          </section>
        </div>
      </section>

      {infoOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <div className="max-h-[88vh] w-full max-w-5xl overflow-auto rounded-lg bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black">{zh ? "功能说明" : "How it works"}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {zh ? "这里展示诊断依据、检查项和缺失数据。主页面只保留最终判断和下一步动作。" : "This panel shows rationale, checks, and missing data. The main page keeps only the final judgment and next actions."}
                </p>
              </div>
              <button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold" onClick={() => setInfoOpen(false)} type="button">
                {zh ? "关闭" : "Close"}
              </button>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                [zh ? "检查工作" : "Readiness checks", displayedGoalReadiness ? [...displayedGoalReadiness.items.map((item) => `${item.ready ? (zh ? "已就绪" : "Ready") : (zh ? "缺失" : "Missing")}: ${item.label}`), `${zh ? "下一步" : "Next"}: ${displayedGoalReadiness.next}`] : [zh ? "生成广告诊断后显示检查工作。" : "Generate a diagnosis to show readiness checks."]],
                [zh ? zhUi.modules.evidence : "Key Evidence", displayedResult?.evidence ?? [zh ? "生成广告诊断后显示关键证据。" : "Generate a diagnosis to show evidence."]],
                [zh ? zhUi.modules.actions : "Priority Actions", displayedResult?.actions ?? []],
                [zh ? zhUi.modules.dont : "Do Not Do", displayedResult?.dont ?? []],
                [zh ? zhUi.modules.review : "Review Rules", displayedResult?.review ?? []],
                [zh ? zhUi.modules.missing : "Missing Data", displayedResult?.missing.length ? displayedResult.missing : [zh ? "当前没有阻断级缺失数据，或尚未生成诊断。" : "No blocking gap, or no diagnosis generated yet."]],
              ].map(([title, items]) => (
                <section key={title as string} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-black">{title as string}</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                    {(items as string[]).map((item) => <li key={item}>• {item}</li>)}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
