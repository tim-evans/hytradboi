import Document, { is, ParseAnnotation } from "@atjson/document";
import * as schema from "../annotations";

// Sometimes, the text will contain
// things that were incorrectly marked by the
// parser as extlinks, due to the nature
// of [sic] and other editorial common practices.
// We want to remove them
export function unmarkFilesAndImages(doc: Document) {
  doc
    .where(
      (annotation) =>
        is(annotation, schema.Wikilink) &&
        (annotation.attributes.href.startsWith("File:") ||
          annotation.attributes.href.startsWith("Image:"))
    )
    .as("wikilink")
    .join(
      doc.where((annotation) => is(annotation, ParseAnnotation)).as("tokens"),
      (link, token) => token.attributes.reason === `${link.type}:${link.id}`
    )
    .update(({ wikilink, tokens }) => {
      let Annotation = wikilink.attributes.href.startsWith("File")
        ? schema.File
        : schema.Image;
      let embed = new Annotation({
        start: wikilink.start,
        end: wikilink.end,
        attributes: wikilink.attributes,
      });

      doc.removeAnnotations([wikilink, ...tokens]);
      doc.addAnnotations(
        embed,
        ...tokens.map(
          (token) =>
            new ParseAnnotation({
              start: token.start,
              end: token.end,
              attributes: {
                reason: `${embed.type}:${embed.id}`,
              },
            })
        )
      );
    });
}
