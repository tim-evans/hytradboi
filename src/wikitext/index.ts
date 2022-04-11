import Document, { ParseAnnotation } from "@atjson/document";
import { parse } from "./parser";
import * as schema from "./annotations";
import migrate from "./migrations";

let templateNesting = 0;

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
  static contentType = "application/vnd.atjson+mediawiki";
  static schema = [...Object.values(schema)];
}

let handlers = {
  NlTk(token) {
    let [start, end] = token.dataAttribs.tsr;
    return [
      new schema.Newline({
        start,
        end,
      }),
    ];
  },
  EOFTk() {
    return [];
  },
  default(token) {
    // Let's mark syntax as semantic
    // rather than textual
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
      link,
      ...nestedAnnotations,
      hrefSlice,
      ...maybeContentSlices,
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
    if (token.dataAttribs.stx === "magiclink") {
      return [link];
    }
    let [contentStart, contentEnd] = token.dataAttribs.extLinkContentOffsets;

    return [
      link,
      ...walk(token.getAttribute("mw:content")),
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
  urllink(token) {
    let [start, end] = token.dataAttribs.tsr;
    let link = new schema.Extlink({
      start,
      end,
      attributes: {
        href: token.getAttribute("href").join(""),
      },
    });

    return [link];
  },
  template(token) {
    // Templates may contain multiple
    // bits that will get passed into
    // the resulting template.
    // To handle this flexibility,
    // if a value of an attribute is an AST
    // tree, we'll refer to that value
    // as a slice
    let [start, end] = token.dataAttribs.tsr;
    let nesting = templateNesting++;

    let nestedAnnotations = [];
    let [name, ...attribs] = token.attribs;
    let slices = attribs.map((attrib) => {
      let key = Array.isArray(attrib.k)
        ? attrib.k.filter((part) => typeof part === "string").join("")
        : attrib.k;
      if (Array.isArray(attrib.v)) {
        let [, , start, end] = attrib.srcOffsets;
        let slice = new schema.Slice({
          start,
          end,
        });
        nestedAnnotations.push(...walk(attrib.v), slice);
        return [key.trim(), `${slice.type}:${slice.id}`];
      } else {
        return [key.trim(), attrib.v.trim()];
      }
    });
    templateNesting--;
    name = Array.isArray(name.k)
      ? name.k.filter((part) => typeof part === "string").join("")
      : name.k;

    // There are positional arguments
    // and named arguments on templates;
    // each can also contain sub trees
    let args = slices
      .filter(([key]) => key === "")
      .map(([, value]) => value) as string[];
    slices
      .filter(([key]) => key.match(/^\d+$/))
      .forEach(([index, value]) => {
        args[parseInt(index)] = value as string;
      });
    let props = slices
      .filter(([key]) => key !== "" && !key.match(/^\d+$/))
      .reduce((E, [key, value]) => {
        E[key] = value as string;
        return E;
      }, {} as Record<string, string>);

    let template = new schema.Template({
      start,
      end,
      attributes: {
        name,
        args,
        props,
        nesting,
        type: "inline",
      },
    });
    return [
      ...nestedAnnotations,
      new ParseAnnotation({
        start,
        end,
        attributes: {
          reason: `${template.type}:${template.id}`,
        },
      }),
      template,
    ];
  },
  TagTk(token) {
    let [start, end] = token.dataAttribs.tsr;
    let attributes = token.attribs.reduce((E, attrib) => {
      E[attrib.k] = attrib.v;
      return E;
    }, {});
    let tag = new schema.OpeningTag({
      start,
      end,
      attributes: {
        name: token.name,
        attributes,
      },
    });
    return [
      tag,
      new ParseAnnotation({
        start,
        end,
        attributes: {
          reason: `${tag.type}:${tag.id}`,
        },
      }),
    ];
  },
  EndTagTk(token) {
    let [start, end] = token.dataAttribs.tsr;
    let tag = new schema.ClosingTag({
      start,
      end,
      attributes: {
        name: token.name,
      },
    });
    return [
      tag,
      new ParseAnnotation({
        start,
        end,
        attributes: {
          reason: `${tag.type}:${tag.id}`,
        },
      }),
    ];
  },
  "mw:redirect"(token) {
    let [start, end] = token.dataAttribs.tsr;
    let annotations = handlers.wikilink(token.dataAttribs.linkTk);
    let link = annotations[0];
    let redirect = new schema.Redirect({
      start,
      end,
      attributes: {
        to: `${link.type}:${link.id}`,
      },
    });

    return [
      redirect,
      ...annotations,
      new ParseAnnotation({
        start,
        end,
        attributes: {
          reason: `${redirect.type}:${redirect.id}`,
        },
      }),
    ];
  },
  extension(token) {
    let [start, sourceStart, sourceEnd, end] = token.dataAttribs.extTagOffsets;
    let slice = new schema.Slice({
      start: sourceStart,
      end: sourceEnd,
    });

    let extension = new schema.Extension({
      start,
      end,
      attributes: {
        name: token.getAttribute("name"),
        source: `${slice.type}:${slice.id}`,
        options: token.getAttribute("options").reduce((E, { k, v }) => {
          E[k] = v;
          return E;
        }, {}),
      },
    });

    return [
      slice,
      extension,
      new ParseAnnotation({
        start,
        end,
        attributes: {
          reason: `${extension.type}:${extension.id}`,
        },
      }),
    ];
  },
  "mw-quote"(token) {
    let [start, end] = token.dataAttribs.tsr;
    let quote = new schema.Quote({
      start,
      end,
      attributes: {
        value: token.getAttribute("value"),
      },
    });
    return [
      quote,
      new ParseAnnotation({
        start,
        end,
        attributes: {
          reason: `${quote.type}:${quote.id}`,
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
