import { InlineAnnotation } from "@atjson/document";

export class Extlink extends InlineAnnotation<{
  href: string;
}> {
  static vendorPrefix = "wm";
  static type = "extlink";
}
