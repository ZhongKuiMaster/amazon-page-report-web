"use client";

import { useEffect, useState } from "react";
import { ToolRuntime } from "@/components/tool-runtime";
import { ToolRuntimeSimplifier } from "@/components/tool-runtime-simplifier";
import type { SupportedLocale } from "@/lib/i18n";
import type { ToolDefinition } from "@/lib/tools";

export function ToolRuntimeClientShell({
  tool,
  locale,
  titleOverride,
}: {
  tool: ToolDefinition;
  locale: SupportedLocale;
  titleOverride: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <ToolRuntimeSimplifier locale={locale} slug={tool.slug} />
      <ToolRuntime tool={tool} locale={locale} titleOverride={titleOverride} />
    </>
  );
}
