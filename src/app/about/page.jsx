import content from "@/content/about";
import SiteScripts from "@/components/SiteScripts";
import JsonLd from "@/components/JsonLd";
import { pageMeta } from "@/lib/seo";
import { graph, breadcrumbs } from "@/lib/jsonld";

export const metadata = pageMeta({
  title: "About Hson | Marketing Consultants Working Across the GCC",
  description:
    "Who Hson is: one team running strategy, creative, and build for brands across the GCC and the UK.",
  path: "/about",
});

const jsonLd = graph(
  breadcrumbs([
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ])
);

export default function AboutPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <div dangerouslySetInnerHTML={{ __html: content }} />
      <SiteScripts page="about" />
    </>
  );
}
