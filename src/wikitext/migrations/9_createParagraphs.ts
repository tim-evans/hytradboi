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
    .sort((a, b) => (a.start > b.start ? 1 : -1))
    .as("newline")
    .outerJoin(
      doc
        .where((annotation) => is(annotation, schema.ClosingTag))
        .as("priorBlocks"),
      (newline, block) => newline.start === block.end
    )
    .outerJoin(
      doc
        .where((annotation) => is(annotation, schema.ClosingTag))
        .as("nextBlocks"),
      ({ newline }, block) => newline.start === block.start
    )
    .outerJoin(
      doc
        .where((annotation) => is(annotation, schema.Template))
        .as("templates"),
      ({ newline }, template) =>
        (newline.start > template.start && newline.end < template.end) ||
        newline.start === template.end
    )
    .update(({ newline, priorBlocks, nextBlocks, templates }) => {
      if (
        priorBlocks.length === 0 &&
        nextBlocks.length === 0 &&
        templates.length === 0
      ) {
        if (previous == null) {
          doc.addAnnotations(
            new schema.Paragraph({
              start: 0,
              end: newline.start,
            })
          );
        } else if (newline.end - newline.start > 1) {
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
