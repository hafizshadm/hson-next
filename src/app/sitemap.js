const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://hsonnext.vercel.app";

// Every indexable route.
const ROUTES = [
  { path: "/", priority: 1.0 },
  { path: "/about", priority: 0.8 },
  { path: "/services", priority: 0.9 },
  { path: "/team", priority: 0.7 },
  { path: "/partners", priority: 0.7 },
  { path: "/contact", priority: 0.8 },
];

export default function sitemap() {
  const now = new Date();
  return ROUTES.map(({ path, priority }) => ({
    url: `${SITE}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority,
  }));
}
