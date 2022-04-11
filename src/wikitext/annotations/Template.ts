import { InlineAnnotation } from "@atjson/document";

export class Template extends InlineAnnotation<{
  name: string;
  args: string[];
  props: Record<string, string>;
}> {
  static vendorPrefix = "wm";
  static type = "template";
}
