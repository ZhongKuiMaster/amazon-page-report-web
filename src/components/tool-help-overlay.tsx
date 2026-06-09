"use client";

import { useEffect } from "react";
import type { AmazonToolHelpEntry } from "@/lib/amazon-tool-help";
import type { SupportedLocale } from "@/lib/i18n";

export function ToolHelpOverlay({
  locale,
  entry,
  open,
  onClose,
}: {
  locale: SupportedLocale;
  entry: AmazonToolHelpEntry;
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="tool-help-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={entry.title[locale]}
      onClick={onClose}
    >
      <div
        className="tool-help-panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="panel-kicker">
              {locale === "zh" ? "使用说明" : "How to use"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              {entry.title[locale]}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {entry.summary[locale]}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-lg text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            aria-label={locale === "zh" ? "关闭说明" : "Close help"}
          >
            ×
          </button>
        </div>

        <div className="mt-6 grid gap-3">
          {entry.items.map((item) => (
            <section key={item.label.en} className="rounded-2xl border border-black/8 bg-slate-50 px-4 py-4">
              <h3 className="text-sm font-semibold text-slate-950">
                {item.label[locale]}
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {item.body[locale]}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
