import Document, { ParseAnnotation, is } from "@atjson/document";
import * as schema from "../annotations";

// Now that newlines aren't adjacent, we can
// start finding block boundaries and creating
// lists and fixing the end ranges for list items.
export function createHeadings(
  doc: Document,
  name: string,
  attributes: { level: number }
) {
  doc
    .where(
      (annotation) =>
        is(annotation, schema.OpeningTag) && annotation.attributes.name === name
    )
    .as("start")
    .join(
      doc
        .where(
          (annotation) =>
            is(annotation, schema.ClosingTag) &&
            annotation.attributes.name === name
        )
        .as("end"),
      (start, end) => start.attributes.closingTag === `${end.type}:${end.id}`
    )
    .join(
      doc.where((annotation) => is(annotation, ParseAnnotation)).as("tokens"),
      ({ start, end }, token) =>
        token.attributes.reason === `${start.type}:${start.id}` ||
        token.attributes.reason === `${end[0].type}:${end[0].id}`
    )
    .update(({ start, end, tokens }) => {
      let heading = new schema.Heading({
        start: start.start,
        end: end[0].end,
        attributes: {
          ...attributes,
        },
      });
      doc.removeAnnotations([start, ...end, ...tokens]);
      doc.addAnnotations(
        heading,
        ...tokens.map(
          (token) =>
            new ParseAnnotation({
              ...token,
              attributes: {
                reason: `${heading.type}:${heading.id}`,
              },
            })
        )
      );
    });
}
