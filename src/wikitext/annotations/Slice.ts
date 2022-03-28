import { Annotation } from "@atjson/document";

export class Slice extends Annotation {
  static vendorPrefix = "atjson";
  static type = "slice";
  get rank() {
    return Number.MAX_SAFE_INTEGER;
  }
}
