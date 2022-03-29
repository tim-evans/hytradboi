import Document from "@atjson/document";
import { exposeLinkText } from "./1_exposeLinkText";
import { stampInHrefToWikilink } from "./2_stampInHrefToWikilink";
import { extendWikilinkEnd } from "./3_extendWikilinkEnd";

export default function (doc: Document) {
  // We'll add a series of migrations
  // here that will allow us to
  // handle structural compositions
  // in the document correctly,
  // and reproducibly.
  exposeLinkText(doc);
  stampInHrefToWikilink(doc);
  extendWikilinkEnd(doc);

  return doc;
}
