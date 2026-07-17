import content from "@/content/contact";
import SiteScripts from "@/components/SiteScripts";

export const metadata = {
  title: "Contact Hson | Marketing Agency for the Gulf Region",
  description:
    "Get in touch with Hson for marketing, branding, or web/app work across the GCC and beyond.",
};

export default function ContactPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: content }} />
      <SiteScripts page="contact" />
    </>
  );
}
