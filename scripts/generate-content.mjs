// Build-time tool: converts the original static HTML pages into JS modules that
// export the page's <body> inner markup (minus the trailing <script> tags) as a
// string. The strings are consumed by the App Router pages via
// dangerouslySetInnerHTML, which preserves the Webflow markup byte-for-byte
// (uppercase STYLE attrs, CSS custom properties, srcset, boolean video attrs,
// form controls) that a hand JSX conversion would mangle.
//
// Run:  node scripts/generate-content.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, "..", "frontend");
const OUT = join(__dirname, "..", "src", "content");

const pages = [
  { file: "index.html", out: "home.js" },
  { file: "services.html", out: "services.js" },
  { file: "about.html", out: "about.js" },
  { file: "contact.html", out: "contact.js" },
  { file: "team.html", out: "team.js" },
  { file: "partners.html", out: "partners.js" },
  // Previous hero, kept reachable at /home-old for comparison. noindex.
  { file: "home-old.html", out: "home-old.js" },
];

function extractBody(html) {
  const bodyOpen = html.indexOf("<body>");
  if (bodyOpen === -1) throw new Error("no <body>");
  const afterOpen = bodyOpen + "<body>".length;
  // Everything up to the first <script ...> that trails the markup.
  const firstScript = html.indexOf("<script", afterOpen);
  const end = firstScript === -1 ? html.indexOf("</body>", afterOpen) : firstScript;
  return html.slice(afterOpen, end).trim();
}

function rewrite(markup) {
  return (
    markup
      // Internal page links -> App Router routes (keep any #hash suffix).
      .replaceAll('href="index.html"', 'href="/"')
      .replaceAll('href="services.html', 'href="/services') // covers services.html and services.html#anchor
      .replaceAll('href="about.html', 'href="/about')
      .replaceAll('href="contact.html', 'href="/contact')
      // Close the rewrites above for the plain (no-hash) case: the replaceAll
      // left e.g. `/services"` intact and `/services#anchor"` intact already.
      // Asset references -> absolute, served from /public.
      .replaceAll('"assets/', '"/assets/') // src="assets/..." and standalone attrs
      .replaceAll(" assets/", " /assets/") // srcset candidates after ", "
      .replaceAll("(assets/", "(/assets/") // any inline url(assets/...) just in case
      .replaceAll('src="Logo-Black.png"', 'src="/Logo-Black.png"')
      .replaceAll('src="Logo-White.png"', 'src="/Logo-White.png"')
  );
}

for (const { file, out } of pages) {
  const html = readFileSync(join(SRC, file), "utf8");
  const markup = rewrite(extractBody(html));
  const module = `// AUTO-GENERATED from frontend/${file} by scripts/generate-content.mjs\n// Do not edit by hand; re-run the generator instead.\nexport default ${JSON.stringify(
    markup
  )};\n`;
  writeFileSync(join(OUT, out), module, "utf8");
  console.log(`wrote src/content/${out}  (${markup.length} chars)`);
}
