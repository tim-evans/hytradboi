import { BlockAnnotation } from "@atjson/document";

export class Image extends BlockAnnotation<{
  href: string;
  maybeContent: string[];
}> {
  static vendorPrefix = "mw";
  static type = "image";
}
