import styled from "styled-components";
import { PropsOf } from "../renderer";
import { Extlink as Annotation } from "../annotations";
import { RedirectIcon } from "../../components";

const Link = styled.a`
  color: var(--color-blue);
  text-decoration: none;
  &:visited {
    color: var(--color-purple);
  }
  &:hover {
    text-decoration: underline;
  }
  svg {
    position: relative;
    top: 0.125em;
    margin-left: 0.125em;
  }
`;

export function Extlink(props: PropsOf<Annotation>) {
  return (
    <Link href={props.href} target="_blank" rel="noopener noreferrer">
      {props.children}
      <RedirectIcon />
    </Link>
  );
}
