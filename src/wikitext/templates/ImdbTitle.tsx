import { useContext } from "react";
import { TemplateContext } from "../../contexts";
import { Template } from "../annotations";
import { Italic, Extlink, Wikilink } from "../components";
import { PropsOf } from "../renderer";

export function ImdbTitle(props: PropsOf<Template>) {
  let context = useContext(TemplateContext);
  let id = props.args[0] ?? props.props.id;
  let title = props.args[1] ?? props.props.title ?? context.PAGENAME;
  let description = props.args[2] ?? props.props.description ?? "";
  let section = props.props.section;
  let url = `https://imdb.com/title/tt${id}`;
  let quotes =
    props.props.quotes === "yes" ||
    props.props.quotes === "y" ||
    props.props.quotes === "true";
  if (section) {
    url = `${url}/${section}`;
  }
  return (
    <>
      <Extlink href={url}>
        {quotes ? <>"{title}"</> : <Italic>{title}</Italic>}
        {description && <> {description}</>}
      </Extlink>{" "}
      on{" "}
      <Wikilink href="IMDb" maybeContent={[]}>
        IMDb
      </Wikilink>
    </>
  );
}
