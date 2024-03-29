import Document, { is, SliceAnnotation } from "@atjson/document";
import * as schema from "../annotations";

export function stampInHrefToWikilink(doc: Document) {
  doc
    .where((annotation) => is(annotation, schema.Wikilink))
    .as("wikilink")
    .join(
      doc.where((annotation) => is(annotation, SliceAnnotation)).as("slices"),
      (link, slice) => link.attributes.href === slice.id
    )
    .update(({ wikilink, slices }) => {
      let slice = slices[0];
      let href = doc.content.slice(slice.start, slice.end).replace(/\s+/g, "_");
      doc.replaceAnnotation(
        wikilink,
        new schema.Wikilink({
          id: wikilink.id,
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
