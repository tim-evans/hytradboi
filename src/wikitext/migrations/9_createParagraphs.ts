import Document, { BlockAnnotation, is } from "@atjson/document";
import * as schema from "../annotations";

// Now that newlines aren't adjacent, we can
// start finding block boundaries and creating
// paragraphs.
export function createParagraphs(doc: Document) {
  let previous = null;
  doc
    .where((annotation) => is(annotation, schema.Newline))
    .as("newline")
    .outerJoin(
      doc
        .where((annotation) => annotation instanceof BlockAnnotation)
        .as("blocks"),
      (newline, block) => newline.start === block.end
    )
    .update(({ newline, blocks }) => {
      if (blocks.length === 0) {
        doc.removeAnnotation(newline);
        if (previous == null) {
          doc.addAnnotations(
            new schema.Paragraph({
              start: 0,
              end: newline.start,
            })
          );
        } else {
          doc.addAnnotations(
            new schema.Paragraph({
              start: previous.end,
              end: newline.start,
            })
          );
        }
      }
      previous = newline;
    });
}
