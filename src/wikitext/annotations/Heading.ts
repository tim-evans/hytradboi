import { BlockAnnotation } from "@atjson/document";

export class Heading extends BlockAnnotation<{ level: number }> {
  static vendorPrefix = "mw";
  static type = "heading";
}
