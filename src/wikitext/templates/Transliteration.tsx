import { Template } from "../annotations";
import { Italic } from "../components";
import { PropsOf } from "../renderer";

export function Transliteration(props: PropsOf<Template>) {
  let [languageOrScriptCode, textOrTransliterationScheme, text] = props.args;
  let transliterationScheme;
  if (text == null) {
    text = textOrTransliterationScheme;
  } else {
    transliterationScheme = textOrTransliterationScheme;
  }
  console.log(props);

  return <Italic>{text}</Italic>;
}

export const Transl = Transliteration;
