import content from "@/content/home";
import SiteScripts, { SCRIPTS } from "@/components/SiteScripts";

export const metadata = {
  title: "Hson | Marketing & Digital Agency for the Gulf Region",
  description:
    "Hson plans and runs marketing, branding, and web/app projects for businesses across the UAE, Saudi Arabia, and the wider Gulf. See how we work.",
  openGraph: {
    type: "website",
    title: "Hson | Marketing & Digital Agency for the Gulf Region",
    description:
      "Hson plans and runs marketing, branding, and web/app projects for businesses across the UAE, Saudi Arabia, and the wider Gulf. See how we work.",
    images: ["/assets/images/opengraph.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hson | Marketing & Digital Agency for the Gulf Region",
    description:
      "Hson plans and runs marketing, branding, and web/app projects for businesses across the UAE, Saudi Arabia, and the wider Gulf. See how we work.",
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Hson",
  url: "/",
  description:
    "Marketing and digital agency for the Gulf region. Strategy, content, ads, branding, and development under one team.",
  slogan: "Marketing That's Built to Work in the Gulf, Not Adapted to It",
  areaServed: ["UAE", "Saudi Arabia", "Qatar", "Kuwait", "Bahrain", "Oman"],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <div dangerouslySetInnerHTML={{ __html: content }} />
      <SiteScripts scripts={SCRIPTS.home} />
    </>
  );
}
