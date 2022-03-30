import { ObjectAnnotation } from "@atjson/document";

export class ClosingTag extends ObjectAnnotation<{
  name: string;
  openingTag?: string;
}> {
  static vendorPrefix = "mw";
  static type = "closing-tag";
}
