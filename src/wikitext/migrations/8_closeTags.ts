import Document, { is } from "@atjson/document";
import * as schema from "../annotations";

// Some tags are intentionally left unclosed
// and have an implied boundary of a line
// break. We'll add a closing tag
// annotation for these so we can more easily
// turn these pairs into tags later
export function closeTags(doc: Document) {
  doc
    .where((annotation) => is(annotation, schema.OpeningTag))
    .as("openingTag")
    .outerJoin(
      doc
        .where((annotation) => is(annotation, schema.ClosingTag))
        .as("possibleClosingTags"),
      (openingTag, closingTag) =>
        openingTag.attributes.name === closingTag.attributes.name &&
        openingTag.end < closingTag.start
    )
    .outerJoin(
      doc.where((annotation) => is(annotation, schema.Newline)).as("newlines"),
      ({ openingTag }, newline) => openingTag.end < newline.start
    )
    .update(({ openingTag, possibleClosingTags, newlines }) => {
      let closingTag = possibleClosingTags[0];

      // There's no _maybe_ closing tags;
      // either they have a closing tag or
      // they don't, so this check is valid
      if (possibleClosingTags.length === 0) {
        let newline = newlines[0];
        closingTag = new schema.ClosingTag({
          start: newline.start,
          end: newline.end,
          attributes: {
            name: openingTag.attributes.name,
            openingTag: `${openingTag.type}:${openingTag.id}`,
          },
        });
        doc.addAnnotations(closingTag);
      } else {
        [closingTag] = doc.replaceAnnotation(
          closingTag,
          new schema.ClosingTag({
            id: closingTag.id,
            start: closingTag.start,
            end: closingTag.end,
            attributes: {
              name: closingTag.attributes.name,
              openingTag: `${openingTag.type}:${openingTag.id}`,
            },
          })
        );
      }

      doc.replaceAnnotation(
        openingTag,
        new schema.OpeningTag({
          id: openingTag.id,
          start: openingTag.start,
          end: openingTag.end,
          attributes: {
            name: openingTag.attributes.name,
            closingTag: `${closingTag.type}:${closingTag.id}`,
            attributes: openingTag.attributes.attributes,
          },
        })
      );
    });
}
