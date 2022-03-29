import Document, { is } from "@atjson/document";
import * as schema from "../annotations";

export function stampInHrefToWikilink(doc: Document) {
  doc
    .where((annotation) => is(annotation, schema.Wikilink))
    .as("wikilink")
    .join(
      doc.where((annotation) => is(annotation, schema.Slice)).as("slices"),
      (link, slice) => link.attributes.href === `${slice.type}:${slice.id}`
    )
    .update(({ wikilink, slices }) => {
      let slice = slices[0];
      let href = doc.content.slice(slice.start, slice.end).replace(/\s+/g, "_");
      doc.replaceAnnotation(
        wikilink,
        new schema.Wikilink({
          start: wikilink.start,
          end: wikilink.end,
          attributes: {
            ...wikilink.attributes,
            href,
          },
        })
      );
      doc.removeAnnotation(slice);
    });
}
