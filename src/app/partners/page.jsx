import content from "@/content/partners";
import SiteScripts from "@/components/SiteScripts";
import JsonLd from "@/components/JsonLd";
import { pageMeta } from "@/lib/seo";
import { graph, breadcrumbs } from "@/lib/jsonld";

export const metadata = pageMeta({
  title: "Trusted Partners | Hson",
  description:
    "The brands that trust Hson with their marketing, from global names to leading independents across the GCC.",
  path: "/partners",
});

const jsonLd = graph(
  breadcrumbs([
    { name: "Home", path: "/" },
    { name: "Partners", path: "/partners" },
  ])
);

export default function PartnersPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <div dangerouslySetInnerHTML={{ __html: content }} />
      <SiteScripts page="partners" />
    </>
  );
}
