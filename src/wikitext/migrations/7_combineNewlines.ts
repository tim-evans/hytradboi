import Document, { is } from "@atjson/document";
import * as schema from "../annotations";

// Paragraphs in wikitext start with some inline
// markup or plain text, and is terminated by a newline
// There are other block markers like listItem
// and templates that should not be considered
// as being "inside" paragraphs. New line tokens
// will break blocks, so we'll combine them to
// make it easier to block boundaries
export function combineNewlines(doc: Document) {
  doc
    .where((annotation) => is(annotation, schema.Newline))
    .as("firstNewline")
    .join(
      doc
        .where((annotation) => is(annotation, schema.Newline))
        .as("subsequentNewlines"),
      (first, next) => first.end === next.start
    )
    .update(({ firstNewline, subsequentNewlines }) => {
      let start = firstNewline.start;
      let end = Math.max(...subsequentNewlines.map((newline) => newline.end));
      doc.removeAnnotations(subsequentNewlines);
      doc.replaceAnnotation(
        firstNewline,
        new schema.Newline({
          start,
          end,
        })
      );
    });
}
