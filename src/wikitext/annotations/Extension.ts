import { BlockAnnotation } from "@atjson/document";

export class Extension extends BlockAnnotation<{
  name: string;
  source: string;
  options: Record<string, string>;
}> {
  static vendorPrefix = "wm";
  static type = "extension";
}
