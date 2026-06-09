"use client";

import { useState } from "react";
import { ToolHelpOverlay } from "@/components/tool-help-overlay";
import type { AmazonToolHelpEntry } from "@/lib/amazon-tool-help";
import type { SupportedLocale } from "@/lib/i18n";

export function ToolHelpLauncher({
  locale,
  entry,
}: {
  locale: SupportedLocale;
  entry: AmazonToolHelpEntry;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-100"
        data-analytics-event="tool_help_open"
        data-analytics-category="engagement"
        data-analytics-label={entry.slug}
      >
        {locale === "zh" ? "如何使用" : "How to use"}
      </button>

      <ToolHelpOverlay
        locale={locale}
        entry={entry}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
