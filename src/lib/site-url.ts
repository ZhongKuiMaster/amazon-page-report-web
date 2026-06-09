const fallbackSiteUrl = "https://dealingnow.com";

function normalizeSiteUrl(value: string | undefined) {
  if (!value) {
    return fallbackSiteUrl;
  }

  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

export function absoluteUrl(path = "/") {
  return path === "/" ? siteUrl : `${siteUrl}${path}`;
}
