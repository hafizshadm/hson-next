import content from "@/content/contact";
import SiteScripts from "@/components/SiteScripts";

export const metadata = {
  title: "Contact Hson | Marketing Agency for the GCC",
  description:
    "Get in touch with Hson for marketing, branding, or web/app work. We support brands across the GCC from anywhere in the world.",
};

export default function ContactPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: content }} />
      <SiteScripts page="contact" />
    </>
  );
}
