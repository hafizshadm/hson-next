"use client";

import { useState, useEffect } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/**
 * Hamburger + full-screen menu for <=991px, the width where the original
 * navbar hides its desktop links. Links are plain <a> (full page loads, like
 * the rest of the site), so navigating naturally resets the menu. Rendered once
 * from the root layout, so it appears on every route.
 */
export default function MobileNav() {
  const [open, setOpen] = useState(false);

  // Lock body scroll while the overlay is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        className={`hson-burger${open ? " is-open" : ""}`}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="hson-mobile-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      <div
        id="hson-mobile-menu"
        className={`hson-mobile-menu${open ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
      >
        <nav className="hson-mobile-menu_links" aria-label="Mobile">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hson-mobile-menu_link"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <a
          href="/contact"
          className="hson-mobile-menu_cta"
          onClick={() => setOpen(false)}
        >
          Book a Free Strategy Call
        </a>
      </div>
    </>
  );
}
