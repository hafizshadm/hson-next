import content from "@/content/about";
import SiteScripts from "@/components/SiteScripts";

export const metadata = {
  title: "About Hson | Marketing Consultants Working Across the Gulf",
  description:
    "Who Hson is: one team running strategy, creative, and build for businesses across the UAE, Saudi Arabia, and the wider Gulf region.",
};

export default function AboutPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: content }} />
      <SiteScripts page="about" />
    </>
  );
}
