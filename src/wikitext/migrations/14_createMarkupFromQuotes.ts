import Document, { is, ParseAnnotation } from "@atjson/document";
import * as schema from "../annotations";

export function createMarkupFromQuotes(doc: Document) {
  let seen: Record<string, boolean | undefined> = {};
  doc
    .where((annotation) => is(annotation, schema.Quote))
    .as("start")
    .join(
      doc.where((annotation) => is(annotation, schema.Quote)).as("endings"),
      (start, end) =>
        start.attributes.value === end.attributes.value && start.end < end.start
    )
    .join(
      doc.where((annotation) => is(annotation, ParseAnnotation)).as("tokens"),
      ({ start, endings }, token) =>
        token.attributes.reason === `${start.type}:${start.id}` ||
        endings.some(
          (ending) => token.attributes.reason === `${ending.type}:${ending.id}`
        )
    )
    .update(({ start, endings, tokens }) => {
      let end = endings.sort((a, b) => (a.start > b.start ? 1 : -1))[0];
      if (end && !seen[start.id]) {
        seen[end.id] = true;
        let parseTokens = tokens.filter((token) => {
          return (
            token.attributes.reason === `${start.type}:${start.id}` ||
            token.attributes.reason === `${end.type}:${end.id}`
          );
        });
        let markup =
          start.attributes.value === "''"
            ? [
                new schema.Italic({
                  start: start.start,
                  end: end.end,
                }),
              ]
            : start.attributes.value === "'''"
            ? [
                new schema.Bold({
                  start: start.start,
                  end: end.end,
                }),
              ]
            : [
                new schema.Bold({
                  start: start.start,
                  end: end.end,
                }),
                new schema.Italic({
                  start: start.start,
                  end: end.end,
                }),
              ];
        doc.removeAnnotations([start, end, ...parseTokens]);
        doc.addAnnotations(
          ...markup,
          ...parseTokens.map(
            (token) =>
              new ParseAnnotation({
                ...token,
                attributes: {
                  reason: `${markup[0].type}:${markup[0].id}`,
                },
              })
          )
        );
      }
    });
}
