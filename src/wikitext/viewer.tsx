import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { fromWikitext } from ".";
import Renderer, { ReactRendererProvider } from "./renderer";
import * as allComponents from "./components";
import { Button, ViewSourceIcon, RichTextIcon } from "../components";

const Title = styled.h1`
  font-size: 1.8em;
  line-height: 1.3em;
  border-bottom: 1px solid var(--color-gray);
  margin-bottom: 1em;
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

export function WikiText() {
  let [view, setView] = useState<"source" | "preview">("source");
  let { slug } = useParams<{ slug: string }>();
  let [title, setTitle] = useState("");
  let [atjson, setAtjson] = useState(null);
  useEffect(() => {
    let unmounted = false;
    fetch(
      `/api?action=parse&prop=wikitext&format=json&contentmodel=wikitext&page=${encodeURIComponent(
        slug
      )}`
    )
      .then((result) => {
        return result.json();
      })
      .then((json) => {
        if (!unmounted) {
          setTitle(json.parse.title);
          document.title = `${json.parse.title} | Wikipedia`;
          let doc = fromWikitext(json.parse.wikitext["*"]);
          setAtjson(doc);
          console.log(doc);
        }
      });
    return () => {
      unmounted = true;
    };
  }, [slug]);
  let { Default, ...components } = allComponents;

  return (
    <Main>
      {view === "preview" && atjson && (
        <ReactRendererProvider value={components}>
          <Title>
            {title}
            <Button onClick={() => setView("source")}>
              <ViewSourceIcon />
            </Button>
          </Title>
          <Article>{Renderer.render({ document: atjson })}</Article>
        </ReactRendererProvider>
      )}
      {view === "source" && atjson && (
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
            {title}
            <Button onClick={() => setView("preview")}>
              <RichTextIcon />
            </Button>
          </Title>
          <Code>
            {Renderer.render({ document: atjson, includeParseTokens: true })}
          </Code>
        </ReactRendererProvider>
      )}
    </Main>
  );
}
