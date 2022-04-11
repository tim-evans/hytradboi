import Document, { is } from "@atjson/document";
import * as schema from "../annotations";

export function setTemplateType(doc: Document) {
  doc
    .where(
      (annotation) =>
        is(annotation, schema.Template) && annotation.attributes.nesting === 0
    )
    .as("template")
    .outerJoin(
      doc
        .where((annotation) => is(annotation, schema.Newline))
        .as("startingNewlines"),
      (template, newline) => newline.end === template.start
    )
    .outerJoin(
      doc
        .where((annotation) => is(annotation, schema.Newline))
        .as("endingNewlines"),
      ({ template }, newline) => newline.start === template.end
    )
    .update(({ template, startingNewlines, endingNewlines }) => {
      if (
        (template.start === 0 || startingNewlines.length > 0) &&
        (template.end === doc.content.length || endingNewlines.length > 0)
      ) {
        template.attributes.type = "block";
      }
    });
}
