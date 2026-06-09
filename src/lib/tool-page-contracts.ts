export type ToolPageContract = {
  userGoal: {
    en: string;
    zh: string;
  };
  inputHint: {
    en: string;
    zh: string;
  };
  resultPromise: {
    en: string;
    zh: string;
  };
};

const sharedAmazonLiveHint = {
  en: "Start with an ASIN or product URL. Let the system infer first, then correct only what is truly missing.",
  zh: "优先填写 ASIN 或商品链接，先让系统自动判断，只有确实缺失时再手动补充。",
};

const sharedTikTokHint = {
  en: "Fill only the core business context first. The page should return a usable answer quickly, not turn into a long brainstorm.",
  zh: "先填写最核心的业务信息，页面应直接给出可用结论，不要变成长篇头脑风暴。",
};

const sharedShopifyHint = {
  en: "Give the page URL or the core business context first. The result should tell the team what to fix, not bury them in theory.",
  zh: "先提供页面链接或核心业务背景，结果应直接告诉团队先改什么，而不是堆一堆理论说明。",
};

export const toolPageContracts: Record<string, ToolPageContract> = {
  "amazon-fba-calculator": {
    userGoal: {
      en: "Check whether FBA still makes sense before you approve the SKU.",
      zh: "先判断这款商品做 FBA 还划不划算，再决定是否继续推进。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get an FBA keep-or-stop result, the main cost blocker, and the next cost figure that must be confirmed.",
      zh: "你会得到 FBA 做还是不做的结论、当前最大成本阻塞，以及下一步必须确认的成本项。",
    },
  },
  "tariff-calculator-amazon": {
    userGoal: {
      en: "Estimate whether tariff pressure breaks the landed-cost story.",
      zh: "先判断关税压力会不会直接打穿落地成本模型。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get a landed-cost result, the tariff pressure level, and the first number that needs correction before a go/no-go.",
      zh: "你会得到落地成本判断、关税压力级别，以及做去留决定前必须先纠正的第一项数字。",
    },
  },
  "amazon-shipping-calculator": {
    userGoal: {
      en: "See whether fulfillment burden is still operationally acceptable.",
      zh: "判断当前物流与履约负担是否仍然在可接受范围内。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get a shipping burden result, the main fulfillment pressure, and the next operational move.",
      zh: "你会得到物流负担判断、最主要的履约压力，以及下一步运营动作。",
    },
  },
  "amazon-profit-analyzer": {
    userGoal: {
      en: "Find out whether this SKU actually has enough margin left to be worth pushing.",
      zh: "判断这款商品现在到底还有没有足够利润值得继续推。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get a profit result, the main margin leak, and the first cost or pricing move worth making.",
      zh: "你会得到利润判断、当前最大利润漏损，以及最值得先做的成本或定价动作。",
    },
  },
  "amazon-sales-estimator": {
    userGoal: {
      en: "Estimate likely demand before treating the category as attractive.",
      zh: "先估算需求，再决定这个类目值不值得继续看。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get a demand result, how strong the estimate looks, and the next decision it should support.",
      zh: "你会得到需求判断、支撑估算的压力级别，以及这份估算应该服务的下一步决策。",
    },
  },
  "amazon-price-tracker": {
    userGoal: {
      en: "See whether price movement needs action now or just monitoring.",
      zh: "判断价格变化是需要立刻动作，还是暂时只需继续观察。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get a pricing result, the most important watch trigger, and the first safe next move.",
      zh: "你会得到当前定价姿态、最重要的观察触发点，以及第一步安全回应动作。",
    },
  },
  "amazon-buy-box": {
    userGoal: {
      en: "Check whether the Buy Box risk is real and what is actually causing it.",
      zh: "判断 Buy Box 风险是不是真的存在，以及真正原因是什么。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get a Buy Box result, the strongest pressure source, and the first corrective move.",
      zh: "你会得到 Buy Box 准备度判断、最强压力来源，以及第一步纠正动作。",
    },
  },
  "amazon-rank-tracker": {
    userGoal: {
      en: "Understand whether rank movement is meaningful enough to react to.",
      zh: "判断排名变化是否已经重要到需要采取动作。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get a rank result, what is pushing it, and when to check again.",
      zh: "你会得到排名方向判断、背后的核心原因，以及建议的下一次复查时间。",
    },
  },
  "amazon-keyword-tracker": {
    userGoal: {
      en: "See which keyword changes deserve attention before you reopen the listing.",
      zh: "先看哪些关键词变化值得重新处理商品页，再决定是否动文案。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get the main keyword risk, the terms to defend first, and the first response move.",
      zh: "你会得到主要关键词风险、需要先守住的词，以及第一步响应动作。",
    },
  },
  "amazon-competitor-monitoring": {
    userGoal: {
      en: "Watch competitors without turning the page into a noisy spreadsheet.",
      zh: "用最少噪音监控竞品，而不是把页面变成一张杂乱表格。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get the most important competitor signal, what to watch next, and the first response.",
      zh: "你会得到最重要的竞品信号、下一步最该盯的内容，以及第一步响应动作。",
    },
  },
  "amazon-competitor-analysis": {
    userGoal: {
      en: "Find the one competitive gap worth attacking first.",
      zh: "找出当前最值得先打的一处竞争缺口。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get the clearest gap to attack, why it matters, and the first move to test it.",
      zh: "你会得到最清晰的竞争缺口、为什么它重要，以及最值得先测试的动作。",
    },
  },
  "amazon-product-compliance": {
    userGoal: {
      en: "Decide whether the product can move forward without avoidable compliance risk.",
      zh: "判断商品能不能在不踩明显合规坑的前提下继续推进。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get a compliance result, the top missing item, and the next document or detail you must prepare.",
      zh: "你会得到合规准备度判断、最大的证据缺口，以及下一步必须补的证明材料。",
    },
  },
  "amazon-listing-title-checker": {
    userGoal: {
      en: "Find out whether the title is good enough to keep or needs fixing now.",
      zh: "判断标题现在是可以继续用，还是必须立刻重改。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get a title verdict, the strongest structural problem, and the first rewrite move.",
      zh: "你会得到标题结论、最主要的结构问题，以及第一步改写动作。",
    },
  },
  "amazon-image-compliance-checker": {
    userGoal: {
      en: "Check whether the image set is safe enough to keep live.",
      zh: "判断图片组现在是否足够安全，可以继续在线使用。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get an image compliance verdict, the highest-risk image issue, and the fix order.",
      zh: "你会得到图片合规结论、最高风险问题，以及修复顺序。",
    },
  },
  "amazon-browse-search-keyword-checker": {
    userGoal: {
      en: "See whether browse path and keyword use are helping discovery or hurting it.",
      zh: "判断 browse 路径和关键词用法是在帮助曝光，还是正在拖累曝光。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get a discoverability result, the biggest coverage gap, and the first cleanup move.",
      zh: "你会得到搜索可见性判断、最大的覆盖缺口，以及第一步清理动作。",
    },
  },
  "amazon-category-ungating": {
    userGoal: {
      en: "Check whether the ungating path is realistic before collecting the wrong paperwork.",
      zh: "先判断解封路径是否现实，避免一开始就准备错资料。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get an ungating result, the biggest weak spot, and the next document path to prepare.",
      zh: "你会得到解封成功可能性的判断、最大的证据弱点，以及下一步该准备的资料路径。",
    },
  },
  "amazon-listing-optimization": {
    userGoal: {
      en: "Understand what the listing should fix first before rewriting everything.",
      zh: "先判断商品页最该修什么，再决定是否大改整页。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get the main listing problem, the first fix to make, and the next action to take.",
      zh: "你会得到商品页的核心问题、最该先做的优化方向，以及最值得先批准的下一步动作。",
    },
  },
  "amazon-review-analyzer": {
    userGoal: {
      en: "Turn reviews into a clearer product, message, or listing decision.",
      zh: "把评论转成更明确的产品、信息或 listing 判断。",
    },
    inputHint: {
      en: "Paste the review set or product feedback first. The result should compress repeated signals into one readable decision.",
      zh: "先粘贴评论集或反馈内容，结果应把重复信号压成一份可读的判断。",
    },
    resultPromise: {
      en: "You will get the main customer signal, the strongest complaint or praise pattern, and the first message move.",
      zh: "你会得到最主要的用户信号、最强的抱怨或证明主题，以及第一步信息动作。",
    },
  },
  "amazon-negative-keywords": {
    userGoal: {
      en: "Cut wasted search terms without over-cleaning the account.",
      zh: "减少无效搜索词浪费，但不要过度清理账户。",
    },
    inputHint: {
      en: "Paste search-term data first. The page should sort what to block now, what to keep, and what still needs evidence.",
      zh: "先粘贴搜索词数据，页面应直接分出现在该否掉什么、保留什么、以及还需要证据的部分。",
    },
    resultPromise: {
      en: "You will get the main waste source, the terms to block first, and the safest cleanup action.",
      zh: "你会得到主要浪费来源、应该先否掉的词，以及最安全的清理动作。",
    },
  },
  "amazon-a-plus-content": {
    userGoal: {
      en: "Figure out what the A+ section should actually explain, prove, and sequence.",
      zh: "判断 A+ 内容真正该讲什么、证明什么、按什么顺序讲。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get the A+ direction, the module to build first, and the first content block to draft.",
      zh: "你会得到 A+ 方向、应该先做的模块，以及第一块该起草的内容。",
    },
  },
  "amazon-enhanced-brand-content": {
    userGoal: {
      en: "Plan Premium A+ or Brand Story around a clearer selling purpose.",
      zh: "让 Premium A+ 或 Brand Story 围绕更清楚的销售目的来规划。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get the content direction, the brand-story angle to lean on, and the first block to build.",
      zh: "你会得到内容方向、最该采用的品牌故事角度，以及第一块先做的内容。",
    },
  },
  "amazon-search-optimization": {
    userGoal: {
      en: "See whether search visibility is strong enough to keep scaling traffic.",
      zh: "判断搜索可见性是否已经强到值得继续放大流量。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get a search result, the biggest relevance or conversion drag, and the next optimization move.",
      zh: "你会得到搜索姿态判断、最大的相关性或转化拖累点，以及下一步优化动作。",
    },
  },
  "amazon-listing-images": {
    userGoal: {
      en: "Decide what image sequence the listing actually needs next.",
      zh: "判断 listing 下一步真正需要怎样的图片顺序。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get an image plan, the missing proof or frame, and the first image to redesign.",
      zh: "你会得到图片顺序方向、缺失的证明或画面，以及第一张该重做的图片。",
    },
  },
  "amazon-storefront-design": {
    userGoal: {
      en: "See how the storefront should route traffic instead of just looking organized.",
      zh: "判断店铺页该如何承接流量，而不只是看起来更整齐。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get a storefront result, the main routing issue, and the next section to rebuild.",
      zh: "你会得到店铺结构判断、主要路由问题，以及下一步要重建的区域。",
    },
  },
  "amazon-keyword-research": {
    userGoal: {
      en: "Find the keyword group worth turning into a real test.",
      zh: "找出最值得真正拿去测试的关键词组。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get the top keyword group, the strongest signal behind it, and the first move to ship.",
      zh: "你会得到最优先的关键词组、背后的最强信号，以及第一步落地动作。",
    },
  },
  "amazon-trending-products": {
    userGoal: {
      en: "Check whether the trend is strong enough to justify entry timing.",
      zh: "判断趋势强度是否足以支撑现在入场。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get a timing result, the strongest momentum signal, and the next window decision.",
      zh: "你会得到时机判断、最强的动量信号，以及下一步窗口决策。",
    },
  },
  "amazon-product-research": {
    userGoal: {
      en: "Pressure-test a product idea before you waste more time on it.",
      zh: "在投入更多时间前，先把产品想法压测一遍。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get a product result, the biggest market pressure, and the first go-or-stop move.",
      zh: "你会得到产品可行性判断、最大的市场压力，以及第一步去留动作。",
    },
  },
  "amazon-niche-finder": {
    userGoal: {
      en: "Check whether a niche is still worth entering.",
      zh: "判断一个 niche 现在是否还值得进入。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get a niche result, the core pressure point, and the next entry decision.",
      zh: "你会得到 niche 可行性判断、核心压力点，以及下一步入场决策。",
    },
  },
  "amazon-seller-analytics": {
    userGoal: {
      en: "Read what a seller portfolio is actually doing well or badly.",
      zh: "看懂一个卖家组合真正做得好的和做得差的地方。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get the strongest portfolio pattern, the clearest weakness, and the first follow-up question worth pursuing.",
      zh: "你会得到最强的组合特征、最清晰的弱点，以及最值得继续追的下一问。",
    },
  },
  "amazon-brand-analytics": {
    userGoal: {
      en: "Turn Brand Analytics rows into a usable traffic and competition decision.",
      zh: "把 Brand Analytics 表格压成可用的流量与竞争判断。",
    },
    inputHint: {
      en: "Paste Brand Analytics data first. The result should surface the queries and ASINs worth acting on.",
      zh: "先粘贴 Brand Analytics 数据，结果应直接指出值得动作的 query 和 ASIN。",
    },
    resultPromise: {
      en: "You will get the main query opportunity, the strongest competitor pressure, and the first follow-up action.",
      zh: "你会得到主要 query 机会、最强的竞品压力，以及第一步跟进动作。",
    },
  },
  "amazon-coupon-strategy": {
    userGoal: {
      en: "Check whether a coupon move is safe enough to launch.",
      zh: "在开优惠券前，先判断这步动作在商业上是否安全。",
    },
    inputHint: sharedAmazonLiveHint,
    resultPromise: {
      en: "You will get a coupon result, the main margin or inventory risk, and the safest first move.",
      zh: "你会得到优惠券姿态判断、主要利润或库存风险，以及最安全的先行动作。",
    },
  },
  "amazon-backend-keywords": {
    userGoal: {
      en: "Pack backend keywords without wasting bytes or polluting relevance.",
      zh: "在不浪费字节、不污染相关性的前提下整理后台关键词。",
    },
    inputHint: {
      en: "Provide the current keyword set or listing context first. The page should compress what deserves backend placement.",
      zh: "先提供当前关键词集合或 listing 背景，页面应压缩出真正该放进后台的词。",
    },
    resultPromise: {
      en: "You will get a backend keyword pack, the best priority terms, and the first terms to exclude.",
      zh: "你会得到后台关键词包、最优先词组，以及应先排除的词。",
    },
  },
  "tiktok-shop-seller-intake": {
    userGoal: {
      en: "Clarify what kind of TikTok Shop business you are actually trying to run first.",
      zh: "先把你到底要做哪一种 TikTok Shop 生意讲清楚。",
    },
    inputHint: sharedTikTokHint,
    resultPromise: {
      en: "You will get a clear seller setup, the main blocker, and the first action worth taking.",
      zh: "你会得到清晰的卖家起步方向、最主要的阻塞点，以及最值得先做的动作。",
    },
  },
  "tiktok-shop-product-research": {
    userGoal: {
      en: "Choose the product idea worth testing instead of keeping too many weak ideas alive.",
      zh: "选出真正值得测试的商品方向，而不是同时养着一堆弱想法。",
    },
    inputHint: sharedTikTokHint,
    resultPromise: {
      en: "You will get a product result, the strongest reason behind it, and the first test to run.",
      zh: "你会得到商品方向判断、最强的支撑理由，以及第一步测试方向。",
    },
  },
  "tiktok-shop-hook-writing": {
    userGoal: {
      en: "Find the opening hook family that deserves the next content test.",
      zh: "找出最值得进入下一轮测试的视频开场方向。",
    },
    inputHint: sharedTikTokHint,
    resultPromise: {
      en: "You will get the recommended hook, the supporting angle it relies on, and the first version to test.",
      zh: "你会得到推荐的开场方向、它依赖的证明角度，以及第一版该测试的内容。",
    },
  },
  "tiktok-shop-short-video-brief": {
    userGoal: {
      en: "Turn the idea into a short-video plan a content team can actually shoot.",
      zh: "把想法翻成内容团队真的能开拍的脚本单。",
    },
    inputHint: sharedTikTokHint,
    resultPromise: {
      en: "You will get a short-video plan, the key sequence to protect, and the first production move.",
      zh: "你会得到短视频脚本方案、必须保住的关键结构，以及第一步制作动作。",
    },
  },
  "tiktok-shop-product-performance": {
    userGoal: {
      en: "Decide whether the SKU deserves more budget, a reset, or a stop.",
      zh: "判断这个 SKU 是该继续加预算、重做，还是直接停掉。",
    },
    inputHint: sharedTikTokHint,
    resultPromise: {
      en: "You will get a scale-or-stop result, the strongest performance signal, and the first budget action.",
      zh: "你会得到继续放量还是停掉的结论、最强的表现信号，以及第一步预算动作。",
    },
  },
  "tiktok-shop-kill-rules": {
    userGoal: {
      en: "Set a stop rule so weak tests stop draining time and spend.",
      zh: "写清停测规则，别让弱测试继续吞时间和预算。",
    },
    inputHint: sharedTikTokHint,
    resultPromise: {
      en: "You will get a kill-rule decision, the stop threshold that matters, and the next rule to enforce.",
      zh: "你会得到停测判断、最关键的止损阈值，以及下一步要执行的规则。",
    },
  },
  "tiktok-shop-creator-research": {
    userGoal: {
      en: "Find the creator type worth scouting instead of scattering outreach.",
      zh: "找出最值得去找的达人方向，而不是到处散射联系。",
    },
    inputHint: sharedTikTokHint,
    resultPromise: {
      en: "You will get the creator type to target, why it fits the buyer, and the first scouting move.",
      zh: "你会得到达人方向、背后的买家匹配逻辑，以及第一步搜寻动作。",
    },
  },
  "tiktok-shop-content-strategy": {
    userGoal: {
      en: "Choose a content system the team can actually repeat.",
      zh: "确定一套团队真的能稳定重复执行的内容系统。",
    },
    inputHint: sharedTikTokHint,
    resultPromise: {
      en: "You will get the clearest content path, the best format to lean on, and the first production rule to adopt.",
      zh: "你会得到最清晰的内容路径、最该重点做的内容形式，以及第一条应采用的制作规则。",
    },
  },
  "shopify-product-page-audit": {
    userGoal: {
      en: "Find the first real leak on the PDP before rewriting random sections.",
      zh: "先找出 PDP 的第一处真实漏损，再决定改哪里。",
    },
    inputHint: sharedShopifyHint,
    resultPromise: {
      en: "You will get the main page problem, why it matters for sales, and the first repair move.",
      zh: "你会得到页面的核心问题、它为什么影响商业结果，以及第一步修复动作。",
    },
  },
  "shopify-offer-positioning": {
    userGoal: {
      en: "Compress the offer into something buyers can actually understand and repeat.",
      zh: "把 offer 压成用户能真正理解并复述的一句话。",
    },
    inputHint: sharedShopifyHint,
    resultPromise: {
      en: "You will get the main offer line to use, the weakness behind it, and the first tightening move.",
      zh: "你会得到该使用的 offer 主张、背后的薄弱点，以及第一步收紧动作。",
    },
  },
  "shopify-landing-page-angle-builder": {
    userGoal: {
      en: "Choose the above-the-fold story worth sending traffic into.",
      zh: "选出真正值得接流量的首屏销售故事。",
    },
    inputHint: sharedShopifyHint,
    resultPromise: {
      en: "You will get the recommended landing angle, the proof it needs, and the first rewrite move.",
      zh: "你会得到推荐的落地页角度、它需要的证明，以及第一步修改方向。",
    },
  },
  "shopify-pricing-test-planner": {
    userGoal: {
      en: "Decide whether pricing is the next lever worth testing.",
      zh: "判断定价是不是下一步最值得动的杠杆。",
    },
    inputHint: sharedShopifyHint,
    resultPromise: {
      en: "You will get a pricing test result, the main limit around it, and the first safe test move.",
      zh: "你会得到定价测试判断、围绕它的主要限制，以及第一步安全测试动作。",
    },
  },
  "shopify-pdp-copy-assembler": {
    userGoal: {
      en: "Turn diagnosis into a rewrite plan the page team can actually use.",
      zh: "把诊断结果整理成页面团队真的能执行的修改计划。",
    },
    inputHint: sharedShopifyHint,
    resultPromise: {
      en: "You will get the rewrite plan, the section to fix first, and the next copy move to make.",
      zh: "你会得到修改方向、最该先修的区块，以及最值得先做的文案动作。",
    },
  },
  "shopify-post-purchase-flow-planner": {
    userGoal: {
      en: "Choose the post-purchase sequence that protects first use and repeat behavior.",
      zh: "确定最能保护激活和复购的售后流程顺序。",
    },
    inputHint: sharedShopifyHint,
    resultPromise: {
      en: "You will get the flow plan, the biggest activation risk, and the first message or step to build.",
      zh: "你会得到流程方向、最大的激活风险，以及第一条该搭的消息或步骤。",
    },
  },
  "shopify-returns-friction-audit": {
    userGoal: {
      en: "Cut the return leak before it gets disguised as a support problem.",
      zh: "先切掉退货漏损，别把它误当成客服问题。",
    },
    inputHint: sharedShopifyHint,
    resultPromise: {
      en: "You will get a returns result, the main expectation gap, and the first fix surface.",
      zh: "你会得到退货摩擦判断、最大的预期落差，以及第一步修复面位。",
    },
  },
  "shopify-faq-objection-builder": {
    userGoal: {
      en: "See which buyer objection should be answered first instead of adding random FAQs.",
      zh: "判断最应该先回答哪一个用户异议，而不是随便堆 FAQ。",
    },
    inputHint: sharedShopifyHint,
    resultPromise: {
      en: "You will get the top objection to resolve, the best placement for it, and the first FAQ move.",
      zh: "你会得到最该先解决的异议、最适合它的放置位置，以及第一步 FAQ 动作。",
    },
  },
  "shopify-reorder-reminder-planner": {
    userGoal: {
      en: "Choose a reorder path that helps repeat purchase instead of annoying buyers.",
      zh: "确定一条既能促进复购、又不会烦到用户的提醒路径。",
    },
    inputHint: sharedShopifyHint,
    resultPromise: {
      en: "You will get the repeat-purchase cadence, the biggest behavior risk, and the first reminder move.",
      zh: "你会得到复购节奏判断、最大的行为风险，以及第一步提醒动作。",
    },
  },
  "shopify-promo-calendar-planner": {
    userGoal: {
      en: "Decide what kind of promo rhythm is actually worth running.",
      zh: "判断什么样的促销节奏才真的值得执行。",
    },
    inputHint: sharedShopifyHint,
    resultPromise: {
      en: "You will get a promo calendar result, the main calendar risk, and the next event to run.",
      zh: "你会得到促销日历判断、主要节奏风险，以及下一场最值得执行的活动。",
    },
  },
  "shopify-merchandising-priority-mapper": {
    userGoal: {
      en: "See which products deserve hero placement and which do not.",
      zh: "看清哪些商品值得做 hero 位，哪些不值得。",
    },
    inputHint: sharedShopifyHint,
    resultPromise: {
      en: "You will get the merchandising priority, the clearest routing issue, and the first placement move.",
      zh: "你会得到陈列优先级、最清晰的路由问题，以及第一步摆放动作。",
    },
  },
  "shopify-launch-readiness-scorecard": {
    userGoal: {
      en: "Check whether the launch deserves paid traffic right now.",
      zh: "判断这个上线状态现在值不值得接付费流量。",
    },
    inputHint: sharedShopifyHint,
    resultPromise: {
      en: "You will get a launch decision, the biggest blocker, and the first issue to clear before traffic.",
      zh: "你会得到上线准备度结论、最大的阻塞，以及流量进来前最该先清掉的问题。",
    },
  },
  "shopify-channel-landing-router": {
    userGoal: {
      en: "Match each traffic source to the page role it actually needs.",
      zh: "把不同流量源匹配到它真正该去的页面角色。",
    },
    inputHint: sharedShopifyHint,
    resultPromise: {
      en: "You will get the best page match, the main mismatch, and the first traffic-page correction.",
      zh: "你会得到流量路由判断、主要错配点，以及第一步修正动作。",
    },
  },
};

export function getToolPageContract(slug: string): ToolPageContract | null {
  return toolPageContracts[slug] ?? null;
}
