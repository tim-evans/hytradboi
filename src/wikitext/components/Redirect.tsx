import { Navigate } from "react-router-dom";
import { PropsOf } from "../renderer";
import { Redirect as Annotation } from "../annotations";

export function Redirect(props: PropsOf<Annotation>) {
  return <Navigate to={`/wiki/${props.to}`} replace />;
}
