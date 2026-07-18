const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://hsonnext.vercel.app";

export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
