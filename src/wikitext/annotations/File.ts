import { BlockAnnotation } from "@atjson/document";

export class File extends BlockAnnotation<{
  href: string;
  maybeContent: string[];
}> {
  static vendorPrefix = "mw";
  static type = "file";
}
