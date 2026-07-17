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
};

export default nextConfig;
