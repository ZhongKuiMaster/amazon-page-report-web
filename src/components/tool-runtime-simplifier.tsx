"use client";

import { useEffect, useRef } from "react";
import type { SupportedLocale } from "@/lib/i18n";

type ToolRuntimeSimplifierProps = {
  locale: SupportedLocale;
  slug: string;
};

const legacyGuardrailCardSelector = "div[class*='rounded'], details, a, button, aside, section, article";
const legacyGuardrailDirectTextSelector = 'root.querySelectorAll<HTMLElement>("p, button, a, summary")';

const hiddenExactHeadings = new Set([
  "Action queue",
  "ACTION QUEUE",
  "执行队列",
  "下一步操盘页",
  "First-screen operator call",
  "FIRST-SCREEN OPERATOR CALL",
  "第一屏操盘判断",
  "First-screen verdict",
  "This estimate call",
  "This profit call",
  "This compliance call",
  "This browse call",
  "This watch",
  "This research pass",
  "This backend-term call",
  "This image call",
  "This response",
  "This shipping call",
  "This tariff call",
  "Operator worksheet",
  "操盘工作纸",
  "操盘工作表",
  "操盘工作台",
  "Scenario presets",
  "场景预设",
  "Quick example",
  "快速示例",
  "Input brief",
  "输入简报",
  "Next paid-grade handoff",
  "下一份付费级交付",
  "下一份付费级交接",
  "Available",
  "可用",
  "Decision board",
  "决策板",
  "Executive readout",
  "高层读稿",
  "Action boundary",
  "动作边界",
  "这个页面在交付什么",
  "First move",
  "FIRST MOVE",
  "Next step",
  "NEXT STEP",
  "Execution call",
  "EXECUTION CALL",
  "Review status",
  "REVIEW STATUS",
  "Completion",
  "COMPLETION",
  "TRAFFIC PLAN",
  "Live tool",
  "Turns live inputs into a decision board you can act on immediately.",
  "实时工具",
  "把实时输入整理成一份可直接行动的决策板。",
  "Meeting-ready summary",
  "Owner not assigned yet",
  "Blocked move",
  "Keep one owner on the next move so the tool turns into action, not commentary.",
  "Available after deterministic review",
  "Use this profit check only after the live sell price and cost stack are both real.",
  "Keep the first economics fix under one owner until price truth and cost truth are both locked.",
  "This step is not about writing more lines. It is about locking the opening angle, early proof, and stop-power that deserve testing first.",
  "This is the fast commercial readout for founders, collaborators, and downstream owners. Read these lines first, then expand into the full handoff only if needed.",
  "Use this screen for the quick readout first, then forward the full artifact to the next execution owner.",
  "Use this PDP report to decide where the first leak is, which move is blocked for now, and which commercial page should inherit the diagnosis next.",
  "Define the live page, the spend context, and the one notes block that explains why this PDP should or should not keep receiving paid traffic.",
  "Judged from hero clarity, trust strength, offer clarity, and mobile friction before spend is approved.",
  "Only use manual overrides when you want to test alternate keyword sets or a rewritten title.",
  "Open manual overrides only for one alternate benchmark path.",
  "Only use manual overrides when you need to test a different creative angle or revise the planned image jobs.",
  "Keep the PDP frozen until the live page makes the first blocker explicit enough to assign and fix.",
  "If the visual contrast is not dramatic enough, the before-after frame will look fake or too mild to stop scroll.",
  "Keep delivery reactive and imperfect enough to feel native to feed content.",
  "Treat the visual contrast as the hero event and keep explanation secondary.",
  "This tool is for deciding whether a SKU has earned the right to keep getting budget, content, and operator attention.",
  "Give the content team one primary winner angle and push volume behind it.",
  "Trading and content teams should keep one controlled winner lane live for the next cycle.",
  "Do not expand spend until the first named leak is repaired, re-read, and handed into the next commercial page.",
  "Define the approved angle, the proof stack, and the one weakness that should control the rewrite. This block should only hold what the page team needs to change the first commercial section.",
  "Use this page to turn scattered copy opinions into one hero, one proof order, and one CTA direction.",
  "When teams rewrite hero, benefits, FAQ, and CTA all at once, they usually lose the causal read.",
  "Ask for the first commitment only after the proof block reduces hesitation.",
  "会议摘要",
  "负责人尚未指定",
  "当前还没有指定负责人",
  "阻止动作",
  "先指定一个负责人，再把结果变成动作，不要停留在评论层。",
  "确定性结果出来后可用",
  "只有在实时售价和成本层都真实之后，这份利润判断才值得参考。",
  "在售价和成本真值都锁定之前，先把第一步利润修正交给一个负责人处理。",
  "这一步不是继续多写几条文案，而是先锁定最值得测试的开场角度、前置证明和停留强度。",
  "这是一份给创始人、协作者和后续负责人先读的快速商业摘要。先读这里，再决定是否展开完整交接稿。",
  "先用这一屏完成快速判断，再把完整交付稿转给下一位执行负责人。",
  "这份 PDP 报告用来判断第一处真实漏损、当前该先挡住什么，以及下一步该交给哪一类商业页面承接。",
  "先定义实时页面、投放背景，以及那一段真正解释为什么这张 PDP 还该不该继续接流量的备注。",
  "这份判断基于首屏表达、信任强度、优惠清晰度和移动端摩擦，在批准继续投放前给出。",
  "用这张售后决策板把激活、预期管理和二购收入放进同一条流程，而不是拆给不同团队各自猜。",
  "只有在你想测试另一组关键词或改写标题时，才打开手动覆盖。",
  "只有在要测试另一条对标路径时，才打开手动覆盖。",
  "只有在要测试另一条创意方向，或重排图片任务时，才打开手动覆盖。",
  "先让 PDP 保持冻结，直到实时页面把第一处阻塞讲清楚，足够让人指定负责人并开始修复。",
  "如果视觉反差不够强，这种 before-after 框架会显得太假，或者弱到拦不住滑走。",
  "表达要保持即时、自然，像原生 feed 内容，不要太像广告脚本。",
  "把视觉反差当成主事件，解释放后面。",
  "这个工具是用来判断这条 SKU 是否值得继续拿预算、内容产能和运营注意力的。",
  "先给内容团队一个主胜出角度，再把量推上去。",
  "交易和内容团队下一轮只保留一条受控的赢家路线继续推进。",
  "在第一处明确漏损修好、复读确认并交接到下一张商业页面之前，不要继续放大投放。",
  "先定义批准过的角度、证明素材和控制这次改写的那一个弱点。这一块只保留页面团队真正要拿去改第一商业区块的信息。",
  "这个页面的任务是把分散的 copy 意见压成一套 hero、一条 proof 顺序和一个 CTA 方向。",
  "团队一旦同时重写 hero、benefits、FAQ 和 CTA，通常就会把因果链写散。",
  "只有在 proof 区先减少犹豫之后，才发出第一步承诺请求。",
  "本轮禁止动作：当团队同时重写 hero、卖点、FAQ 和 CTA 时，通常会丢掉因果判断。",
  "Live estimate inputs",
  "First-screen operator call",
  "This estimate call",
  "实时费用输入",
  "本次 FBA 判断",
  "第一屏操盘判断",
  "Live fee inputs",
  "This FBA call",
  "Live compliance inputs",
  "This compliance call",
  "Live shipping inputs",
  "This shipping call",
  "Live tariff inputs",
  "This tariff call",
  "Execution owner",
  "Decision owner",
  "Do not cross",
  "Then do",
  "Watch",
  "Why now",
  "Status",
  "Decision inputs still missing",
  "Commercial risk to watch",
  "Approved next move",
  "Review brief",
  "This response",
  "Customer voice evidence",
  "Commercial use of estimate",
  "Escalation logic",
  "Decision board",
  "Action boundary",
  "动作边界",
  "Use this profit check only after the live sell price and cost stack are both real.",
  "Pressure map",
  "Review cadence",
  "Benchmark pressure",
  "Keyword gaps",
  "Market pressure",
  "Commercial call",
  "Open lane",
  "Live PDP brief",
  "Live profit inputs",
  "This profit call",
  "Live listing analysis",
  "This image call",
  "Live family signals",
  "Decision order",
  "Live browse and keyword analysis",
  "This browse call",
  "Coverage gaps",
  "Cleanup order",
  "Ungating evidence read",
  "This ungating call",
  "Keyword brief",
  "This research pass",
  "Research call",
  "Protected assist",
  "Directional sample",
  "Optional profit guardrail",
  "Live keyword inputs",
  "This backend-term call",
  "Pack posture",
  "Comparison brief",
  "This watch",
  "Hold / open / benchmark",
  "Watch brief",
  "Alert priorities",
  "Watch targets",
  "Scenario presets",
  "Quick example",
  "Operator handoff",
  "operator handoff",
  "Ready-to-use handoff",
  "Copy handoff",
  "Meeting readout",
  "Do now",
  "Needs review",
  "Ready",
  "Blocked",
  "This page",
  "输入",
  "结果",
  "Executive call",
  "执行结论",
  "Scenario presets",
  "场景预设",
  "Live case",
  "Reference case",
  "Quick example",
  "Paid deliverable lens",
  "Client takeaway 1",
  "Client takeaway 2",
  "Client takeaway 3",
  "客户拿走 1",
  "客户拿走 2",
  "客户拿走 3",
  "Operator worksheet",
  "Input focus 1",
  "Input focus 2",
  "Input focus 3",
  "Input brief",
  "Next paid-grade handoff",
  "What you are carrying forward",
  "First test model",
  "Decision brief",
  "Owner handoff",
  "Call",
  "Review status",
  "Completion",
  "Commercial call",
  "Open lane",
  "Protected assist",
  "Directional sample",
  "Optional profit guardrail",
  "结论",
  "复查状态",
  "完成度",
  "商业判断",
  "开放路径",
  "受保护增强",
  "方向性样本",
  "付费交付视角",
  "客户收获 1",
  "客户收获 2",
  "客户收获 3",
  "操盘工作表",
  "操盘工作纸",
  "输入重点 1",
  "输入重点 2",
  "输入重点 3",
  "输入简报",
  "下一份付费级交接",
  "本轮向下游带走的结论",
  "首轮测试模型",
  "决策简报",
  "负责人交接",
  "现在就做",
  "需要复查",
  "已就绪",
  "阻塞",
  "下一份付费级交付",
  "下一份可交付动作",
  "你将带走的结果",
  "不要越线",
  "建议动作",
  "第一步动作",
  "这个页面在交付什么",
]);

const hiddenExactHeadingsLower = new Set(
  Array.from(hiddenExactHeadings).map((value) => value.toLowerCase()),
);

const hiddenButtonTexts = new Set([
  "Manual overrides",
  "Hide manual overrides",
  "Adjust detected values",
  "手动覆盖",
  "隐藏手动覆盖",
  "调整识别结果",
  "Copy forwardable handoff",
  "Copied forwardable handoff",
  "复制可转发交付稿",
  "已复制可转发交付稿",
  "Live case",
  "Reference case",
  "可用",
  "Official guide evidence",
  "官方风格证据",
]);

const hiddenButtonPrefixes = [
  "Live case",
  "Reference case",
  "Quick example",
  "Scenario presets",
  "Next paid-grade handoff",
  "Ready-to-use handoff",
  "Copy handoff",
  "Open the next commercial page",
  "Open pricing test planner",
  "Open launch readiness scorecard",
  "Open landing-page angle builder",
  "Open returns friction audit",
  "Open channel landing router",
  "Open promo calendar planner",
  "Open product page audit",
  "Open PDP copy assembler",
  "Open post-purchase flow planner",
  "Open FAQ and objection builder",
  "去渠道路由规划器",
  "去活动日历规划器",
];

const hiddenSupportSectionTitles = [
  "Action queue",
  "执行队列",
  "下一步操盘页",
  "First-screen operator call",
  "第一屏操盘判断",
  "Operator worksheet",
  "操盘工作纸",
  "操盘工作表",
  "Scenario presets",
  "场景预设",
  "Quick example",
  "快速示例",
  "Input brief",
  "输入简报",
  "Next paid-grade handoff",
  "下一份付费级交付",
  "Paid deliverable lens",
  "Operator worksheet",
  "Input brief",
  "Next paid-grade handoff",
  "Executive readout",
  "Action boundary",
  "Full execution notes",
  "Meeting-ready summary",
  "Why now",
  "Status",
  "Decision inputs still missing",
  "Commercial risk to watch",
  "Approved next move",
  "Paid handoff artifact",
  "Commercial summary",
  "Ready to forward",
  "Decision brief",
  "Execution call",
  "Review status",
  "Completion",
  "Commercial call",
  "Open lane",
  "为什么现在",
  "当前状态",
  "当前还缺的决策输入",
  "需要盯住的商业风险",
  "已批准的下一步",
  "付费交付件",
  "商业摘要",
  "可直接转发",
  "决策简报",
  "执行调用",
  "复查状态",
  "完成度",
  "商业判断",
  "开放路径",
  "付费交付视角",
  "操盘工作表",
  "输入简报",
  "下一份付费级交接",
  "完整执行说明",
  "会议可读摘要",
  "下一份付费级交付",
  "下一份可交付动作",
  "你将带走的结果",
  "不要越线",
  "建议动作",
  "第一步动作",
  "Official guide evidence",
  "官方风格证据",
];

const replacementPrefixEntries: Array<[string, string]> = [
  ["PRODUCT PAGE URL", "商品页链接"],
  ["Product page URL", "商品页链接"],
  ["PAGE URL", "页面链接"],
  ["OFFER OR PRODUCT FOCUS", "产品或主卖点"],
  ["Offer or product focus", "产品或主卖点"],
  ["CURRENT PAGE AND PROOF STATE", "当前页面与证明状态"],
  ["Current page and proof state", "当前页面与证明状态"],
  ["OPERATIONAL READINESS", "运营准备度"],
  ["Operational readiness", "运营准备度"],
  ["TRAFFIC PLAN", "流量计划"],
  ["Traffic plan", "流量计划"],
  ["KNOWN LAUNCH RISKS", "已知上线风险"],
  ["Known launch risks", "已知上线风险"],
  ["PRICE POINT", "价格带"],
  ["Price point", "价格带"],
  ["TRAFFIC MIX", "流量结构"],
  ["Traffic mix", "流量结构"],
  ["PRODUCT OR SKU", "产品或 SKU"],
  ["Product or SKU", "产品或 SKU"],
  ["TRAFFIC QUALITY", "流量质量"],
  ["Traffic quality", "流量质量"],
  ["CONVERSION RATE", "转化率"],
  ["Conversion rate", "转化率"],
  ["MARGIN REALITY", "利润空间"],
  ["Margin reality", "利润空间"],
  ["REFUND PRESSURE", "退款压力"],
  ["Refund pressure", "退款压力"],
  ["CONTENT THROUGHPUT", "内容产能"],
  ["Content throughput", "内容产能"],
  ["Load live page", "加载实时页面"],
  ["Load live listing", "加载实时商品"],
  ["Load listing", "加载商品"],
  ["Load competitor", "加载竞品"],
  ["Load competitors", "加载竞品"],
  ["Load competitor offers", "加载竞品报价"],
  ["Load competitor prices", "加载竞品价格"],
  ["Load competitor keywords", "加载竞品关键词"],
  ["Load live comparison", "加载实时对比"],
  ["Load live watchlist", "加载实时监控列表"],
  ["Load live baseline", "加载实时基线"],
  ["Load live research set", "加载实时调研集合"],
  ["Load live keyword baseline", "加载实时关键词基线"],
  ["Load live niche set", "加载实时细分集合"],
  ["Load live trend set", "加载实时趋势集合"],
  ["Load live portfolio", "加载实时组合"],
  ["Paste PDP notes", "粘贴商品页备注"],
  ["Own PDP", "自己的商品页"],
  ["PDP owner", "商品页负责人"],
  ["Competitor PDP set", "竞品商品页集合"],
  ["Every alert is computed from the current marketplace PDP sample", "所有提醒都基于当前站点的商品页样本"],
  ["Load a live listing to let the optimizer build the first real decision pass", "先加载实时商品页，让系统先建立第一轮真实判断"],
  ["Add direct competitors only after your own PDP is loaded", "先加载自己的商品页，再补直接竞品"],
  ["Own live PDP evidence", "自己的商品页依据"],
  ["Title, bullets, category path, and image stack have to come from the real page before any rewrite gets approved.", "标题、要点、类目路径和图片顺序都应先来自真实商品页，再决定是否改写。"],
  ["Load your live PDP first", "先加载实时商品页"],
  ["Load the live listing first", "先加载实时商品页"],
  ["Load the live listing first so the checker starts from the real PDP wording.", "先加载实时商品页，让检查从真实页面文案开始。"],
  ["Load the live listing first so the checker starts from the actual PDP wording.", "先加载实时商品页，让检查从真实页面文案开始。"],
  ["Load the live watchlist first", "先加载实时监控列表"],
  ["Build the watchlist from real competitor PDPs before deciding what should interrupt the team.", "先用真实竞品商品页建立监控集合，再决定什么变化值得打断团队。"],
  ["Load your live offer before discussing alerts", "先加载自己的实时报价，再讨论提醒阈值"],
  ["Do not react to price before loading your own offer baseline", "在加载自己的实时报价前，不要先做价格反应"],
  ["Start with the real PDP so coverage, media depth, and proof gaps come from live evidence rather than assumptions.", "先从真实商品页开始，让覆盖度、素材深度和证明缺口都来自真实页面，而不是猜测。"],
  ["Do not rewrite the PDP before loading the live listing", "在加载实时商品页前，不要先改写页面"],
  ["Do not rewrite the PDP from a weak benchmark set", "在对标依据还弱时，不要先改写页面"],
  ["Load your own PDP first", "先加载自己的商品页"],
  ["Load your own PDP first, then keep the same benchmark set fixed long enough to expose the real optimization job.", "先加载自己的商品页，再把同一组对标维持稳定，才能看清真正该优化的问题。"],
  ["Without your own live title, images, and category path, the team is just rewriting in the dark.", "如果连自己的标题、图片和类目路径都还没读取，团队现在的改写就只是摸黑处理。"],
  ["先加载实时 ASIN，让工具从真实 PDP 推断证据需求。", "先加载实时 ASIN，让工具从真实商品页推断证据需求。"],
  ["先加载实时 PDP", "先加载实时商品页"],
  ["ASIN OR AMAZON PRODUCT URL", "ASIN 或 Amazon 商品链接"],
  ["PRODUCT", "产品"],
  ["Product", "产品"],
  ["BUYER", "用户对象"],
  ["Buyer", "用户对象"],
  ["Entry", "入门价位"],
  ["Mid-market", "中间价位"],
  ["Premium", "高价位"],
  ["Paid social", "付费社媒"],
  ["Search", "搜索流量"],
  ["Email / returning", "邮件 / 回访流量"],
  ["MARKETPLACE", "站点"],
  ["Paste hero copy, offer details, proof, objections, and current claim language", "Paste current offer and proof notes"],
  ["Paste hero, bridge, offer, proof, and first-screen notes", "Paste first-screen notes"],
  ["Paste the current pricing problem, risks, and operator notes", "Paste pricing notes"],
  ["Paste PDP notes, headline, offer, trust, and mobile issues", "Paste PDP notes"],
  ["Review text or TSV/CSV paste", "Paste review text or TSV/CSV"],
  ["30 to 60 day promo notes or windows", "Promo notes or windows"],
  ["Current FAQ or support questions", "Current FAQ or support questions"],
  ["Delivery and timing expectation", "Delivery and timing expectation"],
  ["Discount and margin guardrails", "Discount and margin guardrails"],
  ["Main return reasons", "Main return reasons"],
  ["Promise or expectation gap", "Promise or expectation gap"],
  ["Support or service friction", "Support or service friction"],
  ["Current repeat-buy behavior", "Current repeat-buy behavior"],
  ["Current post-purchase setup", "Current post-purchase setup"],
  ["Current pressure", "Current pressure"],
  ["Margin and discount guardrails", "Margin and discount guardrails"],
];

const hiddenMetaPrefixes = [
  "Load the main URL or page first.",
  "Load the main URL or product page first.",
  "The tool should return a judgment and next move.",
  "Enter the core context first.",
  "先加载核心链接或页面",
  "先填写核心信息",
  "This screen",
  "This page",
  "This tool is for",
  "Use this page to",
  "What this page should deliver by default",
  "The default board should already",
  "Use this PDP report to",
  "Define the live page",
  "Define the approved angle",
  "Pin down one product",
  "Define the opening page",
  "Define the product timing reality",
  "Define the return reasons",
  "Define the real usage window",
  "Define the primary goal",
  "Define the catalog scope",
  "Define the live offer",
  "Define the live traffic mix",
  "Use this approval board to decide",
  "Use this post-purchase board",
  "Use this return audit",
  "Use this objection board",
  "Use this reorder board",
  "Use this launch board",
  "Use this routing board",
  "Judged from",
  "Keep the PDP frozen",
  "Treat the visual contrast",
  "Keep delivery",
  "Trading and content teams",
  "Ask for the first commitment",
  "客户愿意为这份报告付费",
  "先加载一张可信 PDP",
  "先定真实页面",
  "不要从一次诊断里分叉出多条后续动作",
  "一份值钱的报告不该",
  "用这份 PDP 报告来判断",
  "这一屏给老板",
  "这个页面的目标是",
  "默认示例是为了",
  "这个页面是在判断",
  "先定批准角度",
  "一张改稿板应该",
  "用这个页面把",
  "Product:",
  "Audience:",
  "Page URL:",
  "Traffic mix:",
  "SKU：",
  "产品：",
  "受众：",
  "流量结构:",
  "page owner ->",
  "hero ->",
  "A customer should be able to buy this report",
  "This is the source brief for the TikTok Shop execution chain",
  "The page starts with a realistic sample brief",
  "Load one believable PDP",
  "A paid report should not spray follow-ups",
  "This intake is meant to decide the operating lane first",
  "客户愿意购买这份报告",
  "这是一份 TikTok Shop 执行链路源 brief",
  "页面先放一份真实示例",
  "先加载一张可信 PDP",
  "付费报告不应该分叉出多条后续",
  "这份 intake 的任务是先决定操盘路径",
  "The point here is not to expand a long idea list",
  "A paid-worthy pricing tool should protect margin",
  "Define the live price structure",
  "Paste hero copy, offer details, proof, objections, and current claim language",
  "Paste hero, bridge, offer, proof, and first-screen notes",
  "Turn product usage pace into a refill system",
  "Turn recurring hesitation into one FAQ and objection asset",
  "Turn an approved commercial plan into the operating calendar",
  "Only use the short assist after the first complaint owner and first move are already clear.",
  "Open this only when you want to test whether reacting to a price alert would cut below your target contribution margin.",
  "这一步不是为了扩写更多想法",
  "一个值钱的定价工具应该先保护利润",
  "先定义真实价格结构",
  "只有在先明确投诉负责人和第一步动作之后，才使用简短增强。",
  "只有在你想测试价格响应是否会跌破目标利润时，才打开这一项。",
];

const hiddenCardStarts = [
  "Action queue",
  "执行队列",
  "下一步操盘页",
  "First-screen operator call",
  "第一屏操盘判断",
  "Operator worksheet",
  "操盘工作纸",
  "操盘工作表",
  "Scenario presets",
  "场景预设",
  "Quick example",
  "快速示例",
  "Input brief",
  "输入简报",
  "Next paid-grade handoff",
  "下一份付费级交付",
  "高层读稿",
  "Paid handoff artifact",
  "付费交付件",
  "Commercial summary",
  "商业摘要",
  "Meeting-ready summary",
  "会议可读摘要",
  "Full execution notes",
  "完整执行说明",
  "Live tool",
  "Decision board",
  "Executive readout",
  "Action boundary",
  "Execution call",
  "Execution owner",
  "Do not cross",
  "Then do",
  "Watch",
  "Why now",
  "Status",
  "Decision inputs still missing",
  "Commercial risk to watch",
  "Approved next move",
  "First-screen operator call",
  "This profit call",
  "This compliance call",
  "This title call",
  "This estimate call",
  "This shipping call",
  "This tariff call",
  "This browse call",
  "This response",
  "This watch",
  "This research pass",
  "This backend-term call",
  "Live profit inputs",
  "Live compliance inputs",
  "Live estimate inputs",
  "Live fee inputs",
  "Live shipping inputs",
  "Live tariff inputs",
  "Live listing analysis",
  "Live family signals",
  "Live keyword inputs",
  "Live browse and keyword analysis",
  "Margin pressure",
  "Decision order",
  "Review brief",
  "Keyword brief",
  "Comparison brief",
  "Watch brief",
  "Review cadence",
  "Scenario presets",
  "Quick example",
  "Paid deliverable lens",
  "Operator worksheet",
  "Input brief",
  "Next paid-grade handoff",
  "What you are carrying forward",
  "First test model",
  "Pressure map",
  "Pack posture",
  "Coverage gaps",
  "Cleanup order",
  "Alert priorities",
  "Watch targets",
  "Decision inputs still missing",
  "Why now",
  "Status",
  "Operator handoff",
  "operator handoff",
  "Ready-to-use handoff",
  "Copy handoff",
  "Meeting readout",
  "执行调用",
  "实时费用输入",
  "本次 FBA 判断",
  "第一屏操盘判断",
  "实时输入",
  "本次判断",
  "执行建议",
  "输入",
  "结果",
  "为什么现在",
  "状态",
  "Official guide evidence",
  "官方风格证据",
];

const hiddenLinkTexts = [
  "Next paid-grade handoff",
  "Open the next commercial page",
  "Open landing-page angle builder",
  "Open returns friction audit",
  "Open pricing test planner",
  "Open launch readiness scorecard",
  "Open product page audit",
  "Open PDP copy assembler",
  "Open post-purchase flow planner",
  "Open FAQ and objection builder",
  "Ready-to-use handoff",
  "Copy handoff",
  "Official guide evidence",
  "官方风格证据",
];

const hiddenContentFragments = [
  "Action queue",
  "执行队列",
  "下一步操盘页",
  "First-screen operator call",
  "First-screen verdict",
  "This estimate call",
  "This profit call",
  "This compliance call",
  "This shipping call",
  "This tariff call",
  "This image call",
  "This browse call",
  "This watch",
  "This response",
  "This research pass",
  "This backend-term call",
  "This page should",
  "This tool should",
  "The page should",
  "结果应直接告诉团队先改什么",
  "Load one realistic client case first",
  "先加载一份真实客户案例",
  "先加载一张可信 PDP",
  "把这里当成商业主张工作台",
  "这个页面是在判断",
  "这个页面在交付什么",
  "高层读稿",
  "下一份付费级交付",
  "下一份付费级交接",
  "操盘工作纸",
  "场景预设",
  "输入简报",
  "Load live page",
  "Load live listing",
  "Load live comparison",
  "Load live watchlist",
  "本轮禁止动作：",
  "本轮批准动作：",
  "唯一负责人：",
  "Only use manual overrides",
  "Open manual overrides only",
  "系统起草的证据包：",
  "The default board should already",
  "What this page should deliver by default",
  "Ready to forward",
  "This is the fast commercial readout",
  "Use this screen for the quick readout",
  "Turns live inputs into a decision board you can act on immediately.",
  "把实时输入直接整理成可执行的决策看板。",
  "把实时输入整理成一份可直接行动的决策板。",
  "Use this page to turn scattered copy opinions",
  "Use this compliance read to decide",
  "Do not let copy, packaging, or freight execution get ahead of the proof stack",
  "This tool is for deciding whether",
  "这份判断基于首屏表达",
  "这是一份给创始人、协作者和后续负责人先读的快速商业摘要",
  "先用这一屏完成快速判断",
  "先用这一屏快速过会，再把完整交付稿发给下一个执行角色。",
  "这页只有在像上游信息交接报告，而不是松散定位 brainstorm 时，才值得付费。",
  "把这里当成商业主张工作台",
  "这份付费级",
  "才值得付费",
  "这个页面在交付什么",
  "只有在 proof 区先减少犹豫之后",
  "团队一旦同时重写 hero、benefits、FAQ 和 CTA",
  "A customer should be able to buy this report",
  "This is the source brief for the TikTok Shop execution chain",
  "The page starts with a realistic sample brief",
  "A paid report should not spray follow-ups across the stack",
  "Load one believable PDP, then only write the notes",
  "Use this like a page-diagnosis worksheet",
  "This intake is meant to decide the operating lane first",
  "Load one realistic client case first",
  "What this paid-grade PDP report should settle",
  "客户愿意购买这份报告",
  "这是一份 TikTok Shop 执行链路源 brief",
  "页面先放一份真实示例",
  "付费报告不应该分叉出多条后续",
  "下一份付费级交付",
  "下一份可交付动作",
  "你将带走的结果",
  "当前还没有指定负责人",
  "必须有一个人接住下一步，否则结果只会停留在分析层。",
  "用这张上线板决定能不能推、卡点在哪，以及下一刀该谁接。",
  "当前没有比下一步动作优先级更高的缺失项。",
  "或者：把第一段上线窗口排进真实活动日历",
  "像页面诊断工作表一样使用",
  "先加载一张可信 PDP",
  "这份 intake 的任务是先决定操盘路径",
  "先加载一份真实客户案例",
  "这份付费级 PDP 报告应该先解决什么",
  "The point here is not to expand a long idea list",
  "A paid-worthy pricing tool should protect margin",
  "Define the live price structure",
  "这一步不是为了扩写更多想法",
  "一个值钱的定价工具应该先保护利润",
  "先定义真实价格结构",
  "Paid handoff artifact",
  "Commercial summary",
  "Decision brief",
  "Execution call",
  "Review status",
  "Completion",
  "Commercial call",
  "Open lane",
  "Turns live inputs into a decision board you can act on immediately.",
  "Use this gallery read to decide what gets repaired first",
  "The tool should inspect the live hero frame",
  "Load the live family so the tool can see whether color or size children are drifting.",
  "The gallery has the basic role mix",
  "Image compliance is strongest when it starts from the actual gallery and main image",
  "The first compliance fix should land with whoever controls the main image",
  "Keep gallery review closed until it starts from the actual live gallery instead of user recall.",
  "Hero, proof, use case, dimensions, and objection handling should appear in a clean commercial sequence.",
  "The main-image heuristic is useful, but secondary-frame quality still needs a human commercial read",
  "The first image fix has one clear owner before the team starts discussing slot polish.",
  "The gallery needs to come from the real PDP first.",
  "No secondary risk outranks the main decision already on the board.",
  "Keep one creative owner on the first repair until the live gallery baseline is rechecked.",
  "The team now has enough structure to run a real weekly publishing system.",
  "No additional missing item outranks the next operator move.",
  "If the team tries to run more lanes than capacity supports",
  "Carry the priority format directly into hook-writing and short-video-brief creation.",
  "Load the live listing to confirm the real category path.",
  "Load your ASIN or Amazon URL.",
  "Let the tool draft the first optimization brief from the live page.",
  "If the live page has not been loaded, the team is still guessing. Do not turn that guesswork into a rewrite sprint.",
  "Use this competitor keyword read to decide whether the shortlist is ready for live placement, still needs pruning, or should stay out of the listing entirely.",
  "Keyword research owner should own the first move: add tighter competitors or adjust the seed before touching the listing.",
  "Split head terms, feature terms, and category terms so each slot does a different job.",
  "The current term set is too noisy or thin to justify rewriting listing copy around it.",
  "Keyword extraction is using a thin competitor set. Add more ASINs for better coverage.",
  "There are not many strong recurring modifiers yet. Widen the competitor set or adjust the seed.",
  "Do not audit from manual counts",
  "Do not optimize a listing you have not loaded",
  "Do not rewrite copy from this yet",
  "Keep image review closed until it starts from the actual live gallery instead of user recall.",
  "Official guide evidence",
  "官方风格证据",
  "Live PDP gallery",
  "Gallery count",
  "Competitor ASINs",
  "Recurring keyword candidates",
  "Image review is waiting on the live PDP",
  "Client takeaway 1",
  "Client takeaway 2",
  "Client takeaway 3",
  "Input focus 1",
  "Input focus 2",
  "Input focus 3",
  "付费交付件",
  "商业摘要",
  "决策简报",
  "执行调用",
  "复查状态",
  "完成度",
  "商业判断",
  "开放路径",
];

const hiddenLinePrefixes = [
  "Decision headline:",
  "Decision order:",
  "Review status:",
  "Execution owner:",
  "Decision owner:",
  "第一步动作：",
  "建议动作：",
  "当前状态：",
  "为什么现在做：",
  "Product:",
  "Buyer:",
  "Audience:",
  "Page URL:",
  "Traffic mix:",
  "Client takeaway",
  "Input focus",
  "Owner call:",
  "Team call:",
  "Owner rule:",
  "Team rule:",
  "Board order:",
  "Section order:",
  "Priority order:",
  "Response order:",
  "Message roles:",
  "Page roles:",
  "Role split:",
  "Offer rule:",
  "Discipline call:",
  "Risk call:",
  "Repair order:",
  "Approval gate:",
  "Stop-loss rule:",
  "Kill rule:",
  "Win rule:",
  "Scouting rule:",
  "Execution rule:",
  "Scale condition:",
  "Stop threshold:",
  "Budget rule:",
  "Growth goal:",
  "Target buyer:",
  "Operator call:",
  "Execution call:",
  "Commercial call:",
  "Open lane:",
  "Scenario call:",
  "Review call:",
  "Call:",
  "Meeting readout:",
  "Owner call：",
  "团队要求：",
  "板块顺序：",
  "页面角色：",
  "执行规则：",
  "优先顺序：",
  "响应顺序：",
  "风险判断：",
  "修复顺序：",
  "审批门槛：",
  "止损规则：",
  "赢家规则：",
  "执行调用：",
  "商业判断：",
  "开放路径：",
  "场景判断：",
  "复查判断：",
  "客户收获",
  "输入重点",
];

function shouldHideNoiseLine(text: string) {
  return (
    hiddenLinePrefixes.some((prefix) => text.startsWith(prefix)) ||
    /^This [a-z-]+ call:?/i.test(text) ||
    /^Live .+ inputs:?/i.test(text) ||
    /^First-screen .+:/i.test(text) ||
    /^本次.+判断[:：]?/.test(text) ||
    /^实时.+输入[:：]?/.test(text)
  );
}

function shouldHideSupportSectionTitle(text: string) {
  return hiddenSupportSectionTitles.some((title) => text === title);
}

function getReplacementText(text: string) {
  for (const [prefix, replacement] of replacementPrefixEntries) {
    if (text.startsWith(prefix)) {
      return replacement;
    }
  }

  return null;
}

function replaceLeadingTextNode(node: HTMLElement, replacement: string) {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType !== Node.TEXT_NODE) {
      continue;
    }

    const current = child.textContent ?? "";
    if (!current.trim()) {
      continue;
    }

    child.textContent = replacement;
    return true;
  }

  return false;
}

const noiseSignalFragments = [
  "handoff",
  "summary",
  "meeting",
  "owner call",
  "team call",
  "owner rule",
  "team rule",
  "board order",
  "section order",
  "priority order",
  "response order",
  "message roles",
  "page roles",
  "role split",
  "approval gate",
  "stop-loss",
  "kill rule",
  "win rule",
  "repair order",
  "discipline call",
  "scouting rule",
  "execution rule",
  "growth goal",
  "target buyer",
  "decision owner",
  "commercial call",
  "open lane",
  "protected assist",
  "directional sample",
  "operator call",
  "execution call",
  "scenario call",
  "review call",
  "付费交付件",
  "商业摘要",
  "会议可读摘要",
  "唯一负责人",
  "本轮禁止动作",
  "本轮批准动作",
  "优先顺序",
  "响应顺序",
  "审批门槛",
  "止损规则",
  "赢家规则",
  "修复顺序",
  "页面角色",
  "板块顺序",
  "决策负责人",
  "商业判断",
  "开放路径",
  "受保护增强",
  "方向性样本",
];

const keepCardFragments = [
  "first move",
  "next move",
  "next step",
  "verdict",
  "judgment",
  "结论",
  "下一步",
  "建议",
  "行动",
  "recommendation",
];

const preservedCardSupportPrefixes = [
  "Execution owner",
  "Decision owner",
  "Review status",
  "Completion",
  "Do not cross",
  "Then do",
  "Watch",
  "Why now",
  "Status",
  "Approval gate",
  "Stop-loss rule",
  "Kill rule",
  "Win rule",
  "Review cadence",
  "Decision order",
  "Board order",
  "Priority order",
  "Response order",
  "Execution owner：",
  "唯一负责人",
  "复查状态",
  "完成度",
  "不要跨过",
  "然后再做",
  "观察",
  "为什么现在",
  "状态",
  "审批门槛",
  "止损规则",
  "赢家规则",
  "复查节奏",
  "优先顺序",
  "响应顺序",
  "Detected category",
  "DETECTED CATEGORY",
  "First blocker",
  "Decision inputs still missing",
  "Commercial risk to watch",
  "Approved next move",
];

const preservedCardSupportFragments = [
  "owner",
  "review status",
  "completion",
  "watch",
  "why now",
  "status",
  "approval gate",
  "stop-loss",
  "kill rule",
  "win rule",
  "review cadence",
  "decision order",
  "priority order",
  "response order",
  "唯一负责人",
  "复查状态",
  "完成度",
  "观察",
  "为什么现在",
  "状态",
  "审批门槛",
  "止损规则",
  "赢家规则",
  "复查节奏",
  "优先顺序",
  "响应顺序",
  "detected category",
  "first blocker",
  "decision inputs still missing",
  "commercial risk to watch",
  "approved next move",
];

function getNoiseSignalScore(text: string) {
  const lower = text.toLowerCase();
  let score = 0;

  for (const fragment of noiseSignalFragments) {
    if (lower.includes(fragment.toLowerCase())) {
      score += 1;
    }
  }

  if (hiddenContentFragments.some((fragment) => text.includes(fragment))) {
    score += 2;
  }

  if (hiddenCardFragments.some((fragment) => text.includes(fragment))) {
    score += 2;
  }

  if (shouldHideNoiseLine(text)) {
    score += 2;
  }

  return score;
}

const hiddenCardFragments = [
  "Live tool",
  "实时工具",
  "Scenario presets",
  "场景预设",
  "Operator worksheet",
  "操盘工作纸",
  "Input brief",
  "输入简报",
  "Executive readout",
  "高层读稿",
  "Commercial summary",
  "商业摘要",
  "Meeting-ready summary",
  "会议可读摘要",
  "Paid handoff artifact",
  "付费交付件",
  "Operator handoff",
  "operator handoff",
  "Meeting readout",
];

const preserveResultCardStarts = [
  "Current result",
  "当前结果",
  "Action plan",
  "行动建议",
  "Review brief",
];

function normalizeText(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function isMostlyLatin(text: string) {
  const chars = text.replace(/\s+/g, "");
  if (chars.length < 16) {
    return false;
  }

  const latinLikeCount = Array.from(chars).filter((char) => /[A-Za-z0-9:/.,|()%+-]/.test(char)).length;
  return latinLikeCount / chars.length >= 0.65;
}

function shouldHideHeading(text: string) {
  if (!text) {
    return false;
  }

  const lower = text.toLowerCase();

  if (hiddenExactHeadingsLower.has(lower)) {
    return true;
  }

  return (
    lower.includes("analysis") ||
    lower.includes("action queue") ||
    lower.includes("action queue") ||
    lower.includes("decision brief") ||
    lower === "input" ||
    lower === "result" ||
    lower === "输入" ||
    lower === "结果" ||
    lower.includes("实时输入") ||
    lower.includes("本次") ||
    lower.startsWith("live ") ||
    lower.startsWith("this ") ||
    lower.startsWith("what this page should deliver") ||
    lower.startsWith("the default board should already") ||
    lower.startsWith("decision board") ||
    lower.startsWith("manual overrides") ||
    lower.startsWith("first move") ||
    lower.startsWith("next step") ||
    lower.startsWith("execution call") ||
    lower.startsWith("review status") ||
    lower.startsWith("completion") ||
    lower.startsWith("commercial call") ||
    lower.startsWith("open lane") ||
    lower.startsWith("executive readout") ||
    lower.startsWith("operator handoff") ||
    lower.startsWith("meeting readout") ||
    lower.startsWith("ready-to-use handoff") ||
    lower.startsWith("copy handoff") ||
    lower.startsWith("action boundary") ||
    lower.startsWith("reference case") ||
    lower.startsWith("live case") ||
    lower.startsWith("next paid-grade handoff") ||
    lower.startsWith("operator worksheet") ||
    lower.startsWith("scenario presets") ||
    lower.startsWith("quick example") ||
    lower.startsWith("input brief") ||
    lower.startsWith("decision board") ||
    lower.startsWith("executive readout") ||
    lower.startsWith("动作边界") ||
    lower.startsWith("场景预设") ||
    lower.startsWith("输入简报")
  );
}

function shouldHidePreservedCardDetail(text: string, locale: SupportedLocale) {
  if (!text) {
    return false;
  }

  const lower = text.toLowerCase();

  if (/^\d{1,3}\/100$/.test(text)) {
    return true;
  }

  if (/^[A-Z][A-Z\\s/-]{4,28}$/.test(text)) {
    return true;
  }

  if (shouldHideNoiseLine(text)) {
    return true;
  }

  if (hiddenContentFragments.some((fragment) => text.includes(fragment))) {
    return true;
  }

  if (
    /^(Paid deliverable lens|Operator worksheet|Input brief|Next paid-grade handoff|Executive readout|Action boundary|Decision inputs still missing|Commercial risk to watch|Approved next move|Full execution notes|Meeting-ready summary|Client takeaway|Input focus)/i.test(
      text,
    )
  ) {
    return true;
  }

  if (
    preservedCardSupportPrefixes.some((prefix) =>
      text.startsWith(prefix),
    )
  ) {
    return true;
  }

  if (
    preservedCardSupportFragments.some((fragment) =>
      lower.includes(fragment.toLowerCase()),
    )
  ) {
    return true;
  }

  if (locale === "zh" && isMostlyLatin(text) && text.length >= 18) {
    return true;
  }

  return false;
}

export function ToolRuntimeSimplifier({
  locale,
  slug,
}: ToolRuntimeSimplifierProps) {
  const markerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const root = markerRef.current?.closest(".tool-runtime-shell") as HTMLElement | null;
    if (!root) {
      return;
    }
    root.setAttribute("data-runtime-simplifier-mounted", "true");

    const isShopifyTool = slug.startsWith("shopify-");

    let cleanupTimeout: ReturnType<typeof setTimeout> | null = null;
    let hydrationUnlockTimeout: ReturnType<typeof setTimeout> | null = null;
    let mutationIdleTimeout: ReturnType<typeof setTimeout> | null = null;
    let animationFrameId: number | null = null;
    let stablePasses = 0;
    let forcedCleanupAttempts = 0;
    let hydrationUnlocked = false;
    let cleanupApplied = false;
    let appliedSnapshot = "";
    let lastSnapshot = "";
    let isApplyingCleanup = false;

    const isRuntimeReady = () => {
      const text = normalizeText(root.textContent);
      if (!text) {
        return false;
      }

      if (
        text.includes("Loading result") ||
        text.includes("结果加载中") ||
        text.includes("Please wait while the system organizes the inputs and prepares the result.") ||
        text.includes("The tool is organizing the inputs and preparing the result.") ||
        text.includes("请稍等，系统正在整理输入并生成结论。")
      ) {
        return false;
      }

      return Boolean(
        root.querySelector("input, select, textarea, button, [role='combobox'], aside, [role='complementary']"),
      );
    };

    const getRuntimeSnapshot = () => {
      const normalized = normalizeText(root.textContent).replace(
        /\b(css-[a-z0-9-]+|__next)\b/gi,
        "",
      );

      if (normalized.length <= 5200) {
        return normalized;
      }

      return `${normalized.slice(0, 2600)}__SNAPSHOT_SPLIT__${normalized.slice(-2600)}`;
    };

    const rootLooksStable = () => {
      if (!isRuntimeReady()) {
        lastSnapshot = "";
        stablePasses = 0;
        return false;
      }

      const snapshot = getRuntimeSnapshot();
      if (!snapshot) {
        lastSnapshot = "";
        stablePasses = 0;
        return false;
      }

      if (snapshot === lastSnapshot) {
        stablePasses += 1;
      } else {
        lastSnapshot = snapshot;
        stablePasses = 1;
      }

      return stablePasses >= 3;
    };

    const applyCleanup = () => {
      if (isApplyingCleanup) {
        return;
      }

      isApplyingCleanup = true;
      root.dataset.runtimeSimplified = "running";

      if (!isRuntimeReady()) {
        root.dataset.runtimeSimplified = "waiting";
        isApplyingCleanup = false;
        return;
      }

      forcedCleanupAttempts = 0;
      try {
        const directTextNodes = Array.from(
          root.querySelectorAll<HTMLElement>("p, button, a, summary, label"),
        );
        const seenLongLines = new Set<string>();
        const stageHeader = root.querySelector<HTMLElement>(".tool-stage > div > div:first-child");

        if (stageHeader) {
          const headerChildren = Array.from(stageHeader.children) as HTMLElement[];
          for (const child of headerChildren) {
            const text = normalizeText(child.textContent);
            if (!text) {
              continue;
            }

            if (
              /实时工具|live tool|执行结论|executive call|execution call/i.test(text)
            ) {
              child.style.display = "none";
            }
          }
        }

        if (!isShopifyTool) {
          const noisyRegions = Array.from(
            root.querySelectorAll<HTMLElement>("aside, [role='complementary']"),
          );
          for (const region of noisyRegions) {
            const text = normalizeText(region.textContent);
            if (!text) {
              continue;
            }

            if (
              hiddenContentFragments.some((fragment) => text.includes(fragment)) ||
              /decision board|executive readout|action boundary|paid handoff|meeting-ready summary|full execution notes|review status|completion|commercial call|open lane|复查状态|商业判断|执行调用|付费交付件/i.test(
                text,
              )
            ) {
              region.style.display = "none";
            }
          }
        }

        const allNoisyRegions = Array.from(
          root.querySelectorAll<HTMLElement>("aside, [role='complementary']"),
        );
        for (const region of allNoisyRegions) {
          const text = normalizeText(region.textContent);
          if (!text) {
            continue;
          }

          if (
            /decision board|executive readout|action boundary|paid handoff|meeting-ready summary|full execution notes|review status|completion|commercial call|open lane|复查状态|商业判断|执行调用|付费交付件|商业摘要|会议可读摘要|完整执行说明|approved next move|commercial risk to watch|decision inputs still missing|next paid-grade handoff|ready-to-forward|ready to forward/i.test(
              text,
            )
          ) {
            region.style.display = "none";
          }
        }

        for (const node of directTextNodes) {
          const text = normalizeText(node.textContent);
          if (!text) {
            continue;
          }

        const replacementText = getReplacementText(text);
        if (replacementText && node.textContent) {
          const hasFormControl = Boolean(
            node.querySelector?.("input, select, textarea, button, [role='combobox']"),
          );
          if (!replaceLeadingTextNode(node, replacementText) && !hasFormControl) {
            node.textContent = replacementText;
          }
          continue;
        }

        if (/^https?:\/\//i.test(text)) {
          node.style.display = "none";
          continue;
        }

        if (shouldHideNoiseLine(text)) {
          const nearestCard = node.closest("div[class*='rounded'], aside, details");
          const nearestCardHasControls =
            nearestCard instanceof HTMLElement &&
            Boolean(nearestCard.querySelector("input, select, textarea, button, [role='combobox']"));
          const nearestCardIsPreservedResult =
            nearestCard instanceof HTMLElement &&
            preserveResultCardStarts.some((prefix) =>
              normalizeText(nearestCard.textContent).toLowerCase().startsWith(prefix.toLowerCase()),
            );
          if (
            nearestCard instanceof HTMLElement &&
            nearestCard !== root &&
            !nearestCardHasControls &&
            !nearestCardIsPreservedResult
          ) {
            nearestCard.style.display = "none";
          } else {
            node.style.display = "none";
          }
          continue;
        }

        if (hiddenContentFragments.some((fragment) => text.includes(fragment))) {
          const nearestCard = node.closest("div[class*='rounded'], aside, details");
          const nearestCardHasControls =
            nearestCard instanceof HTMLElement &&
            Boolean(nearestCard.querySelector("input, select, textarea, button, [role='combobox']"));
          const nearestCardIsPreservedResult =
            nearestCard instanceof HTMLElement &&
            preserveResultCardStarts.some((prefix) =>
              normalizeText(nearestCard.textContent).toLowerCase().startsWith(prefix.toLowerCase()),
            );
          if (
            nearestCard instanceof HTMLElement &&
            nearestCard !== root &&
            !nearestCardHasControls &&
            !nearestCardIsPreservedResult
          ) {
            nearestCard.style.display = "none";
          } else {
            node.style.display = "none";
          }
          continue;
        }

        if (
          /^(Paid deliverable lens|Operator worksheet|Scenario presets|Quick example|Input brief|Next paid-grade handoff|Executive readout|Action boundary|Decision inputs still missing|Commercial risk to watch|Approved next move|Full execution notes|Meeting-ready summary|Client takeaway|Input focus|高层读稿|场景预设|输入简报|下一份付费级交付|下一份付费级交接)/i.test(
            text,
          )
        ) {
          const nearestCard = node.closest("div[class*='rounded'], aside, details");
          const nearestCardHasControls =
            nearestCard instanceof HTMLElement &&
            Boolean(
              nearestCard.querySelector("input, select, textarea, button, [role='combobox']"),
            );
          const nearestCardIsAside =
            nearestCard instanceof HTMLElement &&
            (nearestCard.tagName === "ASIDE" || nearestCard.getAttribute("role") === "complementary");

          if (
            nearestCard instanceof HTMLElement &&
            nearestCard !== root &&
            !nearestCardHasControls &&
            !(isShopifyTool && nearestCardIsAside)
          ) {
            nearestCard.style.display = "none";
          } else {
            node.style.display = "none";
          }
          continue;
        }

        if (locale === "zh" && node.tagName === "P" && isMostlyLatin(text)) {
          node.style.display = "none";
          continue;
        }

        if (
          text === "可用" ||
          text === "Ready" ||
          text === "Needs review" ||
          text === "Blocked"
        ) {
          node.style.display = "none";
          continue;
        }

        if (
          text === "Live tool" ||
          text === "Decision board" ||
          text === "实时工具" ||
          text === "决策板" ||
          text === "Meeting-ready summary" ||
          text === "Paid handoff artifact" ||
          text === "Commercial summary" ||
          text === "Full execution notes" ||
          text === "Owner not assigned yet" ||
          text === "Blocked move" ||
          text === "Keep one owner on the next move so the tool turns into action, not commentary." ||
          text === "会议摘要" ||
          text === "付费交付件" ||
          text === "商业摘要" ||
          text === "完整执行说明" ||
          text === "会议可读摘要" ||
          text === "负责人尚未指定" ||
          text === "阻止动作" ||
          text === "先指定一个负责人，再把结果变成动作，不要停留在评论层。" ||
          text === "Turns live inputs into a decision board you can act on immediately." ||
          text === "把实时输入整理成一份可直接行动的决策板。" ||
          text === "Use this profit check only after the live sell price and cost stack are both real." ||
          text === "This page" ||
          text === "Operator handoff" ||
          text === "operator handoff" ||
          text === "Ready-to-use handoff" ||
          text === "Copy handoff" ||
          text === "Meeting readout" ||
          text === "输入" ||
          text === "结果" ||
          text === "Keep the first economics fix under one owner until price truth and cost truth are both locked." ||
          text === "This step is not about writing more lines. It is about locking the opening angle, early proof, and stop-power that deserve testing first." ||
          text === "This is the fast commercial readout for founders, collaborators, and downstream owners. Read these lines first, then expand into the full handoff only if needed." ||
          text === "Use this screen for the quick readout first, then forward the full artifact to the next execution owner." ||
          text === "Use this PDP report to decide where the first leak is, which move is blocked for now, and which commercial page should inherit the diagnosis next." ||
          text === "Define the live page, the spend context, and the one notes block that explains why this PDP should or should not keep receiving paid traffic." ||
          text === "Judged from hero clarity, trust strength, offer clarity, and mobile friction before spend is approved." ||
          text === "Only use manual overrides when you want to test alternate keyword sets or a rewritten title." ||
          text === "Open manual overrides only for one alternate benchmark path." ||
          text === "Only use manual overrides when you need to test a different creative angle or revise the planned image jobs." ||
          text === "Keep the PDP frozen until the live page makes the first blocker explicit enough to assign and fix." ||
          text === "If the visual contrast is not dramatic enough, the before-after frame will look fake or too mild to stop scroll." ||
          text === "Keep delivery reactive and imperfect enough to feel native to feed content." ||
          text === "Treat the visual contrast as the hero event and keep explanation secondary." ||
          text === "This tool is for deciding whether a SKU has earned the right to keep getting budget, content, and operator attention." ||
          text === "Give the content team one primary winner angle and push volume behind it." ||
          text === "Trading and content teams should keep one controlled winner lane live for the next cycle." ||
          text === "Do not expand spend until the first named leak is repaired, re-read, and handed into the next commercial page." ||
          text === "Define the approved angle, the proof stack, and the one weakness that should control the rewrite. This block should only hold what the page team needs to change the first commercial section." ||
          text === "Use this page to turn scattered copy opinions into one hero, one proof order, and one CTA direction." ||
          text === "When teams rewrite hero, benefits, FAQ, and CTA all at once, they usually lose the causal read." ||
          text === "Ask for the first commitment only after the proof block reduces hesitation." ||
          text === "只有在实时售价和成本层都真实之后，这份利润判断才值得参考。" ||
          text === "在售价和成本真值都锁定之前，先把第一步利润修正交给一个负责人处理。" ||
          text === "这一步不是继续多写几条文案，而是先锁定最值得测试的开场角度、前置证明和停留强度。" ||
          text === "这一步不是为了多写几句开场，而是为了确定最值得先测的开场方向、前置证明和停留抓手。" ||
          text === "这是一份给创始人、协作者和后续负责人先读的快速商业摘要。先读这里，再决定是否展开完整交接稿。" ||
          text === "先用这一屏完成快速判断，再把完整交付稿转给下一位执行负责人。" ||
          text === "这份 PDP 报告用来判断第一处真实漏损、当前该先挡住什么，以及下一步该交给哪一类商业页面承接。" ||
          text === "先定义实时页面、投放背景，以及那一段真正解释为什么这张 PDP 还该不该继续接流量的备注。" ||
          text === "这份判断基于首屏表达、信任强度、优惠清晰度和移动端摩擦，在批准继续投放前给出。" ||
          text === "如果 PDP 叙事已经清楚，就把同一套 hero 和 proof 逻辑带进投流落地页。" ||
          text === "用这张售后决策板把激活、预期管理和二购收入放进同一条流程，而不是拆给不同团队各自猜。" ||
          text === "只有在你想测试另一组关键词或改写标题时，才打开手动覆盖。" ||
          text === "只有在要测试另一条对标路径时，才打开手动覆盖。" ||
          text === "只有在要测试另一条创意方向，或重排图片任务时，才打开手动覆盖。" ||
          text === "先让 PDP 保持冻结，直到实时页面把第一处阻塞讲清楚，足够让人指定负责人并开始修复。" ||
          text === "如果视觉反差不够强，这种 before-after 框架会显得太假，或者弱到拦不住滑走。" ||
          text === "表达要保持即时、自然，像原生 feed 内容，不要太像广告脚本。" ||
          text === "把视觉反差当成主事件，解释放后面。" ||
          text === "这个工具是用来判断这条 SKU 是否值得继续拿预算、内容产能和运营注意力的。" ||
          text === "先给内容团队一个主胜出角度，再把量推上去。" ||
          text === "交易和内容团队下一轮只保留一条受控的赢家路线继续推进。" ||
          text === "在第一处明确漏损修好、复读确认并交接到下一张商业页面之前，不要继续放大投放。" ||
          text === "先定义批准过的角度、证明素材和控制这次改写的那一个弱点。这一块只保留页面团队真正要拿去改第一商业区块的信息。" ||
          text === "这个页面的任务是把分散的 copy 意见压成一套 hero、一条 proof 顺序和一个 CTA 方向。" ||
          text === "团队一旦同时重写 hero、benefits、FAQ 和 CTA，通常就会把因果链写散。" ||
          text === "只有在 proof 区先减少犹豫之后，才发出第一步承诺请求。" ||
          hiddenMetaPrefixes.some((prefix) => text.startsWith(prefix)) ||
          text === "Copy forwardable handoff" ||
          text.startsWith("Live case") ||
          text.startsWith("Reference case") ||
          text.startsWith("Next paid-grade handoff")
        ) {
          node.style.display = "none";
          continue;
        }

        if (node.tagName === "P" && text.length >= 36) {
          if (seenLongLines.has(text)) {
            node.style.display = "none";
            continue;
          }

          seenLongLines.add(text);
        }
        }

        const inputStage = root.querySelector<HTMLElement>(".tool-stage .mt-5.grid");
        if (inputStage) {
          const stageChildren = Array.from(inputStage.children) as HTMLElement[];

          for (const child of stageChildren) {
            const text = normalizeText(child.textContent);
            const hasControls = Boolean(
              child.querySelector("input, select, textarea, button"),
            );

            if (hasControls) {
              continue;
            }

            if (
              text.includes("Enter an ASIN") ||
              text.includes("Load the live PDP first") ||
              text.includes("先输入") ||
              text.includes("优先填写")
            ) {
              child.style.display = "none";
              continue;
            }

            if (/live |this |analysis|brief|pressure|posture|summary|decision order|checkpoints|timeline|clusters|signals|watch|review status|completion|commercial call|open lane/i.test(text)) {
              child.style.display = "none";
            }
          }
        }

        const resultStage = root.querySelector<HTMLElement>(".tool-stage > aside, .tool-stage aside");
        if (resultStage) {
          const resultText = normalizeText(resultStage.textContent);
          if (
            /decision board|executive readout|action boundary|paid handoff|meeting-ready summary|full execution notes|approved next move|commercial risk to watch|decision inputs still missing|review status|completion|commercial call|open lane|next paid-grade handoff|ready to forward|付费交付件|商业摘要|会议可读摘要|完整执行说明|执行调用|复查状态|商业判断/i.test(
              resultText,
            )
          ) {
            resultStage.style.display = "none";
          }
        }

        const cards = Array.from(
          root.querySelectorAll<HTMLElement>(
            "div[class*='rounded'], details, a, button, aside",
          ),
        );

        for (const card of cards) {
          const text = normalizeText(card.textContent);
          if (!text) {
            continue;
          }

        const lower = text.toLowerCase();
        const hasInteractiveField = Boolean(
          card.querySelector("input, select, textarea, details, [role='combobox']"),
        );
        const isStartMatch = hiddenCardStarts.some((prefix) =>
          lower.startsWith(prefix.toLowerCase()),
        );
        const isPreservedResultCard = preserveResultCardStarts.some((prefix) =>
          lower.startsWith(prefix.toLowerCase()),
        );
        const cardHasPreservedSignal = preserveResultCardStarts.some((prefix) =>
          lower.includes(prefix.toLowerCase()),
        );
        const isLinkMatch = hiddenLinkTexts.some((prefix) =>
          lower.startsWith(prefix.toLowerCase()),
        );
        const isNoisySupportCard =
          /paid deliverable lens|operator worksheet|scenario presets|quick example|input brief|next paid-grade handoff|executive readout|action boundary|decision inputs still missing|commercial risk to watch|approved next move|full execution notes|meeting-ready summary|client takeaway|input focus|高层读稿|场景预设|输入简报|下一份付费级交付|下一份付费级交接/i.test(
            lower,
          );
        const hasHiddenFragment = hiddenContentFragments.some((fragment) =>
          text.includes(fragment),
        );
        const hasHiddenCardFragment = hiddenCardFragments.some((fragment) =>
          text.includes(fragment),
        );
        const hasNoiseLine = shouldHideNoiseLine(text);
        const noiseSignalScore = getNoiseSignalScore(text);
        const hasKeepSignal = keepCardFragments.some((fragment) =>
          lower.includes(fragment.toLowerCase()),
        );

        if (isLinkMatch) {
          card.style.display = "none";
          continue;
        }

        if (
          /场景预设|Scenario presets|快速示例|Quick example|这个页面在交付什么|高层读稿|操盘工作纸|Operator worksheet|输入简报|Input brief|下一份付费级交付|Next paid-grade handoff/i.test(
            text,
          ) &&
          !hasInteractiveField
        ) {
          card.style.display = "none";
          continue;
        }

        const isAsideCard =
          card.tagName === "ASIDE" || card.getAttribute("role") === "complementary";

        if (isNoisySupportCard && !hasInteractiveField && !(isShopifyTool && isAsideCard)) {
          card.style.display = "none";
          continue;
        }

        if (
          isStartMatch &&
          !isPreservedResultCard &&
          !cardHasPreservedSignal &&
          !hasInteractiveField &&
          !lower.startsWith("asin or amazon product url") &&
          !lower.startsWith("product page url")
        ) {
          card.style.display = "none";
          continue;
        }

        if (hasHiddenFragment && !hasInteractiveField && !cardHasPreservedSignal) {
          card.style.display = "none";
          continue;
        }

        if (hasNoiseLine && !hasInteractiveField && !cardHasPreservedSignal) {
          card.style.display = "none";
          continue;
        }

        if (
          noiseSignalScore >= 4 &&
          !hasInteractiveField &&
          !cardHasPreservedSignal &&
          !hasKeepSignal &&
          !lower.includes("asin") &&
          !lower.includes("url") &&
          !lower.includes("marketplace") &&
          !lower.includes("load")
        ) {
          card.style.display = "none";
          continue;
        }

        if (
          hasHiddenCardFragment &&
          !isPreservedResultCard &&
          !cardHasPreservedSignal &&
          !hasInteractiveField &&
          !lower.includes("asin") &&
          !lower.includes("url") &&
          !lower.includes("marketplace") &&
          !lower.includes("load")
        ) {
          card.style.display = "none";
          continue;
        }

        if (isPreservedResultCard || cardHasPreservedSignal) {
          const seenSupportTexts = new Set<string>();
          const supportNodes = Array.from(
            card.querySelectorAll<HTMLElement>("div, p, li, span, summary, h4"),
          );

          for (const node of supportNodes) {
            const nodeText = normalizeText(node.textContent);
            if (!nodeText) {
              continue;
            }

            if (node.children.length > 0) {
              continue;
            }

            const nodeLower = nodeText.toLowerCase();
            const dedupeKey = nodeLower.replace(/[.!?]+$/, "");

            if (seenSupportTexts.has(dedupeKey)) {
              node.style.display = "none";
              continue;
            }
            seenSupportTexts.add(dedupeKey);

            if (
              preserveResultCardStarts.some((prefix) =>
                nodeLower.startsWith(prefix.toLowerCase()),
              )
            ) {
              continue;
            }

            if (keepCardFragments.some((fragment) => nodeLower.includes(fragment.toLowerCase()))) {
              continue;
            }

            if (shouldHidePreservedCardDetail(nodeText, locale)) {
              node.style.display = "none";
            }
          }
        }
        }

        const textNodes = Array.from(
          root.querySelectorAll<HTMLElement>("p, li, h2, h3, h4, summary, button, label, div, span, option"),
        );

        for (const node of textNodes) {
          const text = normalizeText(node.textContent);
          if (!text) {
            continue;
          }

        const replacementText = getReplacementText(text);
        if (replacementText && node.textContent) {
          const hasFormControl = Boolean(
            node.querySelector?.("input, select, textarea, button, [role='combobox']"),
          );
          if (!replaceLeadingTextNode(node, replacementText) && !hasFormControl) {
            node.textContent = replacementText;
          }
          continue;
        }

        if (node.tagName === "DIV" && node.children.length > 0) {
          continue;
        }

        if (node.tagName === "BUTTON") {
          if (
            hiddenButtonTexts.has(text) ||
            hiddenButtonPrefixes.some((prefix) => text.startsWith(prefix))
          ) {
            const nearestCard = node.closest("div[class*='rounded']");
            if (nearestCard instanceof HTMLElement) {
              nearestCard.style.display = "none";
            } else {
              node.style.display = "none";
            }
            continue;
          }
        }

        if (node.tagName === "A") {
          if (
            hiddenLinkTexts.includes(text) ||
            text.startsWith("Official guide evidence") ||
            text.startsWith("官方风格证据")
          ) {
            const nearestCard = node.closest("div[class*='rounded'], aside, details");
            if (nearestCard instanceof HTMLElement) {
              nearestCard.style.display = "none";
            } else {
              node.style.display = "none";
            }
            continue;
          }
        }

        if (!shouldHideHeading(text)) {
          if (!shouldHideSupportSectionTitle(text)) {
            continue;
          }
        }

        const preserveResultHeading = preserveResultCardStarts.some((prefix) =>
          text.toLowerCase().startsWith(prefix.toLowerCase()),
        );

        const parent = node.parentElement;
        if (!parent || parent === root) {
          node.style.display = "none";
          continue;
        }

        if (parent.tagName === "SUMMARY") {
          const details = parent.parentElement;
          if (details instanceof HTMLElement) {
            details.style.display = "none";
          }
          continue;
        }

        if (parent.className.includes("rounded") || parent.className.includes("border")) {
          if (parent.querySelector("input, select, textarea") || preserveResultHeading) {
            node.style.display = "none";
            continue;
          }
          parent.style.display = "none";
          continue;
        }

        const nearestDiv: Element | null = parent.closest("div");
        if (
          nearestDiv instanceof HTMLElement &&
          nearestDiv !== root &&
          /rounded|border/.test(nearestDiv.className)
        ) {
          if (nearestDiv.querySelector("input, select, textarea") || preserveResultHeading) {
            node.style.display = "none";
            continue;
          }
          nearestDiv.style.display = "none";
          continue;
        }

        node.style.display = "none";
        }

        const seenLeafTexts = new Set<string>();
        const leafNodes = Array.from(
          root.querySelectorAll<HTMLElement>("div, p, li, span, summary, label"),
        );

        for (const node of leafNodes) {
          if (node.children.length > 0) {
            continue;
          }

        const text = normalizeText(node.textContent);
        if (!text) {
          continue;
        }

        const lower = text.toLowerCase();

        if (
          hiddenExactHeadingsLower.has(lower) ||
          hiddenContentFragments.some((fragment) => text.includes(fragment)) ||
          shouldHideNoiseLine(text) ||
          shouldHideSupportSectionTitle(text) ||
          ["可用", "ready", "needs review", "blocked"].includes(lower) ||
          /^(Paid deliverable lens|Operator worksheet|Scenario presets|Quick example|Input brief|Next paid-grade handoff|Executive readout|Action boundary|Decision inputs still missing|Commercial risk to watch|Approved next move|Full execution notes|Meeting-ready summary|Client takeaway|Input focus|高层读稿|场景预设|输入简报|下一份付费级交付|下一份付费级交接)/i.test(
            text,
          )
        ) {
          node.style.display = "none";
          continue;
        }

        if (
          node.tagName !== "LABEL" &&
          node.tagName !== "SUMMARY" &&
          text.length >= 12
        ) {
          const dedupeKey = lower.replace(/[.!?]+$/, "");
          if (seenLeafTexts.has(dedupeKey)) {
            node.style.display = "none";
            continue;
          }
          seenLeafTexts.add(dedupeKey);
        }
        }

        const primaryResultPanels = Array.from(
          root.querySelectorAll<HTMLElement>("div.rounded-xl, div.rounded-lg"),
        );

        for (const panel of primaryResultPanels) {
          const panelText = normalizeText(panel.textContent);
          const lower = panelText.toLowerCase();

          if (
            !lower.startsWith("current result") &&
            !lower.startsWith("当前结果") &&
            !lower.startsWith("action plan") &&
            !lower.startsWith("行动建议")
          ) {
            continue;
          }

          panel.style.display = "";

          let ancestor = panel.parentElement;
          while (ancestor && ancestor !== root) {
            if (ancestor.style.display === "none") {
              ancestor.style.display = "";
            }
            ancestor = ancestor.parentElement;
          }

          const descendants = Array.from(panel.querySelectorAll<HTMLElement>("p, div, span"));
          for (const descendant of descendants) {
            if (!normalizeText(descendant.textContent)) {
              continue;
            }

            descendant.style.display = "";
          }
        }

        cleanupApplied = true;
        appliedSnapshot = getRuntimeSnapshot();
        root.dataset.runtimeSimplified = "true";
      } catch (error) {
        root.dataset.runtimeSimplified = "error";
        root.dataset.runtimeSimplifyError =
          error instanceof Error ? error.message.slice(0, 120) : "unknown";
      } finally {
        isApplyingCleanup = false;
      }
    };

    const scheduleCleanup = () => {
      if (!hydrationUnlocked) {
        return;
      }

      if (cleanupTimeout) {
        clearTimeout(cleanupTimeout);
      }

      cleanupTimeout = setTimeout(() => {
        const snapshot = getRuntimeSnapshot();
        if (cleanupApplied && snapshot && snapshot === appliedSnapshot) {
          return;
        }

        const stable = rootLooksStable();
        if (!stable) {
          forcedCleanupAttempts += 1;

          if (forcedCleanupAttempts >= 4 && isRuntimeReady()) {
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
            }

            animationFrameId = window.requestAnimationFrame(() => {
              animationFrameId = window.requestAnimationFrame(() => {
                applyCleanup();
              });
            });
            return;
          }

          if (mutationIdleTimeout) {
            clearTimeout(mutationIdleTimeout);
          }
          mutationIdleTimeout = setTimeout(() => {
            scheduleCleanup();
          }, 500);
          return;
        }

        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }

        animationFrameId = window.requestAnimationFrame(() => {
          animationFrameId = window.requestAnimationFrame(() => {
            applyCleanup();
          });
        });
      }, 220);
    };

    hydrationUnlockTimeout = setTimeout(() => {
      hydrationUnlocked = true;
      applyCleanup();
      scheduleCleanup();
    }, 250);

    const observer = new MutationObserver(() => {
      if (isApplyingCleanup) {
        return;
      }
      scheduleCleanup();
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    const latePassInterval = window.setInterval(() => {
      if (!hydrationUnlocked || isApplyingCleanup) {
        return;
      }

      const snapshot = getRuntimeSnapshot();
      if (!snapshot || snapshot === appliedSnapshot) {
        return;
      }

      forcedCleanupAttempts = Math.max(forcedCleanupAttempts, 3);
      applyCleanup();
      scheduleCleanup();
    }, 1800);

    return () => {
      observer.disconnect();
      if (cleanupTimeout) {
        clearTimeout(cleanupTimeout);
      }
      if (mutationIdleTimeout) {
        clearTimeout(mutationIdleTimeout);
      }
      if (hydrationUnlockTimeout) {
        clearTimeout(hydrationUnlockTimeout);
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      window.clearInterval(latePassInterval);
    };
  }, []);

  return <span ref={markerRef} hidden aria-hidden="true" data-tool-runtime-simplifier="true" />;
}
