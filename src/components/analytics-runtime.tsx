"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    dataLayer?: unknown[];
    clarity?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    __CTS_GA4_ID__?: string;
    __CTS_EVENT_LOG__?: Array<Record<string, unknown>>;
  }
}

function readMainContext() {
  const main = document.querySelector("main[data-page-type]");

  if (!(main instanceof HTMLElement)) {
    return {};
  }

  return {
    page_type: main.dataset.pageType,
    page_locale: main.dataset.pageLocale,
    page_platform: main.dataset.pagePlatform,
    page_tool_slug: main.dataset.toolSlug,
    page_support_slug: main.dataset.supportSlug,
    page_template: main.dataset.pageTemplate,
  };
}

function pushEventToLog(entry: Record<string, unknown>) {
  if (!window.__CTS_EVENT_LOG__) {
    window.__CTS_EVENT_LOG__ = [];
  }

  window.__CTS_EVENT_LOG__.push(entry);
}

export function AnalyticsRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const pagePath = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
    const context = readMainContext();

    if (typeof window.gtag === "function" && window.__CTS_GA4_ID__) {
      window.gtag("event", "page_view", {
        page_path: pagePath,
        page_location: window.location.href,
        page_title: document.title,
        ...context,
      });
    }

    pushEventToLog({
      type: "page_view",
      page_path: pagePath,
      ...context,
    });
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const tracked = target.closest<HTMLElement>("[data-analytics-event]");
      if (!tracked) {
        return;
      }

      const eventName = tracked.dataset.analyticsEvent;
      if (!eventName) {
        return;
      }

      const payload = {
        event_category: tracked.dataset.analyticsCategory,
        event_label: tracked.dataset.analyticsLabel,
        destination: tracked.dataset.analyticsDestination,
        link_type: tracked.dataset.analyticsLinkType,
        ...readMainContext(),
      };

      if (typeof window.gtag === "function") {
        window.gtag("event", eventName, payload);
      }

      pushEventToLog({
        type: "click",
        event_name: eventName,
        ...payload,
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
