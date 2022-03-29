import { Link as RouterLink } from "react-router-dom";
import styled from "styled-components";
import { PropsOf } from "../renderer";
import { Wikilink as Annotation } from "../annotations";

const Link = styled(RouterLink)`
  color: var(--color-blue);
  text-decoration: none;
  &:visited {
    color: var(--color-purple);
  }
  &:hover {
    text-decoration: underline;
  }
`;

export function Wikilink(props: PropsOf<Annotation>) {
  return <Link to={`/wiki/${props.href}`}>{props.children}</Link>;
}
