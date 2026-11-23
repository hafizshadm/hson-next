import content from "@/content/contact";
import SiteScripts from "@/components/SiteScripts";
import ContactBrief from "@/components/ContactBrief";
import JsonLd from "@/components/JsonLd";
import { pageMeta } from "@/lib/seo";
import { graph, breadcrumbs } from "@/lib/jsonld";

export const metadata = pageMeta({
  title: "Contact Hson | Marketing Agency for the GCC",
  description:
    "Send Hson a project brief for marketing, branding, or web/app work, or email info@hsonagency.com. We support brands across the GCC from anywhere in the world.",
  path: "/contact",
});

const jsonLd = graph(
  breadcrumbs([
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ])
);

export default function ContactPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <div dangerouslySetInnerHTML={{ __html: content }} />
      <ContactBrief />
      <SiteScripts page="contact" />
    </>
  );
}
