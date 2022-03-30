import Document, { ParseAnnotation, is } from "@atjson/document";
import * as schema from "../annotations";

// Now that newlines aren't adjacent, we can
// start finding block boundaries and creating
// lists and fixing the end ranges for list items.
export function createLists(doc: Document) {
  doc
    .where(
      (annotation) =>
        is(annotation, schema.OpeningTag) &&
        annotation.attributes.name === "listItem"
    )
    .as("start")
    .join(
      doc
        .where(
          (annotation) =>
            is(annotation, schema.ClosingTag) &&
            annotation.attributes.name === "listItem"
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
      let listItem = new schema.ListItem({
        start: start.start,
        end: end[0].start,
      });
      doc.removeAnnotations([start, end[0], ...tokens]);
      doc.addAnnotations(
        listItem,
        ...tokens.map(
          (token) =>
            new ParseAnnotation({
              ...token,
              attributes: {
                reason: `${listItem.type}:${listItem.id}`,
              },
            })
        )
      );
    });

  let lines = doc
    .where((annotation) => is(annotation, schema.Newline))
    .as("newline")
    .outerJoin(
      doc
        .where((annotation) => is(annotation, schema.ListItem))
        .as("preceding"),
      (newline, listItem) => listItem.end === newline.start
    )
    .outerJoin(
      doc
        .where((annotation) => is(annotation, schema.ListItem))
        .as("proceeding"),
      ({ newline }, listItem) => listItem.start === newline.end
    );

  let listStart = null;

  for (let { preceding, proceeding } of lines) {
    if (preceding.length === 0 && proceeding.length > 0) {
      listStart = proceeding[0].start;
    } else if (preceding.length > 0 && proceeding.length === 0) {
      doc.addAnnotations(
        new schema.List({
          start: listStart,
          end: preceding[0].end,
        })
      );
    }
  }
}
