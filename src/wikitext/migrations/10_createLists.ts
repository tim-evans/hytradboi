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
    .where((annotation) => is(annotation, schema.ListItem))
    .as("listItem")
    .outerJoin(
      doc.where((annotation) => is(annotation, schema.Newline)).as("newlines"),
      (listItem, newline) => newline.start === listItem.end
    );

  let [lastLine, ...subsequentLines] = lines;
  let list = [lastLine];
  for (let line of subsequentLines) {
    if (line.listItem.start === lastLine.newlines[0].end) {
      list.push(line);
    } else {
      doc.addAnnotations(
        new schema.List({
          start: list[0].listItem.start,
          end: list[list.length - 1].newlines[0].end,
        })
      );
      list = [line];
    }
    lastLine = line;
  }

  if (list.length) {
    doc.addAnnotations(
      new schema.List({
        start: list[0].listItem.start,
        end: list[list.length - 1].newlines[0].end,
      })
    );
  }
}
