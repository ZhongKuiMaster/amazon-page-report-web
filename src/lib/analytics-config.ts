function normalizeOptionalValue(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export const analyticsConfig = {
  ga4Id: normalizeOptionalValue(process.env.NEXT_PUBLIC_GA4_ID),
  googleSiteVerification: normalizeOptionalValue(
    process.env.NEXT_PUBLIC_GSC_VERIFICATION,
  ),
  bingSiteVerification: normalizeOptionalValue(
    process.env.NEXT_PUBLIC_BING_VERIFICATION,
  ),
  clarityProjectId: normalizeOptionalValue(
    process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
  ),
  cloudflareBeaconToken: normalizeOptionalValue(
    process.env.NEXT_PUBLIC_CLOUDFLARE_BEACON_TOKEN,
  ),
} as const;

export const hasOptionalAnalytics =
  Boolean(analyticsConfig.ga4Id) ||
  Boolean(analyticsConfig.clarityProjectId) ||
  Boolean(analyticsConfig.cloudflareBeaconToken);
