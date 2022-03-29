import { InlineAnnotation } from "@atjson/document";

// This defines the structure of
// the annotation, for use in type
// checking and light documentation
export class Wikilink extends InlineAnnotation<{
  href: string;
  maybeContent: string[];
}> {
  static vendorPrefix = "wm";
  static type = "wikilink";
}
