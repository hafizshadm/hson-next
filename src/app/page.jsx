import content from "@/content/home";
import SiteScripts from "@/components/SiteScripts";

const DESCRIPTION =
  "Hson plans and runs marketing, branding, and web/app projects for brands across the GCC and the UK. See how we work.";

export const metadata = {
  title: "Hson | Making You Visible",
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    title: "Hson | Making You Visible",
    description: DESCRIPTION,
    images: ["/assets/images/opengraph.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hson | Making You Visible",
    description: DESCRIPTION,
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Hson",
  url: "/",
  description:
    "Marketing and digital agency for the GCC. Strategy, content, ads, branding, and development under one team.",
  slogan: "Making You Visible",
  sameAs: ["https://www.instagram.com/hson.agency/"],
  areaServed: [
    "UAE",
    "Saudi Arabia",
    "Qatar",
    "Kuwait",
    "Bahrain",
    "Oman",
    "United Kingdom",
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <div dangerouslySetInnerHTML={{ __html: content }} />
      <SiteScripts page="home" />
    </>
  );
}
