# Hson — Next.js

The Hson marketing site (originally a static Webflow HTML/CSS/JS export) rebuilt
as a **Next.js 15 App Router** app, ready to deploy on Vercel.

## How the conversion works

The original site is animation-heavy: GSAP + ScrollTrigger + SplitText +
ScrambleText, jQuery, and Webflow runtime chunks, all self-initialising on page
load. To preserve that behaviour exactly while moving to Next.js:

- **Markup** — each original page's `<body>` is preserved verbatim and rendered
  via `dangerouslySetInnerHTML`. This keeps every Webflow attribute intact
  (uppercase `STYLE`, CSS custom properties, `srcset`, boolean `<video>` attrs,
  form controls) that a hand JSX rewrite would break. **`frontend/*.html` is the
  source of truth — edit those, never `src/content/*.js`**, which are generated
  from them by `scripts/generate-content.mjs`. Internal links and asset paths are
  rewritten to app routes (`/`, `/about`, `/services`, `/team`, `/partners`,
  `/contact`) and absolute `/assets/...` URLs.
- **CSS** — `style.css` is served as a static file from `public/style.css` (not
  imported through the bundler) so its relative `url("assets/...")` references
  keep resolving against `public/assets`.
- **Scripts** — `src/components/SiteScripts.jsx` loads the vendor libs, the
  page-specific Webflow chunk, and `script.js` in the exact `defer` order of the
  original pages, each after the previous finishes.
- **Navigation** — internal links are plain `<a>` tags (inside the injected
  markup), so every route change is a full document load and `script.js`
  re-initialises cleanly, just like the original multi-page site.

## Routes

| Route       | Source page              |
| ----------- | ------------------------ |
| `/`         | `frontend/index.html`    |
| `/about`    | `frontend/about.html`    |
| `/services` | `frontend/services.html` |
| `/team`     | `frontend/team.html`     |
| `/partners` | `frontend/partners.html` |
| `/contact`  | `frontend/contact.html`  |

To add a route: create `frontend/<page>.html`, register it in the `pages` array
in `scripts/generate-content.mjs`, add a script manifest entry in
`src/components/SiteScripts.jsx`, and add `src/app/<page>/page.jsx`.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
```

## Regenerate markup

After editing any `frontend/*.html`, re-run this or the change will not reach the
site — the app renders `src/content/*.js`, not the HTML directly:

```bash
npm run generate:content
```

## Build / deploy

```bash
npm run build && npm start
```

Deploys to Vercel with zero configuration (framework preset: Next.js).

Set `NEXT_PUBLIC_SITE_URL` to your production URL so Open Graph image URLs are
absolute (defaults to a Vercel placeholder otherwise).
