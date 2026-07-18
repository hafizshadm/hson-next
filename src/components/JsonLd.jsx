// Renders a schema.org JSON-LD document into a <script> tag. Server component —
// the JSON is serialised at build time and shipped in the static HTML.
export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
