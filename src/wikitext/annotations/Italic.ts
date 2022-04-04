import { InlineAnnotation } from "@atjson/document";

export class Italic extends InlineAnnotation {
  static vendorPrefix = "mw";
  static type = "italic";
}
