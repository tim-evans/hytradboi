import { ObjectAnnotation } from "@atjson/document";

export class Quote extends ObjectAnnotation<{
  value: string;
}> {
  static vendorPrefix = "mw";
  static type = "quote";
}
