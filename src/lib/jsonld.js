// Structured data (schema.org JSON-LD) for search engines and, increasingly,
// for answer/generative engines (Google AI Overviews, ChatGPT, Perplexity).
// Clean, factual, machine-readable entities are what these systems extract and
// cite — so this is the backbone of the site's AEO/GEO. Everything here mirrors
// content that is actually visible on the pages (a requirement for FAQ/Service
// markup), and nothing is fabricated.

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://hsonnext.vercel.app";
const ORG_ID = `${SITE}/#organization`;

const AREA_SERVED = [
  "United Arab Emirates",
  "Saudi Arabia",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "Oman",
  "United Kingdom",
];

// The eleven services, mirroring the home index and /services cards.
export const SERVICES = [
  { name: "Content Creation", description: "Campaign, social, and brand content produced in Arabic and English." },
  { name: "Social Media Management", description: "Day-to-day channel management, content calendars, and community." },
  { name: "Ads Management", description: "Paid social and search campaigns built and optimised for measurable results." },
  { name: "Influencer Marketing", description: "Creator partnerships matched to the audience across the GCC." },
  { name: "Graphic Design & Branding", description: "Visual identity, brand systems, and design assets." },
  { name: "Photography & Videography", description: "Studio and on-location shoots for campaigns and content." },
  { name: "AI Automations", description: "Workflow and marketing automations that remove manual work." },
  { name: "Website Design & Development", description: "Fast, search-ready marketing sites built to convert." },
  { name: "SEO / AEO / GEO Optimization", description: "Ranking on search, answer, and generative engines." },
  { name: "Web & Mobile App Development", description: "Custom web and mobile applications." },
  { name: "Behavioural Intelligence", description: "Audience research and behavioural insight that informs strategy." },
];

// Home FAQ — text kept in lockstep with the visible FAQ section on the homepage.
export const FAQS = [
  { q: "Do you build custom packages, or is it fixed pricing per service?", a: "Custom. Most clients need a mix of two or three services, not all ten — we scope based on the actual goal, not a set menu." },
  { q: "Can you run campaigns in both Arabic and English at the same level of quality?", a: "Yes — this is handled by separate native-level writers for each language rather than one team translating the other's work." },
  { q: "How long before a new client sees results?", a: "Depends on the service. Paid ads and social content show measurable movement within weeks; SEO and AEO/GEO work typically takes a few months to show ranking and citation changes, which we'll be upfront about during scoping." },
  { q: "Can we see examples of past work?", a: "We're building out a public case study library now. In the meantime, book a call and we'll walk you through examples relevant to your industry directly." },
  { q: "Do you only work with businesses in the GCC?", a: "No. We support brands across the GCC from anywhere in the world. Most of the work happens remotely, so where you are based is not a problem." },
  { q: "Who actually does the work — is any of it outsourced?", a: "It's handled in-house by our core team, not rotating freelancers. You'll know who's running your account by name, not by a support ticket queue." },
  { q: "Can you take over mid-campaign from our current agency or freelancers?", a: "Yes — this is one of the most common ways clients come to us. We start with an audit of what's already running so nothing gets dropped during the handover." },
];

export function organization() {
  return {
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORG_ID,
    name: "Hson",
    alternateName: "Hson Agency",
    url: `${SITE}/`,
    logo: `${SITE}/favicon.png`,
    image: `${SITE}/opengraph-image`,
    slogan: "Making You Visible",
    description:
      "Hson is a marketing, branding, and web agency for the GCC and the UK. One team runs strategy, content, ads, branding, SEO/AEO/GEO, and web/app development, so a campaign and the website it points to are built together.",
    sameAs: ["https://www.instagram.com/hson.agency/"],
    areaServed: AREA_SERVED,
    knowsAbout: SERVICES.map((s) => s.name),
    serviceType: SERVICES.map((s) => s.name),
    hasOfferCatalog: offerCatalog(),
  };
}

export function offerCatalog() {
  return {
    "@type": "OfferCatalog",
    name: "Marketing, branding & web services",
    itemListElement: SERVICES.map((s) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: s.name, description: s.description, provider: { "@id": ORG_ID } },
    })),
  };
}

export function website() {
  return {
    "@type": "WebSite",
    "@id": `${SITE}/#website`,
    url: `${SITE}/`,
    name: "Hson",
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
  };
}

export function faqPage() {
  return {
    "@type": "FAQPage",
    "@id": `${SITE}/#faq`,
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbs(trail) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE}${item.path}`,
    })),
  };
}

// Wrap a set of nodes in a single @graph document.
export function graph(...nodes) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
