import content from "@/content/home-old";
import SiteScripts from "@/components/SiteScripts";

// The previous home hero (arc marquee), kept reachable for comparison after the
// 3D curved hero was promoted to /. Explicitly kept out of search: it is a
// near-duplicate of the homepage, so letting crawlers index it would split
// ranking signals against the real one.
export const metadata = {
  title: "Hson | Making You Visible (previous hero)",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
  alternates: { canonical: "/" },
};

export default function HomeOldPage() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: content }} />
      <SiteScripts page="home-old" />
    </>
  );
}
