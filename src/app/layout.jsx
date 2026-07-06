// Global stylesheet is served as a static file from /public/style.css (NOT
// imported through the bundler) so its relative `url("assets/...")` references
// keep resolving against /assets, exactly as in the original export.
import "./mobile-nav.css";
import MobileNav from "@/components/MobileNav";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://hson-agency.vercel.app"
  ),
  title: {
    default: "Hson | Marketing & Digital Agency for the Gulf Region",
    template: "%s",
  },
  icons: {
    icon: [{ url: "/favicon.png", sizes: "32x32", type: "image/png" }],
    apple: "/assets/images/webclip.png",
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
        {children}
        <MobileNav />
      </body>
    </html>
  );
}
