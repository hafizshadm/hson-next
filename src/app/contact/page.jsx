import content from "@/content/contact";
import SiteScripts, { SCRIPTS } from "@/components/SiteScripts";

export const metadata = {
  title: "Contact Hson | Marketing Agency for the Gulf Region",
  description:
    "Get in touch with Hson for marketing, branding, or web/app work across the UAE, Saudi Arabia, and the GCC.",
};

export default function ContactPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: content }} />
      <SiteScripts scripts={SCRIPTS.contact} />
    </>
  );
}
