import { useState } from "react";
import { render } from "react-dom";
import { CSSReset, CSSVariables } from "./components";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Viewer } from "./wikitext/Viewer";
import { Page } from "./wikitext/Page";
import { fromWikitext } from "./wikitext";

function App() {
  return (
    <>
      <CSSReset />
      <CSSVariables />
      <BrowserRouter>
        <Routes>
          <Route path="/wiki/:slug" element={<Page />}></Route>
          <Route
            path="/"
            element={
              <Viewer
                title="Welcome"
                document={fromWikitext(
                  `Try the following links for examples of pages with different annotation profiles:
* [[Database]]
* [[Bob Ross]]
* [[Lenapehoking]]
* [[New York City]]
                  `
                )}
              />
            }
          ></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

// Now that we have the article in a usable form, render it out with our React components.
render(<App />, document.querySelector("#app"));
