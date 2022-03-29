import Document, { is, ParseAnnotation } from "@atjson/document";
import * as schema from "../annotations";

export function exposeLinkText(doc: Document) {
  doc
    .where((annotation) => is(annotation, schema.Wikilink))
    .as("wikilink")
    .join(
      doc.where((annotation) => is(annotation, ParseAnnotation)).as("tokens"),
      (wikilink, token) =>
        token.attributes.reason === `${wikilink.type}:${wikilink.id}`
    )
    .join(
      doc.where((annotation) => is(annotation, schema.Slice)).as("hrefs"),
      ({ wikilink }, slice) =>
        wikilink.attributes.href === `${slice.type}:${slice.id}`
    )
    .outerJoin(
      doc
        .where((annotation) => is(annotation, schema.Slice))
        .as("maybeContent"),
      ({ wikilink }, slice) =>
        wikilink.attributes.maybeContent.includes(`${slice.type}:${slice.id}`)
    )
    .update(({ hrefs, maybeContent, tokens }) => {
      // We now have a big join that allows
      // us to associate a bunch of information
      // together that was in the document.
      // We'll be shifting the parse annotation
      // such that it exposes the correct slice
      // of text.
      let slice =
        maybeContent.length > 0
          ? maybeContent[maybeContent.length - 1]
          : hrefs[0];

      // At this point, we only have one token
      let token = tokens[0];
      doc.replaceAnnotation(
        token,
        new ParseAnnotation({
          start: token.start,
          end: slice.start,
          attributes: token.attributes,
        }),
        new ParseAnnotation({
          start: slice.end,
          end: token.end,
          attributes: token.attributes,
        })
      );
      if (slice !== hrefs[0]) {
        doc.removeAnnotation(slice);
      }
    });
}
