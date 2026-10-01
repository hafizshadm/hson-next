// The one canonical origin for the site. Every absolute URL the site emits —
// <link rel="canonical">, og:url, og:image, sitemap.xml, robots.txt, JSON-LD —
// is built from this, so search engines credit hsonagency.com and never the
// Vercel deployment host.
//
// NEXT_PUBLIC_SITE_URL can override it (e.g. a staging domain), but a
// *.vercel.app value is ignored: pointing canonicals at the deployment URL is
// what split link equity away from the brand domain in the first place.
export const PRODUCTION_URL = "https://hsonagency.com";

function resolveSiteUrl() {
  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/+$/, "");
  if (!fromEnv) return PRODUCTION_URL;
  try {
    const { hostname } = new URL(fromEnv);
    if (hostname.endsWith(".vercel.app")) return PRODUCTION_URL;
  } catch {
    return PRODUCTION_URL;
  }
  return fromEnv;
}

export const SITE_URL = resolveSiteUrl();
