import { ObjectAnnotation } from "@atjson/document";

export class OpeningTag extends ObjectAnnotation<{
  name: string;
  closingTag?: string;
  attributes: Record<string, string>;
}> {
  static vendorPrefix = "mw";
  static type = "opening-tag";
}
