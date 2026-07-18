import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// File-based OG image: Next auto-wires this as og:image AND twitter:image for
// every route (twitter-image.jsx re-exports it), replacing the old leftover
// template graphic. Rendered once at build time — the site is fully static.
export const alt =
  "Hson — Making You Visible. Marketing, branding, and web for the GCC and the UK.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand palette (see public/style.css :root)
const BLACK = "#080909";
const IVORY = "#fbf8ed";
const BRONZE = "#96794a";

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public/Logo-White.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 84px",
          backgroundColor: BLACK,
          // Soft bronze glow bleeding from the top-right corner.
          backgroundImage: `radial-gradient(1100px 620px at 88% -8%, rgba(150,121,74,0.42), rgba(8,9,9,0) 60%)`,
          color: IVORY,
          fontFamily: "sans-serif",
        }}
      >
        {/* Eyebrow */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 44,
              height: 4,
              backgroundColor: BRONZE,
              marginRight: 20,
            }}
          />
          <div
            style={{
              fontSize: 26,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: BRONZE,
              fontWeight: 600,
            }}
          >
            Marketing · Branding · Web — GCC &amp; UK
          </div>
        </div>

        {/* Headline + supporting line */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 116,
              lineHeight: 1.02,
              fontWeight: 800,
              letterSpacing: -3,
              color: IVORY,
            }}
          >
            Making You Visible
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 34,
              lineHeight: 1.35,
              color: "rgba(251,248,237,0.78)",
              maxWidth: 900,
            }}
          >
            One team for strategy, content, ads, branding, and web &amp; app
            development.
          </div>
        </div>

        {/* Footer: wordmark + handle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(251,248,237,0.16)",
            paddingTop: 34,
          }}
        >
          <img src={logoSrc} height={44} alt="Hson" />
          <div style={{ display: "flex", fontSize: 30, color: BRONZE, fontWeight: 600 }}>
            hson.agency
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
