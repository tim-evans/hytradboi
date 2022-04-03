import Document, { is } from "@atjson/document";
import { fromWikitext } from "..";
import * as schema from "../annotations";

export function mergeRefSource(doc: Document) {
  doc
    .where(
      (annotation) =>
        is(annotation, schema.Extension) && annotation.attributes.name === "ref"
    )
    .as("ref")
    .join(
      doc.where((annotation) => is(annotation, schema.Slice)).as("slices"),
      (ref, slice) => ref.attributes.source === `${slice.type}:${slice.id}`
    )
    .outerJoin(
      doc
        .where(
          (annotation) =>
            is(annotation, schema.Template) &&
            annotation.attributes.name === "Reflist"
        )
        .as("reflists"),
      () => true
    )
    .update(({ slices, reflists }) => {
      let slice = slices[0];

      let sourceDoc = fromWikitext(doc.content.slice(slice.start, slice.end));
      doc.addAnnotations(
        ...sourceDoc.annotations.map((annotation) => {
          annotation.start += slice.start;
          annotation.end += slice.start;
          return annotation;
        })
      );
      let reflist = reflists[0];
      if (reflist) {
        reflist.attributes.args.push(`${slice.type}:${slice.id}`);
      }
    });
}
