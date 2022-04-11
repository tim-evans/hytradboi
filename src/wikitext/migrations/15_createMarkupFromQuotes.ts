import Document, { is, ParseAnnotation } from "@atjson/document";
import * as schema from "../annotations";

export function createMarkupFromQuotes(doc: Document) {
  let seen: Record<string, boolean | undefined> = {};
  doc
    .where((annotation) => is(annotation, schema.Quote))
    .sort((a, b) => (a.start > b.start ? 1 : -1))
    .as("start")
    .join(
      doc
        .where((annotation) => is(annotation, schema.Quote))
        .sort((a, b) => (a.start > b.start ? 1 : -1))
        .as("endings"),
      (start, end) =>
        start !== end &&
        start.attributes.value === end.attributes.value &&
        start.end < end.start
    )
    .join(
      doc.where((annotation) => is(annotation, ParseAnnotation)).as("tokens"),
      ({ start, endings }, token) =>
        token.attributes.reason === `${start.type}:${start.id}` ||
        endings.some(
          (ending) => token.attributes.reason === `${ending.type}:${ending.id}`
        )
    )
    .outerJoin(
      doc.where((annotation) => is(annotation, schema.Newline)).as("newlines"),
      ({ start }, newline) => newline.start > start.end
    )
    .update(({ start, endings, tokens, newlines }) => {
      let ending = endings.sort((a, b) => (a.start > b.start ? 1 : -1))[0];
      let endOfLine =
        newlines.sort((a, b) => (a.start > b.start ? 1 : -1))[0]?.start ??
        doc.content.length;
      if (!seen[start.id]) {
        let end = ending && ending.start < endOfLine ? ending.end : endOfLine;
        if (end && ending.start < endOfLine) {
          seen[ending.id] = true;
        }
        let parseTokens = tokens.filter((token) => {
          return (
            token.attributes.reason === `${start.type}:${start.id}` ||
            (end && token.attributes.reason === `${ending.type}:${ending.id}`)
          );
        });
        let markup =
          start.attributes.value === "''"
            ? [
                new schema.Italic({
                  start: start.start,
                  end,
                }),
              ]
            : start.attributes.value === "'''"
            ? [
                new schema.Bold({
                  start: start.start,
                  end,
                }),
              ]
            : [
                new schema.Bold({
                  start: start.start,
                  end,
                }),
                new schema.Italic({
                  start: start.start,
                  end,
                }),
              ];
        doc.removeAnnotations([start, ending, ...parseTokens]);
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
