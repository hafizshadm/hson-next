import content from "@/content/partners";
import SiteScripts from "@/components/SiteScripts";

export const metadata = {
  title: "Trusted Partners | Hson",
  description:
    "The brands that trust Hson with their marketing, from global names to leading independents across the GCC.",
};

export default function PartnersPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: content }} />
      <SiteScripts page="partners" />
    </>
  );
}
