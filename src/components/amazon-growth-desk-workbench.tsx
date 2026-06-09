"use client";

import { useMemo, useState } from "react";

type Stage = "upload" | "diagnosis" | "actions" | "review";
type ViewMode = "owner" | "operator" | "ads";
type ActionStatus = "queued" | "doing" | "done";

const stages: Array<{ id: Stage; label: string; short: string }> = [
  { id: "upload", label: "Upload", short: "Data" },
  { id: "diagnosis", label: "Diagnosis", short: "Board" },
  { id: "actions", label: "Actions", short: "Queue" },
  { id: "review", label: "Review", short: "Loop" },
];

const goals = [
  "Lower TACOS",
  "Lift sales",
  "Rank push",
  "Keyword share",
  "Clear inventory",
  "Deal support",
  "Brand defense",
  "Competitor ASIN",
];

const viewModes: Array<{ id: ViewMode; label: string }> = [
  { id: "owner", label: "Owner" },
  { id: "operator", label: "Operator" },
  { id: "ads", label: "Ad operator" },
];

const uploads = [
  { name: "Sponsored Products report", type: "Ads", file: "sp_week_20.csv", size: "2.4 MB", required: true },
  { name: "Sponsored Brands report", type: "Ads", file: "sb_week_20.csv", size: "1.1 MB", required: false },
  { name: "Business Report", type: "Retail", file: "business_week_20.csv", size: "3.6 MB", required: true },
  { name: "Search Query Performance", type: "Brand Analytics", file: "sqp_week_20.csv", size: "5.2 MB", required: true },
  { name: "Search Catalog Performance", type: "Brand Analytics", file: "catalog_week_20.csv", size: "2.8 MB", required: true },
  { name: "Deals and Coupons", type: "Promotion", file: "deals_week_20.csv", size: "1.7 MB", required: false },
  { name: "Inventory and Featured Offer", type: "Retail", file: "inventory_week_20.csv", size: "940 KB", required: true },
  { name: "Margin and goal inputs", type: "User input", file: "target_acos_12.csv", size: "Manual", required: true },
];

const diagnosis = [
  {
    layer: "Ad efficiency",
    sub: "Spend vs. return quality",
    metrics: ["TACOS 14.2%", "ROAS 7.04", "Spend $17,860"],
    status: "Below target",
    tone: "amber",
    evidence: "Broad match spend and low-CVR queries are driving TACOS above the 12.0% target.",
  },
  {
    layer: "Listing conversion",
    sub: "Traffic to purchase",
    metrics: ["CVR 8.6%", "ATC 14.1%", "Sessions 148,732"],
    status: "Below target",
    tone: "amber",
    evidence: "Ads clicks are meaningful, but Business Report CVR and catalog purchase rate trail category baseline.",
  },
  {
    layer: "Sales and TACOS",
    sub: "Sales outcome",
    metrics: ["GMV $125,480", "Units 4,812", "WoW +4.7%"],
    status: "At risk",
    tone: "red",
    evidence: "Sales grew, but TACOS pressure increased faster than organic contribution.",
  },
  {
    layer: "Keyword share",
    sub: "Impression and click share",
    metrics: ["IS top 20 32.1%", "CS top 20 18.6%", "Rank avg 16.7"],
    status: "Below target",
    tone: "amber",
    evidence: "Strategic queries have ad orders, yet SQP click and purchase share remain weak.",
  },
  {
    layer: "Promo window",
    sub: "Deal and coupon impact",
    metrics: ["Promo sales $22,148", "Incremental $6,532", "Promo TACOS 9.1%"],
    status: "On track",
    tone: "green",
    evidence: "Deal window improved conversion and produced measurable incremental sales.",
  },
  {
    layer: "Offsite attribution",
    sub: "External traffic quality",
    metrics: ["Attr. sales $18,562", "Attr. share 14.8%", "ROAS 9.21"],
    status: "On track",
    tone: "green",
    evidence: "Attribution sales and same-window Business Report sales moved in the same direction.",
  },
];

const baseActions = [
  {
    id: "reduce-low-cvr",
    action: "Reduce spend on low-CVR broad queries",
    evidence: "92 queries | CVR under 6% | TACOS 26%",
    owner: "Ad operator",
    window: "May 19 - May 25",
    confidence: 86,
  },
  {
    id: "scale-exact",
    action: "Increase bids on exact keywords with SQP share gap",
    evidence: "38 queries | ROAS 9.8 | click share under 20%",
    owner: "Ad operator",
    window: "May 19 - May 25",
    confidence: 82,
  },
  {
    id: "listing-test",
    action: "Test main image and price competitiveness",
    evidence: "CVR 8.6% vs. 11.2% category proxy",
    owner: "Operator",
    window: "May 19 - Jun 2",
    confidence: 68,
  },
  {
    id: "coupon-hero",
    action: "Keep 15% coupon on hero SKU during rank push",
    evidence: "Promo lift +31% with lower promo TACOS",
    owner: "Owner",
    window: "May 19 - May 25",
    confidence: 77,
  },
  {
    id: "offsite-cap",
    action: "Cap offsite scaling until inventory cover improves",
    evidence: "ROAS 9.21, but days of supply under 21",
    owner: "Owner",
    window: "May 19 - May 26",
    confidence: 65,
  },
];

const reviewEvents = [
  {
    title: "Last recommendation",
    period: "May 5 - May 11",
    body: "Increase bids on exact match core keywords.",
    result: "GMV +9.6%, TACOS -1.1pp",
  },
  {
    title: "Current week",
    period: "May 12 - May 18",
    body: "Conversion lift did not keep pace with spend expansion.",
    result: "GMV +4.7%, TACOS +0.6pp",
  },
  {
    title: "Next decision point",
    period: "May 19 - May 25",
    body: "Rebalance ad mix after listing and coupon tests.",
    result: "Focus: ad efficiency and CVR lift",
  },
];

function toneClass(tone: string) {
  if (tone === "green") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (tone === "red") return "border-rose-200 bg-rose-50 text-rose-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

export function AmazonGrowthDeskWorkbench() {
  const [stage, setStage] = useState<Stage>("diagnosis");
  const [goal, setGoal] = useState(goals[0]);
  const [viewMode, setViewMode] = useState<ViewMode>("operator");
  const [statuses, setStatuses] = useState<Record<string, ActionStatus>>({
    "reduce-low-cvr": "doing",
    "scale-exact": "queued",
    "listing-test": "queued",
    "coupon-hero": "done",
    "offsite-cap": "queued",
  });
  const [reviewState, setReviewState] = useState("watch");

  const received = uploads.length;
  const requiredReady = uploads.filter((item) => item.required).length;
  const completion = Math.round((received / uploads.length) * 100);
  const activeAction = baseActions.find((item) => statuses[item.id] !== "done") ?? baseActions[0];

  const filteredActions = useMemo(() => {
    if (viewMode === "owner") return baseActions.filter((item) => item.owner !== "Ad operator");
    if (viewMode === "ads") return baseActions.filter((item) => item.owner === "Ad operator");
    return baseActions;
  }, [viewMode]);

  function cycleStatus(id: string) {
    setStatuses((current) => {
      const next = current[id] === "queued" ? "doing" : current[id] === "doing" ? "done" : "queued";
      return { ...current, [id]: next };
    });
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f6f8f9] text-slate-950">
      <div className="grid min-h-screen min-w-0 grid-cols-1 lg:grid-cols-[148px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 px-5 py-4 lg:block lg:px-4 lg:py-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-teal-200 bg-teal-50 text-sm font-black text-teal-700">
              AG
            </div>
            <div className="lg:mt-3">
              <p className="text-sm font-black leading-tight">Amazon Ads Audit Workbench</p>
              <p className="mt-1 text-xs text-slate-500">Ads + retail diagnosis</p>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto px-3 pb-3 lg:block lg:space-y-2 lg:overflow-visible">
            {stages.map((item, index) => (
              <button
                key={item.id}
                className={`flex min-h-11 min-w-28 items-center gap-3 rounded-md border px-3 text-left text-sm font-semibold transition lg:w-full ${
                  stage === item.id
                    ? "border-teal-200 bg-teal-50 text-teal-800"
                    : "border-transparent bg-white text-slate-600 hover:border-slate-200"
                }`}
                onClick={() => setStage(item.id)}
                type="button"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-current text-xs">
                  {index + 1}
                </span>
                <span>
                  <span className="block">{item.label}</span>
                  <span className="block text-xs font-medium opacity-70">{item.short}</span>
                </span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0">
          <header className="min-w-0 border-b border-slate-200 bg-white">
            <div className="grid min-w-0 gap-3 px-4 py-4 md:grid-cols-[minmax(220px,1fr)_230px_minmax(280px,auto)] md:items-center xl:px-6">
              <label className="grid gap-1">
                <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Account</span>
                <select className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900">
                  <option>Northwind Brands - US</option>
                  <option>Hero SKU portfolio</option>
                </select>
              </label>
              <label className="grid gap-1">
                <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Goal</span>
                <select
                  className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900"
                  onChange={(event) => setGoal(event.target.value)}
                  value={goal}
                >
                  {goals.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <div className="grid min-w-0 grid-cols-1 items-end gap-3 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Diagnosis confidence</p>
                  <div className="mt-1 flex h-11 items-center justify-between rounded-md border border-slate-200 bg-white px-3">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      High
                    </span>
                    <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">
                      88%
                    </span>
                  </div>
                </div>
                <div className="flex min-w-0 overflow-x-auto rounded-md border border-slate-200 bg-white p-1">
                  {viewModes.map((item) => (
                    <button
                      key={item.id}
                      className={`h-9 rounded px-2 text-xs font-bold ${
                        viewMode === item.id ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"
                      }`}
                      onClick={() => setViewMode(item.id)}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </header>

          <div className="grid min-w-0 items-start gap-4 p-4 xl:grid-cols-[410px_minmax(0,1fr)] xl:p-6">
            <section className="self-start rounded-md border border-slate-200 bg-white">
              <div className="flex items-start justify-between border-b border-slate-200 p-4">
                <div>
                  <p className="text-base font-black">1. Upload and intake</p>
                  <p className="mt-1 text-sm text-slate-500">{requiredReady} required inputs ready for {goal.toLowerCase()}.</p>
                </div>
                <span className="rounded border border-teal-200 bg-teal-50 px-2 py-1 text-xs font-black text-teal-700">
                  {received} / {uploads.length}
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {uploads.map((item) => (
                  <div key={item.name} className="grid grid-cols-[1fr_auto] gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-teal-600" />
                        <p className="truncate text-sm font-bold">{item.name}</p>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{item.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="max-w-36 truncate rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold">
                        {item.file}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{item.size}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-sm font-semibold">
                    Weekly GMV goal
                    <input className="h-10 rounded-md border border-slate-200 px-3" defaultValue="$125,000" />
                  </label>
                  <label className="grid gap-1 text-sm font-semibold">
                    Target TACOS
                    <input className="h-10 rounded-md border border-slate-200 px-3" defaultValue="12.0%" />
                  </label>
                  <label className="grid gap-1 text-sm font-semibold">
                    Gross margin
                    <input className="h-10 rounded-md border border-slate-200 px-3" defaultValue="42.0%" />
                  </label>
                  <label className="grid gap-1 text-sm font-semibold">
                    Window
                    <input className="h-10 rounded-md border border-slate-200 px-3" defaultValue="14 days" />
                  </label>
                </div>
                <div className="mt-5">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Processing status</span>
                    <span>{completion}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-teal-600" style={{ width: `${completion}%` }} />
                  </div>
                  <p className="mt-3 text-xs text-slate-500">Data validated, normalized, and mapped to the growth diagnosis schema.</p>
                </div>
              </div>
            </section>

            <div className="grid min-w-0 gap-4">
              <section className="min-w-0 rounded-md border border-slate-200 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
                  <div>
                    <p className="text-base font-black">2. Diagnosis board</p>
                    <p className="mt-1 text-sm text-slate-500">Six layers combine ads, retail, share, promo, and offsite evidence.</p>
                  </div>
                  <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-600">
                    Active: {stage}
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {diagnosis.map((item, index) => (
                    <button
                      key={item.layer}
                      className="grid w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 md:grid-cols-[190px_1fr_160px]"
                      onClick={() => setStage("diagnosis")}
                      type="button"
                    >
                      <div className="flex gap-3">
                        <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-teal-600 text-xs font-black text-white">
                          {index + 1}
                        </span>
                        <span>
                          <span className="block text-sm font-black">{item.layer}</span>
                          <span className="block text-xs text-slate-500">{item.sub}</span>
                        </span>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {item.metrics.map((metric) => (
                          <span key={metric} className="rounded border border-slate-200 bg-white px-3 py-2 text-sm font-bold leading-5">
                            {metric}
                          </span>
                        ))}
                      </div>
                      <div>
                        <span className={`inline-flex rounded border px-2 py-1 text-xs font-black ${toneClass(item.tone)}`}>
                          {item.status}
                        </span>
                        <p className="mt-2 text-xs leading-5 text-slate-600">{item.evidence}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
                <section className="min-w-0 self-start rounded-md border border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-200 p-4">
                    <div>
                      <p className="text-base font-black">3. Action queue</p>
                      <p className="mt-1 text-sm text-slate-500">Actions are evidence-backed and assigned by operating owner.</p>
                    </div>
                    <button
                      className="h-9 rounded-md border border-teal-200 bg-teal-50 px-3 text-xs font-black text-teal-700"
                      onClick={() => setStage("actions")}
                      type="button"
                    >
                      Focus
                    </button>
                  </div>
                  <div className="max-w-full overflow-x-auto">
                    <table className="min-w-[760px] w-full border-collapse text-left text-sm">
                      <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.06em] text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Action</th>
                          <th className="px-4 py-3">Evidence</th>
                          <th className="px-4 py-3">Owner</th>
                          <th className="px-4 py-3">Window</th>
                          <th className="px-4 py-3">Confidence</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredActions.map((item) => (
                          <tr key={item.id} className="align-top">
                            <td className="px-4 py-3 font-bold">{item.action}</td>
                            <td className="px-4 py-3 text-slate-600">{item.evidence}</td>
                            <td className="px-4 py-3">{item.owner}</td>
                            <td className="px-4 py-3 text-slate-600">{item.window}</td>
                            <td className="px-4 py-3">
                              <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">
                                {item.confidence}%
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                className="h-8 min-w-20 rounded-md border border-slate-200 bg-white px-2 text-xs font-black capitalize hover:bg-slate-50"
                                onClick={() => cycleStatus(item.id)}
                                type="button"
                              >
                                {statuses[item.id]}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="rounded-md border border-slate-200 bg-white">
                  <div className="border-b border-slate-200 p-4">
                    <p className="text-base font-black">4. Weekly review loop</p>
                    <p className="mt-1 text-sm text-slate-500">Keep, watch, or reverse recommendations based on metric movement.</p>
                  </div>
                  <div className="space-y-3 p-4">
                    {reviewEvents.map((item, index) => (
                      <div key={item.title} className="grid grid-cols-[28px_1fr] gap-3">
                        <div className="flex flex-col items-center">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-xs font-black text-white">
                            {index + 1}
                          </span>
                          {index < reviewEvents.length - 1 ? <span className="h-full w-px bg-slate-200" /> : null}
                        </div>
                        <div className="pb-4">
                          <p className="text-sm font-black">{item.title}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">{item.period}</p>
                          <p className="mt-2 text-sm text-slate-700">{item.body}</p>
                          <p className="mt-2 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">
                            {item.result}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-200 p-4">
                    <p className="text-sm font-black">Decision for next week</p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {["effective", "watch", "reverse"].map((item) => (
                        <button
                          key={item}
                          className={`h-9 rounded-md border px-2 text-xs font-black capitalize ${
                            reviewState === item
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                          onClick={() => setReviewState(item)}
                          type="button"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      Current next action: {activeAction.action}. Decision state: {reviewState}.
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
