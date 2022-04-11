import { useContext } from "react";
import { TemplateContext } from "../../contexts";
import { Template } from "../annotations";
import { Extlink, Wikilink } from "../components";
import { PropsOf } from "../renderer";

export function Youtube(props: PropsOf<Template>) {
  let context = useContext(TemplateContext);
  let user = props.props.u ?? props.props.user;
  let suffix = props.props.suffix ?? "'s";
  let id = props.args[0] ?? props.props.id;
  let title = props.props.title;
  return (
    <>
      {user && (
        <Extlink href={`https://youtube.com/user/${user}`}>
          {context.PAGENAME}
          {suffix} channel
        </Extlink>
      )}
      {id && <Extlink href={`https://youtube.com?v=${id}`}>{title}</Extlink>} on{" "}
      <Wikilink href="YouTube" maybeContent={[]}>
        YouTube
      </Wikilink>
    </>
  );
}
