function normalizeOptionalValue(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

const defaultAnalyticsConfig = {
  ga4Id: "G-Z39MZHMTRF",
  baiduSiteVerification: "codeva-43zVPFWyUS",
  clarityProjectId: "x45gqlm3lv",
  cloudflareBeaconToken: "1452ffa2a49b45749c9a8ddb3c98cb2e",
} as const;

export const analyticsConfig = {
  ga4Id:
    normalizeOptionalValue(process.env.NEXT_PUBLIC_GA4_ID) ??
    defaultAnalyticsConfig.ga4Id,
  googleSiteVerification: normalizeOptionalValue(
    process.env.NEXT_PUBLIC_GSC_VERIFICATION,
  ),
  bingSiteVerification: normalizeOptionalValue(
    process.env.NEXT_PUBLIC_BING_VERIFICATION,
  ),
  baiduSiteVerification: normalizeOptionalValue(
    process.env.NEXT_PUBLIC_BAIDU_SITE_VERIFICATION,
  ) ?? defaultAnalyticsConfig.baiduSiteVerification,
  clarityProjectId: normalizeOptionalValue(
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
  ) ?? defaultAnalyticsConfig.clarityProjectId,
  cloudflareBeaconToken: normalizeOptionalValue(
    process.env.NEXT_PUBLIC_CLOUDFLARE_BEACON_TOKEN,
  ) ?? defaultAnalyticsConfig.cloudflareBeaconToken,
} as const;

export const hasOptionalAnalytics =
  Boolean(analyticsConfig.ga4Id) ||
  Boolean(analyticsConfig.clarityProjectId) ||
  Boolean(analyticsConfig.cloudflareBeaconToken);
