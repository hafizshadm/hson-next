import content from "@/content/team";
import SiteScripts from "@/components/SiteScripts";

export const metadata = {
  title: "Our Team | Hson",
  description:
    "Meet the Hson team: the people who plan the strategy, make the content, and run the campaigns for brands across the GCC.",
};

export default function TeamPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: content }} />
      <SiteScripts page="team" />
    </>
  );
}
