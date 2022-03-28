import { useState } from "react";
import styled from "styled-components";

const Slide = styled.div`
  padding: 1.5rem;
  padding-bottom: 2rem;
  width: 100vw;
  height: 100vh;
  font-family: Georgia, "Times New Roman", Times, serif;
  line-height: 1.5rem;
  background: #111;
  color: #fff;
`;

/**
 * you can do all of these with one-off scripts,
 * but it's
 */
const Centered = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
`;

let Slides = [
  <Centered>
    <div>
      <h1>atjson</h1>
      <p>relational reasoning for rich text</p>
    </div>
  </Centered>,
];

const Footer = styled.div`
  position: absolute;
  bottom: 1rem;
  font-size: 0.5rem;
  color: #666;
`;

export function Presentation() {
  let [slide, setSlide] = useState(0);

  return (
    <Slide
      onClick={(evt) => {
        if (slide < Slides.length - 1) {
          setSlide(slide + 1);
        }
        evt.preventDefault();
        evt.stopPropagation();
      }}
    >
      {Slides[slide]}
      <Footer>tim evans // hytradboi 2022</Footer>
    </Slide>
  );
}
