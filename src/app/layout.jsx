// Global stylesheet is served as a static file from /public/style.css (NOT
// imported through the bundler) so its relative `url("assets/...")` references
// keep resolving against /assets, exactly as in the original export.
import "./mobile-nav.css";
import "./loader.css";
import MobileNav from "@/components/MobileNav";
import Loader from "@/components/Loader";

export const metadata = {
  // Open Graph image URLs must be absolute, so this has to match the domain the
  // site actually serves from or link previews resolve to a dead host. Override
  // with NEXT_PUBLIC_SITE_URL once a custom domain is attached.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://hsonnext.vercel.app"
  ),
  title: {
    default: "Hson | Making You Visible",
    template: "%s",
  },
  applicationName: "Hson",
  keywords: [
    "marketing agency GCC",
    "digital marketing Kuwait",
    "branding agency GCC",
    "web development GCC",
    "SEO AEO GEO",
    "social media management",
    "content creation",
    "advertising GCC",
    "Hson",
  ],
  authors: [{ name: "Hson" }],
  creator: "Hson",
  publisher: "Hson",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [{ url: "/favicon.png", sizes: "32x32", type: "image/png" }],
    apple: "/favicon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* React 19 hoists these into <head>. Keeping the stylesheet as a
            static /public asset preserves the CSS url() -> /assets mapping. */}
        <link rel="stylesheet" href="/style.css" precedence="default" />
        <link
          rel="preload"
          href="/assets/fonts/OverusedGrotesk-VF.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        {/* Without JS the overlay can never be dismissed, so hide it outright. */}
        <noscript>
          <style>{`.hson-loader{display:none!important}`}</style>
        </noscript>
        <Loader />
        {children}
        <MobileNav />
      </body>
    </html>
  );
}
