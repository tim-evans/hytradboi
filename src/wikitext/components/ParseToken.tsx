import styled, { css } from "styled-components";
import { withLogger } from "./withLogger";

export const ParseToken = withLogger(styled.span<{ $highlight: string }>`
  color: var(--color-gray);
  ${(props) =>
    props.$highlight
      ? css`
          background: ${props.$highlight};
        `
      : ""};
`);
