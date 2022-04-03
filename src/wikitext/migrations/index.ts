import Document from "@atjson/document";
import { mergeRefSource } from "./0_mergeRefSource";
import { exposeLinkText } from "./1_exposeLinkText";
import { stampInHrefToWikilink } from "./2_stampInHrefToWikilink";
import { extendWikilinkEnd } from "./3_extendWikilinkEnd";
import { unmarkInvalidExtlinks } from "./4_unmarkInvalidExtlinks";
import { handleCategoryLinks } from "./5_handleCategoryLinks";
import { unmarkFilesAndImages } from "./6_unmarkFilesAndImages";
import { combineNewlines } from "./7_combineNewlines";
import { closeTags } from "./8_closeTags";
import { createParagraphs } from "./9_createParagraphs";
import { createLists } from "./10_createLists";
import { createHeadings } from "./11_createHeadings";
import { stampInRedirects } from "./12_stampInRedirects";

export default function (doc: Document) {
  // We'll add a series of migrations
  // here that will allow us to
  // handle structural compositions
  // in the document correctly,
  // and reproducibly.
  mergeRefSource(doc);
  exposeLinkText(doc);
  stampInHrefToWikilink(doc);
  extendWikilinkEnd(doc);
  unmarkInvalidExtlinks(doc);
  handleCategoryLinks(doc);
  unmarkFilesAndImages(doc);
  combineNewlines(doc);
  closeTags(doc);
  createParagraphs(doc);
  createLists(doc);
  createHeadings(doc, "h2", { level: 2 });
  createHeadings(doc, "h3", { level: 3 });
  createHeadings(doc, "h4", { level: 4 });
  stampInRedirects(doc);

  return doc;
}
