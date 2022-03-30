import { BlockAnnotation } from "@atjson/document";

export class ListItem extends BlockAnnotation {
  static vendorPrefix = "mw";
  static type = "listItem";
}
