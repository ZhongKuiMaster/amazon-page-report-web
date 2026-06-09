(function () {
  if (window.__CTS_ANALYTICS_BOUND__) {
    return;
  }
  window.__CTS_ANALYTICS_BOUND__ = true;

  var STORAGE_KEY = "__CTS_EVENT_LOG__";
  var AMAZON_FIRST_WAVE_TOOL_SLUGS = {
    "amazon-price-tracker": true,
    "amazon-competitor-monitoring": true,
    "amazon-keyword-tracker": true,
    "amazon-listing-optimization": true,
    "amazon-product-compliance": true,
    "amazon-category-ungating": true,
    "amazon-image-compliance-checker": true,
    "amazon-search-optimization": true,
    "amazon-rank-tracker": true,
    "amazon-competitor-analysis": true,
  };
  var PRIMARY_ACTION_LABELS = {
    "amazon-price-tracker": [
      "Load comparison and generate result",
      "加载对比并生成结果",
    ],
    "amazon-competitor-monitoring": [
      "Load competitors and generate result",
      "加载竞品并生成结果",
      "加载竞品",
    ],
    "amazon-keyword-tracker": [
      "Load keywords and generate result",
      "加载关键词并生成结果",
    ],
    "amazon-listing-optimization": [
      "Load listing and generate result",
      "加载商品并生成结果",
      "加载商品",
    ],
    "amazon-product-compliance": [
      "Load product and generate compliance result",
      "加载商品并生成合规结果",
      "加载商品",
    ],
    "amazon-category-ungating": [
      "Load product and generate ungating result",
      "加载商品并生成解封结果",
      "加载商品",
    ],
    "amazon-image-compliance-checker": [
      "Load images and generate result",
      "加载图片并生成结果",
    ],
    "amazon-search-optimization": [
      "Load product and generate search result",
      "加载商品并生成搜索结果",
      "加载商品",
    ],
    "amazon-rank-tracker": [
      "Load rank data and generate result",
      "加载排名并生成结果",
    ],
    "amazon-competitor-analysis": [
      "Load comparison and generate result",
      "加载对比并生成结果",
    ],
  };
  var emittedFlags = {};

  function readStoredLog() {
    try {
      var raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return [];
      }
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_error) {
      return [];
    }
  }

  function persistLog(entries) {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-200)));
    } catch (_error) {
      // Ignore storage failures.
    }
  }

  function readMainContext() {
    var main = document.querySelector("main[data-page-type]");
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

  function pushEventToLog(entry) {
    window.__CTS_EVENT_LOG__ = window.__CTS_EVENT_LOG__ || readStoredLog();
    window.__CTS_EVENT_LOG__.push(entry);
    persistLog(window.__CTS_EVENT_LOG__);
  }

  function emitAnalyticsEvent(eventName, payload) {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, payload);
    }

    pushEventToLog(
      Object.assign(
        {
          type: eventName === "page_view" ? "page_view" : "event",
          event_name: eventName,
          ts: Date.now(),
        },
        payload,
      ),
    );
  }

  function getMainElement() {
    var main = document.querySelector("main[data-page-type]");
    return main instanceof HTMLElement ? main : null;
  }

  function isAmazonPrimaryToolPage(context) {
    return (
      context.page_type === "tool" &&
      context.page_platform === "amazon" &&
      !!context.page_tool_slug &&
      AMAZON_FIRST_WAVE_TOOL_SLUGS[context.page_tool_slug] === true
    );
  }

  function normalizeButtonText(element) {
    return (element.textContent || "").trim().replace(/\s+/g, " ");
  }

  function getPrimaryActionEventPayload(target) {
    var context = readMainContext();
    if (!isAmazonPrimaryToolPage(context)) {
      return null;
    }

    var button = target.closest("button, input[type='submit']");
    if (!(button instanceof HTMLElement)) {
      return null;
    }

    var toolSlug = context.page_tool_slug;
    var allowedLabels = PRIMARY_ACTION_LABELS[toolSlug] || [];
    var actionLabel = normalizeButtonText(button);

    if (!actionLabel) {
      return null;
    }

    var isPrimaryLabel = allowedLabels.indexOf(actionLabel) !== -1;
    var looksPrimaryByClass =
      typeof button.className === "string" &&
      button.className.indexOf("bg-slate-950") !== -1;

    if (!isPrimaryLabel && !looksPrimaryByClass) {
      return null;
    }

    return {
      eventName: "tool_primary_action_click",
      payload: Object.assign(
        {
          event_category: "tool-runtime",
          event_label: toolSlug,
          action_label: actionLabel,
          destination: window.location.pathname,
          link_type: "in-page",
        },
        context,
      ),
    };
  }

  function checkToolResultVisible() {
    var context = readMainContext();
    if (!isAmazonPrimaryToolPage(context)) {
      return;
    }

    var key = "tool_result_visible:" + context.page_locale + ":" + context.page_tool_slug;
    if (emittedFlags[key]) {
      return;
    }

    var text = document.body ? document.body.innerText || "" : "";
    var hasCurrentResult =
      text.indexOf("当前结果") !== -1 || text.indexOf("Current result") !== -1;
    var hasActionPlan =
      text.indexOf("行动建议") !== -1 || text.indexOf("Action plan") !== -1;

    if (!hasCurrentResult || !hasActionPlan) {
      return;
    }

    emittedFlags[key] = true;
    emitAnalyticsEvent(
      "tool_result_visible",
      Object.assign(
        {
          event_category: "tool-runtime",
          event_label: context.page_tool_slug,
          result_surface: "current-result-shell",
        },
        context,
      ),
    );
  }

  function trackPageView() {
    var pagePath = window.location.pathname + window.location.search;
    var context = readMainContext();
    emitAnalyticsEvent(
      "page_view",
      Object.assign(
        {
          page_path: pagePath,
          page_location: window.location.href,
          page_title: document.title,
        },
        context,
      ),
    );
    window.setTimeout(checkToolResultVisible, 80);
  }

  function trackClick(event) {
    var target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    var dynamicEvent = getPrimaryActionEventPayload(target);
    if (dynamicEvent) {
      emitAnalyticsEvent(dynamicEvent.eventName, dynamicEvent.payload);
      return;
    }

    var tracked = target.closest("[data-analytics-event]");
    if (!(tracked instanceof HTMLElement)) {
      return;
    }

    var eventName = tracked.dataset.analyticsEvent;
    if (!eventName) {
      return;
    }

    var payload = Object.assign(
      {
        event_category: tracked.dataset.analyticsCategory,
        event_label: tracked.dataset.analyticsLabel,
        destination: tracked.dataset.analyticsDestination,
        link_type: tracked.dataset.analyticsLinkType,
      },
      readMainContext(),
    );
    emitAnalyticsEvent(eventName, payload);
  }

  var originalPushState = history.pushState;
  var originalReplaceState = history.replaceState;

  history.pushState = function () {
    var result = originalPushState.apply(this, arguments);
    window.setTimeout(trackPageView, 0);
    return result;
  };

  history.replaceState = function () {
    var result = originalReplaceState.apply(this, arguments);
    window.setTimeout(trackPageView, 0);
    return result;
  };

  window.addEventListener("popstate", function () {
    window.setTimeout(trackPageView, 0);
  });

  document.addEventListener("click", trackClick, true);

  var observer = new MutationObserver(function () {
    checkToolResultVisible();
  });

  function startObserver() {
    if (!document.body || observer.__ctsStarted) {
      return;
    }
    observer.__ctsStarted = true;
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  startObserver();

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      function () {
        startObserver();
        trackPageView();
      },
      { once: true },
    );
  } else {
    trackPageView();
  }
})();
