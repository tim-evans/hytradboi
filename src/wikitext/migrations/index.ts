import Document, { is, ParseAnnotation } from "@atjson/document";
import * as schema from "../annotations";

function stampInHrefToWikilink(doc: Document) {
  doc
    .where((annotation) => is(annotation, schema.Wikilink))
    .as("wikilink")
    .join(
      doc.where((annotation) => is(annotation, schema.Slice)).as("slices"),
      (link, slice) => link.attributes.href === `${slice.type}:${slice.id}`
    )
    .update(({ wikilink, slices }) => {
      let slice = slices[0];
      let href = doc.content.slice(slice.start, slice.end).replace(/\s+/g, "_");
      doc.replaceAnnotation(
        wikilink,
        new schema.Wikilink({
          start: wikilink.start,
          end: wikilink.end,
          attributes: {
            ...wikilink.attributes,
            href,
          },
        })
      );
    });
}

function exposeLinkText(doc: Document) {
  doc
    .where((annotation) => is(annotation, schema.Wikilink))
    .as("wikilink")
    .join(
      doc.where((annotation) => is(annotation, ParseAnnotation)).as("tokens"),
      (wikilink, token) =>
        token.attributes.reason === `${wikilink.type}:${wikilink.id}`
    )
    .join(
      doc.where((annotation) => is(annotation, schema.Slice)).as("hrefs"),
      ({ wikilink }, slice) =>
        wikilink.attributes.href === `${slice.type}:${slice.id}`
    )
    .outerJoin(
      doc
        .where((annotation) => is(annotation, schema.Slice))
        .as("maybeContent"),
      ({ wikilink }, slice) =>
        wikilink.attributes.maybeContent.includes(`${slice.type}:${slice.id}`)
    )
    .update(({ hrefs, maybeContent, tokens }) => {
      // We now have a big join that allows
      // us to associate a bunch of information
      // together that was in the document.
      // We'll be shifting the parse annotation
      // such that it exposes the correct slice
      // of text.
      let slice =
        maybeContent.length > 0
          ? maybeContent[maybeContent.length - 1]
          : hrefs[0];

      // At this point, we only have one token
      let token = tokens[0];
      doc.replaceAnnotation(
        token,
        new ParseAnnotation({
          start: token.start,
          end: slice.start,
          attributes: token.attributes,
        }),
        new ParseAnnotation({
          start: slice.end,
          end: token.end,
          attributes: token.attributes,
        })
      );
    });
}

export default function (doc: Document) {
  // We'll add a series of migrations
  // here that will allow us to
  // handle structural compositions
  // in the document correctly,
  // and reproducibly.
  exposeLinkText(doc);
  stampInHrefToWikilink(doc);

  // We now have links associated with
  // the correct href and underlying text.
  // We can start now doing other manipulations.

  // From here, we can continue
  // manipulating the document further,
  // adding more features of wikitext,
  // but let's go over our 
  return doc;
}
