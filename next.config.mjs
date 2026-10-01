/** @type {import('next').NextConfig} */
const nextConfig = {
  // The original site is fully static: markup is injected from generated
  // strings and all animation is client-side (GSAP/jQuery/Webflow chunks).
  // Nothing here needs a server at runtime, so every route is statically
  // generated and served as HTML — deploys to Vercel with zero config.
  reactStrictMode: true,

  // `next dev` and `next build` both write to .next, and their output is not
  // interchangeable: running a build while a dev server is up leaves the dev
  // server loading production chunks, which fails as
  // "Cannot find module './833.js'" or "__webpack_modules__[moduleId] is not a
  // function". Setting NEXT_DIST_DIR lets a one-off build compile somewhere
  // else and leave a running dev server alone. Defaults to .next, so normal
  // dev/build/deploy (including Vercel) is unchanged.
  distDir: process.env.NEXT_DIST_DIR || ".next",

  // hsonagency.com is the only canonical host. Any request that reaches a
  // production deployment through a *.vercel.app hostname (hsonnext.vercel.app
  // and the per-deployment URLs) is 301'd path-for-path to the brand domain, so
  // backlinks pointing at the Vercel URL pass their equity to hsonagency.com.
  // Scoped to production builds so preview deployments stay reachable.
  async redirects() {
    if (process.env.VERCEL_ENV !== "production") return [];
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: ".+\\.vercel\\.app" }],
        destination: "https://hsonagency.com/:path*",
        statusCode: 301,
      },
    ];
  },

  // Belt-and-braces with app/robots.js: preview deployments send noindex on
  // every response, so a stray link to one can never get it indexed.
  async headers() {
    if (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production") return [];
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
