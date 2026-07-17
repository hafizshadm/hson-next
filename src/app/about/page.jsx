import content from "@/content/about";
import SiteScripts from "@/components/SiteScripts";

export const metadata = {
  title: "About Hson | Marketing Consultants Working Across the GCC",
  description:
    "Who Hson is: one team running strategy, creative, and build for brands across the GCC and the UK.",
};

export default function AboutPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: content }} />
      <SiteScripts page="about" />
    </>
  );
}
