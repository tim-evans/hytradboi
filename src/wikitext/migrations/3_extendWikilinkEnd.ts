import Document, { is, ParseAnnotation } from "@atjson/document";
import * as schema from "../annotations";

export function extendWikilinkEnd(doc: Document) {
  doc
    .where((annotation) => is(annotation, schema.Wikilink))
    .as("wikilink")
    .outerJoin(
      doc.where((annotation) => is(annotation, ParseAnnotation)).as("tokens"),
      (wikilink, token) => token.start >= wikilink.end
    )
    .update(({ wikilink, tokens }) => {
      // Extend links so examples like
      // [[computing language]]s becomes
      // a wikilink with the text
      // "computing languages" and the href
      // computing_languages
      let matches = doc.match(
        /^[a-zA-Z']+/,
        wikilink.end,
        tokens.length ? tokens[0].start : Infinity
      );
      if (matches.length) {
        doc.replaceAnnotation(
          wikilink,
          new schema.Wikilink({
            id: wikilink.id,
            start: wikilink.start,
            end: matches[0].end,
            attributes: {
              ...wikilink.attributes,
            },
          })
        );
      }
    });
}
