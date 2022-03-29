import Document, { is, ParseAnnotation } from "@atjson/document";
import * as schema from "../annotations";

// Categories are special,
// and will automatically have their prefix stripped.
export function handleCategoryLinks(doc: Document) {
  doc
    .where(
      (annotation) =>
        is(annotation, schema.Wikilink) &&
        annotation.attributes.href.startsWith("Category:")
    )
    .as("wikilink")
    .join(
      doc.where((annotation) => is(annotation, ParseAnnotation)).as("tokens"),
      (link, token) =>
        token.attributes.reason === `${link.type}:${link.id}` &&
        token.start == link.start
    )
    .update(({ tokens }) => {
      let openingBraces = tokens[0];
      let matches = doc.match(/^Category:/, openingBraces.end);

      if (matches.length) {
        doc.replaceAnnotation(
          openingBraces,
          new ParseAnnotation({
            start: openingBraces.start,
            end: matches[0].end,
            attributes: openingBraces.attributes,
          })
        );
      }
    });
}
