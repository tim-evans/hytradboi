import { Template } from "../annotations";
import { PropsOf } from "../renderer";

export function ColumnsList(props: PropsOf<Template>) {
  return (
    <div style={{ columnWidth: props.props.colwidth }}>{props.args[0]}</div>
  );
}
