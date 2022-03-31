import Document, {
  BlockAnnotation,
  is,
  ParseAnnotation,
} from "@atjson/document";
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
      doc.where((annotation) => is(annotation, schema.ClosingTag)).as("blocks"),
      (newline, block) =>
        newline.start === block.end || newline.start === block.start
    )
    .outerJoin(
      doc
        .where((annotation) => is(annotation, schema.Template))
        .as("templates"),
      ({ newline }, template) =>
        (newline.start > template.start && newline.end < template.end) ||
        newline.start === template.end
    )
    .update(({ newline, blocks, templates }) => {
      if (blocks.length === 0 && templates.length === 0) {
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
