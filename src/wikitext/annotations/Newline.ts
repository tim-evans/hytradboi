import { ObjectAnnotation } from "@atjson/document";

export class Newline extends ObjectAnnotation<{ for: string }> {
  static vendorPrefix = "wm";
  static type = "newline";
}
