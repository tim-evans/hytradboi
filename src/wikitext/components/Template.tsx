import { useContext } from "react";
import { TemplateContext } from "../../contexts";
import { Template as Annotation } from "../annotations";
import { PropsOf } from "../renderer";
import { classify } from "@atjson/renderer-hir";

export function Template(props: PropsOf<Annotation>) {
  let context = useContext(TemplateContext);
  let Component = context.templates[classify(props.name.replace(/\s+/g, "-"))];
  if (Component) {
    return <Component {...props} />;
  }
  return <></>;
}
