import content from "@/content/services";
import SiteScripts from "@/components/SiteScripts";

export const metadata = {
  title: "Marketing, Branding & Web Services | Hson",
  description:
    "Eleven specialist services under one team — content, social, ads, branding, photography, SEO/AEO/GEO, behavioural intelligence, automations, and web/app development.",
};

export default function ServicesPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: content }} />
      <SiteScripts page="services" />
    </>
  );
}
