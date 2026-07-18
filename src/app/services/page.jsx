import content from "@/content/services";
import SiteScripts from "@/components/SiteScripts";
import JsonLd from "@/components/JsonLd";
import { pageMeta } from "@/lib/seo";
import { graph, organization, breadcrumbs } from "@/lib/jsonld";

export const metadata = pageMeta({
  title: "Marketing, Branding & Web Services | Hson",
  description:
    "Eleven specialist services under one team — content, social, ads, branding, photography, SEO/AEO/GEO, behavioural intelligence, automations, and web/app development.",
  path: "/services",
});

// organization() carries the full OfferCatalog of the eleven services.
const jsonLd = graph(
  organization(),
  breadcrumbs([
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
  ])
);

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <div dangerouslySetInnerHTML={{ __html: content }} />
      <SiteScripts page="services" />
    </>
  );
}
