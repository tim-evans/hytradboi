import Document from "@atjson/document";
import { exposeLinkText } from "./1_exposeLinkText";
import { stampInHrefToWikilink } from "./2_stampInHrefToWikilink";
import { extendWikilinkEnd } from "./3_extendWikilinkEnd";
import { unmarkInvalidExtlinks } from "./4_unmarkInvalidExtlinks";
import { handleCategoryLinks } from "./5_handleCategoryLinks";
import { unmarkFilesAndImages } from "./6_unmarkFilesAndImages";
import { combineNewlines } from "./7_combineNewlines";
import { createLists } from "./8_createLists";
import { createParagraphs } from "./9_createParagraphs";

export default function (doc: Document) {
  // We'll add a series of migrations
  // here that will allow us to
  // handle structural compositions
  // in the document correctly,
  // and reproducibly.
  exposeLinkText(doc);
  stampInHrefToWikilink(doc);
  extendWikilinkEnd(doc);
  unmarkInvalidExtlinks(doc);
  handleCategoryLinks(doc);
  unmarkFilesAndImages(doc);
  combineNewlines(doc);
  createLists(doc);
  createParagraphs(doc);

  return doc;
}
