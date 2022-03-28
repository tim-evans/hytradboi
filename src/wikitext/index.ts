import Document from "@atjson/document";
import { parse } from "./parser";
import * as schema from "./annotations";

function annotationsOf(tokens) {
  let annotations = [];

  for (let i = 0, len = tokens.length; i < len; i++) {
    let token = tokens[i];

    if (typeof token === "string") {
      continue;
    }
  }
  return annotations;
}

export async function fromRaw(wikitext: string) {
  let tokens = parse(wikitext);
  let annotations = annotationsOf(tokens);
  return new WikiText({
    content: wikitext,
    annotations,
  });
}

export default class WikiText extends Document {
  static schema = [...Object.values(schema)];
}
