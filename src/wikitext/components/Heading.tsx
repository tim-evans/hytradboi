import styled, { css } from "styled-components";

export const Heading = styled.div.attrs((props) => {
  return {
    $level: props.level,
    as: `h${props.level}`,
  };
})`
  ${(props) =>
    props.$level === 2
      ? css`
          font-size: 1.5em;
          margin-block-start: 1em;
          margin-block-end: 0.25em;
          line-height: 1.3;
          &:after {
            margin-top: 0.2em;
            content: " ";
            display: block;
            width: 3em;
            border-bottom: 1px solid var(--color-gray);
          }
        `
      : ""}

  ${(props) =>
    props.$level === 3
      ? css`
          font-weight: bold;
          font-size: 1.2em;
          margin-block-start: 0.3em;
          margin-block-end: 0;
          line-height: 1.6;
        `
      : ""}

${(props) =>
    props.$level === 4
      ? css`
          font-weight: bold;
          font-size: 1em;
          margin-top: 0.3em;
          margin-bottom: 0;
          line-height: 1.6;
        `
      : ""}
`;
