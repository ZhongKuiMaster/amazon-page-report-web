# Amazon Growth & Profit Planner P0 Spec

## 0. Ownership And Scope

- Product line: Amazon Growth & Profit Planner.
- Recommended slug: `amazon-growth-profit-planner`.
- English title: `Amazon Growth & Profit Planner`.
- Chinese title: `Amazon 增长利润规划器`.
- One-line value proposition: Turn one SKU's price, cost, traffic, inventory, and ad inputs into a profit-safe Amazon growth plan with official action options and stop-lines.
- P0 owner role: execution thread for Growth & Profit Planner.
- Not owned by this product: Ads Workbench ad account/report diagnosis, Alexa Listing Builder copy generation, Seller Central API integration, live inventory/fee syncing.

P0 core result:

> After a user enters one ASIN/SKU's price, costs, FBA/referral fee, inventory, sales velocity, traffic, conversion, and ad efficiency, the tool identifies the current growth bottleneck and recommends the next official Amazon growth or operating action while showing profit floor, ad ceiling, stop-line, and review window.

P0 is not a generic profit calculator. P0 is not an activity recommender. It is a SKU-level operating decision brief.

## 1. Decision This Tool Must Answer

Primary decision:

- Should the seller scale, protect profit, control ads, clear inventory, fix listing conversion, or first provide missing data?

Required follow-on decisions:

- If sales need to grow, should the seller prioritize Coupon, Deal, Prime Exclusive Deal, Sponsored Products, Sponsored Brands, Sponsored Display, Vine, A+ Content, Brand Store, Posts, or no growth action yet?
- Will the action break the profit floor?
- What should be reviewed in 7, 14, or 30 days?
- What threshold triggers stop, downgrade, or adjustment?

## 2. P0 Rejection Gates

Any one item below rejects the P0 output:

1. Only calculates profit and gives no operating action.
2. Recommends an official action but does not check profit floor.
3. Missing landed cost, FBA fee, or referral fee and still recommends adding ads, running a Deal, or discounting.
4. Missing Sessions/Page views, Orders/CVR, or ad efficiency and still makes a high-confidence traffic bottleneck call.
5. Missing inventory units or sales velocity and still recommends scaling, rank push, Deal, Coupon expansion, or ad budget increase.
6. Copies Ads Workbench's ad report diagnosis structure instead of making a SKU-level growth/profit decision.
7. Generates Alexa Listing Builder outputs such as title, bullets, long description, or Search Terms.
8. Pretends to have Seller Central live data, real-time inventory, fee backend, rank history, or Amazon API access.
9. Promises guaranteed growth, lower ACOS, higher profit, or ranking improvement.
10. Exposes traceback, local paths, HTTP stack, script names, model errors, or English internal demo text in user-facing errors.

## 3. Page Integration Package

### Route Recommendation

- Route: `/amazon/amazon-growth-profit-planner`.
- Launch form: single-page tool detail page, runtime-first.
- P0 backend: deterministic client/server calculation is enough; no upload parser or AI call is required for first implementation.
- Output style: decision brief plus operating plan table, not long free text.

### Form Fields

Required fields:

| Field key | Label | Type | Notes |
| --- | --- | --- | --- |
| `skuName` | SKU / ASIN name | text | Accept SKU, ASIN, or product nickname. |
| `price` | Selling price | number | Per unit selling price. |
| `landedCost` | Landed cost | number | Product cost including procurement/import when available. |
| `referralFeeMode` | Referral fee input mode | select | `rate` or `amount`. |
| `referralFeeRate` | Referral fee rate | number | Required when mode is `rate`. |
| `referralFeeAmount` | Referral fee amount | number | Required when mode is `amount`. |
| `fbaFee` | FBA / fulfillment fee | number | Per unit. If seller fulfilled, user must enter expected fulfillment cost. |
| `inventoryUnits` | Current inventory units | number | Required for scale/clearance decisions. |
| `avgDailySales` | Average daily sales | number | User may enter 7, 14, or 30-day average. |
| `salesWindowDays` | Sales window | select | `7`, `14`, `30`. |
| `sessionsOrPageViews` | Sessions or page views | number | P0 accepts either; label must show what user selected. |
| `trafficMetricType` | Traffic metric type | select | `sessions` or `pageViews`. |
| `orders` | Orders | number | Required if CVR is not entered. |
| `cvr` | CVR | number | Required if orders are not entered. |
| `adSpend` | Current ad spend | number | Required if ACOS is not entered. |
| `adSales` | Current ad sales | number | Required if ACOS is not entered. |
| `acos` | Current ACOS | number | Required if ad spend/ad sales are not entered. |
| `currentGoal` | Current goal | select | `scale`, `protect-profit`, `clear-inventory`, `new-launch`, `rank-defense`, `budget-reallocation`. |

Strongly recommended optional fields:

| Field key | Label | Type | Notes |
| --- | --- | --- | --- |
| `couponStatus` | Coupon status | select | `none`, `active`, `eligible`, `unknown`. |
| `dealStatus` | Deal / Prime Exclusive Deal status | select | `none`, `eligible`, `active`, `unknown`. |
| `rating` | Rating | number | Used only for conversion/readiness context. |
| `reviewCount` | Review count | number | Used for Vine/new launch gating. |
| `keywordRank` | Core keyword rank | text/number | Optional context; do not infer live ranking. |
| `targetNetMargin` | Target net margin | number | Default to 10%-15% range if missing, but mark as assumed. |
| `returnRate` | Return/refund rate | number | Optional cost risk. |
| `returnCost` | Return/refund cost per unit | number | Optional. |
| `inboundUnits` | Inbound inventory units | number | Optional. |
| `inboundEta` | Inbound ETA | date | Optional. |
| `targetTacos` | Target TACOS | number | Optional. |
| `totalSales` | Total sales | number | Optional; needed for TACOS. |

## 4. Derived Metrics

The implementation should calculate only from user-provided inputs. If an input is missing, the metric must be `unknown`, not guessed.

| Metric | Formula |
| --- | --- |
| Referral fee amount | `price * referralFeeRate` or user-entered amount. |
| Pre-ad gross profit | `price - landedCost - referralFeeAmount - fbaFee`. |
| Pre-ad gross margin | `preAdGrossProfit / price`. |
| ACOS | `adSpend / adSales`, if ACOS not directly entered. |
| Break-even ACOS | `preAdGrossProfit / price`. Use as a directional ceiling, not a guarantee. |
| Suggested ACOS ceiling | `max(0, breakEvenAcos - targetNetMargin - knownExtraCostRate)`. If target margin is missing, present a conservative range. |
| Inventory cover days | `inventoryUnits / avgDailySales`. If avg daily sales is 0, mark as `no recent sales`. |
| CVR | `orders / sessionsOrPageViews`, if CVR not directly entered. |
| TACOS | `adSpend / totalSales`, only if total sales is entered. |

Known extra cost rate can include return/refund cost when provided. Do not invent storage, coupon, Deal, or Vine costs.

## 5. Branch Rules

The `currentJudgment.branch` must be exactly one of:

- `missing-profit-core`
- `missing-traffic-core`
- `profit-floor-risk`
- `traffic-gap`
- `conversion-gap`
- `inventory-risk`
- `scale-ready`
- `clearance-needed`

Branch selection order:

1. `missing-profit-core`
   - Trigger when any profit core input is missing: price, landed cost, FBA/fulfillment fee, referral fee rate/amount.
   - Allowed output: ask for missing profit inputs; no ads, Deal, Coupon, or discount scaling recommendation.

2. `missing-traffic-core`
   - Trigger when traffic/conversion/ad efficiency inputs are missing: sessions/page views, orders/CVR, and ad spend/ad sales/ACOS.
   - Allowed output: ask for traffic, conversion, and ad inputs; only low-confidence operating notes.

3. `inventory-risk`
   - Trigger when inventory units or sales velocity is missing, or inventory cover is below the scale safety threshold.
   - P0 default threshold: below 21 days cover = do not scale; below 14 days = urgent inventory risk.
   - Allowed output: protect stock, avoid rank push, avoid Deals, cap ads until replenishment is clear.

4. `clearance-needed`
   - Trigger when current goal is `clear-inventory`, or inventory cover is materially high relative to velocity.
   - P0 default threshold: above 90 days cover with stable/low velocity.
   - Allowed output: clearance plan with profit-safe Coupon/Deal/price boundary, not growth-at-any-cost.

5. `profit-floor-risk`
   - Trigger when ACOS is above break-even ACOS, suggested ACOS ceiling is near or below current ACOS, pre-ad gross margin is too thin, or proposed discount would make unit economics unsafe.
   - Allowed output: control ads, reduce/avoid discount stacking, review price/cost, set stop-line.

6. `conversion-gap`
   - Trigger when sessions/page views are adequate but CVR is weak or orders are low relative to traffic.
   - P0 default signal: CVR below user/category baseline if provided; if no baseline, use cautious language.
   - Allowed output: A+ Content, review/Vine eligibility check, offer clarity, Coupon only if profit allows. Do not generate listing copy.

7. `traffic-gap`
   - Trigger when profit and inventory are safe, CVR is acceptable or unknown-low-confidence, but sessions/page views are low relative to target.
   - Allowed output: Sponsored Products test, Coupon visibility, Brand Store/Posts if brand assets exist, Sponsored Brands/Display only when goal and readiness match.

8. `scale-ready`
   - Trigger when profit floor, inventory cover, traffic/conversion, and ad efficiency are all acceptable for the selected goal.
   - Allowed output: controlled scale plan with budget ceiling, official action priority, review rule, and stop-line.

## 6. Official Action Selection Rules

Only recommend actions supported by the user's inputs and current branch.

| Action | Recommend when | Block when |
| --- | --- | --- |
| Coupon | Profit floor can absorb discount and coupon fees; goal is traffic lift, conversion nudge, launch, or clearance. | Profit core missing, margin unsafe, inventory low, user already stacking discounts without margin room. |
| Deal | Inventory is sufficient, profit floor can absorb discount/fees, and Deal eligibility/status is known or user can verify. | Inventory low, profit floor risky, eligibility unknown and output states it as available. |
| Prime Exclusive Deal | Prime eligibility is known or user must verify in Deals dashboard; useful when limited budget/inventory needs Prime visibility. | Same blockers as Deal; never imply independent eligibility. |
| Sponsored Products | Profit and inventory are safe; traffic gap or controlled scale is the branch. | Missing traffic/ad data, ACOS above ceiling, inventory risk, or Ads Workbench-level report diagnosis is needed. |
| Sponsored Brands | Brand discovery, rank defense, Store/brand landing page support, or new-to-brand context. | No brand/Store readiness data, profit unsafe, or only SP report data is present. |
| Sponsored Display | Retargeting, competitor/detail-page exposure, or audience layer is explicitly part of the goal. | No audience/SD context; never evaluate it from SP search term data alone. |
| Vine | New/cold-start product with low review count and user has/needs to verify Brand Registry, FBA, and eligibility. | Review count not low, FBA/brand eligibility unknown and output presents it as available, profit/inventory cannot absorb free units/fees. |
| A+ Content | Conversion gap, insufficient product proof, or brand-owned ASIN with A+ access. | Do not generate title, bullets, descriptions, or Search Terms. |
| Brand Store | Brand traffic, Sponsored Brands landing page, portfolio education, or rank defense context. | No brand asset or Store access information; do not make it first action for a single SKU profit emergency. |
| Posts | Brand content distribution or upper-funnel support when listing/profit/inventory are stable. | Urgent profit floor risk, inventory risk, or missing core inputs. |
| Control ads | Current ACOS exceeds ceiling, profit floor risk, or conversion/inventory cannot support scale. | Do not call it "growth" if the plan is actually loss control. |
| Clear inventory | Inventory cover high and goal/velocity supports sell-through. | Cost inputs missing or inventory not actually high. |

Official source anchors used by this spec:

- Amazon Seller Central Help: Coupons, Coupon fees, Deals/Prime Exclusive Deals, Vine, A+ Content, FBA and referral fee topics.
- Amazon Ads official best-practice references for Sponsored Products, Sponsored Brands, and Sponsored Display.
- These sources define available official action categories and platform boundaries. They do not give this tool live eligibility, live fee, live inventory, or guaranteed outcome data.

## 7. Required Output Contract

The result object should use this structure:

```ts
type GrowthProfitPlannerResult = {
  currentJudgment: {
    branch:
      | "missing-profit-core"
      | "missing-traffic-core"
      | "profit-floor-risk"
      | "traffic-gap"
      | "conversion-gap"
      | "inventory-risk"
      | "scale-ready"
      | "clearance-needed";
    decision: string;
    confidence: "blocked" | "low" | "medium" | "high";
  };
  evidence: string[];
  priorityActions: string[];
  doNotDo: string[];
  reviewRules: string[];
  missingData: string[];
  operatingPlanTable: {
    profitStructure: string[];
    adToleranceLine: string[];
    bottleneck: string;
    officialActions: string[];
    budgetOrPromotionBoundary: string;
    stopLine: string;
  };
};
```

### Six Modules

1. Current judgment
   - Must show one branch from the approved branch list.
   - Must answer whether to scale, protect profit, control ads, clear inventory, fix conversion, or first supplement data.

2. Key evidence
   - Must cite user inputs and derived metrics: price, cost, fee, gross profit, net margin/profit floor, inventory cover, Sessions/Page views, CVR, ACOS/TACOS when available.

3. Priority actions
   - Must list 1-3 official growth or operating actions.
   - Must be evidence-matched.

4. Do not do
   - Must stop at least one likely wrong action.

5. Review rules
   - Must define 7/14/30-day metric checks and continue/stop/adjust thresholds.

6. Missing data
   - Must explicitly list missing inputs and whether they downgrade or block the decision.

### Operating Plan Table

The output must include:

1. Current unit profit structure: price, landed cost, referral fee, FBA/fulfillment fee, estimated gross profit, estimated margin.
2. Ad tolerance line: break-even ACOS, suggested ACOS ceiling, target ACOS/TACOS if inputs allow.
3. Bottleneck: traffic, conversion, profit, inventory, or missing data.
4. Official action recommendations: only recommend actions supported by inputs.
5. Budget or activity boundary: maximum sustainable ad/discount boundary as a range when exact precision would be false.
6. Stop-line: what triggers stop or downgrade.

## 8. Default Example Input

```json
{
  "skuName": "B0EXAMPLE | Stainless Electric Milk Frother",
  "price": 29.99,
  "landedCost": 8.4,
  "referralFeeMode": "rate",
  "referralFeeRate": 0.15,
  "fbaFee": 4.65,
  "inventoryUnits": 840,
  "avgDailySales": 22,
  "salesWindowDays": 14,
  "trafficMetricType": "sessions",
  "sessionsOrPageViews": 4200,
  "orders": 308,
  "adSpend": 1836,
  "adSales": 5400,
  "currentGoal": "scale",
  "couponStatus": "eligible",
  "dealStatus": "unknown",
  "rating": 4.4,
  "reviewCount": 86,
  "targetNetMargin": 0.12,
  "returnRate": 0.04,
  "targetTacos": 0.12,
  "totalSales": 9236
}
```

## 9. Default Example Output

Current judgment:

- Branch: `profit-floor-risk`.
- Decision: Do not scale yet. The SKU has enough inventory, but current ACOS is above the suggested profit-safe ad ceiling, so the next move is to protect margin before adding growth pressure.
- Confidence: `high`.

Key evidence:

- Selling price is `$29.99`; landed cost is `$8.40`; referral fee at 15% is about `$4.50`; FBA/fulfillment fee is `$4.65`.
- Pre-ad gross profit is about `$12.44`, or about 41.5% of selling price.
- Break-even ACOS is about 41.5%, but the target net margin is 12%, so a safer ACOS ceiling is about 29.5% before optional return and promotion costs.
- Current ACOS is about 34.0%, which is above the suggested profit-safe ceiling of about 25%-30% and leaves too little room for target net margin, returns, or promotion fees.
- Inventory cover is about 38 days, so inventory does not block a controlled test.
- CVR is about 7.3% from 308 orders and 4,200 sessions.

Priority actions:

1. Freeze broad scale and cut or hold campaigns above the suggested profit-safe ceiling.
2. Recalculate the profit floor before any Coupon, Deal, or Prime Exclusive Deal.
3. Resume only a capped Sponsored Products test after ACOS is under the ceiling for 7 days.

Do not do:

- Do not add budget, Coupon, or Deal pressure while ACOS is already above the suggested profit-safe ceiling.
- Do not stack Deal plus Coupon plus higher ad budget in the same review window. If profit drops, the seller will not know which lever caused it.

Review rules:

- 7 days: review ACOS, spend, orders, CVR, and inventory cover. Keep scale frozen if ACOS remains above the ceiling for 3 consecutive days.
- 14 days: resume only a small controlled test if ACOS returns below the ceiling and estimated net margin remains above target.
- 30 days: decide whether to keep the tighter ad ceiling, return to baseline, or test a capped promotion.

Missing data:

- Deal eligibility and exact coupon fee impact are not confirmed, so Deal/PED recommendations are conditional.
- Return cost per unit is missing, so the margin ceiling should be treated as conservative but incomplete.

Operating plan table:

| Area | P0 output |
| --- | --- |
| Unit profit structure | Price `$29.99`; landed cost `$8.40`; referral fee about `$4.50`; FBA fee `$4.65`; pre-ad gross profit about `$12.44`; pre-ad margin about `41.5%`. |
| Ad tolerance line | Break-even ACOS about `41.5%`; suggested ceiling about `25%-30%` after target margin and return risk; current ACOS about `34.0%`; target TACOS `12%` if total sales input is reliable. |
| Bottleneck | Profit guardrail is the first bottleneck; inventory is acceptable, but traffic should not be expanded until ad efficiency returns below the ceiling. |
| Official actions | Control Sponsored Products spend first; verify Coupon/Deal/PED economics before any promotion; route detailed ad cleanup to Ads Workbench if needed. |
| Budget/activity boundary | No new scale budget while ACOS is above ceiling; avoid discount stacking; cap action if expected per-unit net margin falls below target. |
| Stop-line | Stop or downgrade if ACOS stays above ceiling for 3 consecutive days, CVR falls while spend rises, or inventory cover drops below 21 days. |

## 10. Error States

User-facing errors must be Chinese, actionable, and productized. They must not expose stack traces, local paths, HTTP details, script names, or model/system wording.

`missing-inventory-core` is an error key that maps to the `inventory-risk` branch; it is not a separate result branch.

| Error key | Trigger | User-facing copy |
| --- | --- | --- |
| `missing-profit-core` | Missing price, landed cost, referral fee, or FBA/fulfillment fee. | `现在不能判断是否该加广告或做促销。请先补齐售价、采购/到岸成本、Amazon 佣金和 FBA/履约费，否则利润底线会被误判。` |
| `missing-traffic-core` | Missing sessions/page views, orders/CVR, or ad efficiency. | `现在不能高置信判断流量断点。请补充 Sessions 或 Page views、Orders 或 CVR，以及广告花费/广告销售/ACOS 中的一组。` |
| `missing-inventory-core` | Missing inventory units or sales velocity. Maps to the `inventory-risk` branch, not a separate branch. | `现在不能建议放量。请补充当前库存件数和近 7/14/30 天日均销量，否则无法判断库存能否承受广告或促销。` |
| `unsafe-profit-action` | Proposed action would break profit floor. | `这个动作可能打穿利润底线。先降低折扣或广告强度，重新确认单件利润后再测试。` |
| `unsupported-live-data` | User expects live Seller Central/API data. | `此工具不会读取 Seller Central 实时后台。请手动输入当前数据，结果只基于你提供的信息计算。` |
| `low-confidence-output` | Optional data missing but core data enough. | `当前结果可以作为初步判断，但缺少关键补充数据。请按缺失数据清单复查后再做大额预算或促销决定。` |

## 11. Boundary With Ads Workbench And Alexa Listing Builder

### Shared Principles

- Missing inputs must downgrade or block output.
- Never fabricate data, platform access, fee schedules, historical rank, or API capability.
- Never promise outcomes.
- Use official Amazon sources for platform action categories and hard boundaries.

### Must Stay Separate From Ads Workbench

- Ads Workbench owns ad account/report diagnosis, multi-report upload, search term waste, placement diagnosis, campaign structure, and advertising action queues.
- Growth & Profit Planner owns SKU-level operating decision: profit floor, inventory cover, traffic/conversion bottleneck, official action selection, review thresholds.
- Growth & Profit Planner may say `control ads` or `run a capped Sponsored Products test`; it must not diagnose search term reports, campaign waste, match types, placement bids, or account structure.

### Must Stay Separate From Alexa Listing Builder

- Alexa Listing Builder owns title, bullets, description, Search Terms, and listing copy generation.
- Growth & Profit Planner may say `fix listing conversion` or `check A+ Content eligibility`; it must not generate listing copy or rewrite content.

## 12. Implementation Acceptance Checklist

P0 page implementation is acceptable only if:

- It includes all required fields or blocks output when core fields are missing.
- It outputs exactly one approved branch.
- It includes the fixed six modules and operating plan table.
- It cites the user's inputs and calculated metrics in evidence.
- It blocks scaling when profit core, traffic core, or inventory core inputs are missing.
- It blocks or downgrades actions that would break profit floor.
- It recommends only 1-3 evidence-matched actions.
- It includes at least one `do not do` item.
- It includes 7/14/30-day review rules and stop-line.
- It clearly states no Seller Central live data/API access.
- It does not touch Ads Workbench behavior or Alexa Listing Builder copy generation.

## 13. Recommended Next Step

Recommended next step after this spec is approved:

- Enter frontend page implementation only after the responsible owner approves this P0 spec.

Do not expand into official knowledge-base summarization unless the owner asks for it. The current spec already has enough official-action boundaries for a deterministic P0 page.
