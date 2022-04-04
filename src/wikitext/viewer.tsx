import { useEffect, useState } from "react";
import styled from "styled-components";
import Renderer, { ReactRendererProvider } from "./renderer";
import * as allComponents from "./components";
import { Button, ViewSourceIcon, RichTextIcon } from "../components";
import Document from "@atjson/document";

const Title = styled.h1`
  font-size: 1.8em;
  line-height: 1.3em;
  margin-bottom: 1em;
  &:after {
    margin-top: 0.2em;
    content: " ";
    display: block;
    width: 3em;
    border-bottom: 1px solid var(--color-gray);
  }
`;

const Main = styled.main`
  font-family: "IBM Plex Sans", sans-serif;
  color: var(--color-white);
  font-size: 18px;
  line-height: 1.5em;
  padding: 1em;
`;

const Article = styled.article`
  color: var(--color-white);
`;

const Code = styled.pre`
  color: var(--color-white);
  font-family: "IBM Plex Mono", Monaco, monospace;
  white-space: pre-wrap;
`;

export function Viewer(props: { title: string; document: Document }) {
  let [view, setView] = useState<"source" | "preview">("source");
  let { Default, ...components } = allComponents;

  useEffect(() => {
    if (props.title && props.document) {
      document.title = `${props.title} | Wikipedia`;
      console.log(props.document);
    }
  }, [props]);

  return (
    <Main>
      {view === "preview" && props.document && (
        <ReactRendererProvider value={components}>
          <Title>
            {props.title}
            <Button onClick={() => setView("source")}>
              <ViewSourceIcon />
            </Button>
          </Title>
          <Article>{Renderer.render({ document: props.document })}</Article>
        </ReactRendererProvider>
      )}
      {view === "source" && props.document && (
        <ReactRendererProvider
          value={{
            ParseToken: allComponents.ParseToken,
            Default: allComponents.Default,
            Wikilink:
              "Wikilink" in allComponents
                ? allComponents.Wikilink
                : allComponents.Default,
          }}
        >
          <Title>
            {props.title}
            <Button onClick={() => setView("preview")}>
              <RichTextIcon />
            </Button>
          </Title>
          <Code>
            {Renderer.render({
              document: props.document,
              includeParseTokens: true,
            })}
          </Code>
        </ReactRendererProvider>
      )}
    </Main>
  );
}
