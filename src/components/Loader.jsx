"use client";

import { useEffect, useRef, useState } from "react";

/**
 * First-load overlay. The concept is the brand line: the logo starts invisible
 * and is literally made visible as the page loads — a bronze fill rises through
 * the mark from 0 to 100%, then the whole panel splits and lifts away.
 *
 * Three things this has to get right, because the site is unusual:
 *
 * 1. Internal navigation is full document loads (plain <a> tags, so script.js
 *    re-initialises). A loader on every route change would fire five times in a
 *    browsing session, so it runs once per tab via sessionStorage.
 * 2. It must never trap the page. The markup is server-rendered so there is no
 *    flash before hydration, which means a JS failure would otherwise leave the
 *    site permanently covered. Two independent escapes: a <noscript> rule, and
 *    a CSS failsafe animation that hides it at 8s no matter what JS does.
 * 3. Progress is real, not a fake timer: it tracks the eager images actually
 *    decoding, and only completes on window load.
 */
export default function Loader() {
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState("loading"); // loading -> leaving -> gone
  const shown = useRef(false);

  useEffect(() => {
    // Already played this tab, or the visitor prefers less motion: skip it.
    const seen = sessionStorage.getItem("hson:loaded");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduced) {
      setState("gone");
      document.documentElement.classList.remove("hson-loading");
      return;
    }
    shown.current = true;
    document.documentElement.classList.add("hson-loading");

    // Real progress: the eager (above-the-fold) images. Lazy ones never load
    // until scroll, so counting them would stall the bar at 40% forever.
    const eager = [...document.images].filter((i) => i.loading !== "lazy");
    const total = eager.length || 1;
    let done = 0;
    let target = 0;
    let current = 0;
    let raf = 0;

    const bump = () => {
      done += 1;
      target = Math.min(96, Math.round((done / total) * 96));
    };
    eager.forEach((img) => {
      if (img.complete) bump();
      else {
        img.addEventListener("load", bump, { once: true });
        img.addEventListener("error", bump, { once: true }); // a 404 must not stall the bar
      }
    });

    const finish = () => {
      target = 100;
    };
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });

    // Never hold the page hostage to a slow asset.
    const bail = setTimeout(finish, 5000);

    // Ease toward the target so the bar glides instead of jumping.
    const tick = () => {
      current += (target - current) * 0.08;
      if (target - current < 0.4) current = target;
      setProgress(Math.round(current));
      if (current >= 100) {
        setState("leaving");
        sessionStorage.setItem("hson:loaded", "1");
        document.documentElement.classList.remove("hson-loading");
        setTimeout(() => setState("gone"), 1100); // must outlast the exit transition
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(bail);
      document.documentElement.classList.remove("hson-loading");
    };
  }, []);

  if (state === "gone") return null;

  return (
    <div
      className={`hson-loader${state === "leaving" ? " is-leaving" : ""}`}
      style={{ "--p": `${progress}%` }}
      role="status"
      aria-live="polite"
      aria-label={`Loading, ${progress} percent`}
    >
      {/* Two halves that part to reveal the page underneath. */}
      <div className="hson-loader_panel is--top" />
      <div className="hson-loader_panel is--bottom" />

      <div className="hson-loader_inner">
        <div className="hson-loader_mark">
          {/* Base: the mark, barely there. Fill: the same mark, clipped to
              progress, rising through it. */}
          <img src="/Logo-Black.png" alt="" className="hson-loader_mark-ghost" />
          <img src="/Logo-Black.png" alt="" className="hson-loader_mark-fill" />
        </div>

        <div className="hson-loader_meta">
          <span className="hson-loader_word">Making You Visible</span>
          <span className="hson-loader_count">{String(progress).padStart(3, "0")}</span>
        </div>

        <div className="hson-loader_bar">
          <span className="hson-loader_bar-fill" />
        </div>
      </div>
    </div>
  );
}
