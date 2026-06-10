# Amazon Growth & Profit Planner P2 Report Upgrade Plan

## Status

Completed as a planning artifact only.

No frontend implementation is included in this P2 plan. Ads Workbench and Alexa Listing Builder are out of scope and must not be changed by this workstream.

## P2 Core Result

Upgrade the submitted output from a branch result into a `SKU Growth & Profit Battle Report`.

The report must make the seller feel that growth, ads, promotion, inventory, and profit cannot be managed separately without creating avoidable loss. It should read like an Amazon operating consultant deliverable, not a calculator result.

The report still uses the approved deterministic Growth Planner branches:

- `missing-profit-core`
- `missing-traffic-core`
- `inventory-risk`
- `profit-floor-risk`
- `traffic-gap`
- `conversion-gap`
- `scale-ready`
- `clearance-needed`

Missing cost, traffic, conversion, ad efficiency, or inventory inputs must still block strong conclusions.

## Report Structure

### 1. Expert Judgment

Purpose: state the SKU's current operating state in a decisive consultant voice.

Must answer:

- Is the SKU blocked by profit floor, traffic, conversion, inventory, clearance pressure, or missing data?
- Is the seller allowed to scale now?
- What is the first operating bottleneck?

Example direction:

- EN: `This SKU is not ready for more traffic. The first blocker is profit tolerance, not demand.`
- ZH: `这个 SKU 现在不适合继续加流量，第一瓶颈不是需求，而是利润承受线。`

### 2. Seller Trap / Operating Psychology

Purpose: explain the common seller mistake this branch prevents.

Branch examples:

- `profit-floor-risk`: do not confuse higher sales with profitable growth.
- `traffic-gap`: do not start with a Deal when the real gap is qualified traffic.
- `conversion-gap`: do not use budget to hide a conversion problem.
- `inventory-risk`: do not let ads create a stockout.
- `clearance-needed`: do not treat clearance like a rank push.
- `scale-ready`: do not scale without a stop-line.

### 3. Profit Floor & Growth Strategy

Purpose: connect unit economics to the next growth move.

Must include:

- Unit profit structure.
- Break-even ACOS.
- Suggested ad tolerance line.
- Promotion margin boundary.
- Inventory cover boundary.
- Stop-line.

### 4. Official Action Path

Purpose: recommend official Amazon actions only when evidence supports them.

Allowed action categories:

- Coupon
- Deal
- Prime Exclusive Discount / Prime Exclusive Deal
- Sponsored Products
- Sponsored Brands
- Sponsored Display
- Vine
- A+ Content
- Brand Store
- Posts

Required boundary:

- Eligibility must be verified in Seller Central.
- This tool must not claim live Seller Central eligibility, live inventory, live fee lookup, rank history, or Amazon API access.

### 5. Why This Planning Matters

Purpose: natural service conversion without hard selling.

Approved tone:

- EN: `If profit, ads, inventory, and promotions are reviewed separately, a team can scale revenue while quietly buying unprofitable orders. This brief is designed to keep those decisions in one frame.`
- ZH: `如果利润、广告、库存和促销分开看，团队很容易把销售额做上去，却同时买来亏损订单。这个报告的价值，是把这些决策放在同一个经营框架里。`

Do not use fear-based or crude sales copy.

### 6. 7 / 14 / 30 Day Review Plan

Purpose: give the seller a concrete review cadence.

Default structure:

- 7 days: ACOS, CVR, orders, inventory cover, spend movement.
- 14 days: estimated net margin, promotion impact, sell-through, conversion movement.
- 30 days: continue scaling, roll back, clear inventory, fix conversion, or collect missing data.

## Rejection Gates

Reject the P2 output if any of the following occurs:

1. It only calculates profit and gives no operating judgment.
2. It recommends Coupon, Deal, ads, or discounting without checking profit floor.
3. It recommends growth when cost, FBA fee, or referral fee is missing.
4. It makes a high-confidence traffic or conversion call when Sessions, CVR/orders, or ad efficiency is missing.
5. It recommends scale, rank push, Deal, Coupon expansion, or budget increase when inventory units or daily sales are missing.
6. It copies Ads Workbench search term, placement, campaign, match type, or report upload diagnosis.
7. It generates Alexa Listing Builder outputs such as title, bullets, description, A+ copy, or Search Terms.
8. It implies live Seller Central data, live fee lookup, live inventory, live promotion eligibility, API access, or rank history.
9. It promises guaranteed growth, lower ACOS, higher profit, or ranking improvement.
10. English output contains Chinese sentences, or Chinese output contains mixed English action verbs such as `cut`, `hold`, or `scale`.
11. Missing-data branches still produce a high-confidence battle report.
12. The service conversion section becomes crude hard selling or fear-based marketing.
13. User-facing errors expose traceback, local paths, HTTP stack, script names, provider errors, `undefined`, or `NaN`.

## Minimal Implementation Plan

1. Keep the existing submitted-input flow and deterministic branch selection.
2. Keep all 8 existing Growth Planner branches.
3. Add a new report copy layer in the Growth component, for example:
   - `buildBattleReport(result, metrics, locale)`
4. Do not rewrite the branch logic unless a branch cannot support the report.
5. Replace the submitted result presentation with the six report sections:
   - Expert Judgment
   - Seller Trap / Operating Psychology
   - Profit Floor & Growth Strategy
   - Official Action Path
   - Why This Planning Matters
   - 7 / 14 / 30 Day Review Plan
6. Keep the `How it works` modal as the diagnostic basis layer:
   - Current judgment
   - Key evidence
   - Priority actions
   - Do not do
   - Review rules
   - Missing data
7. Ensure English and Chinese report copy are generated from separate locale-specific copy, not translated labels over Chinese result text.
8. Update the Growth branch verifier to assert:
   - all 8 branches still hit,
   - submitted generation still gates output,
   - all six battle report sections render,
   - missing data blocks strong conclusions,
   - Ads Workbench / Alexa boundaries remain intact,
   - English and Chinese outputs stay language-consistent.
9. Run:
   - targeted eslint for Growth route/component,
   - `pnpm build`,
   - Growth branch verifier.

## Explicit Non-Goals

- No Seller Central API.
- No AI generation.
- No multi-provider model routing.
- No knowledge-base enhancement.
- No export brief.
- No Ads Workbench changes.
- No Alexa Listing Builder changes.
- No new tool wall or new unrelated page.
