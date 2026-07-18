import content from "@/content/team";
import SiteScripts from "@/components/SiteScripts";
import JsonLd from "@/components/JsonLd";
import { pageMeta } from "@/lib/seo";
import { graph, breadcrumbs } from "@/lib/jsonld";

export const metadata = pageMeta({
  title: "Our Team | Hson",
  description:
    "Meet the Hson team: the people who plan the strategy, make the content, and run the campaigns for brands across the GCC.",
  path: "/team",
});

const jsonLd = graph(
  breadcrumbs([
    { name: "Home", path: "/" },
    { name: "Team", path: "/team" },
  ])
);

export default function TeamPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <div dangerouslySetInnerHTML={{ __html: content }} />
      <SiteScripts page="team" />
    </>
  );
}
