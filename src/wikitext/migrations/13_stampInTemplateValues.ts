import Document, { is, ParseAnnotation } from "@atjson/document";
import * as schema from "../annotations";

export function stampInTemplateValues(doc: Document) {
  doc
    .where((annotation) => is(annotation, schema.Template))
    .as("template")
    .join(
      doc.where((annotation) => is(annotation, schema.Slice)).as("slices"),
      (template, slice) =>
        template.attributes.args.includes(`${slice.type}:${slice.id}`) ||
        Object.values(template.attributes.props).includes(
          `${slice.type}:${slice.id}`
        )
    )
    .outerJoin(
      doc
        .where((annotation) => !is(annotation, schema.Newline))
        .as("annotations"),
      ({ slices }, annotation) =>
        slices.some(
          (slice) =>
            annotation.start >= slice.start &&
            annotation.end <= slice.end &&
            annotation !== slice
        )
    )
    .outerJoin(
      doc.where((annotation) => is(annotation, schema.Newline)).as("newlines"),
      ({ slices }, annotation) =>
        slices.some(
          (slice) =>
            annotation.start >= slice.start &&
            annotation.end <= slice.end &&
            annotation !== slice
        )
    )
    .outerJoin(
      doc.where((annotation) => is(annotation, schema.Extlink)).as("extlinks"),
      ({ slices }, annotation) =>
        slices.some(
          (slice) =>
            annotation.start >= slice.start &&
            annotation.end <= slice.end &&
            annotation !== slice
        )
    )
    .update(({ template, slices, annotations, newlines, extlinks }) => {
      let sliceValues = {};
      let annotationsToRemove = [];
      for (let slice of slices) {
        let innerAnnotations = annotations.filter(
          (annotation) =>
            annotation.start >= slice.start &&
            annotation.end <= slice.end &&
            annotation !== slice
        );
        let urls = extlinks.filter(
          (annotation) =>
            annotation.start >= slice.start &&
            annotation.end <= slice.end &&
            annotation !== slice &&
            annotation.attributes.href ===
              doc.content.slice(annotation.start, annotation.end).trim()
        );

        // Stamp in magiclinks
        if (
          urls.length === innerAnnotations.length &&
          urls.length === 1 &&
          urls[0] === innerAnnotations[0]
        ) {
          annotationsToRemove.push(
            slice,
            ...urls,
            ...newlines.filter(
              (annotation) =>
                annotation.start >= slice.start &&
                annotation.end <= slice.end &&
                annotation !== slice
            )
          );

          sliceValues[`${slice.type}:${slice.id}`] =
            urls[0].attributes.href.trim();
        } else if (innerAnnotations.length === 0) {
          annotationsToRemove.push(
            slice,
            ...newlines.filter(
              (annotation) =>
                annotation.start >= slice.start &&
                annotation.end <= slice.end &&
                annotation !== slice
            )
          );

          sliceValues[`${slice.type}:${slice.id}`] = doc.content
            .slice(slice.start, slice.end)
            .trim();
        } else {
          sliceValues[
            `${slice.type}:${slice.id}`
          ] = `${slice.type}:${slice.id}`;
        }
      }

      let args = template.attributes.args.map((arg) => sliceValues[arg] ?? arg);
      let props = Object.entries(template.attributes.props).reduce(
        (E, [key, value]) => {
          E[key] = sliceValues[value as string] ?? value;
          return E;
        },
        {}
      );
      doc.removeAnnotations(annotationsToRemove);
      doc.replaceAnnotation(
        template,
        new schema.Template({
          id: template.id,
          start: template.start,
          end: template.end,
          attributes: {
            name: template.attributes.name,
            args,
            props,
          },
        })
      );
    });
}
