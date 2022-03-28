import Document, { is, ParseAnnotation } from "@atjson/document";
import * as schema from "../annotations";

function addHrefToWikilink(doc: Document) {
  // First, we'll query the document
  // for wikilinks
  doc
    .where((annotation) => is(annotation, schema.Wikilink))
    .as("wikilink")
    .join(
      // Then we'll join with the slice
      doc.where((annotation) => is(annotation, schema.Slice)).as("slices"),
      (link, slice) => link.attributes.href === `${slice.type}:${slice.id}`
    )
    .update(({ wikilink, slices }) => {
      // We have the link and the
      // slice of the content from the href
      // We'll replace the link with the
      // contents of the href text
      // and normalize it
      let href = doc.content
        .slice(slices[0].start, slices[0].end)
        .replace(/\s+/g, "_");
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

function exposeWikilinkText(doc: Document) {
  doc
    .where((annotation) => is(annotation, schema.Wikilink))
    .as("wikilink")
    .join(
      doc.where((annotation) => is(annotation, ParseAnnotation)).as("syntax"),
      (link, syntax) => syntax.attributes.reason === `${link.type}:${link.id}`
    )
    .join(
      doc.where((annotation) => is(annotation, schema.Slice)).as("href"),
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
    .update(({ wikilink, syntax, href, maybeContent }) => {
      let parseToken = syntax[0];
      let textSlice =
        maybeContent.length > 0
          ? maybeContent[maybeContent.length - 1]
          : href[0];
      if (textSlice !== href[0]) {
        // We'll clean up the slice
        doc.removeAnnotation(textSlice);
      }

      doc.replaceAnnotation(
        parseToken,
        new ParseAnnotation({
          start: wikilink.start,
          end: textSlice.start,
          attributes: parseToken.attributes,
        }),
        new ParseAnnotation({
          start: textSlice.end,
          end: wikilink.end,
          attributes: parseToken.attributes,
        })
      );
    });
}

function migrateFileLinks(doc: Document) {
  doc
    .where(
      (annotation) =>
        is(annotation, schema.Wikilink) &&
        (annotation.attributes.href.startsWith("File:") ||
          annotation.attributes.href.startsWith("Image:"))
    )
    .as("link")
    .update((file) => {
      doc.replaceAnnotation(
        file,
        new schema.File({
          start: file.start,
          end: file.end,
          attributes: {
            ...file.attributes,
          },
        })
      );
    });
}

function extendWikilinks(doc: Document) {
  doc
    .where((annotation) => is(annotation, schema.Wikilink))
    .as("wikilink")
    .outerJoin(
      doc.where((annotation) => is(annotation, ParseAnnotation)).as("syntax"),
      (link, syntax) => syntax.start >= link.end
    )
    .update(({ wikilink, syntax }) => {
      let match = doc.match(
        /^[a-zA-Z']+/,
        wikilink.end,
        syntax.length ? syntax[0].start : Infinity
      );
      if (match.length) {
        doc.replaceAnnotation(
          wikilink,
          new schema.Wikilink({
            start: wikilink.start,
            end: match[0].end,
            attributes: wikilink.attributes,
          })
        );
      }
    });
}

export default function (doc: Document) {
  exposeWikilinkText(doc);
  addHrefToWikilink(doc);
  // Let's also include Images :/
  migrateFileLinks(doc);

  // One last thing that we may
  // want to handle is extending
  // links.
  // ```
  // [[hyperlink]]s
  // ```
  // should extend the link to the s
  extendWikilinks(doc);

  // atjson provides tools for you
  // to start taking your markup
  // and content that's stuck in
  // a veritable data lake and
  // make it friendly to query,
  // manipulate and understand.
  return doc;
}
