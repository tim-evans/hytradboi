import Document, { ParseAnnotation } from "@atjson/document";
import { parse } from "./parser";
import * as schema from "./annotations";
import migrate from "./migrations";

export function fromWikitext(wikitext: string) {
  let tokens = parse(wikitext);
  // Next, let's treat our initial
  // set of data as something that
  // we can run migrations on.
  // We have some weird data that
  // is directly from the AST that
  // needs to be manipulated.
  // Instead of doing manipulation through
  // DOM querying et al, we can treat
  // the annotations as database entries
  // that we can query and manipulate
  // sequentially.
  return migrate(
    new WikiText({
      content: wikitext,
      annotations: walk(tokens),
    })
  );
}

// A document contains a schema with
// a collection of annotations.
// You can think of these like database
// entries that refer to offsets in
// the document.
// To populate the annotations, we'll
// be writing the fromWikitext
// implementation above
export default class WikiText extends Document {
  static schema = [...Object.values(schema)];
}

let handlers = {
  default(token) {
    // Let's mark syntax as semantic
    // rather than textual
    if (token.dataAttribs?.tsr) {
      // There's offset positions,
      // which indicates that it's a node
      // that has some syntatical relevance.
      let [start, end] = token.dataAttribs.tsr;
      return [
        // The parse annotation
        // is used in atjson to indicate
        // syntatical parts of the text.
        new ParseAnnotation({
          start,
          end,
        }),
      ];
    }
    return [];
  },
  // now we'll continue to handle wikilinks
  wikilink(token) {
    let [start, end] = token.dataAttribs.tsr;

    let href = token.attribs.find((attrib) => attrib.k === "href");
    let maybeContent = token.attribs.filter(
      (attrib) => attrib.k === "mw:maybeContent"
    );

    // We'll take the href and maybeContent
    // and have the link refer to them
    // via document offsets. These
    // will be represented also as annotations,
    // so other annotations and code can
    // query them.
    let hrefStart = start + token.dataAttribs.src.indexOf(href.vsrc);
    let hrefSlice = new schema.Slice({
      start: hrefStart,
      end: hrefStart + href.vsrc.length,
    });

    let nestedAnnotations = [];
    let maybeContentSlices = maybeContent.map((attrib) => {
      // maybeContent is an AST tree,
      // so we need to collect those tokens
      nestedAnnotations.push(...walk(attrib.v));
      let [start, end] = attrib.srcOffsets;
      return new schema.Slice({
        start,
        end,
      });
    });

    let link = new schema.Wikilink({
      start,
      end,
      attributes: {
        href: `${hrefSlice.type}:${hrefSlice.id}`,
        maybeContent: maybeContentSlices.map(
          (slice) => `${slice.type}:${slice.id}`
        ),
      },
    });

    return [
      ...nestedAnnotations,
      hrefSlice,
      ...maybeContentSlices,
      link,
      new ParseAnnotation({
        start,
        end,
        attributes: {
          reason: `${link.type}:${link.id}`,
        },
      }),
    ];
  },
  extlink(token) {
    let [start, end] = token.dataAttribs.tsr;
    let link = new schema.Extlink({
      start,
      end,
      attributes: {
        href: token.getAttribute("href"),
      },
    });
    let [contentStart, contentEnd] = token.dataAttribs.extLinkContentOffsets;

    return [
      ...walk(token.getAttribute("mw:content")),
      link,
      new ParseAnnotation({
        start,
        end: contentStart,
        attributes: {
          reason: `${link.type}:${link.id}`,
        },
      }),
      new ParseAnnotation({
        start: contentEnd,
        end,
        attributes: {
          reason: `${link.type}:${link.id}`,
        },
      }),
    ];
  },
};

function walk(tokens) {
  let annotations = [];

  // Iterate over tokens and call the relevant
  // handler
  for (let token of tokens) {
    if (typeof token == "string") {
      // The wikitext ast contains
      // string nodes; we can skip these
      // since we have source offset information
      continue;
    }

    if (token.name && handlers[token.name]) {
      annotations.push(...handlers[token.name](token));
    } else if (token.type && handlers[token.type]) {
      annotations.push(...handlers[token.type](token));
    } else {
      annotations.push(...handlers.default(token));
    }
  }
  return annotations;
}
