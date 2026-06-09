import type { ToolDefinition } from "@/lib/tools";

export const supportedLocales = ["en", "zh"] as const;

export type SupportedLocale = (typeof supportedLocales)[number];

export const defaultLocale: SupportedLocale = "en";

export function isSupportedLocale(value: string): value is SupportedLocale {
  return supportedLocales.includes(value as SupportedLocale);
}

export function getLocalizedPath(locale: SupportedLocale, path = "/") {
  const normalizedPath = path === "/" ? "" : path;

  if (locale === "en") {
    return normalizedPath || "/";
  }

  if (!normalizedPath) {
    return "/zh";
  }

  return `${normalizedPath}/zh`;
}

export function getDefaultPath(path = "/") {
  return getLocalizedPath("en", path);
}

export function stripTrailingLocale(path = "/") {
  return path.endsWith("/zh") ? path.slice(0, -3) || "/" : path;
}

export function getCanonicalAlternates(path = "/") {
  const basePath = stripTrailingLocale(path);

  return {
    canonical: getLocalizedPath("en", basePath),
    languages: {
      en: getLocalizedPath("en", basePath),
      zh: getLocalizedPath("zh", basePath),
      "x-default": getLocalizedPath("en", basePath),
    },
  };
}

const homeCopy = {
  en: {
    siteName: "Commerce Tool System",
    siteTagline:
      "Practical tools for commerce teams across major platforms.",
    browseTools: "Open tool pages",
    platformMap: "Platforms",
    officialRules: "Official rules",
    faq: "FAQ",
    heroTitle: "Choose a platform",
    heroBody:
      "Open the platform page you need. Amazon is available now, and more marketplaces will appear here.",
    startHere: "Start here",
    mostSearched: "Most searched tools",
    featuredToolsHeading: "Featured tools",
    featuredToolsBody:
      "Start with the highest-priority tools for the current platform so users hit the shortest path into real seller work.",
    secondaryToolsHeading: "More to explore",
    secondaryToolsBody:
      "These pages come next when the operator needs a deeper execution layer after the first decision is already framed.",
    seoSupportHeading: "All indexed tools",
    seoSupportBody:
      "The remaining tools stay indexable and discoverable without competing for the first visual layer.",
    liveNow: "Live now",
    toolsHeading: "Launch-ready tool pages",
    toolsBody:
      "Each tool page is built to work as a usable tool and a clear search destination: precise title, fast first action, and adjacent next steps.",
    officialHeading: "Backed by official sources",
    officialBody:
      "Amazon tools now use local help references, official category trees, and style-guide evidence instead of thin demo lists.",
    marketplaceCoverage: "Marketplace coverage",
    restrictionTopics: "Restriction topics",
    matrixHeading: "Platform directory",
    matrixBody:
      "Amazon is live and TikTok Shop is now entering the active matrix. The site structure leaves clean room for more platforms next.",
    capabilityHeading: "Capability map",
    capabilityBody:
      "The product is being organized around reusable seller problem types so we can expand by platform without rebuilding the whole site model.",
    commonQuestions: "Common questions",
    commonQuestionsBody:
      "The first batch is intentionally rules-first. That keeps the pages useful, indexable, and honest before heavier AI service layers are added.",
    statCoreSkills: "Amazon core skill pages",
    statCompanionTools: "Live audit companion tools",
    statNonAiCandidates: "First-batch non-AI candidates",
    statPriorityLocales: "Priority locales live",
    coreInputs: "Core inputs",
    officialReferencesLabel: "Official references",
    openTool: "Open tool",
    currentFocusLabel: "Current focus",
    nextWaveLabel: "Next wave",
    marketplaceSuffix: "seller marketplaces",
    riskThemeSuffix: "high-risk themes",
    capabilityExamplesLabel: "Example categories",
    platformPageWhyTitle: "Why this platform page exists",
    platformPageWhyBody:
      "The platform page works as a clean search and navigation layer: it groups primary tools, preserves room for specialized entries, and helps long-tail traffic move into the right tool page instead of stopping on a dead-end archive.",
    platformPageFitTitle: "What sellers should solve here first",
    platformPageFitBody:
      "Start with fee math, compliance, listing quality, and fulfillment planning. Those are the highest-frequency seller decisions and the easiest pages to make both useful and indexable.",
    footerSummary:
      "A multilingual commerce product with calculators, audits, and practical tools for major platforms.",
    footerRoadmap: "Platform roadmap",
    footerPlatforms: "Platforms",
    footerLanguages: "Languages",
    footerPrimaryLanguage: "English",
    footerSecondaryLanguage: "Chinese",
    specializedEntry: "Specialized entry",
    specializedEntriesKicker: "Specialized entries",
    specializedEntriesTitle:
      "These pages solve narrow problems, but they are not the primary skill pages",
    specializedEntriesBody:
      "They are useful for fast checks on titles, images, variation structure, or search-facing issues. Full optimization, planning, and decision-making still belong in the primary tools above.",
    categoryDirectoryHeading: "Browse by category",
    categoryDirectoryBody:
      "Sellers rarely arrive with a full product map in mind. Grouping tools by category makes the platform page easier to scan, easier to index, and easier to use as a working directory instead of a long list.",
    openCategory: "Open category",
    searchIntentHeading: "What search intent this platform page should capture",
    searchIntentBody:
      "The strongest platform pages do more than list tools. They absorb high-intent seller searches, clarify which tool comes first, and route each visitor into the right decision page.",
    searchIntentPoints: [
      "Fee, margin, and landed-cost questions before a product is approved",
      "Listing, compliance, and ungating questions before a catalog goes live",
      "Prep, shipping, and inventory questions before operations start slipping",
    ],
    searchIntentCta: "Start with the primary tools below, then move into the closest execution category.",
    operatorHeading: "Built for operators, not content filler",
    operatorBody:
      "Every page is meant to work as a usable search landing page and an internal operating surface at the same time: clear intent, fast first action, and enough context to decide whether the page is worth using daily or upgrading later.",
    operatorPoints: [
      "Search pages should qualify demand, not just collect impressions.",
      "The first useful answer has to appear before the user feels sold to.",
      "If a page earns repeat use, it becomes a natural upgrade path for paid features later.",
    ],
    membershipHeading: "What a paid layer can credibly unlock later",
    membershipBody:
      "The free surface should win trust with deterministic utility first. Paid value should come from saved runs, deeper monitoring, collaboration, and faster decision cycles rather than vague AI wrapping.",
    membershipPoints: [
      "Saved tool runs and reusable operating templates",
      "Cross-tool monitoring across pricing, compliance, listing quality, and expansion",
      "Shared workspaces for teams handling sourcing, ops, and catalog changes",
    ],
    commercialCoreHeading: "Core decisions",
    commercialCoreBody:
      "Start with the few pages that decide whether the SKU economics and launch direction are worth pursuing at all.",
    commercialControlHeading: "Revenue and control",
    commercialControlBody:
      "Use this layer once the economics are acceptable and the team needs tighter pricing, search, and market-control decisions.",
    commercialRiskHeading: "Risk and readiness gates",
    commercialRiskBody:
      "These pages protect the listing from avoidable compliance, discoverability, and category-entry mistakes before they become expensive.",
    commercialSupportHeading: "Supporting audits",
    commercialSupportBody:
      "Keep these pages available for deeper checks, but do not let them distract from the primary launch and margin decisions.",
    commercialAnchorsHeading: "Primary monetization anchors",
    commercialAnchorsBody:
      "These are the strongest candidates for saved runs, recurring use, monitoring, and later paid execution-layer expansion.",
    homepageHeroLabel: "Primary entry",
    homepageHighLabel: "Priority",
    pageRolePrimaryDecision: "Primary decision page",
    pageRoleWorkflowAnchor: "Operator anchor",
    pageRoleSpecializedEntry: "Specialized entry",
    coverageHeading: "Current coverage snapshot",
    coverageBody:
      "A serious operator product should make its current scope legible. Users and search engines both benefit when the page clearly signals what is already live, what is grouped, and where the coverage is still expanding.",
    faqItems: [
      {
        question: "What is this site for?",
        answer:
          "It is a multilingual commerce operator product with live calculators, readiness boards, and rule-backed decision pages for real operating teams.",
      },
      {
        question: "Why start with Amazon first?",
        answer:
          "Amazon has the strongest current knowledge base and the clearest deterministic rules, which makes it the best launch platform before expanding to the next marketplaces.",
      },
      {
        question: "How will other platforms fit here later?",
        answer:
          "The site is now grouped by reusable capability clusters such as fee math, compliance, listing quality, and fulfillment, so new platform tools can slot into the same system.",
      },
    ],
  },
  zh: {
    siteName: "电商工具系统",
    siteTagline:
      "面向电商团队的多平台工具系统。",
    browseTools: "打开工具页",
    platformMap: "平台",
    officialRules: "官方规则",
    faq: "常见问题",
    heroTitle: "选择平台",
    heroBody:
      "按平台进入对应工具页。当前可用 Amazon，其他平台会在这里继续补充。",
    startHere: "从这里开始",
    mostSearched: "当前最强工具",
    featuredToolsHeading: "主推工具",
    featuredToolsBody:
      "先进入当前平台最关键的工具，把第一步判断做出来。",
    secondaryToolsHeading: "更多推荐工具",
    secondaryToolsBody:
      "第一步判断完成后，再进入这一层继续推进。",
    seoSupportHeading: "全部保留工具",
    seoSupportBody:
      "其余工具继续保留，方便处理相邻任务。",
    liveNow: "已上线",
    toolsHeading: "当前可直接使用的工具页",
    toolsBody: "从工具页直接进入计算、检查和运营判断。",
    officialHeading: "基于官方知识源",
    officialBody:
      "Amazon 工具现在已经接入本地帮助页、官方分类树和风格指南证据。",
    marketplaceCoverage: "站点覆盖",
    restrictionTopics: "高风险主题",
    matrixHeading: "平台目录",
    matrixBody: "当前 Amazon 已上线，TikTok Shop 已进入工具矩阵，其他平台会继续按同一结构补充。",
    capabilityHeading: "功能能力地图",
    capabilityBody:
      "整站会按卖家真实问题类别来组织，这样后面接入新平台时，不需要把整站重新推翻重建。",
    commonQuestions: "常见问题",
    commonQuestionsBody:
      "第一批工具仍然坚持规则优先，这样页面更实用、更利于收录，也更适合在 AI 能力接入前先稳定拿流量。",
    statCoreSkills: "Amazon 核心技能页",
    statCompanionTools: "实时审核伴随工具",
    statNonAiCandidates: "首批非 AI 候选工具",
    statPriorityLocales: "已上线优先语种",
    coreInputs: "核心输入项",
    officialReferencesLabel: "官方依据",
    openTool: "打开工具",
    currentFocusLabel: "当前重点",
    nextWaveLabel: "下一阶段",
    marketplaceSuffix: "个卖家站点",
    riskThemeSuffix: "个高风险主题",
    capabilityExamplesLabel: "典型类别",
    platformPageWhyTitle: "为什么要有这个平台页",
    platformPageWhyBody:
      "平台页承担的是搜索入口和导航层角色：把核心工具聚合起来，给专项入口留位置，并让长尾流量进入后能顺着正确工具继续走，而不是停在一个没有承接的目录页里。",
    platformPageFitTitle: "卖家最应该先解决哪些问题",
    platformPageFitBody:
      "优先解决费用测算、合规审核、Listing 质量和履约规划。这些是最高频、最容易做成真实可用页面、也最容易稳定拿搜索流量的卖家决策问题。",
    footerSummary:
      "面向电商团队的多平台工具产品，提供计算、检查和分析工具，并支持中英文访问。",
    footerRoadmap: "平台路线",
    footerPlatforms: "平台列表",
    footerLanguages: "站点语种",
    footerPrimaryLanguage: "英文",
    footerSecondaryLanguage: "中文",
    specializedEntry: "专项入口",
    specializedEntriesKicker: "专项切口",
    specializedEntriesTitle: "这些页面解决单点问题，但不是主工具本体",
    specializedEntriesBody:
      "适合快速处理标题、图片、变体或搜索面的单点问题；完整优化、规划和策略决策仍然在上方主工具中完成。",
    categoryDirectoryHeading: "按类别浏览",
    categoryDirectoryBody:
      "按问题类型快速定位对应工具。",
    openCategory: "查看这一类",
    searchIntentHeading: "这个平台页应该承接哪些搜索意图",
    searchIntentBody:
      "优秀的平台页不只是罗列工具，更要承接高意图搜索，帮助卖家判断先处理哪类问题，再自然进入对应的决策页面。",
    searchIntentPoints: [
      "在产品立项前先处理费用、利润率和到岸成本问题",
      "在上架前先处理 Listing、合规和类目准入问题",
      "在运营承压前先处理备货、物流和库存节奏问题",
    ],
    searchIntentCta: "先从下方主工具列表进入，再按最接近的问题类别继续深入。",
    operatorHeading: "面向运营，不是内容填充页",
    operatorBody:
      "每个页面都应该同时承担两种角色：既是能承接搜索流量的真实落地页，也是团队内部可以直接使用的操作界面。用户进来以后，要能快速理解意图、快速开始、快速判断这个页面值不值得长期使用或后续升级。",
    operatorPoints: [
      "搜索页的任务不是只拿曝光，而是先把需求筛清楚。",
      "用户在感受到推销之前，必须先拿到第一层有用结果。",
      "只有页面本身能形成重复使用，后续付费功能才有自然升级空间。",
    ],
    membershipHeading: "未来付费层真正应该提供什么",
    membershipBody:
      "免费层先用确定性工具建立信任。后续的付费价值，应该来自保存记录、持续监控、多人协作和更快决策，而不是只给用户套一层模糊的 AI 壳。",
    membershipPoints: [
      "保存工具运行结果和可复用操作模板",
      "围绕价格、合规、Listing 质量和扩张规划的跨工具监控",
      "适合选品、运营、目录团队协作的共享工作区",
    ],
    commercialCoreHeading: "核心操盘判断",
    commercialCoreBody:
      "先用最少的几个页面判断这个 SKU 的利润结构和起盘方向值不值得继续做。",
    commercialControlHeading: "收入与控制层",
    commercialControlBody:
      "当利润结构成立后，再进入这一层处理价格、搜索位和市场控制问题。",
    commercialRiskHeading: "风险与上线关口",
    commercialRiskBody:
      "这组页面负责把合规、可发现性和类目准入问题挡在前面，避免它们变成昂贵的后果。",
    commercialSupportHeading: "辅助审核层",
    commercialSupportBody:
      "这些页面适合做更深的补充检查，但不应该打断前面的利润判断和起盘主线。",
    commercialAnchorsHeading: "主要付费锚点",
    commercialAnchorsBody:
      "这些是最适合承接保存记录、重复使用、持续监控和后续付费执行层扩展的页面。",
    homepageHeroLabel: "主入口",
    homepageHighLabel: "重点页",
    pageRolePrimaryDecision: "主决策页",
    pageRoleWorkflowAnchor: "操盘锚点",
    pageRoleSpecializedEntry: "专项入口",
    coverageHeading: "当前覆盖快照",
    coverageBody:
      "一个成熟的操盘产品，应该把当前覆盖范围讲清楚。无论是用户还是搜索引擎，都需要快速看到哪些能力已经上线、哪些类别已经成型、哪些区域还在继续扩展。",
    faqItems: [
      {
        question: "这个网站未来要做成什么？",
        answer:
          "它不是只做 Amazon 的专题站，而是要做成覆盖多个电商平台的专业小工具矩阵，先用 Amazon 打样，再逐步扩到其他平台。",
      },
      {
        question: "为什么先做 Amazon？",
        answer:
          "因为 Amazon 的官方知识库、规则文档和可确定逻辑最完整，最适合先做出能跑、能验证、能拿流量的产品。",
      },
      {
        question: "未来新平台如何接入？",
        answer:
          "整站会按“费用测算、合规审核、Listing 质量、履约运营、扩张规划”这些能力层来组织，新平台只需要往同一个能力框架里补工具。",
      },
    ],
  },
} as const;

const toolPageCopy = {
  en: {
    home: "Home",
    browserLogic: "Browser-side deterministic logic",
    officialInputs: "Official knowledge base plus seller inputs",
    requiredInputs: "Required inputs",
    expectedOutputs: "Expected outputs",
    idealForHeading: "Best fit",
    idealForBody:
      "This page works best when the user already knows the operating question and wants a fast first-pass answer before deeper tooling or service work.",
    outputsHeading: "What this page should return",
    outputsBody:
      "The point is not to impress with generic prose. A useful tool page should return concrete outputs the user can act on or carry into the next decision.",
    jumpTo: "Jump to",
    jumpRuntime: "Tool",
    jumpMethod: "Method",
    jumpFit: "Fit and outputs",
    jumpFaq: "FAQ",
    jumpRelated: "Related",
    openImageStudio: "Open image studio",
    imageStudioEyebrow: "Visuals",
    imageStudioTitle: "Create Amazon visuals",
    imageStudioBody:
      "Open the next-step image workspace for A+ modules, listing images, storefront assets, and other Amazon creative work.",
    imageStudioCta: "Open image studio",
    officialAnchors: "Official source anchors",
    methodScope: "Method and scope",
    methodScopeBody:
      "The tool owns the first screen. Supporting reference material stays below the fold so the page behaves like a real utility first.",
    faqHeading: "Questions sellers ask before they trust a tool page",
    relatedHeading: "Related tools",
    relatedBody:
      "Organic traffic should move through a real working path, not stop on a dead-end calculator page.",
    faqKicker: "FAQ",
    specializedEntry: "Specialized entry",
    pageRolePrimaryDecision: "Primary decision page",
    pageRoleWorkflowAnchor: "Operator anchor",
    pageRoleSpecializedEntry: "Specialized entry",
    specializedEntries: "Specialized entries",
    openParentSkill: "Open parent skill",
    autoDataHint:
      "ASIN or URL goes first: the tool auto-fetches and infers wherever possible; manual fields are advanced overrides.",
    parentSkillIntro:
      "This page is a specialized entry cut from a broader skill. It is useful for one narrow task, but the full workflow and higher-value decisions live on the parent skill page.",
    specializedEntriesHeading:
      "Jump from the primary skill into high-frequency specialized checks",
    specializedEntriesBody:
      "These pages isolate one narrow task. They are useful for fast checks, but the full decision flow still belongs to this primary skill.",
    specializedFaqQuestion: "Why is this page not the full primary tool?",
    specializedFaqAnswerPrefix:
      "Because it isolates one high-frequency task from the broader source skill. Full optimization, planning, and benchmarking still happen in",
    searchIntentHeading: "What search intent this page should satisfy",
    searchIntentBody:
      "A strong tool page should answer the first real seller question quickly, show the decision boundary clearly, and make the next operational move obvious without forcing a long read.",
    searchIntentPoints: [
      "Users searching for a fast first-pass answer before they commit time or budget",
      "Operators comparing one narrow execution decision instead of buying a full service yet",
      "Teams that need a practical output they can carry into the next tool or internal review",
    ],
    conversionHeading: "What makes this page worth returning to",
    conversionBody:
      "A useful tool page should help the user decide faster today, then make a stronger case for repeat usage tomorrow. That means practical output now, clearer decision boundaries, and a visible path into adjacent tasks.",
    conversionPoints: [
      "Fast first-pass utility without setup friction",
      "Clear scope so the user knows what this page does and does not solve",
      "Adjacent tool links that keep the session moving instead of ending on one calculation",
    ],
    operatorConfidenceHeading: "Why the output is meant to feel trustworthy",
    operatorConfidenceBody:
      "This layer stays grounded in deterministic checks, marketplace rules, and explicit inputs so the user can understand where the answer came from before deciding whether to pay for deeper operator support later.",
  },
  zh: {
    home: "首页",
    browserLogic: "浏览器端确定性逻辑",
    officialInputs: "官方知识库加卖家输入",
    requiredInputs: "启动所需输入",
    expectedOutputs: "工具输出结果",
    idealForHeading: "适合谁用",
    idealForBody:
      "当用户已经知道自己要解决什么问题，只想先快速拿到第一轮判断，而不是立刻进入更重的系统或服务流程时，这个页面最合适。",
    outputsHeading: "这个页面应该给出什么结果",
    outputsBody:
      "目标不是堆一段泛泛描述，而是返回用户能立刻使用、或者能直接带入下一步操盘判断的具体输出。",
    jumpTo: "快速跳转",
    jumpRuntime: "工具区",
    jumpMethod: "方法说明",
    jumpFit: "适合谁用与输出",
    jumpFaq: "常见问题",
    jumpRelated: "相关工具",
    openImageStudio: "打开图片工作台",
    imageStudioEyebrow: "图片工具",
    imageStudioTitle: "创建 Amazon 视觉内容",
    imageStudioBody:
      "进入下一步图片工作台，用于处理 A+ 模块、商品图、店铺素材和其他 Amazon 视觉内容任务。",
    imageStudioCta: "打开图片工作台",
    officialAnchors: "官方证据锚点",
    methodScope: "方法与边界",
    methodScopeBody:
      "先把可操作的工具放在前面，补充说明放在下方，让用户先用起来，再理解方法和边界。",
    faqHeading: "卖家在信任工具之前最常问的问题",
    relatedHeading: "相关工具",
    relatedBody:
      "进入页面后，用户应该能顺着相邻问题继续走，而不是停在一个孤立工具页上。",
    faqKicker: "常见问题",
    specializedEntry: "专项入口",
    pageRolePrimaryDecision: "主决策页",
    pageRoleWorkflowAnchor: "操盘锚点",
    pageRoleSpecializedEntry: "专项入口",
    specializedEntries: "专项入口",
    openParentSkill: "前往主工具",
    autoDataHint: "优先通过 ASIN 或 URL 自动抓取并推断，手工字段仅作为高级覆盖。",
    parentSkillIntro:
      "这个页面是从更完整的主工具中拆出的专项入口，适合快速处理单一问题；完整操盘路径和更高价值的决策仍然以主工具页面为准。",
    specializedEntriesHeading: "从主工具直接进入高频专项检查",
    specializedEntriesBody:
      "这些页面只负责解决单点问题。它们适合快速检查，但完整决策仍然以当前主工具为准。",
    specializedFaqQuestion: "为什么这个页面不是完整主工具？",
    specializedFaqAnswerPrefix:
      "因为它只切出了主工具里的一个高频专项任务。完整的优化、规划和竞争分析仍在",
    searchIntentHeading: "这个页面应该满足什么搜索意图",
    searchIntentBody:
      "一个好的工具页，应该先回答用户最关心的第一个问题，清楚说明页面边界，并让下一步动作足够明确。",
    searchIntentPoints: [
      "只想先快速拿到第一轮判断、还不准备投入更多时间或预算的用户",
      "暂时只在比较某个单点运营决策、还不需要整套服务的运营团队",
      "需要把当前输出直接带入下一工具或内部复核流程的使用者",
    ],
    conversionHeading: "为什么这个页面值得反复回来用",
    conversionBody:
      "一个好的工具页，不只是在今天帮用户更快做出判断，也要让用户下次遇到同类问题时愿意继续回来用。为此，它需要同时做到输出实用、边界清楚、路径连贯。",
    conversionPoints: [
      "几乎没有学习成本的首轮实用价值",
      "清楚说明这个页面解决什么、不解决什么",
      "把用户自然带到相邻操盘页，而不是停在一次计算结果上",
    ],
    operatorConfidenceHeading: "为什么这个结果层值得信任",
    operatorConfidenceBody:
      "当前页面优先建立在确定性检查、平台规则和明确输入之上，让用户先看懂结果从哪里来，再决定是否需要更深的操盘支持或后续付费能力。",
  },
} as const;

const runtimeCopy = {
  en: {
    liveTool: "Live tool",
    deterministic: "Turns live inputs into a decision board you can act on immediately.",
    currentResult: "Current result",
    resultPanel: "Result panel",
    resultPrompt:
      "Fill the inputs and the tool will return concrete calculations, scores, and next actions.",
    reviewStatus: "Review status",
    resultSummary: "Result summary",
    missing: "Missing",
    risks: "Risks",
    nextSteps: "Next steps",
    officialGuideEvidence: "Official guide evidence",
    ready: "Ready",
    needsReview: "Needs review",
    blocked: "Blocked",
    noMissingYet: "No additional missing item outranks the next operator move.",
    noMajorRiskYet: "No secondary risk outranks the main decision already on the board.",
  },
  zh: {
    liveTool: "实时工具",
    deterministic: "把实时输入直接整理成可执行的决策看板。",
    currentResult: "当前结果",
    resultPanel: "结果面板",
    resultPrompt:
      "填写输入项后，工具会直接返回计算结果、风险判断和下一步建议。",
    reviewStatus: "审核状态",
    resultSummary: "核心结论",
    missing: "缺失项",
    risks: "风险点",
    nextSteps: "执行建议",
    officialGuideEvidence: "官方风格证据",
    ready: "可用",
    needsReview: "需复核",
    blocked: "阻塞",
    noMissingYet: "当前没有比下一步动作优先级更高的缺失项。",
    noMajorRiskYet: "当前没有比主决策更高优先级的次级风险。",
  },
} as const;

const categoryLabels = {
  en: {
    Calculator: "Calculator",
    Advertising: "Advertising",
    Compliance: "Compliance",
    Growth: "Growth",
    Listing: "Listing quality",
    Operations: "Operations",
    Eligibility: "Eligibility",
    Research: "Research",
  },
  zh: {
    Calculator: "计算工具",
    Advertising: "广告投放",
    Compliance: "合规审核",
    Growth: "增长策略",
    Listing: "商品页质量",
    Operations: "运营履约",
    Eligibility: "准入资格",
    Research: "调研分析",
  },
} as const;

const intentLabels = {
  en: {
    "Commercial investigation": "Commercial investigation",
    "Problem solving": "Problem solving",
  },
  zh: {
    "Commercial investigation": "商业调研",
    "Problem solving": "问题处理",
  },
} as const;

const toolTranslations: Record<
  string,
  {
    zh: {
      name: string;
      summary: string;
      seoTitle?: string;
      seoDescription?: string;
      idealFor?: string[];
      outputs?: string[];
      methodology?: string[];
      faqs?: { question: string; answer: string }[];
    };
  }
> = {
  "amazon-fba-calculator": {
    zh: {
      name: "亚马逊 FBA 费用计算器",
      summary: "在备货前快速估算 FBA 费用、佣金、利润率和 ROI。",
      seoTitle: "亚马逊 FBA 费用计算器 | 利润率与 ROI 预估",
      seoDescription: "面向亚马逊卖家的 FBA 费用测算工具，适合快速评估 SKU 的成本和利润空间。",
      idealFor: [
        "正在验证新 SKU 的自有品牌卖家",
        "补货前先检查利润空间的批发型卖家",
        "需要清晰客户输入清单的代运营团队",
      ],
      outputs: [
        "预估佣金",
        "预估履约费用",
        "单件利润与利润率",
        "ROI 预估",
        "包装和定价压力提示",
      ],
      methodology: [
        "优先使用卖家提供的产品属性，而不是猜测平台数据。",
        "把确定性费用计算和解释性说明分开，保证结果可复核。",
        "明确提示缺失输入，避免用户对结果产生虚假确定感。",
      ],
      faqs: [
        {
          question: "这个页面现在已经接入 Amazon 实时费用 API 了吗？",
          answer:
            "还没有。当前版本先作为结构化落地页和准备流程使用，后续可以在同一 URL 下接入完整费用引擎。",
        },
        {
          question: "为什么先做 FBA 费用计算器？",
          answer:
            "因为这个关键词需求稳定、商业意图明确，而且产品可以先用确定性逻辑验证，不需要依赖主观模型输出。",
        },
      ],
    },
  },
  "tariff-calculator-amazon": {
    zh: {
      name: "亚马逊关税与到岸成本计算器",
      summary: "在下单和采购前估算关税、VAT/GST 和单件到岸成本压力。",
      seoTitle: "亚马逊关税计算器 | 到岸成本与进口税预估",
      seoDescription: "帮助卖家估算进口关税、增值税和到岸成本的跨境成本工具。",
      idealFor: [
        "从中国或东南亚采购的跨境 Amazon 卖家",
        "下 PO 前需要比较不同运输路径的运营团队",
        "准备进入新税务辖区的品牌方",
      ],
      outputs: [
        "预估关税负担",
        "预估单件到岸成本",
        "路径层面的利润压力",
        "报关资料清单",
        "面向税务敏感型上新的风险提示",
      ],
      methodology: [
        "把报关和税务假设写明，方便用户复核和质疑。",
        "将关税逻辑与 VAT/GST 逻辑拆开呈现，便于审核。",
        "页面定位为规划支持工具，不替代法律或税务意见。",
      ],
      faqs: [
        {
          question: "这个工具能替代报关行或清关代理吗？",
          answer:
            "不能。它的作用是帮助卖家先判断成本暴露和所需输入，再去和报关行或物流伙伴沟通。",
        },
        {
          question: "为什么这是一个很强的 SEO 页面？",
          answer:
            "因为搜索意图具体、常年存在，而且离采购决策很近，比泛化的策略内容更适合做第一批自然流量入口。",
        },
      ],
    },
  },
  "amazon-shipping-calculator": {
    zh: {
      name: "亚马逊物流成本计算器",
      summary: "快速测算 FBA/FBM 物流负担、仓储压力和体积重风险。",
      seoTitle: "亚马逊物流成本计算器 | FBA、FBM 与仓储成本测算",
      seoDescription: "帮助卖家快速测算 FBA/FBM 物流、仓储和体积重压力的实用工具。",
      idealFor: [
        "正在比较 FBA 和 FBM 的卖家",
        "想通过包装重设计保护利润的品牌方",
        "需要预估仓储费和移除费压力的运营团队",
      ],
      outputs: [
        "预估履约负担",
        "仓储压力信号",
        "体积重预警",
        "潜在包装优化方向",
        "建议继续使用的下一步工具",
      ],
      methodology: [
        "先收集运营输入，再用直白语言解释成本压力。",
        "优先展示影响最大的物流变量，再引入更进阶的假设。",
        "通过内部链接把用户带向相邻工具，既利于收录也利于留存。",
      ],
      faqs: [
        {
          question: "这个页面现在就等于完整的运营模拟器吗？",
          answer:
            "还不是。它当前的任务是先承接流量，并把用户带入更深的工具流程，完整计算层后续再继续补齐。",
        },
        {
          question: "谁最适合先用这个页面？",
          answer:
            "体积大、仓储季节性风险高，或者在 FBA 与 FBM 之间犹豫的卖家最适合先用这个工具。",
        },
      ],
    },
  },
  "amazon-product-compliance": {
    zh: {
      name: "亚马逊产品合规检查器",
      summary: "在上架前判断产品可能需要的认证、标签和证据文件。",
      seoTitle: "亚马逊产品合规检查器 | 认证与资料准备度评估",
      seoDescription: "用于判断产品认证、标签和合规资料缺口的亚马逊工具页。",
      idealFor: [
        "进入受监管类目的进口商",
        "在放量前审查高风险 Listing 的代运营团队",
        "准备带新宣称进入欧美市场的品牌方",
      ],
      outputs: [
        "可能需要的资料清单",
        "潜在认证缺口",
        "不同市场的风险提示",
        "上架前证据准备清单",
        "需要专家复核时的升级提醒",
      ],
      methodology: [
        "不要把这个检查器包装成法律意见。",
        "优先发现证据缺失，而不是制造虚假确定性。",
        "围绕卖家真正要准备的资料，用直白语言输出结论。",
      ],
      faqs: [
        {
          question: "没有完整后台工具，合规检查页也能拿到搜索流量吗？",
          answer:
            "可以，只要它能直接回答清单问题，并且方法、边界、免责声明和相关指引都足够清楚。",
        },
        {
          question: "为什么第一版要尽量少用 AI？",
          answer:
            "因为合规建议一旦幻觉化，风险会远高于一个明确说明边界的结构化清单。",
        },
      ],
    },
  },
  "amazon-listing-title-checker": {
    zh: {
      name: "亚马逊 Listing 标题检查器",
      summary: "检查标题长度、结构、重复词和类目风格是否合规。",
      seoTitle: "亚马逊标题检查器 | 标题长度、结构与合规审核",
      seoDescription: "帮助卖家检查 Amazon 标题长度、品牌位置、重复词和类目风格规则的工具。",
      idealFor: [
        "正在准备新 Listing 的目录团队",
        "上传前复核标题改写稿的代运营团队",
        "因抑制或浏览质量问题而清理标题的卖家",
      ],
      outputs: [
        "标题长度与可读性信号",
        "重复词与禁用短语预警",
        "品牌位置与属性覆盖检查",
        "类目风格证据提示",
        "优先改写动作",
      ],
      methodology: [
        "在任何主观文案建议之前，先按可审计的结构规则打分。",
        "围绕类目风格指南给出预警和建议，而不是泛泛而谈。",
        "输出以便于一轮改完为目标，而不是只做抽象评论。",
      ],
      faqs: [
        {
          question: "这个工具会直接生成一个新的标题吗？",
          answer:
            "当前版本不会。它先诊断现有标题的问题，帮助卖家更有把握地修正结构、重复词和类目规则缺口。",
        },
        {
          question: "为什么标题审核要先走确定性逻辑？",
          answer:
            "因为卖家先需要一个可复核的过滤层，之后才会真正信任生成式标题建议。",
        },
      ],
    },
  },
  "amazon-image-compliance-checker": {
    zh: {
      name: "亚马逊图片合规检查器",
      summary: "检查主图白底、图片数量、场景图和细节图覆盖是否达标。",
      seoTitle: "亚马逊图片合规检查器 | 主图、场景图与细节图审核",
      seoDescription: "帮助卖家检查 Amazon 主图规则、图片结构和类目图片要求的工具。",
      idealFor: [
        "准备上线视觉素材的品牌方",
        "上传前做上线复核的拍摄或设计团队",
        "想减少图片抑制和转化流失的运营人员",
      ],
      outputs: [
        "图片组完整度评分",
        "主图合规预警",
        "场景图、比例图、细节图覆盖缺口",
        "类目风格证据提示",
        "上传前的下一步图片动作",
      ],
      methodology: [
        "把主图视为硬门槛，其余图片视为转化准备层。",
        "将白底和无叠字检查与更广义的讲故事建议分开。",
        "借助类目风格证据，避免给出一刀切的图片建议。",
      ],
      faqs: [
        {
          question: "这个工具已经能直接分析上传后的真实图片了吗？",
          answer:
            "还没有。当前版本主要评估团队准备上传的图片结构和合规条件。",
        },
        {
          question: "为什么光看图片数量还不够？",
          answer:
            "因为 Amazon 图片质量更关键的是角色覆盖，比如主图、细节图、比例图、场景图以及变体安全使用。",
        },
      ],
    },
  },
  "shopify-product-page-audit": {
    zh: {
      name: "Shopify 商品页审计",
      summary: "找出商品页最伤转化的问题、哪些可以先不动、以及第一步先改什么。",
      seoTitle: "Shopify 商品页审计 | PDP 转化问题与优先修正项",
      seoDescription: "用于审查 Shopify 商品页层级、信任感和转化摩擦点的在线工具。",
    },
  },
  "shopify-review-mining": {
    zh: {
      name: "Shopify 评论挖掘",
      summary: "把评论压成卖点表达、异议处理和最该先修的问题。",
      seoTitle: "Shopify 评论挖掘 | 卖点、异议与用户语言提炼",
      seoDescription: "把评论文本压成商品页和创意都能直接使用的卖点、异议和修正方向。",
    },
  },
  "shopify-competitor-teardown": {
    zh: {
      name: "Shopify 竞品拆解",
      summary: "对比你和竞品的页面，找出定位、offer 和转化上的关键差距。",
      seoTitle: "Shopify 竞品拆解 | 定位、Offer 与转化差距分析",
      seoDescription: "帮助 Shopify 团队对比竞品页面、定位与转化承接方式的在线工具。",
    },
  },
  "shopify-offer-positioning": {
    zh: {
      name: "Shopify Offer 定位器",
      summary: "把产品和证明材料压成用户更容易理解的 offer 角度和购买理由。",
      seoTitle: "Shopify Offer 定位器 | 卖点角度与购买理由设计",
      seoDescription: "用于压出更清晰的 offer 角度、差异化和购买动机的 Shopify 工具页。",
    },
  },
  "shopify-email-flow-planner": {
    zh: {
      name: "Shopify 邮件流程规划器",
      summary: "把生命周期目标转成第一批该搭建的邮件流程、触发条件和消息角色。",
      seoTitle: "Shopify 邮件流程规划器 | 生命周期 Flow 与触发设计",
      seoDescription: "用于决定欢迎流、弃购流和复购流先后顺序的 Shopify 工具页。",
    },
  },
  "shopify-ugc-brief-builder": {
    zh: {
      name: "Shopify UGC Brief 生成器",
      summary: "把受众张力和证明材料直接变成创作者能拍的 UGC brief。",
      seoTitle: "Shopify UGC Brief 生成器 | 场景、证明点与 CTA 设计",
      seoDescription: "帮助 Shopify 团队快速生成创作者 UGC 拍摄 brief 的在线工具。",
    },
  },
  "shopify-landing-page-angle-builder": {
    zh: {
      name: "Shopify 落地页角度生成器",
      summary: "找出最适合这波流量的落地页首屏角度和证明顺序。",
      seoTitle: "Shopify 落地页角度生成器 | 首屏角度与 Above-the-fold 结构",
      seoDescription: "用于找出冷流量落地页最合适的首屏角度、证明顺序和转化结构。",
    },
  },
  "shopify-bundle-offer-designer": {
    zh: {
      name: "Shopify Bundle Offer 设计器",
      summary: "看什么 bundle offer 更容易拉高 AOV，又不把页面讲乱。",
      seoTitle: "Shopify Bundle Offer 设计器 | 组合方案、AOV 与价格结构",
      seoDescription: "用于判断什么 bundle offer 更容易拉高 AOV 且不把页面讲乱。",
    },
  },
  "shopify-subscription-planner": {
    zh: {
      name: "Shopify 订阅规划器",
      summary: "看订阅结构、复购节奏和折扣边界值不值得上线。",
      seoTitle: "Shopify 订阅规划器 | 复购节奏、折扣护栏与上线判断",
      seoDescription: "用于判断订阅结构、复购节奏和折扣边界是否值得上线。",
    },
  },
  "shopify-quiz-planner": {
    zh: {
      name: "Shopify Quiz 与获客规划器",
      summary: "决定 quiz、pop-up 和后续承接该怎么接起来。",
      seoTitle: "Shopify Quiz 与获客规划器 | 分群路径、问题流与跟进承接",
      seoDescription: "用于决定 quiz、pop-up 与后续邮件短信该怎么接的 Shopify 工具页。",
    },
  },
  "shopify-collection-page-audit": {
    zh: {
      name: "Shopify Collection 页审计",
      summary: "找出 collection 页在商品组织、筛选和陈列上的主要问题。",
      seoTitle: "Shopify Collection 页审计 | 商品组织、筛选与陈列优化",
      seoDescription: "用于检查 collection 页面陈列、筛选逻辑和转化摩擦的 Shopify 工具页。",
    },
  },
  "shopify-creative-testing-matrix": {
    zh: {
      name: "Shopify 创意测试矩阵",
      summary: "把 offer、证明和用户张力排成优先级清楚的创意测试顺序。",
      seoTitle: "Shopify 创意测试矩阵 | Hook、证明与首轮测试计划",
      seoDescription: "用于排出创意测试矩阵、hook 优先级和首轮验证顺序的 Shopify 工具页。",
    },
  },
  "shopify-pricing-test-planner": {
    zh: {
      name: "Shopify 定价测试规划器",
      summary: "把价格、折扣和毛利限制压成一轮能直接执行的定价测试。",
      seoTitle: "Shopify 定价测试规划器 | 价格带、折扣护栏与测试板",
      seoDescription: "用于制定价格测试、折扣边界和胜负规则的 Shopify 工具页。",
    },
  },
  "shopify-pdp-copy-assembler": {
    zh: {
      name: "Shopify PDP 文案组装器",
      summary: "把 angle、proof 和 objection 直接变成可改页的 PDP 文案。",
      seoTitle: "Shopify PDP 文案组装器 | Hero、证明顺序与 CTA 改写",
      seoDescription: "用于把页面判断和用户语言直接变成 PDP 改写稿的 Shopify 工具页。",
    },
  },
  "shopify-post-purchase-flow-planner": {
    zh: {
      name: "Shopify 售后流程规划器",
      summary: "把售后预期、使用激活和二购目标排成一条可执行的售后流程。",
      seoTitle: "Shopify 售后流程规划器 | 激活、教育与二购承接",
      seoDescription: "用于排出 post-purchase 流程、使用教育和二购承接顺序的 Shopify 工具页。",
    },
  },
  "shopify-returns-friction-audit": {
    zh: {
      name: "Shopify 退货摩擦审计",
      summary: "看清退货是被什么拖出来的，以及第一步该修哪一处。",
      seoTitle: "Shopify 退货摩擦审计 | 预期落差、利润漏损与修复优先级",
      seoDescription: "用于检查退货风险、预期差和售后摩擦的 Shopify 工具页。",
    },
  },
  "shopify-faq-objection-builder": {
    zh: {
      name: "Shopify FAQ 与异议构建器",
      summary: "把异议和证明缺口直接变成可上页的 FAQ 与解答顺序。",
      seoTitle: "Shopify FAQ 与异议构建器 | FAQ 结构、异议梯度与证明补位",
      seoDescription: "用于把常见异议和 FAQ 问题压成页面与客服都能直接用的内容。",
    },
  },
  "shopify-reorder-reminder-planner": {
    zh: {
      name: "Shopify 补货提醒规划器",
      summary: "把使用周期和复购节奏排成一套可执行的补货提醒。",
      seoTitle: "Shopify 补货提醒规划器 | 补货节奏、触发窗口与收入护栏",
      seoDescription: "用于安排补货提醒、复购触发和优惠护栏的 Shopify 工具页。",
    },
  },
  "shopify-promo-calendar-planner": {
    zh: {
      name: "Shopify 活动日历规划器",
      summary: "把库存压力和推广窗口排成一份能执行的活动日历。",
      seoTitle: "Shopify 活动日历规划器 | 活动节奏、渠道角色与毛利护栏",
      seoDescription: "用于排出 30 到 60 天活动节奏、渠道分工和止损规则的 Shopify 工具页。",
    },
  },
  "shopify-merchandising-priority-mapper": {
    zh: {
      name: "Shopify 陈列优先级映射器",
      summary: "看清哪些商品该做 Hero 位，以及流量最该先送去哪里。",
      seoTitle: "Shopify 陈列优先级映射器 | Hero SKU、流量去向与页面角色",
      seoDescription: "用于决定类目陈列、主推商品和页面分工的 Shopify 工具页。",
    },
  },
  "shopify-launch-readiness-scorecard": {
    zh: {
      name: "Shopify 上线准备度评分卡",
      summary: "看当前页面和运营状态是能上线、该暂缓，还是要先修。",
      seoTitle: "Shopify 上线准备度评分卡 | 上线判断、关键修复与责任分配",
      seoDescription: "用于判断当前页面和运营状态是否适合上线推广的 Shopify 工具页。",
    },
  },
  "shopify-channel-landing-router": {
    zh: {
      name: "Shopify 渠道路由落地页规划器",
      summary: "看不同渠道流量最适合落到哪一种页面。",
      seoTitle: "Shopify 渠道路由落地页规划器 | 流量去向、页面角色与修复优先级",
      seoDescription: "用于决定不同渠道流量该落 PDP、landing page、quiz 还是 collection 的 Shopify 工具页。",
    },
  },
  "amazon-variation-relationship-checker": {
    zh: {
      name: "亚马逊变体关系检查器",
      summary: "检查 parent-child 变体关系是否一致、是否混入无效主题。",
      seoTitle: "亚马逊变体关系检查器 | Parent Child 结构审核",
      seoDescription: "帮助卖家检查 Amazon 变体主题、父子关系和混合商品风险的工具。",
      idealFor: [
        "正在搭建父子变体家族的目录团队",
        "清理重复子 ASIN 的卖家",
        "上传平铺表前审查变体申请的代运营团队",
      ],
      outputs: [
        "变体准备度评分",
        "无效混搭家族预警",
        "主题和标题一致性检查",
        "类目风格证据提示",
        "推荐清理动作",
      ],
      methodology: [
        "重点判断父子家族是否围绕同一核心产品、只发生有效属性变化。",
        "当不同产品、套装逻辑或品牌不一致被硬塞进同一家族时尽早预警。",
        "利用类目风格证据，是因为不同垂类对变体的要求并不一样。",
      ],
      faqs: [
        {
          question: "这个工具能保证 Amazon 一定接受这个变体家族吗？",
          answer:
            "不能。它是一个预检工具，用来在数据进入 Seller Central 之前先减少明显结构错误。",
        },
        {
          question: "它最常抓到的失败模式是什么？",
          answer:
            "团队经常把不同产品、混合套装逻辑，或者标题完全不一致的子体硬挂到同一个父体下面，而真正允许的只有属性变化。",
        },
      ],
    },
  },
  "amazon-browse-search-keyword-checker": {
    zh: {
      name: "亚马逊类目与搜索关键词检查器",
      summary: "检查类目路径、标题关键词和后台搜索词之间是否匹配。",
      seoTitle: "亚马逊类目与搜索关键词检查器 | 路径与关键词匹配审核",
      seoDescription: "帮助卖家检查 Amazon 类目路径、核心词覆盖和关键词堆砌风险的工具。",
      idealFor: [
        "准备重做弱 Listing 再上线的卖家",
        "平铺表上传前复核 SEO 输入的团队",
        "想尽早发现类目路径和搜索词错位的代运营团队",
      ],
      outputs: [
        "关键词覆盖评分",
        "缺失描述词和堆砌预警",
        "标题与后台搜索词重叠检查",
        "类目浏览与搜索证据提示",
        "优先优化动作",
      ],
      methodology: [
        "先看类目和 browse path 是否匹配，再看关键词密度。",
        "对重复词和后台词重复做扣分，因为可发现性更依赖干净覆盖，而不是堆砌。",
        "使用类目浏览与搜索规则证据，让建议始终贴近 Amazon 实际规则。",
      ],
      faqs: [
        {
          question: "这个工具能替代关键词调研吗？",
          answer:
            "不能。它的作用是检查你已经选好的关键词，是否合理地分布在 Listing 结构里，并且避免重复。",
        },
        {
          question: "为什么把 browse 和 search 放在一个页面里？",
          answer:
            "因为很多 Amazon Listing 问题并不是单纯的词量问题，而是类目路径、item type 和关键词摆放之间的组合问题。",
        },
      ],
    },
  },
  "amazon-brand-registry": {
    zh: {
      name: "亚马逊品牌备案准备度检查器",
      summary: "判断当前品牌是否已具备申请 Brand Registry 的准备条件。",
      seoTitle: "亚马逊品牌备案检查器 | Brand Registry 准备度评估",
      seoDescription: "帮助卖家判断品牌备案资料是否齐备的准备度检查工具。",
      idealFor: [
        "刚开始做自有品牌的新卖家",
        "准备申请 A+ 权限的成长型品牌",
        "正在规划品牌防御动作的运营团队",
      ],
      outputs: [
        "申请准备度评分",
        "缺失资料清单",
        "优先下一步动作",
        "提交前常见阻塞点",
        "备案后可继续利用的相关机会",
      ],
      methodology: [
        "把页面锚定在真实里程碑上，而不是抽象品牌建议。",
        "优先显式暴露证据缺口，因为这才是用户真正的阻力。",
        "把备案准备度和 A+、Brand Analytics 等下游能力连起来。",
      ],
      faqs: [
        {
          question: "为什么第一批先做这个，而不是 A+ 内容生成？",
          answer:
            "因为这个搜索意图更窄、流程更确定，用户也能先自我判断，而不需要依赖生成式文案。",
        },
        {
          question: "这个页面为什么更符合 E-E-A-T？",
          answer:
            "因为它明确列出输入、流程、边界和后续决策，而不是伪装成官方来源。",
        },
      ],
    },
  },
  "amazon-category-ungating": {
    zh: {
      name: "亚马逊类目解封准备度检查器",
      summary: "在采购前预判受限类目的资料要求和审批阻塞点。",
      seoTitle: "亚马逊类目解封检查器 | Ungating 准备度评估",
      seoDescription: "帮助卖家检查受限类目审批资料、发票与授权缺口的工具。",
      idealFor: [
        "试探受限类目的新卖家",
        "采购前需要先审发票条件的批发型卖家",
        "替客户准备审批资料的代运营团队",
      ],
      outputs: [
        "可能的审批路径",
        "资料缺口",
        "潜在拒批风险",
        "供应商证明清单",
        "需要继续查看的相关合规页面",
      ],
      methodology: [
        "把准入问题当作证据准备度问题，而不是做鼓励式文案。",
        "使用类目特定问题，避免页面过宽过薄。",
        "强化内部链接，因为卖家通常会继续走向合规或品牌备案页面。",
      ],
      faqs: [
        {
          question: "这个页面以后能在不改 URL 的情况下升级成真正的工具吗？",
          answer:
            "可以。第一版先做强准备流程，后面再在同一个 slug 下长成更动态的资料评分工具。",
        },
        {
          question: "这个页面的 SEO 角度是什么？",
          answer:
            "这类审批型搜索通常转化更强，因为搜索者往往已经处在采购或上新流程里。",
        },
      ],
    },
  },
  "amazon-fba-prep": {
    zh: {
      name: "亚马逊 FBA 备货清单工具",
      summary: "把包装、贴标和入仓准备要求整理成清晰的操作清单。",
      seoTitle: "亚马逊 FBA 备货清单 | 包装、贴标与入仓准备",
      seoDescription: "面向亚马逊卖家的 FBA 备货、包装和贴标准备清单工具。",
      idealFor: [
        "第一次发送 FBA 货件的卖家",
        "正在建立备货 SOP 的 3PL 团队",
        "想减少仓库拒收风险的运营人员",
      ],
      outputs: [
        "按货件类型生成的备货清单",
        "标签和包装缺口",
        "可能的拒收点",
        "给仓库或备货中心的交接说明",
        "建议继续使用的成本类工具",
      ],
      methodology: [
        "页面要足够具体、足够能执行，而不是讲概念。",
        "围绕真实发货任务组织内容，才能形成收藏和重复回访。",
        "用卖家本来就在搜索的程序化语言来支撑 SEO。",
      ],
      faqs: [
        {
          question: "为什么清单型页面值得先做？",
          answer:
            "因为备货和发货意图长期存在、非常实操，也比内容生成类工具更不依赖假想的 AI 价值。",
        },
        {
          question: "这种页面本身能带来自然流量吗？",
          answer:
            "可以，只要它足够具体、足够程序化，并且和相邻计算器与准备流程有自然连接。",
        },
      ],
    },
  },
  "amazon-inventory-management": {
    zh: {
      name: "亚马逊库存补货规划器",
      summary: "帮助卖家评估补货时点、断货风险和交期压力。",
      seoTitle: "亚马逊库存规划器 | 补货时点与断货风险评估",
      seoDescription: "帮助卖家评估库存覆盖天数、补货时点和断货风险的规划工具。",
      idealFor: [
        "供应链交期较长的品牌方",
        "Prime Day 或 Q4 临近的运营团队",
        "想减少断货和滞销库存的团队",
      ],
      outputs: [
        "补货紧迫度信号",
        "安全库存规划说明",
        "活动期风险预警",
        "补货时点清单",
        "延伸到运费和费用页面的规划入口",
      ],
      methodology: [
        "尽量围绕卖家本来就知道的输入构建页面。",
        "优先用距离断货还有多久来组织逻辑，因为这最贴近真实运营问题。",
        "把常规流程建议与活动季节性规划拆开处理。",
      ],
      faqs: [
        {
          question: "为什么库存管理也要放进第一批工具？",
          answer:
            "因为它承接的是长期存在的运营搜索需求，也天然适合后续扩展成保存结果和告警能力。",
        },
        {
          question: "这个页面第一天就需要接 Amazon 实时库存 API 吗？",
          answer:
            "不需要。它可以先靠强规划内容和结构化输入流程拿流量，后续再补保存和动态计算能力。",
        },
      ],
    },
  },
  "tiktok-shop-seller-intake": {
    zh: {
      name: "TikTok Shop 卖家起步梳理",
      summary: "先看清卖家现状、主要限制和最合适的起步路径。",
      seoTitle: "TikTok Shop 卖家起步梳理 | 卖家方案与起步路径",
      seoDescription: "用于看清 TikTok Shop 卖家身份、目标、资源和限制后，决定最合适起步路径的工具页。",
    },
  },
  "tiktok-shop-product-research": {
    zh: {
      name: "TikTok Shop 选品调研",
      summary: "比较需求、内容适配和利润空间，选出最值得先测的商品方向。",
      seoTitle: "TikTok Shop 选品调研 | 商品方向与商业可行性判断",
      seoDescription: "用于比较 TikTok Shop 商品机会、内容适配度和商业可行性后选出首测方向。",
    },
  },
  "tiktok-shop-hook-writing": {
    zh: {
      name: "TikTok Shop 视频开场钩子",
      summary: "把产品角度和证明素材压成最值得先测的一组开场钩子。",
      seoTitle: "TikTok Shop 视频开场钩子 | 短视频开头与内容角度",
      seoDescription: "用于把 TikTok Shop 短视频的开场方向、证明前置和测试角度压成可拍内容。",
    },
  },
  "tiktok-shop-short-video-brief": {
    zh: {
      name: "TikTok Shop 短视频脚本单",
      summary: "把已选钩子直接变成可拍的短视频结构、镜头顺序和拍摄清单。",
      seoTitle: "TikTok Shop 短视频脚本单 | 脚本结构与拍摄清单",
      seoDescription: "用于把 TikTok Shop 商品内容角度直接变成可拍的短视频脚本。",
    },
  },
  "tiktok-shop-product-performance": {
    zh: {
      name: "TikTok Shop 商品表现决策",
      summary: "根据流量、转化和利润，判断商品该继续放量、重做还是停掉。",
      seoTitle: "TikTok Shop 商品表现决策 | 放量、暂缓与停测判断",
      seoDescription: "用于根据 TikTok Shop 商品的转化、利润与内容效率判断该继续、重做还是停掉。",
    },
  },
  "tiktok-shop-kill-rules": {
    zh: {
      name: "TikTok Shop 停测规则",
      summary: "给弱商品和弱测试写清楚停掉、延长观察还是带条件重试的规则。",
      seoTitle: "TikTok Shop 停测规则 | 停掉、延长与重试判断",
      seoDescription: "帮助卖家在 TikTok Shop 中为弱商品和弱内容建立更明确的停测与重试规则。",
    },
  },
  "tiktok-shop-creator-research": {
    zh: {
      name: "TikTok Shop 达人研究",
      summary: "找出最值得先参考的达人类型和内容样板。",
      seoTitle: "TikTok Shop 达人研究 | 达人类型与内容样板判断",
      seoDescription: "用于找出 TikTok Shop 最值得参考的达人风格、对象和内容差距。",
    },
  },
  "tiktok-shop-content-strategy": {
    zh: {
      name: "TikTok Shop 内容策略",
      summary: "按商品方向和团队产能，确定最能持续执行的内容组合与发布节奏。",
      seoTitle: "TikTok Shop 内容策略 | 内容组合与发布方向",
      seoDescription: "用于把 TikTok Shop 的商品方向、达人路径和发布节奏压成可执行内容方向。",
    },
  },
  "amazon-profit-analyzer": {
    zh: {
      name: "亚马逊利润分析器",
      summary: "拆解广告、退货、折扣、仓储和隐性运营成本后的真实 SKU 利润。",
    },
  },
  "amazon-repricing-strategy": {
    zh: {
      name: "亚马逊调价策略规划器",
      summary: "把价格、利润和 Buy Box 目标转成可执行的调价规则与响应方案。",
    },
  },
  "amazon-buy-box": {
    zh: {
      name: "亚马逊 Buy Box 优化器",
      summary: "看清是什么在拖累 Buy Box，以及最该先修什么。",
    },
  },
  "amazon-deal-finder": {
    zh: {
      name: "亚马逊促销方案匹配器",
      summary: "结合利润和库存现实，比较 coupon、deal 和 Prime 折扣等促销形式。",
    },
  },
  "amazon-ppc-campaign": {
    zh: {
      name: "亚马逊 PPC 广告结构工具",
      summary: "看清广告结构哪里在浪费花费、哪里有效，以及下一步先改什么。",
    },
  },
  "amazon-advertising-strategy": {
    zh: {
      name: "亚马逊广告策略规划器",
      summary: "看预算该怎么分到不同广告类型，以及下一步该把钱往哪里挪。",
    },
  },
  "amazon-negative-keywords": {
    zh: {
      name: "亚马逊否定关键词工具",
      summary: "把浪费花费的搜索词分成该保留、该否掉和还要再看的部分。",
    },
  },
  "amazon-display-ads": {
    zh: {
      name: "亚马逊展示广告规划器",
      summary: "选出下一轮展示广告最该打的人群、再营销路径和商品定向。",
    },
  },
  "amazon-coupon-strategy": {
    zh: {
      name: "亚马逊 Coupon 策略工具",
      summary: "看当前最适合开的 coupon 深度、时机和叠加方式。",
    },
  },
  "amazon-dayparting-strategy": {
    zh: {
      name: "亚马逊分时投放策略工具",
      summary: "找出预算应该加大、削减或保护的时段与星期分布。",
    },
  },
  "amazon-listing-optimization": {
    zh: {
      name: "亚马逊 Listing 优化工具",
      summary: "看清 Listing 最该先改哪一块，提升搜索和转化。",
    },
  },
  "amazon-a-plus-content": {
    zh: {
      name: "亚马逊 A+ 内容规划器",
      summary: "把产品证明整理成最该先做的 A+ 模块、文案和图片方向。",
    },
  },
  "amazon-enhanced-brand-content": {
    zh: {
      name: "亚马逊增强品牌内容规划器",
      summary: "看 Premium A+ 和 Brand Story 该怎么讲产品、建立信任更快。",
    },
  },
  "amazon-backend-keywords": {
    zh: {
      name: "亚马逊后台关键词工具",
      summary: "在字节限制内把后台关键词压缩好、去重好、优先级排好。",
    },
  },
  "amazon-search-optimization": {
    zh: {
      name: "亚马逊搜索优化工具",
      summary: "看清搜索排名为什么上不去，以及最该先补哪一处。",
    },
  },
  "amazon-listing-images": {
    zh: {
      name: "亚马逊 Listing 图片规划器",
      summary: "把卖点和顾虑排成最该先做的图片顺序。",
    },
  },
  "amazon-product-photography": {
    zh: {
      name: "亚马逊产品摄影规划器",
      summary: "把图片缺口直接变成拍摄清单、道具建议和后期重点。",
    },
  },
  "amazon-storefront-design": {
    zh: {
      name: "亚马逊店铺设计规划器",
      summary: "看店铺页该怎么排页面顺序和流量去向。",
    },
  },
  "amazon-international-listings": {
    zh: {
      name: "亚马逊国际 Listing 本地化工具",
      summary: "看 Listing 进新市场时该怎么改表达、定价和本地语境。",
    },
  },
  "amazon-variation-strategy": {
    zh: {
      name: "亚马逊变体策略工具",
      summary: "判断变体现在该合并、拆分还是保持不动。",
    },
  },
  "amazon-keyword-research": {
    zh: {
      name: "亚马逊关键词调研工具",
      summary: "扩展种子词后，筛出最值得先投入的关键词机会。",
    },
  },
  "amazon-trending-products": {
    zh: {
      name: "亚马逊趋势产品发现工具",
      summary: "看清哪些产品方向正在上升，值不值得现在跟进。",
    },
  },
  "amazon-product-research": {
    zh: {
      name: "亚马逊产品调研工具",
      summary: "判断一个产品想法现在值不值得进入 Amazon。",
    },
  },
  "amazon-niche-finder": {
    zh: {
      name: "亚马逊细分类目机会发现器",
      summary: "找出竞争没那么挤、但仍有需求和利润空间的细分类目。",
    },
  },
  "amazon-seller-analytics": {
    zh: {
      name: "亚马逊卖家经营分析工具",
      summary: "看清一个卖家店铺在卖什么、怎么定价、哪里有空档。",
    },
  },
  "amazon-sales-estimator": {
    zh: {
      name: "亚马逊销量估算器",
      summary: "根据 BSR、ASIN 或关键词估算销量，并看这个数字值不值得信。",
    },
  },
  "amazon-rank-tracker": {
    zh: {
      name: "亚马逊排名追踪规划器",
      summary: "看哪些自然词的排名最值得追，掉了以后先盯哪里。",
    },
  },
  "amazon-keyword-tracker": {
    zh: {
      name: "亚马逊关键词监控器",
      summary: "持续盯住自然位和广告位关键词，发现哪些变化该先处理。",
    },
  },
  "amazon-price-tracker": {
    zh: {
      name: "亚马逊价格监控器",
      summary: "持续看自己和竞品的价格变化，判断该跟、该等还是该忽略。",
    },
  },
  "amazon-competitor-analysis": {
    zh: {
      name: "亚马逊竞品分析工具",
      summary: "比较你和竞品在定位、价格、评论和 Listing 上最关键的差距。",
    },
  },
  "amazon-competitor-monitoring": {
    zh: {
      name: "亚马逊竞品监控工具",
      summary: "持续监控竞品变化，找出真正值得你反应的那条信号。",
    },
  },
  "amazon-review-analyzer": {
    zh: {
      name: "亚马逊评论分析器",
      summary: "把评论压成用户抱怨、好评证明和最该先修的问题。",
    },
  },
  "amazon-brand-analytics": {
    zh: {
      name: "亚马逊 Brand Analytics 解读器",
      summary: "把 Brand Analytics 数据压成 query 机会、ASIN 压力和下一步动作。",
    },
  },
  "amazon-brand-tailored-promotions": {
    zh: {
      name: "亚马逊品牌定向促销规划器",
      summary: "为复购用户、召回人群和连带购买场景设计差异化促销方案。",
    },
  },
  "amazon-global-selling": {
    zh: {
      name: "亚马逊全球开店规划器",
      summary: "评估下一步该进入哪些站点，以及更合理的市场进入顺序。",
    },
  },
  "amazon-subscribe-save": {
    zh: {
      name: "亚马逊订阅省优化器",
      summary: "优化复购渗透率、折扣梯度和补货经济性。",
    },
  },
  "amazon-review-strategy": {
    zh: {
      name: "亚马逊评论增长策略工具",
      summary: "看最安全的评论增长方式该怎么走、什么时候做。",
    },
  },
  "amazon-vine-program": {
    zh: {
      name: "亚马逊 Vine 项目规划器",
      summary: "判断 SKU 是否适合 Vine、什么时候加入，以及可能面对的评论质量取舍。",
    },
  },
  "amazon-return-reduction": {
    zh: {
      name: "亚马逊退货率改善工具",
      summary: "把退货原因拆成 Listing、包装和产品上最该先修的动作。",
    },
  },
  "amazon-seasonal-planning": {
    zh: {
      name: "亚马逊季节性运营规划器",
      summary: "把 Prime Day、Q4 和活动窗口排成库存、广告和促销节奏。",
    },
  },
  "amazon-product-bundling": {
    zh: {
      name: "亚马逊捆绑组合规划器",
      summary: "看什么组合能拉高客单价，又不伤利润和表达清晰度。",
    },
  },
  "amazon-private-label": {
    zh: {
      name: "亚马逊自有品牌规划器",
      summary: "判断 private label 想法够不够强，以及 launch 前还要先验证什么。",
    },
  },
  "amazon-wholesale-sourcing": {
    zh: {
      name: "亚马逊批发采购规划器",
      summary: "看供应商、MOQ 和转售利润是否真的值得继续谈下去。",
    },
  },
  "amazon-suspension-appeal": {
    zh: {
      name: "亚马逊申诉信规划工具",
      summary: "把政策通知直接变成带根因、修复动作和预防步骤的申诉草稿。",
    },
  },
};

const runtimeTitles: Record<
  string,
  {
    zh: string;
  }
> = {
  "amazon-profit-analyzer": { zh: "查看利润判断" },
  "amazon-fba-calculator": { zh: "运行 FBA 费用测算" },
  "tariff-calculator-amazon": { zh: "估算关税与到岸成本" },
  "amazon-shipping-calculator": { zh: "测算每月物流负担" },
  "amazon-sales-estimator": { zh: "估算销量与需求区间" },
  "amazon-price-tracker": { zh: "查看价格姿态" },
  "amazon-keyword-tracker": { zh: "查看关键词压力" },
  "amazon-competitor-monitoring": { zh: "查看竞品变化" },
  "amazon-listing-optimization": { zh: "查看 Listing 优化方向" },
  "amazon-product-compliance": { zh: "筛查合规资料风险" },
  "amazon-listing-title-checker": { zh: "检查标题结构与重复词风险" },
  "amazon-image-compliance-checker": { zh: "检查图片结构与主图合规性" },
  "amazon-variation-relationship-checker": { zh: "检查变体关系与主题一致性" },
  "amazon-browse-search-keyword-checker": { zh: "检查类目路径与关键词匹配度" },
  "amazon-brand-registry": { zh: "评估品牌备案准备度" },
  "amazon-category-ungating": { zh: "检查类目解封资料强度" },
  "amazon-fba-prep": { zh: "生成 FBA 备货清单" },
  "amazon-inventory-management": { zh: "规划库存覆盖与补货时点" },
  "tiktok-shop-seller-intake": { zh: "看清卖家起步路径" },
  "tiktok-shop-product-research": { zh: "筛选更适合 TikTok Shop 的商品方向" },
  "tiktok-shop-hook-writing": { zh: "生成短视频开场钩子与角度" },
  "tiktok-shop-short-video-brief": { zh: "生成短视频结构与拍摄脚本" },
  "tiktok-shop-product-performance": { zh: "判断这个商品该继续放量还是停掉" },
  "tiktok-shop-kill-rules": { zh: "确定现在该停测还是继续观察" },
  "tiktok-shop-creator-research": { zh: "找出更值得跟进的创作者方向" },
  "tiktok-shop-content-strategy": { zh: "确定下一阶段内容方向" },
  "shopify-product-page-audit": { zh: "找出商品页最先漏损的地方" },
  "shopify-offer-positioning": { zh: "明确这个 offer 该怎么卖" },
  "shopify-landing-page-angle-builder": { zh: "明确首屏转化故事" },
  "shopify-bundle-offer-designer": { zh: "锁定值得上线的 bundle 路径" },
  "shopify-subscription-planner": { zh: "决定是否该上复购通道" },
  "shopify-quiz-planner": { zh: "锁定分群获客路径" },
  "shopify-collection-page-audit": { zh: "修正 collection 选购路径" },
  "shopify-creative-testing-matrix": { zh: "明确首测创意家族" },
  "shopify-pricing-test-planner": { zh: "明确首轮定价测试" },
  "shopify-pdp-copy-assembler": { zh: "生成可直接改页的 PDP 文案" },
  "shopify-post-purchase-flow-planner": { zh: "搭好首条售后流程" },
  "shopify-returns-friction-audit": { zh: "切掉最伤利润的退货摩擦" },
  "shopify-faq-objection-builder": { zh: "把常见异议收成 FAQ 资产" },
  "shopify-reorder-reminder-planner": { zh: "锁定补货提醒节奏" },
  "shopify-promo-calendar-planner": { zh: "排出 30 到 60 天活动节奏" },
  "shopify-merchandising-priority-mapper": { zh: "决定谁该拿 Hero 位和流量" },
  "shopify-launch-readiness-scorecard": { zh: "判断现在能不能推" },
  "shopify-channel-landing-router": { zh: "决定不同流量该落哪" },
};

export function getHomeCopy(locale: SupportedLocale) {
  return homeCopy[locale];
}

export function getToolPageCopy(locale: SupportedLocale) {
  return toolPageCopy[locale];
}

export function getRuntimeCopy(locale: SupportedLocale) {
  return runtimeCopy[locale];
}

export function translateCategory(
  category: ToolDefinition["category"],
  locale: SupportedLocale,
) {
  return categoryLabels[locale][category];
}

export function translateIntent(intent: string, locale: SupportedLocale) {
  return intentLabels[locale][intent as keyof (typeof intentLabels)["en"]] ?? intent;
}

export function translatePlatform(platform: ToolDefinition["platform"], locale: SupportedLocale) {
  if (platform === "tiktok-shop") {
    return "TikTok Shop";
  }

  if (platform === "shopify") {
    return "Shopify";
  }

  if (locale === "zh" && platform === "amazon") {
    return "Amazon";
  }

  return "Amazon";
}

export function getLocalizedRuntimeTitle(
  slug: string,
  locale: SupportedLocale,
  fallback: string,
) {
  if (locale === "en") {
    return fallback;
  }

  return runtimeTitles[slug]?.zh ?? fallback;
}

function getZhSeoCategoryLabel(category: ToolDefinition["category"]) {
  switch (category) {
    case "Calculator":
      return "费用与利润工具";
    case "Advertising":
      return "广告优化工具";
    case "Compliance":
      return "合规审核工具";
    case "Growth":
      return "增长工具";
    case "Listing":
      return "商品页优化工具";
    case "Operations":
      return "运营履约工具";
    case "Eligibility":
      return "准入审核工具";
    case "Research":
      return "研究工具";
    default:
      return "运营工具";
  }
}

export function localizeTool(tool: ToolDefinition, locale: SupportedLocale) {
  if (locale === "en") {
    return tool;
  }

  const translation = toolTranslations[tool.slug]?.zh;

  if (!translation) {
    return tool;
  }

  const localizedName = translation.name;
  const localizedSummary = translation.summary;
  const localizedSeoTitle =
    translation.seoTitle ??
    `${localizedName} | ${translatePlatform(tool.platform, "zh")} ${getZhSeoCategoryLabel(tool.category)}`;
  const localizedSeoDescription =
    translation.seoDescription ??
    localizedSummary;

  return {
    ...tool,
    name: localizedName,
    summary: localizedSummary,
    seoTitle: localizedSeoTitle,
    seoDescription: localizedSeoDescription,
    idealFor: translation.idealFor ?? tool.idealFor,
    outputs: translation.outputs ?? tool.outputs,
    methodology: translation.methodology ?? tool.methodology,
    faqs: translation.faqs ?? tool.faqs,
  };
}
