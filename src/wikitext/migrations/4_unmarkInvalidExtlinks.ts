import Document, { is, ParseAnnotation } from "@atjson/document";
import * as schema from "../annotations";

// Sometimes, the text will contain
// things that were incorrectly marked by the
// parser as extlinks, due to the nature
// of [sic] and other editorial common practices.
// We want to remove them
export function unmarkInvalidExtlinks(doc: Document) {
  doc
    .where((annotation) => is(annotation, schema.Extlink))
    .as("extlink")
    .join(
      doc.where((annotation) => is(annotation, ParseAnnotation)).as("tokens"),
      (link, token) => token.attributes.reason === `${link.type}:${link.id}`
    )
    .update(({ extlink, tokens }) => {
      try {
        new URL(extlink.attributes.href);
      } catch (e) {
        doc.removeAnnotations([extlink, ...tokens]);
      }
    });
}
