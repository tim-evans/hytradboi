import { BlockAnnotation } from "@atjson/document";

export class Paragraph extends BlockAnnotation {
  static vendorPrefix = "wm";
  static type = "paragraph";
}
