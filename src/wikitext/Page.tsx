import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Viewer } from "./Viewer";
import { fromWikitext } from "./index";

export function Page() {
  let [title, setTitle] = useState("");
  let [atjson, setAtjson] = useState(null);
  let { slug } = useParams<{ slug: string }>();
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
          setAtjson(fromWikitext(json.parse.wikitext["*"]));
        }
      });
    return () => {
      unmounted = true;
    };
  }, [slug]);

  return <Viewer title={title} document={atjson} />;
}
