# Amazon Growth & Profit Planner Implementation Checklist

## 0. Purpose

This is the pre-implementation checklist and branch test list for the `Amazon Growth & Profit Planner` P0 page.

Primary spec:

`/Users/ortom/Documents/Amazon Page Report/web/docs/amazon-growth-profit-planner-p0-spec.md`

This file is not a new product spec. It only turns the approved P0 spec into implementation and QA gates for the future page-building thread.

Current status:

- P0 spec: report-level approved.
- Frontend implementation: not started in this thread.
- Ads Workbench: untouched.
- Alexa Listing Builder: untouched.

## 1. Implementation Result

The future page must let a user enter one SKU/ASIN's:

- Price and landed cost.
- Referral fee and FBA/fulfillment fee.
- Inventory units and recent average daily sales.
- Sessions or page views.
- Orders or CVR.
- Ad spend/ad sales or ACOS.
- Current operating goal.
- Optional Coupon, Deal, review, rating, return, inbound inventory, target margin, and target TACOS context.

Then it must produce:

- Exactly one deterministic branch.
- Fixed six-module output.
- Operating plan table.
- Profit floor and ad tolerance line.
- Official action recommendation or data-blocking message.
- Stop-line and review window.

The page must not become an Ads Workbench clone, a generic profit calculator, or a Listing copy generator.

## 2. Non-Negotiable Gates

### Gate 1: Profit Core Must Block Growth Actions

If any profit core input is missing, the page must select `missing-profit-core`.

Profit core inputs:

- Selling price.
- Landed cost.
- Referral fee rate or referral fee amount.
- FBA/fulfillment fee.

Required behavior:

- Show current judgment as blocked.
- List missing profit inputs.
- Explain that profit floor cannot be calculated.
- Do not recommend advertising scale, Coupon, Deal, Prime Exclusive Deal, discounting, or rank push.

Reject if:

- Missing cost/FBA/referral fee still recommends ads, Deal, Coupon, or discount.
- Output estimates profit using invented fees.
- Output says the seller can scale while profit floor is unknown.

### Gate 2: Traffic Core Must Block High-Confidence Bottleneck Calls

If traffic, conversion, or ad efficiency inputs are missing, the page must select `missing-traffic-core` after profit core is satisfied.

Traffic core inputs:

- Sessions or page views.
- Orders or CVR.
- Ad spend/ad sales or ACOS.

Required behavior:

- Show low or blocked confidence.
- Ask for the missing traffic/conversion/ad metrics.
- Do not assert `traffic-gap`, `conversion-gap`, or `scale-ready` with high confidence.

Reject if:

- Missing Sessions/CVR/ACOS still produces a confident traffic or conversion diagnosis.
- Output says to scale traffic without ad efficiency data.

### Gate 3: Inventory Core Must Block Scale

If inventory units or average daily sales are missing, the output must use the `inventory-risk` branch. The `missing-inventory-core` error key maps to `inventory-risk`; it is not a separate branch.

Inventory core inputs:

- Current inventory units.
- Average daily sales for 7/14/30 days.

Required behavior:

- Block scale, rank push, Deal, Coupon expansion, and budget increases.
- Ask for inventory units and average daily sales.
- Show no inventory cover calculation if either value is missing.

Reject if:

- Missing inventory or sales velocity still recommends scale, Deal, Coupon expansion, or budget increase.
- A new `missing-inventory-core` result branch is added.

### Gate 4: Single-Branch Output Consistency

Every output must derive from exactly one branch:

- `missing-profit-core`
- `missing-traffic-core`
- `profit-floor-risk`
- `traffic-gap`
- `conversion-gap`
- `inventory-risk`
- `scale-ready`
- `clearance-needed`

Required behavior:

- Branch, decision, evidence, actions, do-not-do, review rules, missing data, and operating plan table must agree.
- `profit-floor-risk` must prioritize profit protection, not scale.
- `traffic-gap` can recommend traffic actions only if profit and inventory are safe.
- `conversion-gap` can recommend conversion actions only if profit and inventory are safe.
- `scale-ready` must still include budget ceilings and stop-lines.

Reject if:

- Evidence says profit is unsafe but actions recommend scale.
- Branch says missing data while output gives high-confidence growth recommendations.
- Operating plan table contradicts the current judgment.

### Gate 5: Error States Must Be Chinese And Productized

All user-facing errors must be Chinese, actionable, and non-technical.

Allowed examples:

- `现在不能判断是否该加广告或做促销。请先补齐售价、采购/到岸成本、Amazon 佣金和 FBA/履约费，否则利润底线会被误判。`
- `现在不能建议放量。请补充当前库存件数和近 7/14/30 天日均销量，否则无法判断库存能否承受广告或促销。`

Forbidden:

- `Command failed`
- `Traceback`
- Local paths.
- HTTP stack.
- Script names.
- Raw model/provider errors.
- API keys.
- JSON exception dumps.

Reject if:

- Any technical stack or provider error appears in the page.
- English internal demo wording appears in Chinese result/error states.

## 3. Minimal Page Sections

The future P0 page should include:

1. Header and boundary note.
2. Required SKU economics form.
3. Traffic, conversion, inventory, and ad efficiency form.
4. Optional operating context form.
5. Generate / evaluate action.
6. Six-module result.
7. Operating plan table.
8. Stop-line and review rule.
9. Boundary note: no Seller Central live data/API access.

Do not add:

- Ads report upload panels.
- Search term waste diagnosis.
- Campaign placement/bid deep diagnosis.
- Listing title/bullet/description/Search Terms generator.
- Seller Central API connection.
- Live inventory sync.
- Activity eligibility claims that the user did not provide.

## 4. Required Form Validation

| Field group | Minimum rule | Blocking branch / error |
| --- | --- | --- |
| SKU / ASIN name | non-empty | missing data message, but can still calculate if all numeric cores exist |
| Price | number greater than 0 | `missing-profit-core` |
| Landed cost | number greater than or equal to 0 | `missing-profit-core` |
| Referral fee | rate or amount present | `missing-profit-core` |
| FBA/fulfillment fee | number greater than or equal to 0 | `missing-profit-core` |
| Inventory units | number greater than or equal to 0 | `inventory-risk` via `missing-inventory-core` error |
| Average daily sales | number greater than or equal to 0 | `inventory-risk` via `missing-inventory-core` error |
| Sessions/page views | number greater than 0 | `missing-traffic-core` |
| Orders or CVR | one present | `missing-traffic-core` |
| Ad spend/ad sales or ACOS | one complete ad efficiency input present | `missing-traffic-core` |
| Current goal | one approved goal selected | missing data message; do not make high-confidence strategic recommendation |

Implementation notes:

- Derive ACOS from `adSpend / adSales` only when both are present and ad sales is greater than 0.
- Derive CVR from `orders / sessionsOrPageViews` only when both are present and sessions/page views is greater than 0.
- Derive inventory cover from `inventoryUnits / avgDailySales`; if average daily sales is 0, show `no recent sales`, not infinity.
- Do not invent referral fee, FBA fee, target margin, returns, coupon fee, Deal fee, Vine fee, rank, or eligibility.

## 5. Branch Test Cases

### Case A: `missing-profit-core`

Input:

- SKU name: present.
- Price: `29.99`.
- Landed cost: missing.
- Referral fee: missing.
- FBA fee: `4.65`.
- Inventory, sales velocity, traffic, CVR, and ACOS: present.
- Goal: `scale`.

Expected:

- Branch: `missing-profit-core`.
- Confidence: `blocked`.
- Priority action: complete cost/referral fee inputs.
- Do not do: no ads, Deal, Coupon, discount, rank push, or scale recommendation.
- Operating plan table: profit structure shows unknown cost/fee fields.

Reject if:

- Output recommends any growth action.
- Output estimates margin without landed cost or referral fee.

### Case B: `missing-traffic-core`

Input:

- Profit core: complete.
- Inventory units and average daily sales: complete.
- Sessions/page views: missing.
- Orders/CVR: missing.
- Ad spend/ad sales/ACOS: missing.
- Goal: `budget-reallocation`.

Expected:

- Branch: `missing-traffic-core`.
- Confidence: `blocked` or `low`.
- Priority action: provide Sessions/page views, Orders/CVR, and ad efficiency.
- Do not do: no high-confidence traffic, conversion, or scale diagnosis.

Reject if:

- Output says traffic or conversion is the bottleneck with high confidence.
- Output recommends increasing ad budget.

### Case C: `inventory-risk`

Input:

- Profit core: complete.
- Traffic core: complete.
- Inventory units: missing, or inventory cover below 14 days.
- Goal: `scale`.

Expected:

- Branch: `inventory-risk`.
- Error key when missing inventory: `missing-inventory-core`, mapped to `inventory-risk`.
- Priority action: protect stock, confirm replenishment, cap or hold growth actions.
- Do not do: no Deal, Coupon expansion, rank push, or broad budget increase.

Reject if:

- Output adds a separate `missing-inventory-core` branch.
- Output recommends scale despite missing/unsafe inventory.

### Case D: `profit-floor-risk`

Input:

- Price: `29.99`.
- Landed cost: `8.40`.
- Referral fee rate: `15%`.
- FBA fee: `4.65`.
- Inventory units: `840`.
- Average daily sales: `22`.
- Sessions: `4200`.
- Orders: `308`.
- Ad spend: `1836`.
- Ad sales: `5400`.
- Target net margin: `12%`.
- Goal: `scale`.

Expected:

- Branch: `profit-floor-risk`.
- Evidence: ACOS about `34.0%`; suggested ceiling about `25%-30%`.
- Priority actions:
  1. Freeze broad scale and cut or hold campaigns above ceiling.
  2. Recalculate profit floor before Coupon/Deal/PED.
  3. Resume only capped Sponsored Products test after ACOS is under ceiling for 7 days.
- Do not do: no budget, Coupon, or Deal pressure while ACOS is above ceiling.

Reject if:

- First action is scale.
- Evidence says current ACOS is under ceiling.

### Case E: `traffic-gap`

Input:

- Profit core: complete and safe.
- Inventory cover: above 30 days.
- CVR: acceptable against user-provided baseline.
- Sessions/page views: low relative to goal.
- ACOS: below suggested ceiling.
- Goal: `scale`.

Expected:

- Branch: `traffic-gap`.
- Priority actions: capped Sponsored Products test, Coupon visibility only if profit-safe, Brand Store/Posts only if brand context is provided.
- Do not do: no Deal or budget expansion without inventory/profit guardrails.

Reject if:

- Output gives Ads Workbench-style search term or placement diagnosis.
- Output recommends traffic growth without profit ceiling.

### Case F: `conversion-gap`

Input:

- Profit core: complete and safe.
- Inventory cover: safe.
- Sessions/page views: adequate.
- Orders/CVR: weak against user-provided baseline.
- ACOS: not above ceiling.
- Optional rating/review count: low or moderate.
- Goal: `scale` or `new-launch`.

Expected:

- Branch: `conversion-gap`.
- Priority actions: check A+ eligibility, review/Vine eligibility if appropriate, improve offer proof, use Coupon only if profit-safe.
- Do not do: no blind budget increase into weak conversion.
- Boundary: do not generate title, bullets, description, or Search Terms.

Reject if:

- Output writes Listing copy.
- Output recommends more spend as the first action.

### Case G: `scale-ready`

Input:

- Profit core: complete and safe.
- Inventory cover: above 30 days.
- Sessions/CVR/ad efficiency: acceptable.
- ACOS: below suggested ceiling.
- Goal: `scale` or `rank-defense`.

Expected:

- Branch: `scale-ready`.
- Priority actions: controlled budget increase or capped official action.
- Evidence: profit floor, inventory cover, CVR, ACOS, and optional TACOS align.
- Stop-line: ACOS ceiling, CVR drop, or inventory cover below 21 days.

Reject if:

- Output lacks stop-line.
- Output promises guaranteed growth, lower ACOS, or ranking improvement.

### Case H: `clearance-needed`

Input:

- Profit core: complete.
- Inventory cover: above 90 days.
- Sales velocity: low or declining.
- Goal: `clear-inventory`.
- Traffic/ad efficiency: present.

Expected:

- Branch: `clearance-needed`.
- Priority actions: profit-safe clearance boundary, capped Coupon/Deal only if economics work, no growth-at-any-cost framing.
- Do not do: no rank push or aggressive ad scaling if clearance goal conflicts with profit floor.
- Review rule: 7/14/30-day sell-through and margin checks.

Reject if:

- Output recommends scale as if the goal were growth.
- Output ignores margin while recommending clearance discount.

## 6. Cross-Product Boundary Tests

### Ads Workbench Boundary

Reject if the Growth Planner page includes:

- Multi-report ad upload flow.
- Search term waste cutter.
- Placement diagnosis.
- Match type restructuring.
- Campaign-level action queue.
- Sponsored Brands/Sponsored Display deep report evaluation.

Allowed:

- `Control ads`.
- `Run a capped Sponsored Products test`.
- `Route detailed ad cleanup to Ads Workbench`.

### Alexa Listing Builder Boundary

Reject if the Growth Planner page generates:

- Title.
- Five bullets.
- Product description.
- Search Terms.
- A+ module copy.

Allowed:

- `Check A+ Content eligibility`.
- `Fix listing conversion`.
- `Do not add budget before conversion issue is addressed`.

### Seller Central / API Boundary

Reject if the page claims:

- Live Seller Central data access.
- Live inventory syncing.
- Live fee lookup.
- Live ad API access.
- Deal/PED/Vine eligibility confirmation.
- Rank history access.

Allowed:

- Ask the user to manually enter values.
- Say eligibility must be verified in Seller Central.
- Use official action categories as options, not guaranteed available actions.

## 7. QA Smoke Checklist

Before page implementation is considered ready for review:

- All branch outputs use the six fixed modules.
- Operating plan table is present for every non-blocked and blocked branch.
- Missing profit core blocks ads, Deal, Coupon, discount, and scale actions.
- Missing traffic core blocks high-confidence bottleneck calls.
- Missing inventory core maps to `inventory-risk`.
- `profit-floor-risk` blocks growth pressure and prioritizes margin protection.
- `traffic-gap` and `conversion-gap` only appear when profit and inventory are safe.
- `scale-ready` includes stop-line and budget/activity boundary.
- Error messages are Chinese and productized.
- No technical stack, local path, raw exception, script name, or provider error is visible.
- No Ads Workbench files are modified.
- No Alexa Listing Builder files are modified.

## 8. Current Recommendation

Wait for the responsible owner to assign implementation order and entry placement.

Do not start frontend implementation from this checklist alone.
