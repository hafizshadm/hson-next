const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://hsonnext.vercel.app";

// /home-old is the previous homepage hero, kept only for comparison. It is a
// near-duplicate of /, so it is blocked here as well as via its own noindex
// meta — a page can be crawled from an external link even if it is absent from
// the sitemap, so the meta tag alone is not enough.
export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/home-old"] }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
