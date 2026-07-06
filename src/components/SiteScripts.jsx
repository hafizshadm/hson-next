"use client";

import { useEffect } from "react";

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
export default function SiteScripts({ scripts }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.__hsonScriptsLoaded) return;
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
    // scripts list is a stable per-page constant; intentionally run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

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
 * HTML file (see frontend/*.html).
 */
export const SCRIPTS = {
  home: [
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
};
