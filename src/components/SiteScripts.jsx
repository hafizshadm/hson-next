"use client";

import { useEffect } from "react";

/** Shared vendor + engine scripts, loaded after the page-specific chunk. */
const GSAP_STACK = [
  "/assets/gsap.min.js",
  "/assets/ScrollTrigger.min.js",
  "/assets/SplitText.min.js",
  "/assets/ScrambleTextPlugin.min.js",
  "/script.js",
];

/**
 * Per-page script manifests, mirroring the <script> order in each original
 * HTML file (see frontend/*.html). Kept inside this client module and looked up
 * by a plain string prop: a server component cannot pass the real array across
 * the RSC boundary (exports of a "use client" module become client-reference
 * proxies on the server, so SCRIPTS.home would arrive as undefined).
 */
const SCRIPTS = {
  // Home's hero is the 3D curved wall, which needs its own self-contained
  // script (no GSAP dependency; binds only to [data-curve-marquee]).
  home: [
    "/assets/jquery.min.js",
    "/assets/hsn.schunk.js",
    "/assets/hsn.main.js",
    ...GSAP_STACK,
    "/hson.curve-hero.js",
  ],
  // The previous arc-marquee hero, archived at /home-old.
  "home-old": [
    "/assets/jquery.min.js",
    "/assets/hsn.schunk.js",
    "/assets/hsn.main.js",
    ...GSAP_STACK,
  ],
  services: [
    "/assets/jquery.min.js",
    "/assets/hsn.schunk.js",
    "/assets/hsn.main.js",
    ...GSAP_STACK,
  ],
  about: [
    "/assets/jquery.min.js",
    "/assets/hsn.schunk.js",
    "/assets/hsn.about.js",
    ...GSAP_STACK,
  ],
  contact: [
    "/assets/jquery.min.js",
    "/assets/hsn.schunk.js",
    "/assets/hsn.contact.js",
    "/assets/hsn.schunk.contact.js",
    ...GSAP_STACK,
  ],
  team: [
    "/assets/jquery.min.js",
    "/assets/hsn.schunk.js",
    "/assets/hsn.about.js",
    ...GSAP_STACK,
  ],
  partners: [
    "/assets/jquery.min.js",
    "/assets/hsn.schunk.js",
    "/assets/hsn.about.js",
    ...GSAP_STACK,
  ],
};

/**
 * Loads the vendor libraries, the page-specific Webflow chunks, and the site's
 * own script.js in the SAME order the original static pages loaded them with
 * `defer`. Each script is appended only after the previous one has finished
 * executing, so ordering dependencies hold (jQuery before the Webflow runtime,
 * GSAP before its plugins, everything before script.js).
 *
 * Internal navigation uses plain <a> tags (rendered inside the page markup, not
 * next/link), so every route change is a full document load. That means this
 * effect runs fresh on each page and script.js re-initialises cleanly — exactly
 * like the original multi-page site. The window guard prevents a double load
 * under React Strict Mode in development.
 */
export default function SiteScripts({ page }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.__hsonScriptsLoaded) return;

    const scripts = SCRIPTS[page];
    if (!scripts || !scripts.length) return;
    window.__hsonScriptsLoaded = true;

    let cancelled = false;

    (async () => {
      for (const src of scripts) {
        if (cancelled) return;
        await new Promise((resolve) => {
          const el = document.createElement("script");
          el.src = src;
          el.async = false;
          el.onload = resolve;
          // Don't stall the whole chain if one file 404s in a broken deploy.
          el.onerror = resolve;
          document.body.appendChild(el);
        });
      }
    })();

    return () => {
      cancelled = true;
    };
    // page is a stable per-route constant; intentionally run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
