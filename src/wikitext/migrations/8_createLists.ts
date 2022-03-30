import Document, { BlockAnnotation, is } from "@atjson/document";
import * as schema from "../annotations";

// Now that newlines aren't adjacent, we can
// start finding block boundaries and creating
// lists and fixing the end ranges for list items.
export function createLists(doc: Document) {
  doc
    .where((annotation) => is(annotation, schema.ListItem))
    .as("listItem")
    .outerJoin(
      doc.where((annotation) => is(annotation, schema.Newline)).as("newlines"),
      (listItem, newline) => newline.start > listItem.end
    )
    .update(({ listItem, newlines }) => {
      // List items will not contain newlines,
      // but they will have a reference
      let end = newlines.length ? newlines[0].start : doc.content.length;
      doc.replaceAnnotation(
        listItem,
        new schema.ListItem({
          id: listItem.id,
          start: listItem.start,
          end,
        })
      );
      if (newlines.length) {
        doc.replaceAnnotation(
          newlines[0],
          new schema.Newline({
            ...newlines[0],
            attributes: {
              for: `${listItem.type}:${listItem.id}`,
            },
          })
        );
      }
    });

  let lines = doc
    .where((annotation) => is(annotation, schema.ListItem))
    .as("listItem")
    .outerJoin(
      doc.where((annotation) => is(annotation, schema.Newline)).as("newline"),
      (listItem, newline) =>
        newline.attributes.for === `${listItem.type}:${listItem.id}`
    );

  let [lastLine, ...subsequentLines] = lines;
  let list = [lastLine];
  for (let line of subsequentLines) {
    if (line.listItem.start === lastLine.newline[0].end) {
      list.push(line);
    } else {
      doc.addAnnotations(
        new schema.List({
          start: list[0].listItem.start,
          end: list[list.length - 1].newline[0].end,
        })
      );
      list = [];
    }
    lastLine = line;
  }

  if (list.length) {
    doc.addAnnotations(
      new schema.List({
        start: list[0].listItem.start,
        end: list[list.length - 1].newline[0].end,
      })
    );
  }
}
