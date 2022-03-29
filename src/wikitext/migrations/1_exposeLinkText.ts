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

      // Let's handle the pipe trick as well.
      if (maybeContent.length > 0) {
        let sliceText = doc.content.slice(slice.start, slice.end).trim();
        // This is a pipe trick, which has a bunch of rules
        // as to how to handle the text.
        // We'll _not_ be using maybeContent here,
        // and instead, will be using
        // offsets in the href slice
        if (sliceText === "*" || sliceText === "") {
          slice = hrefs[0].clone();
          let startMatches = doc.match(/:/, slice.start, slice.end);
          if (startMatches.length) {
            slice.start = startMatches[0].end;
          }
          let endMatches = doc.match(/,/, slice.start, slice.end);
          if (endMatches.length) {
            slice.end = endMatches[0].start;
          } else {
            endMatches = doc.match(/\s+\(/, slice.start, slice.end);
            if (endMatches.length) {
              slice.end = endMatches[0].start;
            }
          }
        }
      }

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
