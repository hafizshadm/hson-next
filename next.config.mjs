/** @type {import('next').NextConfig} */
const nextConfig = {
  // The original site is fully static: markup is injected from generated
  // strings and all animation is client-side (GSAP/jQuery/Webflow chunks).
  // Nothing here needs a server at runtime, so every route is statically
  // generated and served as HTML — deploys to Vercel with zero config.
  reactStrictMode: true,
};

export default nextConfig;
