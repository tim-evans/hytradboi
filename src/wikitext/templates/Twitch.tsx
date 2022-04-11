import { useContext } from "react";
import { TemplateContext } from "../../contexts";
import { Template } from "../annotations";
import { Extlink, Wikilink } from "../components";
import { PropsOf } from "../renderer";

export function Twitch(props: PropsOf<Template>) {
  let context = useContext(TemplateContext);
  return (
    <>
      <Extlink href={`https://twitch.tv/${props.args[0]}`}>
        {context.PAGENAME}
      </Extlink>{" "}
      on{" "}
      <Wikilink href="Twitch_(service)" maybeContent={[]}>
        Twitch
      </Wikilink>
    </>
  );
}
