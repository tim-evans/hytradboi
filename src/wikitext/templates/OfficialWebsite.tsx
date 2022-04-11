import { Template } from "../annotations";
import { Extlink, Wikilink } from "../components";
import { PropsOf } from "../renderer";

export function OfficialWebsite(props: PropsOf<Template>) {
  let [url, name] = props.args;
  return (
    <>
      <Extlink href={url}>{name ?? "Official website"}</Extlink>
      {props.props.mobile && (
        <>
          (<Extlink href={props.props.mobile}>Mobile</Extlink>)
        </>
      )}
      {props.props.format === "flash" && (
        <>
          (Requires{" "}
          <Wikilink href="Adobe_Flash_Player" maybeContent={[]}>
            Adobe Flash Player
          </Wikilink>
          )
        </>
      )}
    </>
  );
}
