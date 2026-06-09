"use client";

import { useMemo, useState } from "react";

type ReadinessCheckerProps = {
  inputs: string[];
  toolName: string;
};

export function ReadinessChecker({
  inputs,
  toolName,
}: ReadinessCheckerProps) {
  const [checked, setChecked] = useState<string[]>([]);

  const missing = useMemo(
    () => inputs.filter((input) => !checked.includes(input)),
    [checked, inputs],
  );

  const readiness = Math.round(((inputs.length - missing.length) / inputs.length) * 100);

  return (
    <section className="rounded-[28px] border border-black/8 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
            Readiness Checker
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950">
            Can a visitor start {toolName} right now?
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            This widget is intentionally non-AI. It checks whether the visitor has
            enough operational inputs to get a credible result.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
          <div className="text-xs uppercase tracking-[0.22em] text-white/70">
            Readiness score
          </div>
          <div className="mt-1 text-4xl font-semibold">{readiness}%</div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
        <div className="grid gap-3">
          {inputs.map((input) => {
            const active = checked.includes(input);

            return (
              <label
                key={input}
                className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 transition ${
                  active
                    ? "border-teal-700 bg-teal-50"
                    : "border-black/8 bg-slate-50 hover:border-teal-200"
                }`}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() =>
                    setChecked((current) =>
                      current.includes(input)
                        ? current.filter((item) => item !== input)
                        : [...current, input],
                    )
                  }
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                />
                <span className="text-sm leading-6 text-slate-800">{input}</span>
              </label>
            );
          })}
        </div>

        <aside className="rounded-2xl bg-slate-950 p-5 text-white">
          <p className="text-xs uppercase tracking-[0.22em] text-white/70">
            Missing inputs
          </p>
          {missing.length === 0 ? (
            <p className="mt-3 text-sm leading-7 text-emerald-200">
              The visitor can move straight into a real tool flow. This is the
              threshold we want for first-batch product-market fit.
            </p>
          ) : (
            <ul className="mt-3 grid gap-3 text-sm leading-6 text-white/82">
              {missing.map((item) => (
                <li key={item} className="rounded-xl border border-white/12 px-3 py-3">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </section>
  );
}
