import content from "@/content/services";
import SiteScripts, { SCRIPTS } from "@/components/SiteScripts";

export const metadata = {
  title: "Marketing, Branding & Web Services | Hson – Gulf Agency",
  description:
    "Ten specialist services under one team — content, social, ads, branding, photography, SEO/AEO/GEO, automations, and web/app development for the Gulf.",
};

export default function ServicesPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: content }} />
      <SiteScripts scripts={SCRIPTS.services} />
    </>
  );
}
