import content from "@/content/home";
import SiteScripts from "@/components/SiteScripts";
import JsonLd from "@/components/JsonLd";
import { pageMeta } from "@/lib/seo";
import { graph, organization, website, faqPage } from "@/lib/jsonld";

export const metadata = pageMeta({
  title: "Hson | Making You Visible",
  description:
    "Hson plans and runs marketing, branding, and web/app projects for brands across the GCC and the UK. See how we work.",
  path: "/",
});

// Organization + WebSite + FAQ, cross-referenced in one @graph so search and
// answer engines can resolve the entity and lift the FAQ answers directly.
const jsonLd = graph(organization(), website(), faqPage());

export default function HomePage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <div dangerouslySetInnerHTML={{ __html: content }} />
      <SiteScripts page="home" />
    </>
  );
}
