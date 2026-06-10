# Amazon Ads Audit Workbench P0 Handoff

## Current Prototype Status

- Platform ownership: Amazon.
- Current implementation: standalone Next.js route and reusable client component.
- Working routes:
  - Recommended launch route: `/amazon/amazon-ads-audit-workbench`
  - Existing prototype alias: `/amazon/growth-desk`
- Current backend state: no backend upload parser, no AI call, no RAG call.
- P0 display state: stable client-side workbench with seeded uploads, diagnosis, action queue, and weekly review interactions.
- Build state: `pnpm build` passes.
- Targeted lint state: `pnpm exec eslint src/app/amazon/growth-desk/page.tsx src/app/amazon/amazon-ads-audit-workbench/page.tsx src/components/amazon-growth-desk-workbench.tsx` passes.
- Full lint state: blocked by existing repo issues outside this tool in `shopify-workflow-progress.tsx`, `tool-runtime-client-shell.tsx`, and `tool-runtime.tsx`.

## Final Tool Recommendation

- Tool name: Amazon Ads Audit Workbench.
- Slug: `amazon-ads-audit-workbench`.
- English title: Amazon Ads Audit Workbench.
- Chinese title: Amazon 广告体检工作台.
- One-line value proposition: Diagnose Amazon ad waste and growth blockers by combining ads, sales, listing conversion, keyword share, promotion, inventory, Featured Offer, and offsite evidence into an operator action queue.
- Category: Amazon / Advertising / Growth.
- Third-layer positioning: flagship Amazon operator tool, not a generic PPC calculator.

## Core Inputs

- Sponsored Products report.
- Sponsored Brands report.
- Business Report / Sales and Traffic.
- Search Query Performance.
- Search Catalog Performance.
- Deals and Coupons report.
- Inventory and Featured Offer context.
- Margin, break-even ACOS, target TACOS, lifecycle stage, and goal.

## Core Outputs

- Upload completeness and diagnosis readiness.
- Six-layer diagnosis board:
  - Ad efficiency.
  - Listing conversion.
  - Sales and TACOS.
  - Keyword share.
  - Promo window.
  - Offsite attribution.
- Evidence-backed action queue with owner, window, confidence, and status.
- Weekly review loop to keep, watch, or reverse prior recommendations.

## Page Structure

1. Left rail: workflow stages - Upload, Diagnosis, Actions, Review.
2. Top controls: account selector, goal selector, diagnosis confidence, role view selector.
3. Upload intake panel: report chips, required-input count, goal and margin fields, normalization progress.
4. Diagnosis board: six operational layers with metrics, status, and evidence.
5. Action queue: actions grouped by owner and filtered by role.
6. Weekly review: prior recommendation, current metric movement, next decision point, decision state.

## Default Example Inputs

- Account: Northwind Brands - US.
- Goal: Lower TACOS.
- Weekly GMV goal: `$125,000`.
- Target TACOS: `12.0%`.
- Gross margin: `42.0%`.
- Observation window: `14 days`.
- Reports:
  - `sp_week_20.csv`.
  - `sb_week_20.csv`.
  - `business_week_20.csv`.
  - `sqp_week_20.csv`.
  - `catalog_week_20.csv`.
  - `deals_week_20.csv`.
  - `inventory_week_20.csv`.
  - `target_acos_12.csv`.

## Default Example Output

- Diagnosis confidence: High, 88%.
- Ad efficiency: Below target; TACOS 14.2%, ROAS 7.04, spend `$17,860`.
- Listing conversion: Below target; CVR 8.6%, ATC 14.1%, sessions 148,732.
- Sales and TACOS: At risk; GMV `$125,480`, units 4,812, week-over-week GMV +4.7%.
- Keyword share: Below target; top-20 impression share 32.1%, click share 18.6%, average rank 16.7.
- Promo window: On track; promo sales `$22,148`, incremental sales `$6,532`, promo TACOS 9.1%.
- Offsite attribution: On track; attributed sales `$18,562`, attributed share 14.8%, ROAS 9.21.
- Action queue:
  - Reduce spend on low-CVR broad queries.
  - Increase bids on exact keywords with SQP share gap.
  - Test main image and price competitiveness.
  - Keep 15% coupon on hero SKU during rank push.
  - Cap offsite scaling until inventory cover improves.

## Main-Site Integration Recommendation

Recommendation: use the standalone route for P0 launch.

Do not integrate into the existing dynamic tool matrix yet. This tool is larger than the current simple runtime pattern: it needs multi-report intake, a diagnosis board, an action queue, and a review loop. Forcing it into the current dynamic tool runtime now would add risk to the live tool system and flatten the product into a generic form/result page.

Use this P0 path:

1. Keep the standalone route `/amazon/amazon-ads-audit-workbench`.
2. Add Amazon platform page entry or CTA later from the website-building thread.
3. Keep the route runtime-first and demo-data-backed until real CSV parsing is ready.
4. After upload parsing and deterministic diagnosis are stable, decide whether to register it in `src/lib/tools.ts` as a matrix item or keep it as a premium standalone flagship page.

Rejected for P0:

- Existing dynamic tool page: too constrained for multi-panel workbench behavior.
- Temporary landing page: wrong product shape; users need a working console, not marketing copy.

## Files Needed By Website-Building Thread

- `src/app/amazon/amazon-ads-audit-workbench/page.tsx`
- `src/app/amazon/growth-desk/page.tsx`
- `src/components/amazon-growth-desk-workbench.tsx`
- `docs/amazon-ads-audit-workbench-p0-handoff.md`

## Dependencies

- No new npm dependency.
- Uses existing Next.js, React, and Tailwind setup.
- No API key required for P0.
- No upload parser required for P0.

## P0 Launch Readiness

Can P0 be shown online now: yes.

The current version is suitable as a stable, demo-data-backed public preview if it is positioned as a workbench preview or sample diagnosis flow.

Minimum blocker for real customer diagnosis: CSV/report parsing and deterministic normalization are not implemented yet. Users cannot upload real files and receive a computed diagnosis in this P0.

Minimum next build step: add a client/server parser for the eight expected inputs, map parsed fields into the existing diagnosis data model, and keep the current seeded state as the fallback demo.
