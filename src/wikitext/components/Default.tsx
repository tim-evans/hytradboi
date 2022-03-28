import styled, { css } from "styled-components";
import { withLogger } from "./withLogger";

export const Default = withLogger(styled.span<{ $highlight: string }>`
  ${(props) =>
    props.$highlight
      ? css`
          background: ${props.$highlight};
        `
      : ""};
`);
