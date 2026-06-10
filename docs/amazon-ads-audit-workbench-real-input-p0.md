# Amazon Ads Audit Workbench Real Input P0

## Decision

Fastest commercial validation path: semi-automated paid diagnosis.

Do not start with a free demo plus lead form as the main path. It validates interest, not willingness to pay. Do not start with a fully automated self-serve upload product either, because report variance and user data gaps will slow launch. The first commercial version should let users upload the minimum useful ad report, fill a short operating form, then receive a paid expert-style diagnosis that can still be manually reviewed before delivery.

## Minimum Trial Version When Users Do Not Have 8 Reports

P0 should accept:

1. One required upload: Sponsored Products search term or campaign performance CSV.
2. One required manual form: business goal and retail context.

This is enough to produce a useful first audit of spend waste, query quality, bid/targeting focus, and whether ad optimization is blocked by conversion, margin, inventory, or promo context.

## First Inputs To Support

First priority:

- Sponsored Products report CSV.
- Manual inputs: target ACOS/TACOS, gross margin or break-even ACOS, weekly sales, sessions or CVR, lifecycle goal, main ASIN/SKU, observation window.

Second priority:

- Business Report / Sales and Traffic CSV.
- If CSV is missing, allow manual fallback for sessions, unit session percentage, ordered units, ordered product sales, and Featured Offer percentage.

## Manual Fallbacks Instead Of CSV

- Target ACOS or target TACOS.
- Gross margin or break-even ACOS.
- Weekly GMV and units.
- Sessions and conversion rate.
- Featured Offer percentage.
- Inventory days of supply.
- Deal/coupon date and discount.
- Top 5 strategic keywords and current rank/share if known.

## Short Implementation Priority

1. Parse one Sponsored Products CSV and map spend, sales, orders, clicks, CPC, CTR, CVR, ACOS, ROAS, campaign, ad group, targeting, and search term.
2. Add a compact business-context form for goal, margin, sales, conversion, inventory, Featured Offer, and promo context.
3. Generate a deterministic P0 diagnosis: waste queries, scaling candidates, conversion blocker warnings, margin/target mismatch, and next-week action queue.

Do not do yet:

- Full 8-report parser.
- Seller Central or Amazon Ads API OAuth.
- Automatic campaign changes.
- Full SQP/Search Catalog parser.
- Offsite attribution parser.
- Keyword rank crawler.
- Multi-account workspace, saved history, or team permissions.

## Current Least Useful Feature To Build

The worst next feature is automatic Amazon Ads account connection and campaign mutation. It is slow, compliance-sensitive, and unnecessary for the first revenue test. The first paid user needs a credible diagnosis and action plan, not an automation system that changes campaigns.

## P0 Commercial Offer

Offer: paid semi-automated Amazon Ads audit.

Flow:

1. User uploads one Sponsored Products report.
2. User fills the short operating form.
3. System produces a structured diagnosis draft.
4. Human/operator reviews and tightens the final action queue.
5. User receives an audit board plus next-week execution actions.

This creates the fastest paid validation because it tests whether sellers will pay for the diagnosis outcome while keeping engineering scope narrow.
