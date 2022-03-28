import Document from "@atjson/document";
import { parse } from "./parser";
import * as schema from "./annotations";

export function fromWikitext(wikitext: string) {
  return new WikiText({
    content: wikitext,
    annotations: [],
  });
}

export default class WikiText extends Document {
  static schema = [...Object.values(schema)];
}
