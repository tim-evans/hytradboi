import { ObjectAnnotation } from "@atjson/document";

export class Redirect extends ObjectAnnotation<{
  to: string;
}> {
  static vendorPrefix = "wm";
  static type = "redirect";
}
