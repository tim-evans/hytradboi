import { InlineAnnotation } from "@atjson/document";

export class Bold extends InlineAnnotation {
  static vendorPrefix = "mw";
  static type = "bold";
}
