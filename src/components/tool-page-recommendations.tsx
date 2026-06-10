import { ecommerceVisualWorkbenchEntry } from "@/lib/workbench-links";
import type { SupportedLocale } from "@/lib/i18n";

export function ToolPageRecommendations({ locale = "en" }: { locale?: SupportedLocale }) {
  return (
    <section className="border-t border-slate-200 bg-slate-50 px-4 py-8 text-slate-950 lg:px-8" data-tool-recommendations="true">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">{locale === "zh" ? "推荐位" : "Recommended"}</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight">{locale === "zh" ? "推荐工具与方案" : "Recommended Tools and Plans"}</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <a
            href={ecommerceVisualWorkbenchEntry.href}
            className="roadmap-card roadmap-card-live"
            data-analytics-event="tool_recommendation_click"
            data-analytics-category="navigation"
            data-analytics-label={ecommerceVisualWorkbenchEntry.key}
            data-analytics-destination={ecommerceVisualWorkbenchEntry.href}
            data-analytics-link-type="external"
            rel="noreferrer"
            target="_blank"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="panel-kicker">{ecommerceVisualWorkbenchEntry.eyebrow[locale]}</p>
                <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                  {ecommerceVisualWorkbenchEntry.name[locale]}
                </h3>
              </div>
              <span className="roadmap-index">{ecommerceVisualWorkbenchEntry.index}</span>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              {ecommerceVisualWorkbenchEntry.description[locale]}
            </p>
            <div className="mt-6">
              <span className="inline-flex min-h-11 items-center rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-100">
                {ecommerceVisualWorkbenchEntry.cta[locale]}
              </span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
