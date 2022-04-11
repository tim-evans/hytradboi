import Document, { is } from "@atjson/document";
import * as schema from "../annotations";

export function stampInRedirects(doc: Document) {
  doc
    .where((annotation) => is(annotation, schema.Redirect))
    .as("redirect")
    .join(
      doc.where((annotation) => is(annotation, schema.Wikilink)).as("links"),
      (redirect, link) => redirect.attributes.to === `${link.type}:${link.id}`
    )
    .update(({ redirect, links }) => {
      let link = links[0];
      doc.replaceAnnotation(
        redirect,
        new schema.Redirect({
          id: redirect.id,
          start: redirect.start,
          end: redirect.end,
          attributes: {
            to: link.attributes.href,
          },
        })
      );
    });
}
