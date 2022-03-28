import { render } from "react-dom";
import { CSSReset, CSSVariables, Presentation } from "./components";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { WikiText } from "./wikitext/viewer";

function App() {
  return (
    <>
      <CSSReset />
      <CSSVariables />
      <BrowserRouter>
        <Routes>
          <Route path="/wiki/:slug" element={<WikiText />}></Route>
          <Route path="/" element={<Presentation />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

// Now that we have the article in a usable form, render it out with our React components.
render(<App />, document.querySelector("#app"));
