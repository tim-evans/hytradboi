import styled from "styled-components";

export const Button = styled.button`
  float: right;
  /** Reset */
  appearance: none;
  border: 0;
  text-decoration: none;
  &::-moz-focus-inner {
    border: 0;
  }
  border-radius: 4px;
  display: inline-grid;
  padding: 4px;
  background: var(--color-black);
  color: var(--color-white);

  &:focus {
    outline: none;
  }

  &:not(:disabled):hover {
    background: #282828;
    box-shadow: 0 0 0 3px #2a388a;
    cursor: pointer;
    text-decoration: none;
  }
`;
