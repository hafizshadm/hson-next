// Shared per-page metadata builder. Keeps titles, descriptions, canonical URLs,
// and social cards consistent across routes. Paths are relative — Next resolves
// them against `metadataBase` (set in app/layout.jsx) into absolute URLs, and
// the file-based app/opengraph-image.jsx supplies og:image/twitter:image for
// every route automatically, so images are not repeated here.

export function pageMeta({ title, description, path = "/" }) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: "Hson",
      locale: "en_US",
      url: path,
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
