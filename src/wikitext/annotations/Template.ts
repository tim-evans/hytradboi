import { InlineAnnotation } from "@atjson/document";

export class Template extends InlineAnnotation<{
  name: string;
  args: string[];
  props: Record<string, string>;
  nesting: number;
  type: "block" | "inline";
}> {
  static vendorPrefix = "wm";
  static type = "template";
  get rank() {
    if (this.attributes.type === "block") {
      return 10 + this.attributes.nesting;
    }
    return super.rank + this.attributes.nesting;
  }
}
