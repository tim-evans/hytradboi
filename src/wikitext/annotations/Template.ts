import { BlockAnnotation } from "@atjson/document";

export class Template extends BlockAnnotation<{
  name: string;
  args: string[];
  props: Record<string, string>;
}> {
  static vendorPrefix = "wm";
  static type = "template";
}
